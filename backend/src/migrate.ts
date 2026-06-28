import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations');

async function readMetaSql(): Promise<string> {
  return fs.readFile(path.join(MIGRATIONS_DIR, '_meta.sql'), 'utf8');
}

async function listMigrations(): Promise<string[]> {
  const files = await fs.readdir(MIGRATIONS_DIR);
  return files.filter((f) => f.endsWith('.sql') && !f.startsWith('_')).sort();
}

export async function runMigrations(): Promise<{ applied: string[] }> {
  const client = await pool.connect();
  const applied: string[] = [];
  try {
    await client.query(await readMetaSql());
    const files = await listMigrations();

    for (const name of files) {
      const { rowCount } = await client.query(
        'select 1 from public._migrations where name = $1',
        [name],
      );
      if (rowCount) continue;

      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, name), 'utf8');
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into public._migrations(name) values ($1)', [name]);
        await client.query('commit');
        applied.push(name);
      } catch (err) {
        await client.query('rollback');
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`migration ${name} failed: ${msg}`);
      }
    }
    return { applied };
  } finally {
    client.release();
  }
}

export interface MigrationStatusRow {
  name: string;
  applied: boolean;
  applied_at: Date | null;
}

export async function migrationStatus(): Promise<MigrationStatusRow[]> {
  await pool.query(await readMetaSql());
  const files = await listMigrations();
  const { rows } = await pool.query<{ name: string; applied_at: Date }>(
    'select name, applied_at from public._migrations order by name',
  );
  const appliedMap = new Map(rows.map((r) => [r.name, r.applied_at]));
  return files.map((name) => ({
    name,
    applied: appliedMap.has(name),
    applied_at: appliedMap.get(name) ?? null,
  }));
}
