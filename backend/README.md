# Lumira Backend

Express + Postgres (Supabase) API for the Lumira studio app.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_SECRET
npm run migrate        # applies SQL files in /migrations
npm run dev            # http://localhost:4000
```

`DATABASE_URL` comes from **Supabase → Project Settings → Database → Connection string** (use the pooled "Transaction" connection for serverless, or "Session" for long-running).

## Schema

Tables (see `migrations/001_init.sql`):

- `profiles` — 1:1 with `auth.users`
- `teams` — a studio; owned by a profile, joinable via `invite_code`
- `team_members` — membership join with `role` + display `color`
- `events` — bookings (wedding, corporate, …)
- `assignments` — crew per event (internal `member_id` or external `external_name`)
- `payments` — payment ledger per event

RLS policies in `002_rls.sql` enforce per-team access if the client ever talks to Supabase directly. The Express backend uses the service-role key and bypasses RLS.

## Endpoints

### Admin (`x-admin-secret: <ADMIN_SECRET>`)
- `GET  /admin/status` — migration state
- `POST /admin/migrate` — apply pending migrations
- `POST /admin/seed?name=sample` — run a seed file
- `POST /admin/reset` — truncate app tables

### Auth
All non-admin routes require `Authorization: Bearer <supabase-jwt>`. The token is verified server-side via `supabase.auth.getUser`.

### Profiles
- `GET    /profiles/me`
- `PUT    /profiles/me` — upsert `{ display_name, phone?, avatar_url? }`
- `GET    /profiles/:id`
- `DELETE /profiles/me`

### Teams (Studios)
- `GET    /teams` — teams the user belongs to
- `POST   /teams` — `{ name, initials, color, role? }` (creator becomes owner)
- `GET    /teams/:id`
- `PATCH  /teams/:id` (owner only)
- `POST   /teams/:id/regenerate-code` (owner only)
- `POST   /teams/join` — `{ invite_code, role?, color? }`
- `DELETE /teams/:id` (owner only)

### Members
- `GET    /teams/:teamId/members`
- `POST   /teams/:teamId/members` — `{ user_id, role, color }`
- `PATCH  /teams/:teamId/members/:memberId`
- `DELETE /teams/:teamId/members/:memberId`

### Events
- `GET    /events?team_id=&from=&to=&type=`
- `POST   /events` — `{ team_id, type, title, event_date, ... }`
- `GET    /events/:id` — includes nested `assignments` & `payments`
- `PATCH  /events/:id`
- `DELETE /events/:id`

### Assignments (event crew)
- `GET    /events/:eventId/assignments`
- `POST   /events/:eventId/assignments` — `{ member_id?, external_name?, role, color? }`
- `PUT    /events/:eventId/assignments` — replace full crew (array body)
- `DELETE /events/:eventId/assignments/:id`

### Payments
- `GET    /events/:eventId/payments`
- `POST   /events/:eventId/payments` — `{ paid_on, amount, method, note? }`
- `PATCH  /events/:eventId/payments/:id`
- `DELETE /events/:eventId/payments/:id`

## Notes

- Migrations are tracked in `public._migrations` so re-running is safe.
- Adding a new migration: drop a new `NNN_name.sql` into `/migrations` and re-run `npm run migrate` (or `POST /admin/migrate`).
