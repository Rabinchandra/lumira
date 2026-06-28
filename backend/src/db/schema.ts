import {
  boolean,
  check,
  date,
  index,
  numeric,
  pgSchema,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Supabase-managed auth schema (we only need the users.id reference target).
const authSchema = pgSchema('auth');
export const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  initials: text('initials').notNull(),
  inviteCode: text('invite_code').notNull().unique(),
  ownerId: uuid('owner_id').notNull().references(() => profiles.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull().unique(),
});

export const teamMembers = pgTable(
  'team_members',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.teamId, t.userId),
    index('team_members_team_idx').on(t.teamId),
    index('team_members_user_idx').on(t.userId),
  ],
);

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    createdByUserId: uuid('created_by_user_id').references(() => profiles.id, { onDelete: 'set null' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    eventDate: date('event_date').notNull(),
    timeLabel: text('time_label'),
    venue: text('venue'),
    clientName: text('client_name'),
    clientPhone: text('client_phone'),
    total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('events_team_idx').on(t.teamId),
    index('events_date_idx').on(t.eventDate),
  ],
);

export const assignments = pgTable(
  'assignments',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
    memberId: uuid('member_id').references(() => teamMembers.id, { onDelete: 'set null' }),
    roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'restrict' }),
    externalName: text('external_name'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('assignments_event_idx').on(t.eventId),
    check('assignments_member_or_external', sql`${t.memberId} is not null or ${t.externalName} is not null`),
  ],
);

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
    paidOn: date('paid_on').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    method: text('method').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('payments_event_idx').on(t.eventId)],
);
