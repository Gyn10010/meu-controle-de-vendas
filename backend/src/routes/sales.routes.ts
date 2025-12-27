import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middleware/auth.middleware';
import { validate, schemas } from '../middleware/validation.middleware';

const router = Router();

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

        let query = supabase
            .from('sales')
            .select('*')
            .eq('userId', userId)
            .order('date', { ascending: false });

        if (clientName) {
            query = query.ilike('clientName', `%${clientName}%`);
        }

        if (startDate) {
            query = query.gte('date', startDate);
        }

        if (endDate) {
            query = query.lte('date', endDate);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data: sales, error } = await query;

        if (error) {
            console.error('Supabase get sales error:', error);
            throw error;
        }

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

        const { data: sale, error } = await supabase
            .from('sales')
            .insert({
                id: crypto.randomUUID(),
                userId,
                clientName,
                itemSold,
                value,
                date,
                status,
                paidAt: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase create sale error:', error);
            throw error;
        }

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
        const { data: existingSale, error: fetchError } = await supabase
            .from('sales')
            .select('id')
            .eq('id', id)
            .eq('userId', userId)
            .single();

        if (fetchError || !existingSale) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }

        const { data: sale, error } = await supabase
            .from('sales')
            .update({
                status,
                paidAt: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
                updatedAt: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase update sale error:', error);
            throw error;
        }

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
        const { data: existingSale, error: fetchError } = await supabase
            .from('sales')
            .select('id')
            .eq('id', id)
            .eq('userId', userId)
            .single();

        if (fetchError || !existingSale) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }

        const { error } = await supabase
            .from('sales')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete sale error:', error);
            throw error;
        }

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

        const { data: sales, error } = await supabase
            .from('sales')
            .select('*')
            .eq('userId', userId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Supabase export CSV error:', error);
            throw error;
        }

        const headers = ['Data', 'Cliente', 'Item', 'Valor', 'Status', 'Data Pagamento'];
        const rows = sales.map((s: any) => [
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

        const { data: sales, error } = await supabase
            .from('sales')
            .select('*')
            .eq('userId', userId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Supabase export JSON error:', error);
            throw error;
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=meu_controle_vendas_backup.json');
        res.json(sales);
    } catch (error) {
        console.error('Export JSON error:', error);
        res.status(500).json({ error: 'Erro ao exportar JSON' });
    }
});

export default router;
