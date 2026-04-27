'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

import { syncEvent, deleteEvent } from '@/lib/google-calendar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function saveAttendance(formData: FormData) {
  const studentId  = formData.get('studentId') as string;
  const date       = formData.get('date') as string;
  const lessonTime = formData.get('lesson_time') as string;
  const content    = formData.get('content') as string;
  const status     = formData.get('status') as string;

  if (!studentId || !date) {
    return { error: 'ID do aluno e data são obrigatórios' };
  }

  const { data: newLog, error } = await supabase
    .from('attendance_logs')
    .insert({
      student_id: studentId,
      lesson_date: date,
      lesson_time: lessonTime || null,
      content,
      status,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar aula:', error);
    return { error: 'Erro ao salvar aula no banco de dados' };
  }

  // Sincronizar com Google Calendar
  await syncEvent(newLog.id);

  revalidatePath(`/students/${studentId}`);
  revalidatePath('/');
  revalidatePath('/calendar');
  
  return { success: true };
}

export async function rescheduleAttendance(formData: FormData) {
  const studentId    = formData.get('studentId') as string;
  const originalDate = formData.get('originalDate') as string;
  const newDate      = formData.get('newDate') as string;
  const newTime      = formData.get('newTime') as string;
  
  // Create a new lesson entry marked as Reposição
  const { data: newLog, error } = await supabase
    .from('attendance_logs')
    .insert({
      student_id: studentId,
      lesson_date: newDate,
      lesson_time: newTime || null,
      content: `Remarcação referente a ${originalDate}`,
      status: 'present',
      is_reposicao: true,
      reposicao_date: originalDate
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao remarcar aula:', error);
    return { error: 'Erro ao remarcar aula' };
  }

  // Sincronizar com Google Calendar
  await syncEvent(newLog.id);

  revalidatePath(`/students/${studentId}`);
  revalidatePath('/');
  revalidatePath('/calendar');
  
  return { success: true };
}

export async function deleteAttendance(logId: string, studentId: string) {
  // 1. Buscar o google_event_id antes de deletar
  const { data: log } = await supabase
    .from('attendance_logs')
    .select('google_event_id')
    .eq('id', logId)
    .single();

  // 2. Se tiver evento no Google, deleta lá também
  if (log?.google_event_id) {
    await deleteEvent(log.google_event_id);
  }

  // 3. Deleta do banco
  const { error } = await supabase
    .from('attendance_logs')
    .delete()
    .eq('id', logId);

  if (error) {
    console.error('Erro ao deletar aula:', error);
    return { error: 'Erro ao deletar aula' };
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath('/');
  revalidatePath('/calendar');

  return { success: true };
}
