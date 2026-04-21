'use client';

import { useState } from 'react';
import { RefreshCw, X, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { rescheduleAttendance } from '@/app/actions/attendance';

interface RescheduleButtonProps {
  studentId: string;
  originalDate: string;
}

export default function RescheduleButton({ studentId, originalDate }: RescheduleButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formata a data original para exibição
  const displayDate = new Date(originalDate + 'T12:00:00').toLocaleDateString('pt-BR');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await rescheduleAttendance(formData);

    if (result.success) {
      setIsOpen(false);
    } else {
      alert(result.error);
    }
    setLoading(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-brand-purple/20 hover:bg-brand-purple/30 text-brand-purple border border-brand-purple/40 px-3 py-1 text-[11px] uppercase tracking-wide font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 w-full"
      >
        <RefreshCw className="w-3 h-3" /> Remarcar
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass w-full max-w-[360px] rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-brand-pink" /> 
                Remarcar Aula
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <input type="hidden" name="studentId" value={studentId} />
              <input type="hidden" name="originalDate" value={originalDate} />
              
              <div className="bg-card/40 border border-border/50 rounded-lg p-3 text-sm text-center">
                Ref. a aula justificada de: <br/> 
                <span className="font-bold text-brand-pink">{displayDate}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" /> Nova Data
                </label>
                <input 
                  type="date"
                  name="newDate"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Novo Horário
                </label>
                <input 
                  type="time"
                  name="newTime"
                  required
                  defaultValue="18:00"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none" 
                />
              </div>

              <p className="text-[10px] text-muted-foreground/70 italic text-center">
                Consulte as datas e horários disponíveis na sua Grade da Semana.
              </p>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white py-2 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Reagendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
