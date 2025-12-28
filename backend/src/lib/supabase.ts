import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.replace(/"/g, '') || '';
const supabaseKey = process.env.SUPABASE_KEY?.replace(/"/g, '') || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Supabase URL/Key missing in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
