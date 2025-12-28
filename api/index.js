// Vercel Serverless Function Handler
// This is a simplified JavaScript version that doesn't rely on TypeScript compilation
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Diagnostic endpoint
app.get('/api/diagnose', (req, res) => {
    const envStatus = {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_KEY,
        supabaseUrlStart: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 8) + '...' : 'MISSING',
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasJwtExpires: !!process.env.JWT_EXPIRES_IN,
    };
    res.json({ status: 'diagnostic', env: envStatus });
});

// Test endpoint
app.post('/api/test', (req, res) => {
    res.json({ message: 'API is working!', body: req.body });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Export for Vercel
module.exports = app;
