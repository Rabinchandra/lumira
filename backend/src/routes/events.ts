import { Router } from 'express';
import { and, asc, desc, eq, gte, lte, type SQL } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler, badRequest } from '../middleware/error.js';

const router = Router();
router.use(requireUser);

const eventCols = {
  id: schema.events.id,
  team_id: schema.events.teamId,
  created_by_user_id: schema.events.createdByUserId,
  type: schema.events.type,
  title: schema.events.title,
  event_date: schema.events.eventDate,
  time_label: schema.events.timeLabel,
  venue: schema.events.venue,
  client_name: schema.events.clientName,
  client_phone: schema.events.clientPhone,
  total: schema.events.total,
  notes: schema.events.notes,
};

const assignmentCols = {
  id: schema.assignments.id,
  event_id: schema.assignments.eventId,
  member_id: schema.assignments.memberId,
  role_id: schema.assignments.roleId,
  external_name: schema.assignments.externalName,
};

const paymentCols = {
  id: schema.payments.id,
  event_id: schema.payments.eventId,
  paid_on: schema.payments.paidOn,
  amount: schema.payments.amount,
  method: schema.payments.method,
  note: schema.payments.note,
};

router.get('/', asyncHandler(async (req, res) => {
  const { team_id, from, to, type } = req.query as unknown as Record<string, string | undefined>;
  const filters: SQL[] = [];
  if (team_id) filters.push(eq(schema.events.teamId, team_id));
  if (from) filters.push(gte(schema.events.eventDate, from));
  if (to) filters.push(lte(schema.events.eventDate, to));
  if (type) filters.push(eq(schema.events.type, type));

  const rows = await db
    .select(eventCols)
    .from(schema.events)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(schema.events.eventDate));
  res.json(rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const [event] = await db.select(eventCols).from(schema.events).where(eq(schema.events.id, id));
  if (!event) return res.status(404).json({ error: 'not found' });

  const [assignments, payments] = await Promise.all([
    db.select(assignmentCols).from(schema.assignments).where(eq(schema.assignments.eventId, id)),
    db
      .select(paymentCols)
      .from(schema.payments)
      .where(eq(schema.payments.eventId, id))
      .orderBy(asc(schema.payments.paidOn)),
  ]);
  res.json({ ...event, assignments, payments });
}));

router.post('/', asyncHandler(async (req, res) => {
  const {
    team_id, type, title, event_date, time_label,
    venue, client_name, client_phone, total = 0, notes,
  } = req.body ?? {};
  if (!team_id || !type || !title || !event_date) {
    throw badRequest('team_id, type, title, event_date are required');
  }

  const [row] = await db
    .insert(schema.events)
    .values({
      teamId: team_id,
      createdByUserId: req.user!.id,
      type,
      title,
      eventDate: event_date,
      timeLabel: time_label ?? null,
      venue: venue ?? null,
      clientName: client_name ?? null,
      clientPhone: client_phone ?? null,
      total: String(total),
      notes: notes ?? null,
    })
    .returning(eventCols);
  res.status(201).json(row);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const body = (req.body ?? {}) as Record<string, unknown>;
  const map: Record<string, keyof typeof schema.events.$inferInsert> = {
    type: 'type',
    title: 'title',
    event_date: 'eventDate',
    time_label: 'timeLabel',
    venue: 'venue',
    client_name: 'clientName',
    client_phone: 'clientPhone',
    total: 'total',
    notes: 'notes',
  };
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  for (const [k, col] of Object.entries(map)) {
    if (k in body) patch[col] = k === 'total' ? String(body[k]) : body[k];
  }
  if (Object.keys(patch).length === 1) throw badRequest('no fields to update');

  const [row] = await db
    .update(schema.events)
    .set(patch)
    .where(eq(schema.events.id, id))
    .returning(eventCols);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  await db.delete(schema.events).where(eq(schema.events.id, id));
  res.status(204).end();
}));

export default router;
