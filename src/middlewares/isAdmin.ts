import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

export function isAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = req.user as JwtPayload | undefined;

  if (!user || typeof user !== 'object' || user.role !== 'admin') {
    res.status(403).json({ erro: 'Acesso restrito a administradores.' });
    return;
  }

  next();
}
