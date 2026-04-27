import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttmrkissdzwqgnqypvlk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bXJraXNzZHp3cWducXlwdmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTYwNDAsImV4cCI6MjA5MjE3MjA0MH0.rjAIaW-l1PoZwLUhVlG97p3XfMVyVTVUwP05rdiWPeI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Total students found:', data.length);
  console.log('Student names:', data.map(s => s.name).join(', '));
  console.log('Detailed data for first 5:', JSON.stringify(data.slice(0, 5), null, 2));
}

checkStudents();
