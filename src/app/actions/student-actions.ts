'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function createStudent(formData: FormData) {
  const name        = formData.get('name') as string;
  const level       = formData.get('level') as string;
  const notes       = formData.get('notes') as string;
  const email       = formData.get('email') as string;
  const phone       = formData.get('phone') as string;
  const age         = formData.get('age') as string;
  const objective   = formData.get('objective') as string;
  const accessCode  = formData.get('access_code') as string;
  const monthlyFee  = formData.get('monthly_fee') as string;
  const planClasses = formData.get('monthly_plan_classes') as string;
  const classTime   = formData.get('class_time') as string;

  const meetingLink = formData.get('meeting_link') as string;

  // Montar string de horário a partir dos dias selecionados
  const DAY_LABELS: Record<string, string> = {
    seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb'
  };
  const selectedDays = Object.keys(DAY_LABELS).filter(d => formData.get(`day_${d}`) === 'on');
  const scheduleStr = selectedDays.length > 0
    ? `${selectedDays.map(d => DAY_LABELS[d]).join('/')} ${classTime || ''}`
    : classTime || '';

  if (!name) {
    return { error: 'O nome do aluno é obrigatório' };
  }

  const { error } = await supabase
    .from('students')
    .insert({
      name,
      level:                level || null,
      schedule:             scheduleStr.trim() || null,
      notes:                notes || null,
      email:                email || null,
      phone:                phone || null,
      age:                  age ? parseInt(age) : null,
      objective:            objective || null,
      access_code:          accessCode || null,
      meeting_link:         meetingLink || null,
      monthly_fee:          monthlyFee ? parseFloat(monthlyFee) : null,
      monthly_plan_classes: planClasses ? parseInt(planClasses) : 8,
    });

  if (error) {
    console.error('Erro ao criar aluno:', error);
    return { error: 'Erro ao cadastrar aluno no banco' };
  }

  revalidatePath('/students');
  revalidatePath('/');
  return { success: true };
}
export async function updateStudent(formData: FormData) {
  const id          = formData.get('id') as string;
  const name        = formData.get('name') as string;
  const level       = formData.get('level') as string;
  const notes       = formData.get('notes') as string;
  const email       = formData.get('email') as string;
  const phone       = formData.get('phone') as string;
  const age         = formData.get('age') as string;
  const objective   = formData.get('objective') as string;
  const accessCode  = formData.get('access_code') as string;
  const monthlyFee  = formData.get('monthly_fee') as string;
  const planClasses = formData.get('monthly_plan_classes') as string;
  const classTime   = formData.get('class_time') as string;
  const meetingLink = formData.get('meeting_link') as string;
  const status      = formData.get('status') as string;

  // Montar string de horário
  const DAY_LABELS: Record<string, string> = {
    seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb'
  };
  const selectedDays = Object.keys(DAY_LABELS).filter(d => formData.get(`day_${d}`) === 'on');
  const scheduleStr = selectedDays.length > 0
    ? `${selectedDays.map(d => DAY_LABELS[d]).join('/')} ${classTime || ''}`
    : classTime || '';

  const { error } = await supabase
    .from('students')
    .update({
      name,
      level:                level || null,
      schedule:             scheduleStr.trim() || null,
      notes:                notes || null,
      email:                email || null,
      phone:                phone || null,
      age:                  age ? parseInt(age) : null,
      objective:            objective || null,
      access_code:          accessCode || null,
      meeting_link:         meetingLink || null,
      monthly_fee:          monthlyFee ? parseFloat(monthlyFee) : null,
      monthly_plan_classes: planClasses ? parseInt(planClasses) : 8,
      status:               status || 'active'
    })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar aluno:', error);
    return { error: 'Erro ao atualizar dados no banco' };
  }

  revalidatePath(`/students/${id}`);
  revalidatePath('/students');
  revalidatePath('/');
  return { success: true };
}

export async function generateStudentMeetLink(studentId: string, studentName: string) {
  const { createMeetingLink } = await import('@/lib/google-calendar');
  const result = await createMeetingLink(studentName);

  if (result.error) return result;

  const { error } = await supabase
    .from('students')
    .update({ meeting_link: result.link })
    .eq('id', studentId);

  if (error) {
    console.error('Erro ao salvar link do Meet:', error);
    return { error: 'Erro ao salvar o link no banco' };
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath('/students');
  return { success: true, link: result.link };
}
