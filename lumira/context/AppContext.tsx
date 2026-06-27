import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { EVENTS, TEAMS, Event, Team, Assignment } from '../constants/data';
import { TODAY } from '../constants/helpers';
import { supabase } from '../lib/supabase';

type Screen = 'signin' | 'profile-setup' | 'onboard' | 'create' | 'join' | 'app';
type Tab = 'dashboard' | 'calendar' | 'events' | 'studio';

export type AppState = {
  screen: Screen;
  tab: Tab;
  teamId: string;
  monthOffset: number;
  selectedDate: string;
  openEventId: string | null;
  events: Record<string, Event[]>;
  teams: Record<string, Team>;
  filter: 'all' | 'upcoming' | 'unpaid';
  studioName: string;
  studioRole: string[];
  joinCode: string;
  payAmount: string;
  payMethod: string;
  newTitle: string;
  newType: string;
  newTotal: string;
  inviteCodes: Record<string, string>;
};

type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'SET_TEAM'; teamId: string }
  | { type: 'SET_MONTH_OFFSET'; offset: number }
  | { type: 'SET_SELECTED_DATE'; date: string }
  | { type: 'OPEN_EVENT'; id: string | null }
  | { type: 'SET_FILTER'; filter: 'all' | 'upcoming' | 'unpaid' }
  | { type: 'SET_STUDIO_NAME'; name: string }
  | { type: 'TOGGLE_STUDIO_ROLE'; role: string }
  | { type: 'SET_JOIN_CODE'; code: string }
  | { type: 'SET_PAY_AMOUNT'; amount: string }
  | { type: 'SET_PAY_METHOD'; method: string }
  | { type: 'SET_NEW_TITLE'; title: string }
  | { type: 'SET_NEW_TYPE'; eventType: string }
  | { type: 'SET_NEW_TOTAL'; total: string }
  | { type: 'ADD_PAYMENT'; eventId: string; amount: number; method: string }
  | { type: 'ADD_EVENT'; teamId: string; event: Event }
  | { type: 'DELETE_EVENT'; eventId: string }
  | { type: 'UPDATE_EVENT_CREW'; eventId: string; assigned: Assignment[] }
  | { type: 'REGEN_CODE'; teamId: string }
  | { type: 'SIGN_OUT' };

const initialState: AppState = {
  screen: 'signin',
  tab: 'dashboard',
  teamId: 'A',
  monthOffset: 0,
  selectedDate: '2026-06-27',
  openEventId: null,
  events: EVENTS,
  teams: TEAMS,
  filter: 'all',
  studioName: '',
  studioRole: ['Lead Photographer'],
  joinCode: '',
  payAmount: '',
  payMethod: 'UPI',
  newTitle: '',
  newType: 'Wedding',
  newTotal: '',
  inviteCodes: { A: 'LUM4X9', B: 'FRM9Z2' },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'SET_TAB':
      return { ...state, tab: action.tab, openEventId: null };
    case 'SET_TEAM':
      return { ...state, teamId: action.teamId, openEventId: null, tab: 'dashboard', selectedDate: '2026-06-27', monthOffset: 0 };
    case 'SET_MONTH_OFFSET':
      return { ...state, monthOffset: action.offset };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.date };
    case 'OPEN_EVENT':
      return { ...state, openEventId: action.id };
    case 'SET_FILTER':
      return { ...state, filter: action.filter };
    case 'SET_STUDIO_NAME':
      return { ...state, studioName: action.name };
    case 'TOGGLE_STUDIO_ROLE':
      return {
        ...state,
        studioRole: state.studioRole.includes(action.role)
          ? state.studioRole.filter(r => r !== action.role)
          : [...state.studioRole, action.role],
      };
    case 'SET_JOIN_CODE':
      return { ...state, joinCode: action.code };
    case 'SET_PAY_AMOUNT':
      return { ...state, payAmount: action.amount };
    case 'SET_PAY_METHOD':
      return { ...state, payMethod: action.method };
    case 'SET_NEW_TITLE':
      return { ...state, newTitle: action.title };
    case 'SET_NEW_TYPE':
      return { ...state, newType: action.eventType };
    case 'SET_NEW_TOTAL':
      return { ...state, newTotal: action.total };
    case 'ADD_PAYMENT': {
      const updated = { ...state.events };
      updated[state.teamId] = updated[state.teamId].map(e => {
        if (e.id !== action.eventId) return e;
        return {
          ...e,
          payments: [...e.payments, {
            dateISO: TODAY,
            amount: action.amount,
            method: action.method,
            note: 'Payment received',
          }],
        };
      });
      return { ...state, events: updated, payAmount: '' };
    }
    case 'ADD_EVENT': {
      const updated = { ...state.events };
      updated[action.teamId] = [...(updated[action.teamId] || []), action.event];
      return { ...state, events: updated, newTitle: '', newTotal: '', tab: 'calendar' };
    }
    case 'DELETE_EVENT': {
      const updated = { ...state.events };
      updated[state.teamId] = updated[state.teamId].filter(e => e.id !== action.eventId);
      return { ...state, events: updated, openEventId: null };
    }
    case 'UPDATE_EVENT_CREW': {
      const updated = { ...state.events };
      updated[state.teamId] = updated[state.teamId].map(e =>
        e.id === action.eventId ? { ...e, assigned: action.assigned } : e
      );
      return { ...state, events: updated };
    }
    case 'REGEN_CODE': {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
      return { ...state, inviteCodes: { ...state.inviteCodes, [action.teamId]: code } };
    }
    case 'SIGN_OUT':
      return { ...initialState };
    default:
      return state;
  }
}

type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    function nextScreen(session: { user: { user_metadata?: Record<string, string> } } | null): Screen {
      if (!session) return 'signin';
      const meta = session.user.user_metadata ?? {};
      return meta.display_name && meta.phone ? 'onboard' : 'profile-setup';
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) dispatch({ type: 'SET_SCREEN', screen: nextScreen(data.session) });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        dispatch({ type: 'SIGN_OUT' });
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        dispatch({ type: 'SET_SCREEN', screen: nextScreen(session) });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
