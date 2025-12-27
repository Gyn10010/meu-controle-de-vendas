import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/clients
 * Get summary of clients with pending debts
 */
router.get('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { data: pendingSales, error } = await supabase
            .from('sales')
            .select('*')
            .eq('userId', userId)
            .eq('status', 'pending')
            .order('date', { ascending: false });

        if (error) {
            console.error('Supabase get pending sales error:', error);
            throw error;
        }

        // Group by client
        const clientMap = new Map<string, { totalDebt: number; lastItem: string }>();

        (pendingSales || []).forEach((sale: any) => {
            const existing = clientMap.get(sale.clientName);
            if (existing) {
                existing.totalDebt += sale.value;
            } else {
                clientMap.set(sale.clientName, {
                    totalDebt: sale.value,
                    lastItem: sale.itemSold,
                });
            }
        });

        const clients = Array.from(clientMap.entries()).map(([clientName, data]) => ({
            clientName,
            totalDebt: data.totalDebt,
            lastItem: data.lastItem,
        }));

        res.json({ clients });
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});

/**
 * GET /api/clients/:name/sales
 * Get all sales for a specific client
 */
router.get('/:name/sales', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { name } = req.params;

        const { data: sales, error } = await supabase
            .from('sales')
            .select('*')
            .eq('userId', userId)
            .ilike('clientName', name)
            .order('date', { ascending: false });

        if (error) {
            console.error('Supabase get client sales error:', error);
            throw error;
        }

        res.json({ sales });
    } catch (error) {
        console.error('Get client sales error:', error);
        res.status(500).json({ error: 'Erro ao buscar vendas do cliente' });
    }
});

export default router;
