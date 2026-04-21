'use client';

import { useState } from 'react';
import { generatePayment, approvePayment } from '@/app/actions/finance_admin';
import { Loader2, Plus, DollarSign, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface Payment {
  id: string;
  reference_month: string;
  due_date: string;
  amount: number;
  status: string;
  receipt_url: string;
}

export default function TeacherFinancePanel({ studentId, payments, defaultFee }: { studentId: string, payments: Payment[], defaultFee?: number }) {
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.append('studentId', studentId);
    
    await generatePayment(fd);
    (e.target as HTMLFormElement).reset();
    setLoading(false);
  }

  async function handleApprove(id: string) {
    if (!confirm('Tem certeza que deseja aprovar e marcar como PAGO?')) return;
    setApprovingId(id);
    await approvePayment(id, studentId);
    setApprovingId(null);
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Form de Gerar Fatura */}
      <form onSubmit={handleSubmit} className="bg-card/30 p-5 rounded-xl border border-border/50 space-y-4">
        <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4" /> Gerar Nova Mensalidade</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Referência Mês/Ano</label>
            <input type="text" name="referenceMonth" required placeholder="Ex: 05/2026" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-brand-purple outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Valor (R$)</label>
            <input type="number" step="0.01" name="amount" defaultValue={defaultFee || ''} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-brand-purple outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">Vencimento</label>
            <input type="date" name="dueDate" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-brand-purple outline-none" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4"/> Gerar Fatura</>}
        </button>
      </form>

      {/* Lista */}
      <div className="space-y-3">
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">Nenhuma cobrança gerada para este aluno.</p>
        ) : (
          payments.map(pay => {
            const isReview = pay.status === 'review';
            const isPaid = pay.status === 'paid';
            return (
              <div key={pay.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-xl border border-border/50 gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h4 className="font-black text-lg">{pay.reference_month}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                      isReview ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/30' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    }`}>
                      {isPaid ? 'Pago' : isReview ? 'Revisar Comprovante' : 'Aguardando'}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(pay.amount)}</p>
                  {pay.due_date && <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Vence: {new Date(pay.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>}
                </div>

                <div className="flex items-center gap-3 shrink-0 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/50 w-full md:w-auto justify-end">
                  {pay.receipt_url && (
                    <a href={pay.receipt_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-white bg-white/5 border border-border px-3 py-1.5 rounded-lg transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> Ver Comprovante
                    </a>
                  )}
                  
                  {isReview && (
                    <button 
                      onClick={() => handleApprove(pay.id)}
                      disabled={approvingId === pay.id}
                      className="px-4 py-1.5 text-xs font-bold bg-emerald-500 text-white rounded-lg transition-colors shadow flex items-center gap-1"
                    >
                      {approvingId === pay.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : <><CheckCircle className="w-3.5 h-3.5"/> Aprovar Pagamento</>}
                    </button>
                  )}
                  
                  {(pay.status === 'pending' || pay.status === 'late') && (
                    <button 
                      onClick={() => handleApprove(pay.id)}
                      disabled={approvingId === pay.id}
                      className="px-3 py-1.5 text-xs font-bold bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg transition-colors border border-border"
                    >
                      {approvingId === pay.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Marcar PG (Manual)'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
