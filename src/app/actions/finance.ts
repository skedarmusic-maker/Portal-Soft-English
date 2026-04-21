'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadPaymentReceipt(formData: FormData) {
  const paymentId = formData.get('paymentId') as string;
  const studentId = formData.get('studentId') as string;
  const file = formData.get('file') as File;

  if (!paymentId || !studentId || !file || file.size === 0) {
    return { error: 'Selecione um arquivo de comprovante.' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const safeName = `${studentId}/${paymentId}-${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('payment-receipts')
    .upload(safeName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Erro no upload do comprovante:', uploadError);
    return { error: 'Erro ao enviar o arquivo.' };
  }

  const { data: publicUrlData } = supabase.storage
    .from('payment-receipts')
    .getPublicUrl(uploadData.path);

  // Atualiza pagamento para status de análise
  const { error: dbError } = await supabase
    .from('payments')
    .update({ 
      receipt_url: publicUrlData.publicUrl,
      status: 'review', 
      payment_date: new Date().toISOString() 
    })
    .eq('id', paymentId);

  if (dbError) {
    return { error: 'Erro ao vincular o comprovante ao pagamento.' };
  }

  revalidatePath('/aluno/financeiro');
  revalidatePath(`/students/${studentId}`);
  return { success: true };
}
