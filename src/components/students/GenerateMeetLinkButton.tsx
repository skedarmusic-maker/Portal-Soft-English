'use client';

import { useState } from 'react';
import { Video, Loader2, Sparkles } from 'lucide-react';
import { generateStudentMeetLink } from '@/app/actions/student-actions';

interface GenerateMeetLinkButtonProps {
  studentId: string;
  studentName: string;
  hasLink: boolean;
}

export default function GenerateMeetLinkButton({ studentId, studentName, hasLink }: GenerateMeetLinkButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (hasLink && !confirm('Este aluno já possui um link do Meet. Deseja gerar um novo?')) return;

    setLoading(true);
    const result = await generateStudentMeetLink(studentId, studentName);
    
    if (result.error) {
      alert(result.error);
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading}
      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
        hasLink 
          ? 'bg-white/5 hover:bg-white/10 text-muted-foreground border border-white/10' 
          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
      }`}
      title={hasLink ? 'Gerar novo link do Meet' : 'Gerar link automático do Meet'}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {hasLink ? <Video className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {hasLink ? 'Novo Meet' : 'Gerar Google Meet'}
        </>
      )}
    </button>
  );
}
