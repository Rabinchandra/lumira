import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { Event, Team, Assignment, PaymentRecord } from '../constants/data';
import { TODAY } from '../constants/helpers';
import { supabase } from '../lib/supabase';
import { Profile, profileFromUser } from '../lib/profile';
import {
  api,
  ApiEvent,
  ApiRole,
  mapEvent,
  mapPayment,
  mapTeam,
} from '../lib/api';

type Screen = 'signin' | 'profile-setup' | 'onboard' | 'create' | 'join' | 'app';
type Tab = 'dashboard' | 'calendar' | 'events' | 'studio';

export type AppState = {
  screen: Screen;
  booting: boolean;
  profile: Profile | null;
  userId: string | null;
  tab: Tab;
  teamId: string;
  monthOffset: number;
  selectedDate: string;
  openEventId: string | null;
  events: Record<string, Event[]>;
  teams: Record<string, Team>;
  roles: { id: string; name: string }[];
  filter: 'all' | 'upcoming' | 'unpaid';
  studioName: string;
  studioRole: string[];
  joinCode: string;
  payAmount: string;
  payMethod: string;
  newTitle: string;
  newType: string;
  newTotal: string;
  loadingTeams: boolean;
  loadingEvents: boolean;
};

type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'SET_BOOTING'; booting: boolean }
  | { type: 'SET_PROFILE'; profile: Profile | null; userId: string | null }
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'SET_TEAM'; teamId: string }
  | { type: 'SET_TEAMS'; teams: Record<string, Team> }
  | { type: 'SET_ROLES'; roles: { id: string; name: string }[] }
  | { type: 'SET_EVENTS_FOR_TEAM'; teamId: string; events: Event[] }
  | { type: 'UPSERT_EVENT'; teamId: string; event: Event }
  | { type: 'REMOVE_EVENT'; teamId: string; eventId: string }
  | { type: 'PATCH_EVENT'; teamId: string; eventId: string; patch: Partial<Event> }
  | { type: 'ADD_PAYMENT_TO_EVENT'; eventId: string; payment: PaymentRecord }
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
  | { type: 'SET_LOADING_TEAMS'; loading: boolean }
  | { type: 'SET_LOADING_EVENTS'; loading: boolean }
  | { type: 'RESET_FORMS' }
  | { type: 'SIGN_OUT' };

const initialState: AppState = {
  screen: 'signin',
  booting: true,
  profile: null,
  userId: null,
  tab: 'dashboard',
  teamId: '',
  monthOffset: 0,
  selectedDate: TODAY,
  openEventId: null,
  events: {},
  teams: {},
  roles: [],
  filter: 'all',
  studioName: '',
  studioRole: ['Photographer'],
  joinCode: '',
  payAmount: '',
  payMethod: 'UPI',
  newTitle: '',
  newType: 'Wedding',
  newTotal: '',
  loadingTeams: false,
  loadingEvents: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen, booting: false };
    case 'SET_BOOTING':
      return { ...state, booting: action.booting };
    case 'SET_PROFILE':
      return { ...state, profile: action.profile, userId: action.userId };
    case 'SET_TAB':
      return { ...state, tab: action.tab, openEventId: null };
    case 'SET_TEAM':
      return { ...state, teamId: action.teamId, openEventId: null, tab: 'dashboard', selectedDate: TODAY, monthOffset: 0 };
    case 'SET_TEAMS': {
      const ids = Object.keys(action.teams);
      const nextTeamId = state.teamId && ids.includes(state.teamId) ? state.teamId : (ids[0] ?? '');
      return { ...state, teams: action.teams, teamId: nextTeamId };
    }
    case 'SET_ROLES':
      return { ...state, roles: action.roles };
    case 'SET_EVENTS_FOR_TEAM':
      return { ...state, events: { ...state.events, [action.teamId]: action.events } };
    case 'UPSERT_EVENT': {
      const list = state.events[action.teamId] || [];
      const idx = list.findIndex(e => e.id === action.event.id);
      const next = idx >= 0
        ? list.map(e => e.id === action.event.id ? action.event : e)
        : [...list, action.event];
      return { ...state, events: { ...state.events, [action.teamId]: next } };
    }
    case 'PATCH_EVENT': {
      const list = state.events[action.teamId] || [];
      const next = list.map(e => e.id === action.eventId ? { ...e, ...action.patch } : e);
      return { ...state, events: { ...state.events, [action.teamId]: next } };
    }
    case 'REMOVE_EVENT': {
      const list = state.events[action.teamId] || [];
      return { ...state, events: { ...state.events, [action.teamId]: list.filter(e => e.id !== action.eventId) }, openEventId: null };
    }
    case 'ADD_PAYMENT_TO_EVENT': {
      const updated: Record<string, Event[]> = { ...state.events };
      for (const tid of Object.keys(updated)) {
        updated[tid] = updated[tid].map(e =>
          e.id === action.eventId ? { ...e, payments: [...e.payments, action.payment] } : e
        );
      }
      return { ...state, events: updated, payAmount: '' };
    }
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
          : [action.role], // single-select role
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
    case 'SET_LOADING_TEAMS':
      return { ...state, loadingTeams: action.loading };
    case 'SET_LOADING_EVENTS':
      return { ...state, loadingEvents: action.loading };
    case 'RESET_FORMS':
      return { ...state, newTitle: '', newTotal: '', payAmount: '', studioName: '', joinCode: '' };
    case 'SIGN_OUT':
      return { ...initialState, booting: false };
    default:
      return state;
  }
}

type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  reloadTeams: () => Promise<Record<string, Team>>;
  reloadEvents: (teamId: string) => Promise<void>;
  refreshEvent: (eventId: string) => Promise<void>;
  pickRoleId: (name?: string) => string | null;
  rolesByName: () => Map<string, string>;
  rolesById: () => Map<string, string>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const rolesByName = useCallback(() => {
    const m = new Map<string, string>();
    for (const r of stateRef.current.roles) m.set(r.name.toLowerCase(), r.id);
    return m;
  }, []);

  const rolesById = useCallback(() => {
    const m = new Map<string, string>();
    for (const r of stateRef.current.roles) m.set(r.id, r.name);
    return m;
  }, []);

  // Try to resolve a role by name; fall back to Other / first role.
  const pickRoleId = useCallback((name?: string) => {
    const roles = stateRef.current.roles;
    if (!roles.length) return null;
    if (name) {
      const lower = name.toLowerCase();
      const exact = roles.find(r => r.name.toLowerCase() === lower);
      if (exact) return exact.id;
      // try common synonyms
      if (lower.includes('photo')) return roles.find(r => r.name === 'Photographer')?.id ?? null;
      if (lower.includes('video') || lower.includes('cinema') || lower.includes('director')) {
        return roles.find(r => r.name === 'Videographer')?.id ?? null;
      }
      if (lower.includes('edit')) return roles.find(r => r.name === 'Editor')?.id ?? null;
      if (lower.includes('drone')) return roles.find(r => r.name === 'Drone Operator')?.id ?? null;
    }
    return roles.find(r => r.name === 'Other')?.id ?? roles[0].id;
  }, []);

  const reloadTeams = useCallback(async (): Promise<Record<string, Team>> => {
    const userId = stateRef.current.userId;
    if (!userId) return {};
    dispatch({ type: 'SET_LOADING_TEAMS', loading: true });
    try {
      const teams = await api.listTeams();
      const memberLists = await Promise.all(teams.map(t => api.listMembers(t.id)));
      const teamMap: Record<string, Team> = {};
      teams.forEach((t, i) => {
        teamMap[t.id] = mapTeam(t, memberLists[i], userId);
      });
      dispatch({ type: 'SET_TEAMS', teams: teamMap });
      return teamMap;
    } finally {
      dispatch({ type: 'SET_LOADING_TEAMS', loading: false });
    }
  }, []);

  const reloadEvents = useCallback(async (teamId: string) => {
    if (!teamId) return;
    dispatch({ type: 'SET_LOADING_EVENTS', loading: true });
    try {
      const list = await api.listEvents(teamId);
      // Fetch full event details in parallel for payments & assignments.
      const full = await Promise.all(list.map(e => api.getEvent(e.id)));
      const roleMap = rolesById();
      const team = stateRef.current.teams[teamId];
      const members = team?.members ?? [];
      const mapped = full.map(e => mapEvent(e, roleMap, members));
      dispatch({ type: 'SET_EVENTS_FOR_TEAM', teamId, events: mapped });
    } finally {
      dispatch({ type: 'SET_LOADING_EVENTS', loading: false });
    }
  }, [rolesById]);

  const refreshEvent = useCallback(async (eventId: string) => {
    const e = await api.getEvent(eventId);
    const roleMap = rolesById();
    const team = stateRef.current.teams[e.team_id];
    const members = team?.members ?? [];
    const mapped = mapEvent(e, roleMap, members);
    dispatch({ type: 'UPSERT_EVENT', teamId: e.team_id, event: mapped });
  }, [rolesById]);

  // Bootstrap on auth state changes
  useEffect(() => {
    let cancelled = false;

    async function bootstrap(userId: string, userMeta: Record<string, any>, email: string | undefined) {
      try {
        // Load roles (always needed for create flows)
        const roles = await api.listRoles();
        if (cancelled) return;
        dispatch({ type: 'SET_ROLES', roles });

        // Load profile from backend
        const profile = await api.getMyProfile();
        if (cancelled) return;

        if (!profile) {
          dispatch({
            type: 'SET_PROFILE',
            profile: {
              displayName: userMeta.display_name ?? '',
              phone: userMeta.phone ?? '',
              photoUrl: userMeta.photo_url ?? null,
              email: email ?? '',
            },
            userId,
          });
          dispatch({ type: 'SET_SCREEN', screen: 'profile-setup' });
          return;
        }

        dispatch({
          type: 'SET_PROFILE',
          profile: {
            displayName: profile.display_name,
            phone: profile.phone ?? '',
            photoUrl: profile.avatar_url,
            email: email ?? '',
          },
          userId,
        });

        // Load teams
        const teams = await api.listTeams();
        if (cancelled) return;
        if (teams.length === 0) {
          dispatch({ type: 'SET_TEAMS', teams: {} });
          dispatch({ type: 'SET_SCREEN', screen: 'onboard' });
          return;
        }
        const memberLists = await Promise.all(teams.map(t => api.listMembers(t.id)));
        if (cancelled) return;
        const teamMap: Record<string, Team> = {};
        teams.forEach((t, i) => {
          teamMap[t.id] = mapTeam(t, memberLists[i], userId);
        });
        dispatch({ type: 'SET_TEAMS', teams: teamMap });
        dispatch({ type: 'SET_SCREEN', screen: 'app' });
      } catch (err) {
        console.warn('[lumira] bootstrap failed', err);
        dispatch({ type: 'SET_BOOTING', booting: false });
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session?.user) {
        bootstrap(data.session.user.id, data.session.user.user_metadata ?? {}, data.session.user.email ?? undefined);
      } else {
        dispatch({ type: 'SET_BOOTING', booting: false });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'SIGNED_OUT' || !session) {
        dispatch({ type: 'SIGN_OUT' });
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        bootstrap(session.user.id, session.user.user_metadata ?? {}, session.user.email ?? undefined);
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Auto-load events when the active team changes (and we're in the app)
  useEffect(() => {
    if (state.teamId && state.screen === 'app' && !state.events[state.teamId]) {
      reloadEvents(state.teamId).catch(err => console.warn('[lumira] load events failed', err));
    }
  }, [state.teamId, state.screen, state.events, reloadEvents]);

  return (
    <AppContext.Provider value={{ state, dispatch, reloadTeams, reloadEvents, refreshEvent, pickRoleId, rolesByName, rolesById }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
