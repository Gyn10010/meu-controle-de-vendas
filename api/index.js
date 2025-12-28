// Minimal Vercel Serverless Function with Auth (ES Module)
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Supabase
const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/"/g, '');
const supabaseKey = (process.env.SUPABASE_KEY || '').replace(/"/g, '');
const supabase = createClient(supabaseUrl, supabaseKey);

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

        // Route: POST /api/auth/register
        if (req.url.includes('/register') && req.method === 'POST') {
            const { email, password, name } = body;

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
                    id: crypto.randomUUID(),
                    email,
                    password: hashedPassword,
                    name,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
                .select()
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
        if (req.url.includes('/login') && req.method === 'POST') {
            const { email, password } = body;

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
        if (req.url.includes('/me') && req.method === 'GET') {
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

        // Route: GET /api/diagnose
        if (req.url.includes('/diagnose')) {
            const envStatus = {
                NODE_ENV: process.env.NODE_ENV,
                VERCEL: process.env.VERCEL,
                hasSupabaseUrl: !!process.env.SUPABASE_URL,
                hasSupabaseKey: !!process.env.SUPABASE_KEY,
                hasJwtSecret: !!process.env.JWT_SECRET,
            };
            res.status(200).json({ status: 'diagnostic', env: envStatus });
            return;
        }

        // Route: GET /api/health
        if (req.url.includes('/health')) {
            res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
            return;
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
