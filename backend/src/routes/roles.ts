import { Router } from 'express';
import { asc } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();
router.use(requireUser);

router.get('/', asyncHandler(async (_req, res) => {
  const rows = await db.select().from(schema.roles).orderBy(asc(schema.roles.name));
  res.json(rows);
}));

export default router;
