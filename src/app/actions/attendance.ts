'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function saveAttendance(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const date = formData.get('date') as string;
  const content = formData.get('content') as string;
  const status = formData.get('status') as string;

  if (!studentId || !date) {
    return { error: 'ID do aluno e data são obrigatórios' };
  }

  const { error } = await supabase
    .from('attendance_logs')
    .insert({
      student_id: studentId,
      lesson_date: date,
      content,
      status,
    });

  if (error) {
    console.error('Erro ao salvar aula:', error);
    return { error: 'Erro ao salvar aula no banco de dados' };
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath('/');
  
  return { success: true };
}

export async function rescheduleAttendance(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const originalDate = formData.get('originalDate') as string;
  const newDate = formData.get('newDate') as string;
  const newTime = formData.get('newTime') as string;
  
  // Create a new lesson entry marked as Reposição
  const { error } = await supabase
    .from('attendance_logs')
    .insert({
      student_id: studentId,
      lesson_date: newDate,
      content: `Remarcação referente a ${originalDate} (${newTime})`,
      status: 'present',
      is_reposicao: true,
      reposicao_date: originalDate // We store the original date to link it
    });

  if (error) {
    console.error('Erro ao remarcar aula:', error);
    return { error: 'Erro ao remarcar aula' };
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath('/');
  revalidatePath('/calendar');
  
  return { success: true };
}
