import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({ error: 'Validação falhou', details: errors });
                return;
            }
            res.status(500).json({ error: 'Erro de validação' });
            return;
        }
    };
};

// Validation schemas
export const schemas = {
    register: z.object({
        email: z.string().email('Email inválido'),
        password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
        name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    }),

    login: z.object({
        email: z.string().email('Email inválido'),
        password: z.string().min(1, 'Senha é obrigatória'),
    }),

    createSale: z.object({
        clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
        itemSold: z.string().min(1, 'Item vendido é obrigatório'),
        value: z.number().positive('Valor deve ser positivo'),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
        status: z.enum(['pending', 'paid']).optional(),
    }),

    updateSaleStatus: z.object({
        status: z.enum(['pending', 'paid']),
    }),
};
