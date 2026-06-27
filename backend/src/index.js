import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profiles.js';
import teamRoutes from './routes/teams.js';
import memberRoutes from './routes/members.js';
import eventRoutes from './routes/events.js';
import assignmentRoutes from './routes/assignments.js';
import paymentRoutes from './routes/payments.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/admin', adminRoutes);
app.use('/profiles', profileRoutes);
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
