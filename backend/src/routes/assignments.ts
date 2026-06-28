import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler, badRequest } from '../middleware/error.js';

const router = Router({ mergeParams: true });
router.use(requireUser);

const assignmentCols = {
  id: schema.assignments.id,
  event_id: schema.assignments.eventId,
  member_id: schema.assignments.memberId,
  role_id: schema.assignments.roleId,
  external_name: schema.assignments.externalName,
};

router.get('/', asyncHandler(async (req, res) => {
  const { eventId } = req.params as { eventId: string };
  const rows = await db.select(assignmentCols).from(schema.assignments).where(eq(schema.assignments.eventId, eventId));
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { eventId } = req.params as { eventId: string };
  const { member_id, role_id, external_name } = req.body ?? {};
  if (!role_id) throw badRequest('role_id is required');
  if (!member_id && !external_name) throw badRequest('member_id or external_name required');

  const [row] = await db
    .insert(schema.assignments)
    .values({
      eventId,
      memberId: member_id ?? null,
      roleId: role_id,
      externalName: external_name ?? null,
    })
    .returning(assignmentCols);
  res.status(201).json(row);
}));

router.put('/', asyncHandler(async (req, res) => {
  const { eventId } = req.params as { eventId: string };
  const list = Array.isArray(req.body) ? req.body : req.body?.assignments;
  if (!Array.isArray(list)) throw badRequest('expected an array of assignments');
  for (const a of list) {
    if (!a.role_id) throw badRequest('each assignment requires role_id');
  }

  await db.transaction(async (tx) => {
    await tx.delete(schema.assignments).where(eq(schema.assignments.eventId, eventId));
    if (list.length) {
      await tx.insert(schema.assignments).values(
        list.map((a: { member_id?: string; role_id: string; external_name?: string }) => ({
          eventId,
          memberId: a.member_id ?? null,
          roleId: a.role_id,
          externalName: a.external_name ?? null,
        })),
      );
    }
  });

  const rows = await db.select(assignmentCols).from(schema.assignments).where(eq(schema.assignments.eventId, eventId));
  res.json(rows);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { eventId, id } = req.params as { eventId: string; id: string };
  await db
    .delete(schema.assignments)
    .where(and(eq(schema.assignments.id, id), eq(schema.assignments.eventId, eventId)));
  res.status(204).end();
}));

export default router;
