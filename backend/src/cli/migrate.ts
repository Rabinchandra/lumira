import 'dotenv/config';
import { runMigrations } from '../migrate.js';
import { pool } from '../db/index.js';

try {
  const { applied } = await runMigrations();
  if (applied.length === 0) console.log('no pending migrations');
  else console.log('applied:', applied.join(', '));
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
