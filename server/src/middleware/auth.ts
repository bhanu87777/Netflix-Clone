import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from './errorHandler';

export interface AuthRequest extends Request {
  userId?: number;
}

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'dev-secret';
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authentication required');
  }

  try {
    const payload = jwt.verify(header.slice(7), getJwtSecret()) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
}
