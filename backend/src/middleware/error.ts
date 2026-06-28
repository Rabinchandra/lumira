import type { NextFunction, Request, Response } from 'express';

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'not found' });
}

export interface HttpError extends Error {
  status?: number;
}

export function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message ?? 'internal error' });
}

export function badRequest(message: string): HttpError {
  const e: HttpError = new Error(message);
  e.status = 400;
  return e;
}
