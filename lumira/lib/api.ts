import { Platform } from 'react-native';
import { supabase } from './supabase';
import type {
  Event,
  Team,
  Member,
  Assignment,
  PaymentRecord,
} from '../constants/data';

export const isProduction = true;

const PROD_URL = 'https://lumira-ntbg.onrender.com';
// Android emulator can't reach the host's "localhost" — it must use 10.0.2.2.
// For physical devices, set EXPO_PUBLIC_API_URL to your machine's LAN IP.
const DEV_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://localhost:4000');

const API_URL = isProduction ? PROD_URL : DEV_URL;

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not signed in');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = body?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body as T;
}

const MEMBER_COLORS = [
  '#7C5CFC',
  '#FF6B5E',
  '#12C9A6',
  '#2E8BFF',
  '#F59E0B',
  '#FF4D8D',
  '#22C55E',
  '#A855F7',
];
function colorForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return MEMBER_COLORS[Math.abs(h) % MEMBER_COLORS.length];
}

// ---------- Types from API ----------
export type ApiProfile = {
  id: string;
  display_name: string;
  phone: string | null;
  avatar_url: string | null;
};

export type ApiRole = { id: string; name: string };

export type ApiTeam = {
  id: string;
  name: string;
  initials: string;
  invite_code: string;
  owner_id: string;
};

export type ApiMember = {
  id: string; // team_members.id
  team_id: string;
  user_id: string; // profiles.id
  role_id: string;
  display_name: string;
  avatar_url: string | null;
  role_name: string;
  is_owner: boolean;
};

export type ApiEvent = {
  id: string;
  team_id: string;
  created_by_user_id: string | null;
  type: string;
  title: string;
  event_date: string;
  time_label: string | null;
  venue: string | null;
  client_name: string | null;
  client_phone: string | null;
  total: string;
  notes: string | null;
  assignments?: ApiAssignment[];
  payments?: ApiPayment[];
};

export type ApiAssignment = {
  id: string;
  event_id: string;
  member_id: string | null;
  role_id: string;
  external_name: string | null;
};

export type ApiPayment = {
  id: string;
  event_id: string;
  paid_on: string;
  amount: string;
  method: string;
  note: string | null;
};

// ---------- Profiles ----------
export const api = {
  baseUrl: API_URL,

  async getMyProfile() {
    return http<ApiProfile | null>('/profiles/me');
  },
  async upsertMyProfile(p: {
    display_name: string;
    phone?: string | null;
    avatar_url?: string | null;
  }) {
    return http<ApiProfile>('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(p),
    });
  },

  // ---------- Roles ----------
  async listRoles() {
    return http<ApiRole[]>('/roles');
  },

  // ---------- Teams ----------
  async listTeams() {
    return http<ApiTeam[]>('/teams');
  },
  async createTeam(p: { name: string; initials: string; role_id: string }) {
    return http<ApiTeam>('/teams', { method: 'POST', body: JSON.stringify(p) });
  },
  async joinTeam(p: { invite_code: string; role_id: string }) {
    return http<ApiTeam>('/teams/join', {
      method: 'POST',
      body: JSON.stringify(p),
    });
  },
  async regenerateCode(teamId: string) {
    return http<ApiTeam>(`/teams/${teamId}/regenerate-code`, {
      method: 'POST',
    });
  },

  // ---------- Members ----------
  async listMembers(teamId: string) {
    return http<ApiMember[]>(`/teams/${teamId}/members`);
  },

  // ---------- Events ----------
  async listEvents(teamId: string) {
    return http<ApiEvent[]>(`/events?team_id=${encodeURIComponent(teamId)}`);
  },
  async getEvent(id: string) {
    return http<ApiEvent>(`/events/${id}`);
  },
  async createEvent(p: {
    team_id: string;
    type: string;
    title: string;
    event_date: string;
    time_label?: string;
    venue?: string;
    client_name?: string;
    client_phone?: string;
    total?: number;
    notes?: string;
  }) {
    return http<ApiEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(p),
    });
  },
  async updateEvent(
    id: string,
    p: {
      venue?: string | null;
      client_name?: string | null;
      client_phone?: string | null;
      notes?: string | null;
    },
  ) {
    return http<ApiEvent>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(p),
    });
  },
  async deleteEvent(id: string) {
    return http<void>(`/events/${id}`, { method: 'DELETE' });
  },

  // ---------- Assignments ----------
  async setAssignments(
    eventId: string,
    list: Array<{
      member_id?: string | null;
      role_id: string;
      external_name?: string | null;
    }>,
  ) {
    return http<ApiAssignment[]>(`/events/${eventId}/assignments`, {
      method: 'PUT',
      body: JSON.stringify(list),
    });
  },

  // ---------- Payments ----------
  async addPayment(
    eventId: string,
    p: { paid_on: string; amount: number; method: string; note?: string },
  ) {
    return http<ApiPayment>(`/events/${eventId}/payments`, {
      method: 'POST',
      body: JSON.stringify(p),
    });
  },
};

// ---------- Mappers (API → frontend types) ----------

export function mapTeam(
  t: ApiTeam,
  members: ApiMember[],
  currentUserId: string,
): Team {
  const me = members.find((m) => m.user_id === currentUserId);
  return {
    id: t.id,
    name: t.name,
    initials: t.initials,
    color: colorForId(t.id),
    userRole:
      t.owner_id === currentUserId ? 'Owner' : (me?.role_name ?? 'Member'),
    inviteCode: t.invite_code,
    members: members.map(
      (m) =>
        ({
          id: m.id,
          userId: m.user_id,
          name: m.display_name,
          role: m.is_owner ? `Owner · ${m.role_name}` : m.role_name,
          color: colorForId(m.user_id),
          photoUrl: m.avatar_url ?? null,
          isMe: m.user_id === currentUserId,
        }) satisfies Member,
    ),
  };
}

export function mapPayment(p: ApiPayment): PaymentRecord {
  return {
    dateISO: p.paid_on,
    amount: Number(p.amount),
    method: p.method,
    note: p.note ?? '',
  };
}

export function mapAssignment(
  a: ApiAssignment,
  roleNameById: Map<string, string>,
  members: Member[],
): Assignment {
  const roleName = roleNameById.get(a.role_id) ?? 'Crew';
  if (a.member_id) {
    return { memberId: a.member_id, role: roleName };
  }
  return {
    memberId: `ext-${a.id}`,
    name: a.external_name ?? 'External',
    role: roleName,
    color: colorForId(a.id),
  };
}

export function mapEvent(
  e: ApiEvent,
  roleNameById: Map<string, string>,
  members: Member[],
): Event {
  return {
    id: e.id,
    type: e.type,
    title: e.title,
    dateISO: e.event_date,
    timeLabel: e.time_label ?? '',
    venue: e.venue ?? '',
    clientName: e.client_name ?? '',
    clientPhone: e.client_phone ?? '',
    assigned: (e.assignments ?? []).map((a) =>
      mapAssignment(a, roleNameById, members),
    ),
    total: Number(e.total),
    notes: e.notes ?? '',
    payments: (e.payments ?? []).map(mapPayment),
    createdByUserId: e.created_by_user_id,
  };
}
