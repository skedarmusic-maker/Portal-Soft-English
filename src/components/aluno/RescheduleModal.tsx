'use client';

import { useState, useEffect } from 'react';
import { getAvailableSlots, bookReplacementSlot } from '@/app/actions/replacement';
import { X, Calendar as CalendarIcon, Clock, Loader2, AlertCircle, MessageSquare, CheckCircle } from 'lucide-react';

interface RescheduleModalProps {
  onClose: () => void;
  studentId: string;
  originalLogId: string;
  originalDate: string;
}

export default function RescheduleModal({ 
  onClose, 
  studentId, 
  originalLogId, 
  originalDate 
}: RescheduleModalProps) {
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calcular prazo limite de 30 dias corridos
  const originalDateObj = new Date(originalDate + 'T12:00:00');
  const maxDateObj = new Date(originalDateObj);
  maxDateObj.setDate(maxDateObj.getDate() + 30);
  
  const maxDateStr = maxDateObj.toISOString().split('T')[0];
  const maxDateFormatted = maxDateObj.toLocaleDateString('pt-BR');

  useEffect(() => {
    async function loadSlots() {
      setLoading(true);
      setErrorMsg(null);
      const res = await getAvailableSlots(studentId, maxDateStr);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSlots(res.slots || []);
      }
      setLoading(false);
    }
    loadSlots();
  }, [studentId, maxDateStr]);

  async function handleBookSlot(slotId: string) {
    setBookingLoading(slotId);
    setErrorMsg(null);
    try {
      const res = await bookReplacementSlot(slotId, studentId, originalLogId);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocorreu um erro ao agendar a reposição.');
    } finally {
      setBookingLoading(null);
    }
  }

  // Agrupar os slots por data para visualização organizada
  const groupedSlots: Record<string, any[]> = {};
  slots.forEach(slot => {
    if (!groupedSlots[slot.slot_date]) {
      groupedSlots[slot.slot_date] = [];
    }
    groupedSlots[slot.slot_date].push(slot);
  });

  // Link do WhatsApp com mensagem pré-preenchida
  const teacherPhone = process.env.NEXT_PUBLIC_TEACHER_WHATSAPP || '';
  const dateFormattedStr = originalDateObj.toLocaleDateString('pt-BR');
  const waMessage = encodeURIComponent(
    `Olá! Gostaria de verificar novas datas e horários disponíveis para a reposição da minha aula que desmarquei do dia ${dateFormattedStr}.`
  );
  const whatsappUrl = `https://wa.me/${teacherPhone}?text=${waMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass w-full max-w-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 bg-slate-900/80">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
            <CalendarIcon className="w-5 h-5 text-brand-pink" />
            Escolher Reposição
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            disabled={bookingLoading !== null}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h4 className="font-bold text-lg text-emerald-400">Reposição Agendada!</h4>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Sua aula de reposição foi agendada e sincronizada com a agenda da professora com sucesso.
              </p>
            </div>
          ) : (
            <>
              {/* Box de Aviso/Limite */}
              <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-xl p-4 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-brand-pink shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Aviso Importante:</span> Você tem até o dia <span className="font-bold text-brand-pink">{maxDateFormatted}</span> (30 dias corridos) para remarcar e realizar a reposição desta aula desmarcada.
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
                  <span className="text-xs text-muted-foreground font-medium">Buscando horários disponíveis...</span>
                </div>
              ) : Object.keys(groupedSlots).length > 0 ? (
                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Horários Disponíveis:</p>
                  
                  {Object.entries(groupedSlots).map(([dateStr, dateSlots]) => {
                    const dateObj = new Date(dateStr + 'T12:00:00');
                    return (
                      <div key={dateStr} className="space-y-2">
                        <span className="text-xs font-bold text-brand-pink block mt-2 first-letter:uppercase">
                          {dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </span>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {dateSlots.map(slot => (
                            <button
                              key={slot.id}
                              onClick={() => handleBookSlot(slot.id)}
                              disabled={bookingLoading !== null}
                              className="px-3 py-2 bg-white/5 hover:bg-brand-purple/20 border border-white/10 hover:border-brand-purple/30 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                            >
                              {bookingLoading === slot.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 opacity-60" />
                              )}
                              {slot.slot_time.substring(0, 5)}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-muted-foreground/60" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Nenhum horário livre encontrado</h4>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                      Não há horários vagos no calendário de reposição no momento. Clique abaixo para combinar um horário diretamente com a professora.
                    </p>
                  </div>
                  
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Solicitar Novos Horários (WhatsApp)
                  </a>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
