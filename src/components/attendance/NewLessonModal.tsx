'use client';

import { useState, useEffect } from 'react';
import { saveAttendance } from '@/app/actions/attendance';
import { X, Loader2, Calendar as CalendarIcon, User } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewLessonModal({ onClose, preSelectedStudentId }: { onClose: () => void, preSelectedStudentId?: string }) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<{ id: string, name: string }[]>([]);
  const [fetchingStudents, setFetchingStudents] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      const { data } = await supabase.from('students').select('id, name').order('name');
      setStudents(data || []);
      setFetchingStudents(false);
    }
    loadStudents();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await saveAttendance(formData);

    if (result.success) {
      onClose();
    } else {
      alert(result.error);
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass w-full max-w-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-pink" /> 
            Agendar Nova Aula
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3" /> Selecionar Aluno
            </label>
            <select 
              name="studentId"
              required
              disabled={fetchingStudents}
              defaultValue={preSelectedStudentId || ""}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none appearance-none disabled:opacity-50"
            >
              {fetchingStudents ? (
                <option className="bg-slate-900">Carregando alunos...</option>
              ) : (
                <>
                  <option value="" className="bg-slate-900">Selecione um aluno</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Data da Aula</label>
              <input 
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status Inicial</label>
              <select 
                name="status"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none appearance-none"
              >
                <option value="present" className="bg-slate-900">Agendada / Presente</option>
                <option value="absent" className="bg-slate-900">Faltou</option>
                <option value="justified" className="bg-slate-900">Justificada</option>
                <option value="holiday" className="bg-slate-900">Feriado</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conteúdo Planejado</label>
            <textarea 
              name="content"
              rows={3}
              placeholder="Ex: Unit 5 - Business Vocabulary"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none resize-none" 
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading || fetchingStudents}
              className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
