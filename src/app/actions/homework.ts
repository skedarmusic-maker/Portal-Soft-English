'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function addHomework(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dueDate = formData.get('dueDate') as string;

  if (!studentId || !title) return { error: 'Faltam dados obrigatórios' };

  const { error } = await supabase.from('homeworks').insert({
    student_id: studentId,
    title,
    description: description || null,
    due_date: dueDate || null,
    status: 'pending'
  });

  if (error) return { error: 'Erro ao salvar lição de casa.' };
  
  revalidatePath(`/students/${studentId}`);
  return { success: true };
}

export async function markHomeworkDone(id: string, studentId: string) {
  const { error } = await supabase.from('homeworks').update({ status: 'done' }).eq('id', id);
  if (error) return { error: 'Erro ao atualizar lição.' };
  revalidatePath(`/students/${studentId}`);
  return { success: true };
}
