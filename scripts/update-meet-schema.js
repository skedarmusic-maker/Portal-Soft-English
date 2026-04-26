const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Adicionando meeting_link em students...');
  // A API do supabase js não permite ALTER TABLE direto a não ser via RPC, 
  // mas podemos fazer isso via pg query ou apenas orientar o usuário.
  // Vou criar a query e usar a API REST se tiver admin key, senão criamos a view.
  console.log('Execute isso no SQL Editor do Supabase:');
  console.log(`
    ALTER TABLE public.students ADD COLUMN IF NOT EXISTS meeting_link TEXT;
    ALTER TABLE public.attendance_logs ADD COLUMN IF NOT EXISTS class_notes TEXT;
  `);
}

run();
