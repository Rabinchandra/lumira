import { Router } from 'express';
import { many, one, query } from '../db.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler, badRequest } from '../middleware/error.js';

// Nested under /teams/:teamId/members
const router = Router({ mergeParams: true });
router.use(requireUser);

router.get('/', asyncHandler(async (req, res) => {
  const rows = await many(
    `select m.*, p.display_name, p.avatar_url
       from public.team_members m
       join public.profiles p on p.id = m.user_id
      where m.team_id = $1
      order by m.is_owner desc, p.display_name`,
    [req.params.teamId],
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { user_id, role, color } = req.body ?? {};
  if (!user_id || !role || !color) throw badRequest('user_id, role, color required');

  const row = await one(
    `insert into public.team_members (team_id, user_id, role, color)
     values ($1, $2, $3, $4)
     on conflict (team_id, user_id) do update
       set role = excluded.role, color = excluded.color
     returning *`,
    [req.params.teamId, user_id, role, color],
  );
  res.status(201).json(row);
}));

router.patch('/:memberId', asyncHandler(async (req, res) => {
  const { role, color } = req.body ?? {};
  const row = await one(
    `update public.team_members
        set role  = coalesce($3, role),
            color = coalesce($4, color)
      where id = $1 and team_id = $2
      returning *`,
    [req.params.memberId, req.params.teamId, role ?? null, color ?? null],
  );
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
}));

router.delete('/:memberId', asyncHandler(async (req, res) => {
  await query(
    'delete from public.team_members where id = $1 and team_id = $2',
    [req.params.memberId, req.params.teamId],
  );
  res.status(204).end();
}));

export default router;
