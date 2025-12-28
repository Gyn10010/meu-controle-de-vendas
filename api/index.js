// Minimal Vercel Serverless Function (ES Module)
export default (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Diagnostic endpoint
    if (req.url === '/api/diagnose' || req.url === '/diagnose') {
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

    // Health check
    if (req.url === '/api/health' || req.url === '/health') {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
        return;
    }

    // Default response
    res.status(200).json({
        message: 'API is working!',
        url: req.url,
        method: req.method
    });
};
