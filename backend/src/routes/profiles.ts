import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler, badRequest } from '../middleware/error.js';

const router = Router();
router.use(requireUser);

router.get('/me', asyncHandler(async (req, res) => {
  const [row] = await db.select().from(schema.profiles).where(eq(schema.profiles.id, req.user!.id));
  res.json(row ?? null);
}));

router.put('/me', asyncHandler(async (req, res) => {
  const { display_name, phone, avatar_url } = req.body ?? {};
  if (!display_name) throw badRequest('display_name is required');

  const [row] = await db
    .insert(schema.profiles)
    .values({
      id: req.user!.id,
      displayName: display_name,
      phone: phone ?? null,
      avatarUrl: avatar_url ?? null,
    })
    .onConflictDoUpdate({
      target: schema.profiles.id,
      set: {
        displayName: display_name,
        phone: phone ?? null,
        avatarUrl: avatar_url ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();
  res.json(row);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const [row] = await db.select().from(schema.profiles).where(eq(schema.profiles.id, id));
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
}));

router.delete('/me', asyncHandler(async (req, res) => {
  await db.delete(schema.profiles).where(eq(schema.profiles.id, req.user!.id));
  res.status(204).end();
}));

export default router;
