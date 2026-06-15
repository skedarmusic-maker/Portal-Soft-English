'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { syncEvent } from '@/lib/google-calendar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null as any;

/**
 * Cria um novo slot de reposição vago (Professora)
 */
export async function createReplacementSlot(date: string, time: string) {
  if (!supabase) return { error: 'Supabase não inicializado' };
  if (!date || !time) return { error: 'Data e horário são obrigatórios' };

  const { data, error } = await supabase
    .from('replacement_slots')
    .insert({
      slot_date: date,
      slot_time: time,
      status: 'available'
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar slot de reposição:', error);
    return { error: 'Erro ao criar slot no banco de dados' };
  }

  revalidatePath('/calendar');
  revalidatePath('/replacement-slots');

  return { success: true, slot: data };
}

/**
 * Exclui ou cancela um slot de reposição (Professora)
 */
export async function deleteReplacementSlot(slotId: string) {
  if (!supabase) return { error: 'Supabase não inicializado' };

  // Se o slot estiver reservado ('booked'), precisamos atualizar o log correspondente?
  // Para simplificar, excluímos ou mudamos para desativado
  const { error } = await supabase
    .from('replacement_slots')
    .delete()
    .eq('id', slotId);

  if (error) {
    console.error('Erro ao deletar slot de reposição:', error);
    return { error: 'Erro ao deletar slot no banco de dados' };
  }

  revalidatePath('/calendar');
  revalidatePath('/replacement-slots');

  return { success: true };
}

/**
 * Altera o status de um slot (Professora)
 */
export async function toggleSlotStatus(slotId: string, status: string) {
  if (!supabase) return { error: 'Supabase não inicializado' };

  const { error } = await supabase
    .from('replacement_slots')
    .update({ status })
    .eq('id', slotId);

  if (error) {
    console.error('Erro ao alterar status do slot:', error);
    return { error: 'Erro ao atualizar status do slot' };
  }

  revalidatePath('/calendar');
  revalidatePath('/replacement-slots');

  return { success: true };
}

/**
 * Obtém todos os slots disponíveis até uma data limite (Aluno)
 */
export async function getAvailableSlots(studentId: string, maxDateStr?: string) {
  if (!supabase) return { error: 'Supabase não inicializado', slots: [] };

  const todayStr = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  let query = supabase
    .from('replacement_slots')
    .select('*')
    .eq('status', 'available')
    .gte('slot_date', todayStr);

  if (maxDateStr) {
    query = query.lte('slot_date', maxDateStr);
  }

  const { data, error } = await query.order('slot_date').order('slot_time');

  if (error) {
    console.error('Erro ao buscar slots disponíveis:', error);
    return { error: 'Erro ao buscar horários disponíveis', slots: [] };
  }

  return { success: true, slots: data || [] };
}

/**
 * Reserva um slot de reposição para o aluno, cria o log de aula de reposição correspondente e sincroniza com o Google Agenda
 */
export async function bookReplacementSlot(slotId: string, studentId: string, originalLogId: string) {
  if (!supabase) return { error: 'Supabase não inicializado' };

  // 1. Verificar se o slot ainda está disponível
  const { data: slot, error: slotError } = await supabase
    .from('replacement_slots')
    .select('*')
    .eq('id', slotId)
    .single();

  if (slotError || !slot) {
    return { error: 'Horário de reposição não encontrado' };
  }

  if (slot.status !== 'available') {
    return { error: 'Este horário já foi preenchido por outro aluno' };
  }

  // 2. Buscar informações do log original (aula desmarcada)
  const { data: originalLog, error: logError } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('id', originalLogId)
    .single();

  if (logError || !originalLog) {
    return { error: 'Aula original desmarcada não encontrada' };
  }

  // 3. Atualizar o slot para 'booked' associando o aluno e a aula original
  const { error: updateSlotError } = await supabase
    .from('replacement_slots')
    .update({
      status: 'booked',
      student_id: studentId,
      original_lesson_id: originalLogId
    })
    .eq('id', slotId);

  if (updateSlotError) {
    console.error('Erro ao reservar slot:', updateSlotError);
    return { error: 'Erro ao reservar o horário no banco' };
  }

  // 4. Criar o novo registro de aula de reposição na tabela attendance_logs
  const { data: newLog, error: createLogError } = await supabase
    .from('attendance_logs')
    .insert({
      student_id: studentId,
      lesson_date: slot.slot_date,
      lesson_time: slot.slot_time,
      status: 'scheduled',
      is_reposicao: true,
      reposicao_date: originalLog.lesson_date,
      content: `Aula de Reposição (Ref. à aula desmarcada de ${new Date(originalLog.lesson_date + 'T12:00:00').toLocaleDateString('pt-BR')})`
    })
    .select()
    .single();

  if (createLogError) {
    console.error('Erro ao criar log de reposição:', createLogError);
    // Rollback do slot
    await supabase.from('replacement_slots').update({ status: 'available', student_id: null, original_lesson_id: null }).eq('id', slotId);
    return { error: 'Erro ao gerar agendamento de reposição' };
  }

  // 5. Atualizar o log original para registrar qual foi a data e o ID do agendamento da reposição (opcional, para controle futuro)
  await supabase
    .from('attendance_logs')
    .update({
      class_notes: originalLog.class_notes 
        ? `${originalLog.class_notes}\n\n[Reposição agendada para ${new Date(slot.slot_date + 'T12:00:00').toLocaleDateString('pt-BR')} às ${slot.slot_time}]`
        : `[Reposição agendada para ${new Date(slot.slot_date + 'T12:00:00').toLocaleDateString('pt-BR')} às ${slot.slot_time}]`
    })
    .eq('id', originalLogId);

  // 6. Sincronizar com Google Agenda
  try {
    await syncEvent(newLog.id);
  } catch (syncErr) {
    console.error('Erro ao sincronizar reposição no Google Agenda:', syncErr);
  }

  revalidatePath('/aluno');
  revalidatePath(`/students/${studentId}`);
  revalidatePath('/calendar');
  revalidatePath('/');

  return { success: true };
}

/**
 * Obtém todos os slots de reposição (disponíveis, reservados, etc.) para visualização da professora
 */
export async function getReplacementSlotsForTeacher() {
  if (!supabase) return { error: 'Supabase não inicializado', slots: [] };

  const { data, error } = await supabase
    .from('replacement_slots')
    .select('*, students(name), original_lesson:original_lesson_id(lesson_date, lesson_time)')
    .order('slot_date', { ascending: true })
    .order('slot_time', { ascending: true });

  if (error) {
    console.error('Erro ao buscar slots para professora:', error);
    return { error: 'Erro ao buscar slots', slots: [] };
  }

  return { success: true, slots: data || [] };
}
