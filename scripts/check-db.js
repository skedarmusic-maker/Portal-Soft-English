require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: students, error } = await supabase.from('students').select('id, name');
  if (error) console.error(error);
  else console.log('Alunos:', students);
}

check();
