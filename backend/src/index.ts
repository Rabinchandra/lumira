import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profiles.js';
import teamRoutes from './routes/teams.js';
import memberRoutes from './routes/members.js';
import roleRoutes from './routes/roles.js';
import eventRoutes from './routes/events.js';
import assignmentRoutes from './routes/assignments.js';
import paymentRoutes from './routes/payments.js';
import { errorHandler, notFound } from './middleware/error.js';
import { db, schema } from './db/index.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  try {
    const [row] = await db
      .select({ status: schema.healthCheck.status, updatedAt: schema.healthCheck.updatedAt })
      .from(schema.healthCheck)
      .orderBy(schema.healthCheck.createdAt)
      .limit(1);
    res.json({ ok: true, db: row?.status ?? 'unknown', checked_at: row?.updatedAt ?? null });
  } catch (err) {
    res.status(503).json({ ok: false, db: 'unreachable', error: (err as Error).message });
  }
});

app.use('/admin', adminRoutes);
app.use('/profiles', profileRoutes);
app.use('/roles', roleRoutes);
app.use('/teams', teamRoutes);
app.use('/teams/:teamId/members', memberRoutes);
app.use('/events', eventRoutes);
app.use('/events/:eventId/assignments', assignmentRoutes);
app.use('/events/:eventId/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[lumira-backend] listening on :${port}`);
});
