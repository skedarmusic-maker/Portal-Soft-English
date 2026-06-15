'use client';

import { useState } from 'react';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
import { confirmLessonByStudent, cancelLessonByStudent } from '@/app/actions/attendance';

interface LessonActionsProps {
  logId: string;
  lessonDate: string;
  lessonTime: string;
  status: string;
}

export default function LessonActions({ logId, lessonDate, lessonTime, status }: LessonActionsProps) {
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
        setSuccessMsg('Presença confirmada com sucesso! Bons estudos.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocorreu um erro ao confirmar a presença.');
    } finally {
      setLoading(null);
    }
  }

  async function handleCancel() {
    if (!canCancel) {
      setErrorMsg('As aulas só podem ser desmarcadas com no mínimo 1 hora de antecedência.');
      return;
    }

    if (!confirm('Tem certeza de que não poderá comparecer a esta aula? O status será alterado para Falta Justificada.')) {
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
        setSuccessMsg('Aula desmarcada. O professor foi notificado.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocorreu um erro ao desmarcar a aula.');
    } finally {
      setLoading(null);
    }
  }

  if (status === 'justified') {
    return (
      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs rounded-xl flex items-center gap-2 font-medium">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Você desmarcou esta aula. Entre em contato para reagendamento.</span>
      </div>
    );
  }

  if (status === 'absent') {
    return (
      <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2 font-medium">
        <X className="w-4 h-4 shrink-0" />
        <span>Presença registrada como Falta para esta aula.</span>
      </div>
    );
  }

  return (
    <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {canCancel ? (
            <span>Você pode desmarcar esta aula até 1 hora antes do início.</span>
          ) : (
            <span className="text-rose-400 font-medium">Limite para desmarcar pelo portal excedido (menos de 1h para a aula).</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Cancelar */}
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={loading !== null}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading === 'cancel' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              Não Comparecerei
            </button>
          )}

          {/* Botão Confirmar */}
          <button
            onClick={handleConfirm}
            disabled={loading !== null || status === 'present'}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-60 ${
              status === 'present'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
            }`}
          >
            {loading === 'confirm' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {status === 'present' ? 'Presença Confirmada' : 'Confirmar Presença'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
