import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middleware/auth.middleware';
import { geminiService } from '../services/gemini.service';

const router = Router();

/**
 * POST /api/insights/generate
 * Generate financial insights using Gemini AI
 */
router.post('/generate', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        // Get user's sales
        const { data: sales, error } = await supabase
            .from('sales')
            .select('*')
            .eq('userId', userId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Supabase get sales error:', error);
            throw error;
        }

        if (!sales || sales.length === 0) {
            return res.json({
                insights: 'Você ainda não tem vendas registradas. Comece adicionando suas primeiras vendas para receber insights personalizados!'
            });
        }

        // Generate insights
        const insights = await geminiService.generateFinancialInsights(sales);

        res.json({ insights });
    } catch (error) {
        console.error('Generate insights error:', error);
        res.status(500).json({ error: 'Erro ao gerar insights' });
    }
});

export default router;
