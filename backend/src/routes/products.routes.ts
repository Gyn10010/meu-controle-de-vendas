import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/products
 * Get all products for the authenticated user
 */
router.get('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('userId', userId)
            .order('name', { ascending: true });

        if (error) {
            console.error('Supabase get products error:', error);
            throw error;
        }

        // Parse expenses JSONB back to object if necessary
        const parsedProducts = products.map(p => ({
            ...p,
            expenses: typeof p.expenses === 'string' ? JSON.parse(p.expenses) : p.expenses
        }));

        res.json({ products: parsedProducts });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { name, category, purchasePrice, expenses, quantity, packagingCost, unitCost, actualPrice, suggestedPrice } = req.body;

        const { data: product, error } = await supabase
            .from('products')
            .insert({
                id: crypto.randomUUID(),
                userId,
                name,
                category,
                purchasePrice,
                expenses, // supabase converts object to jsonb automatically
                quantity,
                packagingCost,
                unitCost,
                actualPrice,
                suggestedPrice,
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase create product error:', error);
            throw error;
        }

        res.status(201).json({ product });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

export default router;
