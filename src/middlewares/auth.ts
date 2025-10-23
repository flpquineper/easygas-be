import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt, { VerifyErrors, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'easygas_secret_key';

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

    (req as AuthenticatedRequest).user = decoded as JwtPayloadCustom;
    next();
  });
};