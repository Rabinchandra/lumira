import { Router } from 'express';
import { many, one, query } from '../db.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler, badRequest } from '../middleware/error.js';

const router = Router();
router.use(requireUser);

// Get current user's profile.
router.get('/me', asyncHandler(async (req, res) => {
  const row = await one('select * from public.profiles where id = $1', [req.user.id]);
  res.json(row);
}));

// Create or update the current user's profile (upsert).
router.put('/me', asyncHandler(async (req, res) => {
  const { display_name, phone, avatar_url } = req.body ?? {};
  if (!display_name) throw badRequest('display_name is required');

  const row = await one(
    `insert into public.profiles (id, display_name, phone, avatar_url)
     values ($1, $2, $3, $4)
     on conflict (id) do update
       set display_name = excluded.display_name,
           phone        = excluded.phone,
           avatar_url   = excluded.avatar_url
     returning *`,
    [req.user.id, display_name, phone ?? null, avatar_url ?? null],
  );
  res.json(row);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const row = await one('select * from public.profiles where id = $1', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
}));

router.delete('/me', asyncHandler(async (req, res) => {
  await query('delete from public.profiles where id = $1', [req.user.id]);
  res.status(204).end();
}));

export default router;
