import { Router } from 'express';
import { pool, many, one, query } from '../db.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler, badRequest } from '../middleware/error.js';

const router = Router();
router.use(requireUser);

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// List teams the current user belongs to (or owns).
router.get('/', asyncHandler(async (req, res) => {
  const rows = await many(
    `select t.*
       from public.teams t
       join public.team_members m on m.team_id = t.id
      where m.user_id = $1
      order by t.created_at desc`,
    [req.user.id],
  );
  res.json(rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const row = await one('select * from public.teams where id = $1', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
}));

// Create a new studio. The creator becomes the owner and first member.
router.post('/', asyncHandler(async (req, res) => {
  const { name, initials, color, role = 'Owner' } = req.body ?? {};
  if (!name || !initials || !color) {
    throw badRequest('name, initials and color are required');
  }

  const client = await pool.connect();
  try {
    await client.query('begin');
    const team = (await client.query(
      `insert into public.teams (name, initials, color, invite_code, owner_id)
       values ($1, $2, $3, $4, $5) returning *`,
      [name, initials, color, randomCode(), req.user.id],
    )).rows[0];

    await client.query(
      `insert into public.team_members (team_id, user_id, role, color, is_owner)
       values ($1, $2, $3, $4, true)`,
      [team.id, req.user.id, role, color],
    );
    await client.query('commit');
    res.status(201).json(team);
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}));

// Update studio metadata (owner only).
router.patch('/:id', asyncHandler(async (req, res) => {
  const { name, initials, color } = req.body ?? {};
  const team = await one('select * from public.teams where id = $1', [req.params.id]);
  if (!team) return res.status(404).json({ error: 'not found' });
  if (team.owner_id !== req.user.id) return res.status(403).json({ error: 'owner only' });

  const row = await one(
    `update public.teams
        set name     = coalesce($2, name),
            initials = coalesce($3, initials),
            color    = coalesce($4, color)
      where id = $1
      returning *`,
    [req.params.id, name ?? null, initials ?? null, color ?? null],
  );
  res.json(row);
}));

router.post('/:id/regenerate-code', asyncHandler(async (req, res) => {
  const team = await one('select owner_id from public.teams where id = $1', [req.params.id]);
  if (!team) return res.status(404).json({ error: 'not found' });
  if (team.owner_id !== req.user.id) return res.status(403).json({ error: 'owner only' });

  const row = await one(
    'update public.teams set invite_code = $2 where id = $1 returning *',
    [req.params.id, randomCode()],
  );
  res.json(row);
}));

// Join a team by invite code. Caller becomes a member.
router.post('/join', asyncHandler(async (req, res) => {
  const { invite_code, role = 'Member', color = '#7C5CFC' } = req.body ?? {};
  if (!invite_code) throw badRequest('invite_code is required');

  const team = await one(
    'select * from public.teams where invite_code = $1',
    [invite_code.trim().toUpperCase()],
  );
  if (!team) return res.status(404).json({ error: 'invalid code' });

  await query(
    `insert into public.team_members (team_id, user_id, role, color)
     values ($1, $2, $3, $4)
     on conflict (team_id, user_id) do nothing`,
    [team.id, req.user.id, role, color],
  );
  res.json(team);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const team = await one('select owner_id from public.teams where id = $1', [req.params.id]);
  if (!team) return res.status(404).json({ error: 'not found' });
  if (team.owner_id !== req.user.id) return res.status(403).json({ error: 'owner only' });
  await query('delete from public.teams where id = $1', [req.params.id]);
  res.status(204).end();
}));

export default router;
