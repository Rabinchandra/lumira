import type { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../supabase.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string | undefined };
    }
  }
}

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing bearer token' });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'invalid token' });

  req.user = { id: data.user.id, email: data.user.email };
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers['x-admin-secret'];
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'forbidden' });
  }
  next();
}
