'use client';

import { useState } from 'react';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
import { confirmLessonByStudent, cancelLessonByStudent } from '@/app/actions/attendance';

interface LessonActionsProps {
  logId: string;
  lessonDate: string;
  lessonTime: string;
  status: string;
  compact?: boolean;
}

export default function LessonActions({ logId, lessonDate, lessonTime, status, compact = false }: LessonActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
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
      const res = await confirmLessonByStudent(logId);
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
      const res = await cancelLessonByStudent(logId);
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
      <div className={`${compact ? 'mt-0' : 'mt-4'} p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs rounded-xl flex items-center gap-2 font-medium`}>
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{compact ? 'Desmarcada' : 'Você desmarcou esta aula. Entre em contato para reagendamento.'}</span>
      </div>
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
