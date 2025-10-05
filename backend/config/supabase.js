const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://hemofpnccbnfcmlibxbr.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlbW9mcG5jY2JuZmNtbGliYnIuc3VwYWJhc2UuY28iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMzM4MzE0NCwiZXhwIjoyMDQ4OTU5MTQ0fQ.1GdQw3qQj8Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
