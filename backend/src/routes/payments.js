import { Router } from 'express';
import { many, one, query } from '../db.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler, badRequest } from '../middleware/error.js';

// Nested under /events/:eventId/payments
const router = Router({ mergeParams: true });
router.use(requireUser);

router.get('/', asyncHandler(async (req, res) => {
  const rows = await many(
    'select * from public.payments where event_id = $1 order by paid_on',
    [req.params.eventId],
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { paid_on, amount, method, note } = req.body ?? {};
  if (!paid_on || amount == null || !method) {
    throw badRequest('paid_on, amount, method are required');
  }
  const row = await one(
    `insert into public.payments (event_id, paid_on, amount, method, note)
     values ($1, $2, $3, $4, $5) returning *`,
    [req.params.eventId, paid_on, amount, method, note ?? null],
  );
  res.status(201).json(row);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const { paid_on, amount, method, note } = req.body ?? {};
  const row = await one(
    `update public.payments
        set paid_on = coalesce($3, paid_on),
            amount  = coalesce($4, amount),
            method  = coalesce($5, method),
            note    = coalesce($6, note)
      where id = $1 and event_id = $2
      returning *`,
    [req.params.id, req.params.eventId, paid_on ?? null, amount ?? null, method ?? null, note ?? null],
  );
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await query(
    'delete from public.payments where id = $1 and event_id = $2',
    [req.params.id, req.params.eventId],
  );
  res.status(204).end();
}));

export default router;
