import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import salesRoutes from './routes/sales.routes';
import clientsRoutes from './routes/clients.routes';
import insightsRoutes from './routes/insights.routes';
import { authMiddleware } from './middleware/auth.middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow all for debugging
    credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check mapped to /api/health
app.get(['/health', '/api/health'], (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Diagnostic endpoint to check env vars
app.get('/api/diagnose', (req, res) => {
    const envStatus = {
        NODE_ENV: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_KEY,
        supabaseUrlStart: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 8) + '...' : 'MISSING',
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasJwtExpires: !!process.env.JWT_EXPIRES_IN,
    };
    res.json({ status: 'diagnostic', env: envStatus });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sales', authMiddleware, salesRoutes);
app.use('/api/clients', authMiddleware, clientsRoutes);
app.use('/api/insights', authMiddleware, insightsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Start server only if NOT running in Vercel (serverless)
// In Vercel, we export the app for the function handler.
// Locally, we want to listen on the port.
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/health`);
        console.log(`📍 API Base: http://localhost:${PORT}/api`);
        console.log(`\n✨ Pronto para receber requisições!\n`);
    });
}

export default app;
