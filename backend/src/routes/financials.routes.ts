import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/financials
 * Get financials for the authenticated user
 */
router.get('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { data: financials, error } = await supabase
            .from('financials')
            .select('*')
            .eq('userId', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Not found - return default empty state
                return res.json({
                    financials: {
                        totalRevenue: 0,
                        totalCost: 0,
                        grossProfit: 0,
                        reinvestmentFund: 0,
                        proLaboreBalance: 0,
                        reserveFund: 0
                    }
                });
            }
            console.error('Supabase get financials error:', error);
            throw error;
        }

        res.json({ financials });
    } catch (error) {
        console.error('Get financials error:', error);
        res.status(500).json({ error: 'Erro ao buscar financeiro' });
    }
});

/**
 * PUT /api/financials
 * Update or Initialize financials for the user
 */
router.put('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { totalRevenue, totalCost, grossProfit, reinvestmentFund, proLaboreBalance, reserveFund } = req.body;

        const updatePayload = {
            totalRevenue,
            totalCost,
            grossProfit,
            reinvestmentFund,
            proLaboreBalance,
            reserveFund,
            updatedAt: new Date().toISOString()
        };

        // Check if exists
        const { data: existing, error: fetchError } = await supabase
            .from('financials')
            .select('id')
            .eq('userId', userId)
            .maybeSingle();

        let result;
        let queryError;

        if (existing) {
            const { data, error } = await supabase
                .from('financials')
                .update(updatePayload)
                .eq('userId', userId)
                .select()
                .single();
            result = data;
            queryError = error;
        } else {
            const { data, error } = await supabase
                .from('financials')
                .insert({
                    id: crypto.randomUUID(),
                    userId,
                    ...updatePayload
                })
                .select()
                .single();
            result = data;
            queryError = error;
        }

        if (queryError) {
            console.error('Supabase update financials error:', queryError);
            throw queryError;
        }

        res.json({ financials: result });
    } catch (error) {
        console.error('Update financials error:', error);
        res.status(500).json({ error: 'Erro ao atualizar financeiro' });
    }
});

export default router;
