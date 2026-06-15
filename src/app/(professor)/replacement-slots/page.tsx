'use client';

import { useState, useEffect } from 'react';
import { 
  createReplacementSlot, 
  deleteReplacementSlot, 
  toggleSlotStatus, 
  getReplacementSlotsForTeacher 
} from '@/app/actions/replacement';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Loader2, 
  User, 
  CheckCircle2, 
  AlertCircle,
  EyeOff,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TeacherReplacementSlotsPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form states
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function loadSlots() {
    setLoading(true);
    const res = await getReplacementSlotsForTeacher();
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSlots(res.slots || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadSlots();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!date || !time) {
      setErrorMsg('Por favor, preencha a data e o horário.');
      return;
    }

    setSubmitLoading(true);
    const res = await createReplacementSlot(date, time);
    setSubmitLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Horário de reposição criado com sucesso!');
      setDate('');
      setTime('');
      loadSlots();
      // Limpa mensagem de sucesso depois de 3 segundos
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir este horário de reposição?')) return;
    
    setActionLoading(id);
    const res = await deleteReplacementSlot(id);
    setActionLoading(null);

    if (res.error) {
      alert(res.error);
    } else {
      loadSlots();
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === 'available' ? 'disabled' : 'available';
    setActionLoading(id);
    const res = await toggleSlotStatus(id, nextStatus);
    setActionLoading(null);

    if (res.error) {
      alert(res.error);
    } else {
      loadSlots();
    }
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gerenciador de Reposições</h1>
        <p className="text-muted-foreground mt-1">
          Abra horários livres para que os alunos possam reagendar de forma automática.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Formulário de Cadastro */}
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-2xl border border-border shadow-lg space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-pink" />
              Abrir Horário Vago
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Data do Horário Livre
                </label>
                <input 
                  type="date"
                  required
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Horário
                </label>
                <input 
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none" 
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {submitLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                Abrir Horário
              </button>
            </form>
          </div>
        </div>

        {/* Coluna Direita: Listagem e Gerenciamento */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-brand-purple" />
                Horários de Reposição Cadastrados
              </h3>
              <span className="text-xs bg-white/5 px-2.5 py-1 rounded-full text-muted-foreground font-semibold">
                {slots.length} totais
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                <span className="text-xs text-muted-foreground">Carregando horários...</span>
              </div>
            ) : slots.length > 0 ? (
              <div className="divide-y divide-white/5">
                {slots.map(slot => {
                  const dateObj = new Date(slot.slot_date + 'T12:00:00');
                  const isPast = slot.slot_date < format(new Date(), 'yyyy-MM-dd');

                  return (
                    <div key={slot.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-4">
                        {/* Data Badge */}
                        <div className="flex flex-col items-center justify-center bg-white/5 border border-border w-12 h-12 rounded-xl text-center shrink-0">
                          <span className="text-[9px] font-bold text-brand-purple uppercase tracking-wider">
                            {dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                          </span>
                          <span className="text-lg font-black text-foreground -mt-1">
                            {dateObj.getDate().toString().padStart(2, '0')}
                          </span>
                        </div>

                        {/* Detalhes */}
                        <div>
                          <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                            {dateObj.toLocaleDateString('pt-BR', { weekday: 'long' })}
                            {isPast && (
                              <span className="text-[9px] bg-white/5 text-muted-foreground/60 border border-white/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                Passado
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {slot.slot_time.substring(0, 5)}
                          </p>
                        </div>
                      </div>

                      {/* Status / Ações */}
                      <div className="flex items-center gap-3 justify-end">
                        {slot.status === 'booked' ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                              <User className="w-3 h-3" />
                              Reservado por: {slot.students?.name || 'Aluno'}
                            </span>
                            {slot.original_lesson && (
                              <span className="text-[9px] text-muted-foreground">
                                Reposição ref. a {new Date(slot.original_lesson.lesson_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        ) : slot.status === 'disabled' ? (
                          <span className="text-[10px] font-bold text-muted-foreground bg-white/5 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                            <EyeOff className="w-3 h-3" />
                            Oculto / Desativado
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            Disponível
                          </span>
                        )}

                        {/* Botões de Ação */}
                        <div className="flex gap-1.5">
                          {slot.status !== 'booked' && (
                            <button
                              onClick={() => handleToggleStatus(slot.id, slot.status)}
                              disabled={actionLoading === slot.id}
                              className="p-2 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/10 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                              title={slot.status === 'available' ? 'Ocultar / Desativar Horário' : 'Ativar Horário'}
                            >
                              {actionLoading === slot.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : slot.status === 'available' ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(slot.id)}
                            disabled={actionLoading === slot.id}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                            title="Excluir Horário"
                          >
                            {actionLoading === slot.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
                <CalendarIcon className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <h4 className="font-bold text-foreground">Nenhum horário aberto</h4>
                <p className="text-sm mt-1 max-w-xs leading-relaxed">
                  Você ainda não abriu nenhum horário livre para reposição de aulas. Utilize o formulário ao lado para abrir novos horários.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
