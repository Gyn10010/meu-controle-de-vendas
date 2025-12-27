import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth.service';
import { validate, schemas } from '../middleware/validation.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(schemas.register), async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Hash password
        const hashedPassword = await authService.hashPassword(password);

        // Create user
        const { data: user, error } = await supabase
            .from('users')
            .insert({
                id: crypto.randomUUID(), // SQLite/Prisma used to handle this, verify if Supabase/Postgres needs explicit ID or if default(uuid()) works. SDK might not trigger default? It usually does if omitted, but let's see. schema.prisma had @default(uuid()).
                email,
                password: hashedPassword,
                name,
                updatedAt: new Date().toISOString() // Manual timestamp if needed, but DB should handle default(now())
            })
            .select() // Important to get return data
            .single();

        if (error || !user) {
            console.error('Supabase create error:', error);
            throw error;
        }

        // Generate token
        const token = authService.generateToken({
            userId: user.id,
            email: user.email,
        });

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token,
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validate(schemas.login), async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Verify password
        const isValidPassword = await authService.comparePassword(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Generate token
        const token = authService.generateToken({
            userId: user.id,
            email: user.email,
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

/**
 * GET /api/auth/me
 * Get current user (requires authentication)
 */
router.get('/me', async (req, res) => {
    try {
        // This will be populated by auth middleware
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, name, createdAt')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

export default router;
