'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteAttendance } from '@/app/actions/attendance';

interface DeleteLessonButtonProps {
  logId: string;
  studentId: string;
}

export default function DeleteLessonButton({ logId, studentId }: DeleteLessonButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja apagar este registro de aula? Isso também removerá o evento da sua Agenda do Google.')) {
      return;
    }

    setLoading(true);
    const result = await deleteAttendance(logId, studentId);
    
    if (!result.success) {
      alert(result.error);
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
      title="Apagar aula"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
    </button>
  );
}
