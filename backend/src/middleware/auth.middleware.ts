import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ error: 'Token não fornecido' });
            return;
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            res.status(401).json({ error: 'Formato de token inválido' });
            return;
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            res.status(401).json({ error: 'Token mal formatado' });
            return;
        }

        try {
            const decoded = authService.verifyToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Token inválido ou expirado' });
            return;
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao verificar autenticação' });
        return;
    }
};
