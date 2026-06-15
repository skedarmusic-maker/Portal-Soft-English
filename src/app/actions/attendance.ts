'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

import { syncEvent, deleteEvent } from '@/lib/google-calendar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function saveAttendance(formData: FormData) {
  const logId      = formData.get('logId') as string;
  const studentId  = formData.get('studentId') as string;
  const date       = formData.get('date') as string;
  const lessonTime = formData.get('lesson_time') as string;
  const content    = formData.get('content') as string;
  const status     = formData.get('status') as string;

  if (!studentId || !date) {
    return { error: 'ID do aluno e data são obrigatórios' };
  }

  let result;
  if (logId) {
    // Editar aula existente
    result = await supabase
      .from('attendance_logs')
      .update({
        lesson_date: date,
        lesson_time: lessonTime || null,
        content,
        status,
      })
      .eq('id', logId)
      .select()
      .single();
  } else {
    // Criar nova aula
    result = await supabase
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
  }

  const { data: newLog, error } = result;

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

export async function confirmLessonByStudent(logId: string) {
  const { data: log, error: fetchError } = await supabase
    .from('attendance_logs')
    .select('*, students(id)')
    .eq('id', logId)
    .single();

  if (fetchError || !log) {
    console.error('Erro ao buscar aula:', fetchError);
    return { error: 'Aula não encontrada' };
  }

  const { error } = await supabase
    .from('attendance_logs')
    .update({
      status: 'present',
      content: log.content ? `${log.content} (Confirmado pelo Aluno)` : 'Aula Confirmada pelo Aluno'
    })
    .eq('id', logId);

  if (error) {
    console.error('Erro ao confirmar aula:', error);
    return { error: 'Erro ao confirmar presença' };
  }

  // Sincronizar com Google Agenda
  await syncEvent(logId);

  revalidatePath('/aluno');
  revalidatePath(`/students/${log.students.id}`);
  revalidatePath('/calendar');
  revalidatePath('/');

  return { success: true };
}

export async function cancelLessonByStudent(logId: string) {
  const { data: log, error: fetchError } = await supabase
    .from('attendance_logs')
    .select('*, students(id)')
    .eq('id', logId)
    .single();

  if (fetchError || !log) {
    console.error('Erro ao buscar aula:', fetchError);
    return { error: 'Aula não encontrada' };
  }

  // Verificar antecedência de 1 hora
  const lessonDate = log.lesson_date;
  const lessonTime = log.lesson_time || '14:00';
  const lessonDateTime = new Date(`${lessonDate}T${lessonTime}:00-03:00`);
  const now = new Date();

  // Calcular diferença em milissegundos
  const diffMs = lessonDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    return { 
      error: 'As aulas só podem ser desmarcadas com no mínimo 1 hora de antecedência para garantir o direito de remarcação.' 
    };
  }

  const { error } = await supabase
    .from('attendance_logs')
    .update({
      status: 'justified',
      content: log.content ? `${log.content} (Desmarcado pelo Aluno)` : 'Desmarcado pelo Aluno'
    })
    .eq('id', logId);

  if (error) {
    console.error('Erro ao desmarcar aula:', error);
    return { error: 'Erro ao desmarcar aula' };
  }

  // Sincronizar com Google Agenda
  await syncEvent(logId);

  revalidatePath('/aluno');
  revalidatePath(`/students/${log.students.id}`);
  revalidatePath('/calendar');
  revalidatePath('/');

  return { success: true };
}

export async function confirmProjectedLessonByStudent(studentId: string, date: string, time: string) {
  // Criar um novo log de presença (present)
  const { data: newLog, error } = await supabase
    .from('attendance_logs')
    .insert({
      student_id: studentId,
      lesson_date: date,
      lesson_time: time || null,
      status: 'present',
      content: 'Aula Confirmada pelo Aluno'
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao confirmar aula projetada:', error);
    return { error: 'Erro ao confirmar presença' };
  }

  // Sincronizar com Google Agenda
  await syncEvent(newLog.id);

  revalidatePath('/aluno');
  revalidatePath(`/students/${studentId}`);
  revalidatePath('/calendar');
  revalidatePath('/');

  return { success: true };
}

export async function cancelProjectedLessonByStudent(studentId: string, date: string, time: string) {
  // Criar um novo log já desmarcado (justified)
  const { data: newLog, error } = await supabase
    .from('attendance_logs')
    .insert({
      student_id: studentId,
      lesson_date: date,
      lesson_time: time || null,
      status: 'justified',
      content: 'Desmarcado pelo Aluno (Projeção Regular)'
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao desmarcar aula projetada:', error);
    return { error: 'Erro ao desmarcar aula' };
  }

  // Sincronizar com Google Agenda
  await syncEvent(newLog.id);

  revalidatePath('/aluno');
  revalidatePath(`/students/${studentId}`);
  revalidatePath('/calendar');
  revalidatePath('/');

  return { success: true };
}

