// Simplified Vercel Serverless Function
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
            hasSupabaseUrl: !!process.env.SUPABASE_URL,
            hasSupabaseKey: !!process.env.SUPABASE_KEY,
            hasJwtSecret: !!process.env.JWT_SECRET,
        };
        res.status(200).json({ status: 'diagnostic', env: envStatus });
        return;
    }

    // Default response - API is working but route not implemented yet
    res.status(200).json({
        message: 'API is running',
        note: 'Authentication routes will be added after frontend loads successfully',
        url: req.url,
        method: req.method
    });
};
