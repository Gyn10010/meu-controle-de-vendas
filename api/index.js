// Complete Vercel Serverless Function with Authentication
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Supabase
const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/"/g, '');
const supabaseKey = (process.env.SUPABASE_KEY || '').replace(/"/g, '');
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// JWT config
const JWT_SECRET = (process.env.JWT_SECRET || 'default_secret').replace(/"/g, '');
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d').replace(/"/g, '');

export default async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Parse request body for POST requests
        let body = {};
        if (req.method === 'POST' && req.body) {
            body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        }

        // Health check
        if (req.url && req.url.includes('/health')) {
            res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
            return;
        }

        // Diagnostic endpoint
        if (req.url && req.url.includes('/diagnose')) {
            const envStatus = {
                NODE_ENV: process.env.NODE_ENV,
                VERCEL: process.env.VERCEL,
                hasSupabaseUrl: !!supabaseUrl,
                hasSupabaseKey: !!supabaseKey,
                hasJwtSecret: !!JWT_SECRET,
                supabaseConnected: !!supabase,
            };
            res.status(200).json({ status: 'diagnostic', env: envStatus });
            return;
        }

        // Check if Supabase is configured
        if (!supabase) {
            res.status(500).json({ error: 'Database not configured' });
            return;
        }

        // Route: POST /api/auth/register
        if (req.url && req.url.includes('/register') && req.method === 'POST') {
            const { email, password, name } = body;

            if (!email || !password || !name) {
                res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
                return;
            }

            // Check if user exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (existingUser) {
                res.status(400).json({ error: 'Email já cadastrado' });
                return;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const { data: user, error } = await supabase
                .from('users')
                .insert({
                    email,
                    password: hashedPassword,
                    name
                })
                .select('id, email, name')
                .single();

            if (error || !user) {
                console.error('Supabase create error:', error);
                res.status(500).json({ error: 'Erro ao criar usuário' });
                return;
            }

            // Generate token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.status(201).json({
                user: { id: user.id, email: user.email, name: user.name },
                token
            });
            return;
        }

        // Route: POST /api/auth/login
        if (req.url && req.url.includes('/login') && req.method === 'POST') {
            const { email, password } = body;

            if (!email || !password) {
                res.status(400).json({ error: 'Email e senha são obrigatórios' });
                return;
            }

            // Find user
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !user) {
                res.status(401).json({ error: 'Credenciais inválidas' });
                return;
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                res.status(401).json({ error: 'Credenciais inválidas' });
                return;
            }

            // Generate token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.status(200).json({
                user: { id: user.id, email: user.email, name: user.name },
                token
            });
            return;
        }

        // Route: GET /api/auth/me
        if (req.url && req.url.includes('/me') && req.method === 'GET') {
            const authHeader = req.headers.authorization || req.headers.Authorization;

            if (!authHeader) {
                res.status(401).json({ error: 'Token não fornecido' });
                return;
            }

            const token = authHeader.replace('Bearer ', '');

            try {
                const decoded = jwt.verify(token, JWT_SECRET);

                // Get user from database
                const { data: user, error } = await supabase
                    .from('users')
                    .select('id, email, name')
                    .eq('id', decoded.userId)
                    .single();

                if (error || !user) {
                    res.status(401).json({ error: 'Usuário não encontrado' });
                    return;
                }

                res.status(200).json({ user });
                return;
            } catch (error) {
                res.status(401).json({ error: 'Token inválido' });
                return;
            }
        }

        // Route: GET /api/sales - Get all sales for user
        if (req.url && req.url.includes('/sales') && req.method === 'GET' && !req.url.includes('/sales/')) {
            const authHeader = req.headers.authorization || req.headers.Authorization;

            if (!authHeader) {
                res.status(401).json({ error: 'Token não fornecido' });
                return;
            }

            const token = authHeader.replace('Bearer ', '');

            try {
                const decoded = jwt.verify(token, JWT_SECRET);

                // Get all sales for this user
                const { data: sales, error } = await supabase
                    .from('sales')
                    .select('*')
                    .eq('userId', decoded.userId)
                    .order('date', { ascending: false });

                if (error) {
                    console.error('Supabase sales fetch error:', error);
                    res.status(500).json({ error: 'Erro ao buscar vendas' });
                    return;
                }

                res.status(200).json(sales || []);
                return;
            } catch (error) {
                res.status(401).json({ error: 'Token inválido' });
                return;
            }
        }

        // Route: POST /api/sales - Create new sale
        if (req.url && req.url.includes('/sales') && req.method === 'POST') {
            const authHeader = req.headers.authorization || req.headers.Authorization;

            if (!authHeader) {
                res.status(401).json({ error: 'Token não fornecido' });
                return;
            }

            const token = authHeader.replace('Bearer ', '');

            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const { clientName, itemSold, value, date, status } = body;

                if (!clientName || !itemSold || !value || !date) {
                    res.status(400).json({ error: 'Todos os campos são obrigatórios' });
                    return;
                }

                // Create sale
                const { data: sale, error } = await supabase
                    .from('sales')
                    .insert({
                        userId: decoded.userId,
                        clientName,
                        itemSold,
                        value: parseFloat(value),
                        date,
                        status: status || 'pending'
                    })
                    .select()
                    .single();

                if (error || !sale) {
                    console.error('Supabase create sale error:', error);
                    res.status(500).json({ error: 'Erro ao criar venda' });
                    return;
                }

                res.status(201).json(sale);
                return;
            } catch (error) {
                res.status(401).json({ error: 'Token inválido' });
                return;
            }
        }

        // Route: PATCH /api/sales/:id - Update sale status
        if (req.url && req.url.includes('/sales/') && req.method === 'PATCH') {
            const authHeader = req.headers.authorization || req.headers.Authorization;

            if (!authHeader) {
                res.status(401).json({ error: 'Token não fornecido' });
                return;
            }

            const token = authHeader.replace('Bearer ', '');

            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const saleId = req.url.split('/sales/')[1].split('?')[0];
                const { status, paymentDate } = body;

                // Update sale
                const updateData = { status };
                if (paymentDate) {
                    updateData.paymentDate = paymentDate;
                }

                const { data: sale, error } = await supabase
                    .from('sales')
                    .update(updateData)
                    .eq('id', saleId)
                    .eq('userId', decoded.userId)
                    .select()
                    .single();

                if (error || !sale) {
                    console.error('Supabase update sale error:', error);
                    res.status(500).json({ error: 'Erro ao atualizar venda' });
                    return;
                }

                res.status(200).json(sale);
                return;
            } catch (error) {
                res.status(401).json({ error: 'Token inválido' });
                return;
            }
        }

        // Route: DELETE /api/sales/:id - Delete sale
        if (req.url && req.url.includes('/sales/') && req.method === 'DELETE') {
            const authHeader = req.headers.authorization || req.headers.Authorization;

            if (!authHeader) {
                res.status(401).json({ error: 'Token não fornecido' });
                return;
            }

            const token = authHeader.replace('Bearer ', '');

            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const saleId = req.url.split('/sales/')[1].split('?')[0];

                // Delete sale
                const { error } = await supabase
                    .from('sales')
                    .delete()
                    .eq('id', saleId)
                    .eq('userId', decoded.userId);

                if (error) {
                    console.error('Supabase delete sale error:', error);
                    res.status(500).json({ error: 'Erro ao deletar venda' });
                    return;
                }

                res.status(204).end();
                return;
            } catch (error) {
                res.status(401).json({ error: 'Token inválido' });
                return;
            }
        }

        // Default 404
        res.status(404).json({
            error: 'Route not found',
            url: req.url,
            method: req.method
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
