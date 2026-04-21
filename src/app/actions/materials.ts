'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadMaterial(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const lessonDate = formData.get('lessonDate') as string;
  const file = formData.get('file') as File | null;
  const linkUrl = formData.get('linkUrl') as string;
  const linkTitle = formData.get('linkTitle') as string;
  const notes = formData.get('notes') as string;

  if (!studentId || !lessonDate) {
    return { error: 'Dados insuficientes para salvar o material.' };
  }

  // --- Upload de Arquivo ---
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const fileType = getFileType(ext);
    const safeName = `${studentId}/${lessonDate}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lesson-materials')
      .upload(safeName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return { error: `Erro ao fazer upload: ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabase.storage
      .from('lesson-materials')
      .getPublicUrl(uploadData.path);

    const { error: dbError } = await supabase.from('lesson_materials').insert({
      student_id: studentId,
      lesson_date: lessonDate,
      file_name: file.name,
      file_url: publicUrlData.publicUrl,
      file_type: fileType,
      file_size_bytes: file.size,
      notes: notes || null,
    });

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
      return { error: 'Arquivo enviado, mas erro ao salvar metadados.' };
    }
  }

  // --- Salvar Link ---
  if (linkUrl && linkUrl.trim().length > 0) {
    const { error: linkError } = await supabase.from('lesson_materials').insert({
      student_id: studentId,
      lesson_date: lessonDate,
      file_type: 'link',
      link_url: linkUrl.trim(),
      link_title: linkTitle || linkUrl.trim(),
      notes: notes || null,
    });

    if (linkError) {
      console.error('Erro ao salvar link:', linkError);
      return { error: 'Erro ao salvar o link.' };
    }
  }

  revalidatePath(`/students/${studentId}`);
  return { success: true };
}

export async function getMaterials(studentId: string, lessonDate?: string) {
  let query = supabase
    .from('lesson_materials')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (lessonDate) {
    query = query.eq('lesson_date', lessonDate);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function deleteMaterial(materialId: string, studentId: string, fileUrl?: string) {
  // Remover do storage se for um arquivo
  if (fileUrl && fileUrl.includes('lesson-materials')) {
    const path = fileUrl.split('/lesson-materials/')[1];
    if (path) {
      await supabase.storage.from('lesson-materials').remove([path]);
    }
  }

  const { error } = await supabase
    .from('lesson_materials')
    .delete()
    .eq('id', materialId);

  if (error) return { error: 'Erro ao deletar material.' };

  revalidatePath(`/students/${studentId}`);
  return { success: true };
}

function getFileType(ext: string): string {
  const types: Record<string, string> = {
    pdf: 'pdf',
    doc: 'word', docx: 'word',
    ppt: 'ppt', pptx: 'ppt',
    mp3: 'audio', wav: 'audio', ogg: 'audio', m4a: 'audio',
    mp4: 'video', mov: 'video', avi: 'video', webm: 'video',
  };
  return types[ext] || 'file';
}
