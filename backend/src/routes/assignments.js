import { Router } from 'express';
import { pool, many, one, query } from '../db.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler, badRequest } from '../middleware/error.js';

// Nested under /events/:eventId/assignments
const router = Router({ mergeParams: true });
router.use(requireUser);

router.get('/', asyncHandler(async (req, res) => {
  const rows = await many(
    'select * from public.assignments where event_id = $1',
    [req.params.eventId],
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { member_id, role, external_name, color } = req.body ?? {};
  if (!role) throw badRequest('role is required');
  if (!member_id && !external_name) throw badRequest('member_id or external_name required');

  const row = await one(
    `insert into public.assignments (event_id, member_id, role, external_name, color)
     values ($1, $2, $3, $4, $5) returning *`,
    [req.params.eventId, member_id ?? null, role, external_name ?? null, color ?? null],
  );
  res.status(201).json(row);
}));

// Replace the full crew list for an event in one shot.
router.put('/', asyncHandler(async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : req.body?.assignments;
  if (!Array.isArray(list)) throw badRequest('expected an array of assignments');

  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query('delete from public.assignments where event_id = $1', [req.params.eventId]);
    for (const a of list) {
      await client.query(
        `insert into public.assignments (event_id, member_id, role, external_name, color)
         values ($1, $2, $3, $4, $5)`,
        [req.params.eventId, a.member_id ?? null, a.role, a.external_name ?? null, a.color ?? null],
      );
    }
    await client.query('commit');
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
  res.json(await many('select * from public.assignments where event_id = $1', [req.params.eventId]));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await query(
    'delete from public.assignments where id = $1 and event_id = $2',
    [req.params.id, req.params.eventId],
  );
  res.status(204).end();
}));

export default router;
