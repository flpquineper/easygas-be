import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'easygas_secret_key';

// Aqui definimos o que será esperado dentro do JWT
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
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ erro: 'Token de acesso não fornecido.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ erro: 'Token inválido ou expirado.' });
      return;
    }

    // Aqui garantimos que o objeto seja do tipo correto
    (req as AuthenticatedRequest).user = decoded as JwtPayloadCustom;
    next();
  });
};