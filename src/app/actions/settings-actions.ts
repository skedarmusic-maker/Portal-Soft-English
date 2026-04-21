'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function saveSettings(formData: FormData) {
  const school_name = formData.get('school_name') as string;
  const teacher_name = formData.get('teacher_name') as string;
  const contact_email = formData.get('contact_email') as string;
  const bio = formData.get('bio') as string;

  const { error } = await supabase
    .from('school_settings')
    .upsert({
      id: 'global',
      school_name,
      teacher_name,
      contact_email,
      bio,
    });

  if (error) {
    console.error('Erro ao salvar configurações:', error);
    return { error: 'Erro ao salvar configurações no banco' };
  }

  revalidatePath('/settings');
  revalidatePath('/');
  
  return { success: true };
}

export async function getSettings() {
  const { data } = await supabase
    .from('school_settings')
    .select('*')
    .eq('id', 'global')
    .single();
    
  return data || {
    school_name: 'Soft English',
    teacher_name: 'Professor Admin',
    contact_email: 'contato@softenglish.com',
    bio: 'Professor de inglês com foco em conversação e resultados reais.',
  };
}
