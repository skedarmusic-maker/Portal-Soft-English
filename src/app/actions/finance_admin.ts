'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generatePayment(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const referenceMonth = formData.get('referenceMonth') as string;
  const amount = formData.get('amount') as string;
  const dueDate = formData.get('dueDate') as string;

  if (!studentId || !referenceMonth || !amount) {
    return { error: 'Preencha todos os campos obrigatórios.' };
  }

  const { error } = await supabase.from('payments').insert({
    student_id: studentId,
    reference_month: referenceMonth,
    amount: parseFloat(amount),
    due_date: dueDate || null,
    status: 'pending'
  });

  if (error) return { error: 'Erro ao gerar fatura.' };
  
  revalidatePath(`/students/${studentId}`);
  return { success: true };
}

export async function approvePayment(paymentId: string, studentId: string) {
  const { error } = await supabase.from('payments').update({
    status: 'paid',
    payment_date: new Date().toISOString()
  }).eq('id', paymentId);

  if (error) return { error: 'Erro ao aprovar.' };

  revalidatePath(`/students/${studentId}`);
  return { success: true };
}
