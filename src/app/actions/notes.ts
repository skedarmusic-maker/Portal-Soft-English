'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function updateClassNotes(logId: string, notes: string) {
  const { error } = await supabase
    .from('attendance_logs')
    .update({ class_notes: notes })
    .eq('id', logId);

  if (error) {
    console.error('Erro ao atualizar anotações:', error);
    return { success: false, error: 'Erro ao salvar o quadro branco.' };
  }

  revalidatePath('/students');
  revalidatePath('/');
  return { success: true };
}
