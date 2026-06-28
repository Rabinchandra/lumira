import { Router } from 'express';
import { desc, eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler, badRequest } from '../middleware/error.js';

const router = Router();
router.use(requireUser);

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

router.get('/', asyncHandler(async (req, res) => {
  const rows = await db
    .select({ team: schema.teams })
    .from(schema.teams)
    .innerJoin(schema.teamMembers, eq(schema.teamMembers.teamId, schema.teams.id))
    .where(eq(schema.teamMembers.userId, req.user!.id))
    .orderBy(desc(schema.teams.createdAt));
  res.json(rows.map((r) => r.team));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const [row] = await db.select().from(schema.teams).where(eq(schema.teams.id, id));
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, initials, role_id } = req.body ?? {};
  if (!name || !initials || !role_id) {
    throw badRequest('name, initials and role_id are required');
  }

  const team = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(schema.teams)
      .values({ name, initials, inviteCode: randomCode(), ownerId: req.user!.id })
      .returning();
    await tx.insert(schema.teamMembers).values({
      teamId: created.id,
      userId: req.user!.id,
      roleId: role_id,
    });
    return created;
  });
  res.status(201).json(team);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const { name, initials } = req.body ?? {};
  const [team] = await db.select().from(schema.teams).where(eq(schema.teams.id, id));
  if (!team) return res.status(404).json({ error: 'not found' });
  if (team.ownerId !== req.user!.id) return res.status(403).json({ error: 'owner only' });

  const patch: Partial<typeof schema.teams.$inferInsert> = { updatedAt: new Date() };
  if (name !== undefined) patch.name = name;
  if (initials !== undefined) patch.initials = initials;

  const [row] = await db.update(schema.teams).set(patch).where(eq(schema.teams.id, id)).returning();
  res.json(row);
}));

router.post('/:id/regenerate-code', asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const [team] = await db
    .select({ ownerId: schema.teams.ownerId })
    .from(schema.teams)
    .where(eq(schema.teams.id, id));
  if (!team) return res.status(404).json({ error: 'not found' });
  if (team.ownerId !== req.user!.id) return res.status(403).json({ error: 'owner only' });

  const [row] = await db
    .update(schema.teams)
    .set({ inviteCode: randomCode(), updatedAt: new Date() })
    .where(eq(schema.teams.id, id))
    .returning();
  res.json(row);
}));

router.post('/join', asyncHandler(async (req, res) => {
  const { invite_code, role_id } = req.body ?? {};
  if (!invite_code || !role_id) throw badRequest('invite_code and role_id are required');

  const [team] = await db
    .select()
    .from(schema.teams)
    .where(eq(schema.teams.inviteCode, String(invite_code).trim().toUpperCase()));
  if (!team) return res.status(404).json({ error: 'invalid code' });

  await db
    .insert(schema.teamMembers)
    .values({ teamId: team.id, userId: req.user!.id, roleId: role_id })
    .onConflictDoNothing();
  res.json(team);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const [team] = await db
    .select({ ownerId: schema.teams.ownerId })
    .from(schema.teams)
    .where(eq(schema.teams.id, id));
  if (!team) return res.status(404).json({ error: 'not found' });
  if (team.ownerId !== req.user!.id) return res.status(403).json({ error: 'owner only' });
  await db.delete(schema.teams).where(eq(schema.teams.id, id));
  res.status(204).end();
}));

export default router;
