'use client';

import { useState } from 'react';
import { addHomework, markHomeworkDone } from '@/app/actions/homework';
import { CheckCircle2, Loader2, Plus, Clock, CheckCircle } from 'lucide-react';

interface Homework {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
}

export default function TeacherHomeworkPanel({ studentId, homeworks }: { studentId: string, homeworks: Homework[] }) {
  const [loading, setLoading] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.append('studentId', studentId);
    
    await addHomework(fd);
    (e.target as HTMLFormElement).reset();
    setLoading(false);
  }

  async function handleComplete(id: string) {
    setCompletingId(id);
    await markHomeworkDone(id, studentId);
    setCompletingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Form de Adicionar */}
      <form onSubmit={handleSubmit} className="bg-card/30 p-5 rounded-xl border border-border/50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Título da Tarefa</label>
            <input type="text" name="title" required placeholder="Ex: Unit 5 Workbook" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-brand-purple outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Prazo (Data)</label>
            <input type="date" name="dueDate" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-brand-purple outline-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase">Descrição / Instruções (Opcional)</label>
          <textarea name="description" rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-brand-purple outline-none resize-none" />
        </div>
        <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4"/> Atribuir Lição</>}
        </button>
      </form>

      {/* Lista */}
      <div className="space-y-3">
        {homeworks.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">Nenhuma tarefa pendente ou entregue.</p>
        ) : (
          homeworks.map(hw => (
            <div key={hw.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-xl border border-border/50 gap-4">
              <div>
                <h4 className="font-bold flex items-center gap-2">
                  {hw.status === 'done' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-amber-500" />}
                  {hw.title}
                </h4>
                {hw.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{hw.description}</p>}
                {hw.due_date && <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase tracking-wide">Prazo: {new Date(hw.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>}
              </div>

              {hw.status === 'pending' && (
                <button 
                  onClick={() => handleComplete(hw.id)}
                  disabled={completingId === hw.id}
                  className="px-4 py-1.5 text-xs font-bold bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg transition-colors border border-border shrink-0 text-center flex items-center justify-center"
                >
                  {completingId === hw.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Marcar como Corrigida'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
