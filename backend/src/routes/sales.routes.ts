import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { validate, schemas } from '../middleware/validation.middleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/sales
 * Get all sales for the authenticated user with optional filters
 */
router.get('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { clientName, startDate, endDate, status } = req.query;

        const where: any = { userId };

        if (clientName) {
            where.clientName = {
                contains: clientName as string,
                mode: 'insensitive',
            };
        }

        if (startDate) {
            where.date = { ...where.date, gte: startDate as string };
        }

        if (endDate) {
            where.date = { ...where.date, lte: endDate as string };
        }

        if (status) {
            where.status = status as string;
        }

        const sales = await prisma.sale.findMany({
            where,
            orderBy: { date: 'desc' },
        });

        res.json({ sales });
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ error: 'Erro ao buscar vendas' });
    }
});

/**
 * POST /api/sales
 * Create a new sale
 */
router.post('/', validate(schemas.createSale), async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { clientName, itemSold, value, date, status = 'pending' } = req.body;

        const sale = await prisma.sale.create({
            data: {
                userId,
                clientName,
                itemSold,
                value,
                date,
                status,
                paidAt: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
            },
        });

        res.status(201).json({ sale });
    } catch (error) {
        console.error('Create sale error:', error);
        res.status(500).json({ error: 'Erro ao criar venda' });
    }
});

/**
 * PATCH /api/sales/:id/status
 * Update sale status
 */
router.patch('/:id/status', validate(schemas.updateSaleStatus), async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { id } = req.params;
        const { status } = req.body;

        // Verify sale belongs to user
        const existingSale = await prisma.sale.findFirst({
            where: { id, userId },
        });

        if (!existingSale) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }

        const sale = await prisma.sale.update({
            where: { id },
            data: {
                status,
                paidAt: status === 'paid' ? new Date().toISOString().split('T')[0] : null
            },
        });

        res.json({ sale });
    } catch (error) {
        console.error('Update sale error:', error);
        res.status(500).json({ error: 'Erro ao atualizar venda' });
    }
});

/**
 * DELETE /api/sales/:id
 * Delete a sale
 */
router.delete('/:id', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { id } = req.params;

        // Verify sale belongs to user
        const existingSale = await prisma.sale.findFirst({
            where: { id, userId },
        });

        if (!existingSale) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }

        await prisma.sale.delete({
            where: { id },
        });

        res.json({ message: 'Venda excluída com sucesso' });
    } catch (error) {
        console.error('Delete sale error:', error);
        res.status(500).json({ error: 'Erro ao excluir venda' });
    }
});

/**
 * GET /api/sales/export/csv
 * Export sales to CSV
 */
router.get('/export/csv', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const sales = await prisma.sale.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });

        const headers = ['Data', 'Cliente', 'Item', 'Valor', 'Status', 'Data Pagamento'];
        const rows = sales.map(s => [
            s.date,
            s.clientName,
            s.itemSold,
            s.value.toFixed(2),
            s.status === 'paid' ? 'Pago' : 'Pendente',
            s.paidAt || '-',
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=extrato_vendas.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ error: 'Erro ao exportar CSV' });
    }
});

/**
 * GET /api/sales/export/json
 * Export sales to JSON
 */
router.get('/export/json', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const sales = await prisma.sale.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=meu_controle_vendas_backup.json');
        res.json(sales);
    } catch (error) {
        console.error('Export JSON error:', error);
        res.status(500).json({ error: 'Erro ao exportar JSON' });
    }
});

export default router;
