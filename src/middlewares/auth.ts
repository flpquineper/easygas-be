// src/middlewares/auth.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt, { VerifyErrors, JwtPayload } from 'jsonwebtoken';
import JWT_SECRET from '../config/jwt';
interface JwtPayloadCustom {
  id: number;
  email: string;
  role?: string;
}
export interface AuthenticatedRequest extends Request {
  user?: JwtPayloadCustom;
}

export const authMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { 'easygas.token': token } = req.cookies;

  if (!token) {
    res.status(401).json({ erro: 'Token de acesso não fornecido.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
    if (err) {
      res.status(403).json({ erro: 'Token inválido ou expirado.' });
      return;
    }

    if (typeof decoded !== 'object' || !decoded) {
      res.status(403).json({ erro: 'Formato de token inválido.' });
      return;
    }
    (req as AuthenticatedRequest).user = decoded as JwtPayloadCustom;
    next();
  });
};