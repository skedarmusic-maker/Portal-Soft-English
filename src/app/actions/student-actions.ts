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
