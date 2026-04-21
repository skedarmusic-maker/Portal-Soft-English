'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function loginStudent(formData: FormData) {
  const pin = formData.get('pin') as string;

  if (!pin) {
    return { error: 'Por favor, insira o código de acesso.' };
  }

  // Buscar aluno pelo PIN
  const { data: student, error } = await supabase
    .from('students')
    .select('id, name')
    .eq('access_code', pin.trim())
    .eq('status', 'active')
    .single();

  if (error || !student) {
    return { error: 'Código de acesso inválido ou aluno inativo.' };
  }

  // Setar cookie de acesso
  const cookieStore = await cookies();
  cookieStore.set('portal_student_id', student.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: '/'
  });

  return { success: true, redirect: '/aluno' };
}

export async function logoutStudent() {
  const cookieStore = await cookies();
  cookieStore.delete('portal_student_id');
}
