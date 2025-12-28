import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.replace(/"/g, '') || '';
const supabaseKey = process.env.SUPABASE_KEY?.replace(/"/g, '') || '';

// Fallback to avoid crash on startup if env vars are missing
// This allows the server to start so we can use the /api/diagnose endpoint
const validUrl = supabaseUrl || 'https://placeholder.supabase.co';
const validKey = supabaseKey || 'placeholder-key';

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Supabase URL/Key missing. Database calls will fail.');
}

export const supabase = createClient(validUrl, validKey);
