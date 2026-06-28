import { Router } from 'express';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler, badRequest } from '../middleware/error.js';

const router = Router({ mergeParams: true });
router.use(requireUser);

router.get('/', asyncHandler(async (req, res) => {
  const { teamId } = req.params as { teamId: string };
  const isOwner = sql<boolean>`${schema.teams.ownerId} = ${schema.teamMembers.userId}`;

  const rows = await db
    .select({
      id: schema.teamMembers.id,
      team_id: schema.teamMembers.teamId,
      user_id: schema.teamMembers.userId,
      role_id: schema.teamMembers.roleId,
      created_at: schema.teamMembers.createdAt,
      display_name: schema.profiles.displayName,
      avatar_url: schema.profiles.avatarUrl,
      role_name: schema.roles.name,
      is_owner: isOwner,
    })
    .from(schema.teamMembers)
    .innerJoin(schema.profiles, eq(schema.profiles.id, schema.teamMembers.userId))
    .innerJoin(schema.teams, eq(schema.teams.id, schema.teamMembers.teamId))
    .innerJoin(schema.roles, eq(schema.roles.id, schema.teamMembers.roleId))
    .where(eq(schema.teamMembers.teamId, teamId))
    .orderBy(desc(isOwner), asc(schema.profiles.displayName));
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { teamId } = req.params as { teamId: string };
  const { user_id, role_id } = req.body ?? {};
  if (!user_id || !role_id) throw badRequest('user_id and role_id required');

  const [row] = await db
    .insert(schema.teamMembers)
    .values({ teamId, userId: user_id, roleId: role_id })
    .onConflictDoUpdate({
      target: [schema.teamMembers.teamId, schema.teamMembers.userId],
      set: { roleId: role_id },
    })
    .returning();
  res.status(201).json(row);
}));

router.patch('/:memberId', asyncHandler(async (req, res) => {
  const { teamId, memberId } = req.params as { teamId: string; memberId: string };
  const { role_id } = req.body ?? {};
  if (!role_id) throw badRequest('role_id required');

  const [row] = await db
    .update(schema.teamMembers)
    .set({ roleId: role_id })
    .where(and(eq(schema.teamMembers.id, memberId), eq(schema.teamMembers.teamId, teamId)))
    .returning();
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
}));

router.delete('/:memberId', asyncHandler(async (req, res) => {
  const { teamId, memberId } = req.params as { teamId: string; memberId: string };
  await db
    .delete(schema.teamMembers)
    .where(and(eq(schema.teamMembers.id, memberId), eq(schema.teamMembers.teamId, teamId)));
  res.status(204).end();
}));

export default router;
