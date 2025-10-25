// src/middlewares/auth.ts
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
  console.log('--- authMiddleware EXECUTADO ---');
  console.log('Cookies recebidos:', req.cookies); // Log 1

  const { 'easygas.token': token } = req.cookies;
  console.log('Token extraído:', token); // Log 2

  if (!token) {
    console.log('>> ERRO: Token não encontrado nos cookies.'); // Log 3
    res.status(401).json({ erro: 'Token de acesso não fornecido.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
    if (err) {
      console.log('>> ERRO: Falha na verificação do JWT:', err.message); // Log 4
      res.status(403).json({ erro: 'Token inválido ou expirado.' });
      return;
    }

    if (typeof decoded !== 'object' || !decoded) {
      console.log('>> ERRO: Payload decodificado não é um objeto:', decoded); // Log 5
      res.status(403).json({ erro: 'Formato de token inválido.' });
      return;
    }

    console.log('>> SUCESSO: Token verificado. Payload:', decoded); // Log 6
    (req as AuthenticatedRequest).user = decoded as JwtPayloadCustom;
    next();
  });
};