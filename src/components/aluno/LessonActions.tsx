'use client';

import { useState } from 'react';
import { Check, X, Loader2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { 
  confirmLessonByStudent, 
  cancelLessonByStudent,
  confirmProjectedLessonByStudent,
  cancelProjectedLessonByStudent
} from '@/app/actions/attendance';
import RescheduleModal from './RescheduleModal';

interface LessonActionsProps {
  logId?: string;
  studentId?: string;
  isProjected?: boolean;
  lessonDate: string;
  lessonTime: string;
  status: string;
  compact?: boolean;
}

export default function LessonActions({ 
  logId, 
  studentId,
  isProjected = false,
  lessonDate, 
  lessonTime, 
  status, 
  compact = false 
}: LessonActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Verificar se ainda dá tempo de desmarcar (antecedência mínima de 1 hora)
  const lessonDateTime = new Date(`${lessonDate}T${lessonTime || '14:00'}:00-03:00`);
  const now = new Date();
  const diffMs = lessonDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const canCancel = diffHours >= 1;

  async function handleConfirm() {
    setLoading('confirm');
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      let res;
      if (isProjected && studentId) {
        res = await confirmProjectedLessonByStudent(studentId, lessonDate, lessonTime);
      } else if (logId) {
        res = await confirmLessonByStudent(logId);
      } else {
        res = { error: 'Dados insuficientes' };
      }

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(compact ? 'Confirmada!' : 'Presença confirmada com sucesso! Bons estudos.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocorreu um erro.');
    } finally {
      setLoading(null);
    }
  }

  async function handleCancel() {
    if (!canCancel) {
      setErrorMsg('Prazo excedido.');
      return;
    }

    if (!confirm('Tem certeza de que não poderá comparecer?')) {
      return;
    }

    setLoading('cancel');
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      let res;
      if (isProjected && studentId) {
        res = await cancelProjectedLessonByStudent(studentId, lessonDate, lessonTime);
      } else if (logId) {
        res = await cancelLessonByStudent(logId);
      } else {
        res = { error: 'Dados insuficientes' };
      }

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(compact ? 'Desmarcada.' : 'Aula desmarcada. O professor foi notificado.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocorreu um erro.');
    } finally {
      setLoading(null);
    }
  }

  if (status === 'justified') {
    return (
      <>
        <div className={`${compact ? 'mt-0' : 'mt-4'} p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-medium w-full`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{compact ? 'Desmarcada' : 'Você desmarcou esta aula. Você tem 30 dias para reagendar.'}</span>
          </div>

          <button
            onClick={() => setIsRescheduleOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors shrink-0 shadow-md shadow-amber-500/10"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Remarcar
          </button>
        </div>

        {isRescheduleOpen && studentId && logId && (
          <RescheduleModal
            onClose={() => setIsRescheduleOpen(false)}
            studentId={studentId}
            originalLogId={logId}
            originalDate={lessonDate}
          />
        )}
      </>
    );
  }

  if (status === 'absent') {
    return (
      <div className={`${compact ? 'mt-0' : 'mt-4'} p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2 font-medium`}>
        <X className="w-3.5 h-3.5 shrink-0" />
        <span>{compact ? 'Falta' : 'Presença registrada como Falta para esta aula.'}</span>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "mt-5 pt-4 border-t border-white/5 space-y-3"}>
      <div className={`flex flex-wrap items-center gap-3 ${compact ? 'justify-end' : 'justify-between'}`}>
        {!compact && (
          <div className="text-xs text-muted-foreground">
            {canCancel ? (
              <span>Você pode desmarcar esta aula até 1 hora antes do início.</span>
            ) : (
              <span className="text-rose-400 font-medium">Limite para desmarcar pelo portal excedido (menos de 1h para a aula).</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Botão Cancelar */}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={loading !== null}
              className={`bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-xl font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                compact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'
              }`}
            >
              {loading === 'cancel' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <X className="w-3 h-3" />
              )}
              {compact ? 'Desmarcar' : 'Não Comparecerei'}
            </button>
          )}

          {/* Botão Confirmar */}
          <button
            onClick={handleConfirm}
            disabled={loading !== null || status === 'present'}
            className={`rounded-xl font-bold transition-all flex items-center gap-1.5 disabled:opacity-60 ${
              status === 'present'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
            } ${compact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'}`}
          >
            {loading === 'confirm' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            {status === 'present' ? (compact ? 'Confirmado' : 'Presença Confirmada') : (compact ? 'Confirmar' : 'Confirmar Presença')}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] rounded-lg flex items-center gap-1.5">
          <Check className="w-3 h-3 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
