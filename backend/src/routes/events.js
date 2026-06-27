import { Router } from 'express';
import { many, one, query } from '../db.js';
import { requireUser } from '../middleware/auth.js';
import { asyncHandler, badRequest } from '../middleware/error.js';

const router = Router();
router.use(requireUser);

// List events. Filter by team_id, date range, or type.
router.get('/', asyncHandler(async (req, res) => {
  const { team_id, from, to, type } = req.query;
  const where = [];
  const params = [];
  if (team_id) { params.push(team_id); where.push(`team_id = $${params.length}`); }
  if (from)    { params.push(from);    where.push(`event_date >= $${params.length}`); }
  if (to)      { params.push(to);      where.push(`event_date <= $${params.length}`); }
  if (type)    { params.push(type);    where.push(`type = $${params.length}`); }

  const sql = `select * from public.events
               ${where.length ? 'where ' + where.join(' and ') : ''}
               order by event_date desc`;
  res.json(await many(sql, params));
}));

// Get one event with assignments & payments nested.
router.get('/:id', asyncHandler(async (req, res) => {
  const event = await one('select * from public.events where id = $1', [req.params.id]);
  if (!event) return res.status(404).json({ error: 'not found' });

  const [assignments, payments] = await Promise.all([
    many('select * from public.assignments where event_id = $1', [req.params.id]),
    many('select * from public.payments where event_id = $1 order by paid_on', [req.params.id]),
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

  const row = await one(
    `insert into public.events
       (team_id, type, title, event_date, time_label,
        venue, client_name, client_phone, total, notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     returning *`,
    [team_id, type, title, event_date, time_label ?? null,
     venue ?? null, client_name ?? null, client_phone ?? null, total, notes ?? null],
  );
  res.status(201).json(row);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const fields = ['type','title','event_date','time_label','venue','client_name','client_phone','total','notes'];
  const sets = [];
  const params = [req.params.id];
  for (const f of fields) {
    if (req.body && f in req.body) {
      params.push(req.body[f]);
      sets.push(`${f} = $${params.length}`);
    }
  }
  if (!sets.length) throw badRequest('no fields to update');

  const row = await one(
    `update public.events set ${sets.join(', ')} where id = $1 returning *`,
    params,
  );
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await query('delete from public.events where id = $1', [req.params.id]);
  res.status(204).end();
}));

export default router;
