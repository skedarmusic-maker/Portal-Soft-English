import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttmrkissdzwqgnqypvlk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bXJraXNzZHp3cWducXlwdmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTYwNDAsImV4cCI6MjA5MjE3MjA0MH0.rjAIaW-l1PoZwLUhVlG97p3XfMVyVTVUwP05rdiWPeI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLS() {
  const studentId = '1df15c15-b2fc-4b39-b535-fdb13717dbd7'; // Gabriel
  const date = '2026-04-27';

  console.log('Testing insert into lesson_materials...');
  const { data, error } = await supabase
    .from('lesson_materials')
    .insert({
      student_id: studentId,
      lesson_date: date,
      file_type: 'link',
      link_url: 'https://test.com',
      link_title: 'Test RLS'
    });

  if (error) {
    console.error('Insert Error:', error.message);
  } else {
    console.log('Insert Success!');
  }
}

testRLS();
