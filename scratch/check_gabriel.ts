import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttmrkissdzwqgnqypvlk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bXJraXNzZHp3cWducXlwdmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTYwNDAsImV4cCI6MjA5MjE3MjA0MH0.rjAIaW-l1PoZwLUhVlG97p3XfMVyVTVUwP05rdiWPeI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGabriel() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .ilike('name', '%Gabriel%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Students found:', JSON.stringify(data, null, 2));
}

checkGabriel();
