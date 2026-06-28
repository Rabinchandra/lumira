import { Router } from 'express';
import { and, asc, eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler, badRequest } from '../middleware/error.js';

const router = Router({ mergeParams: true });
router.use(requireUser);

router.get('/', asyncHandler(async (req, res) => {
  const { eventId } = req.params as { eventId: string };
  const rows = await db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.eventId, eventId))
    .orderBy(asc(schema.payments.paidOn));
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { eventId } = req.params as { eventId: string };
  const { paid_on, amount, method, note } = req.body ?? {};
  if (!paid_on || amount == null || !method) {
    throw badRequest('paid_on, amount, method are required');
  }
  const [row] = await db
    .insert(schema.payments)
    .values({
      eventId,
      paidOn: paid_on,
      amount: String(amount),
      method,
      note: note ?? null,
    })
    .returning();
  res.status(201).json(row);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const { eventId, id } = req.params as { eventId: string; id: string };
  const { paid_on, amount, method, note } = req.body ?? {};
  const patch: Partial<typeof schema.payments.$inferInsert> = {};
  if (paid_on !== undefined) patch.paidOn = paid_on;
  if (amount !== undefined) patch.amount = String(amount);
  if (method !== undefined) patch.method = method;
  if (note !== undefined) patch.note = note;
  if (Object.keys(patch).length === 0) throw badRequest('no fields to update');

  const [row] = await db
    .update(schema.payments)
    .set(patch)
    .where(and(eq(schema.payments.id, id), eq(schema.payments.eventId, eventId)))
    .returning();
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { eventId, id } = req.params as { eventId: string; id: string };
  await db
    .delete(schema.payments)
    .where(and(eq(schema.payments.id, id), eq(schema.payments.eventId, eventId)));
  res.status(204).end();
}));

export default router;
