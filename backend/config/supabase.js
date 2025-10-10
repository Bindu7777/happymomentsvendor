const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - using environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('Key:', supabaseKey ? 'Set' : 'Missing');
  throw new Error('Missing Supabase environment variables');
}

console.log('Backend Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Backend Supabase Key:', supabaseKey ? 'Set' : 'Missing');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
