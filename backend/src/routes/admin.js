import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { pool } from '../db.js';
import { runMigrations, migrationStatus } from '../migrate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEEDS_DIR = path.resolve(__dirname, '../../seeds');

const router = Router();
router.use(requireAdmin);

router.get('/status', asyncHandler(async (_req, res) => {
  res.json({ migrations: await migrationStatus() });
}));

router.post('/migrate', asyncHandler(async (_req, res) => {
  res.json(await runMigrations());
}));

router.post('/seed', asyncHandler(async (req, res) => {
  const name = (req.query.name ?? 'sample') + '.sql';
  const sql = await fs.readFile(path.join(SEEDS_DIR, name), 'utf8');
  await pool.query(sql);
  res.json({ seeded: name });
}));

router.post('/reset', asyncHandler(async (_req, res) => {
  // Truncates app data but keeps schema and auth.users intact.
  await pool.query(`
    truncate
      public.payments,
      public.assignments,
      public.events,
      public.team_members,
      public.teams,
      public.profiles
    restart identity cascade;
  `);
  res.json({ reset: true });
}));

export default router;
