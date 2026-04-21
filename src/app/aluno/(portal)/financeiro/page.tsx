import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Wallet, CheckCircle, AlertCircle, Clock, Upload, ArrowUpRight } from 'lucide-react';
import ReceiptUploader from './ReceiptUploader';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function FinanceiroPage() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get('portal_student_id')?.value;

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('student_id', studentId)
    .order('due_date', { ascending: false });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStatusInfo = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'pending';
    if (isOverdue) return { label: 'Atrasado', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: AlertCircle };
    if (status === 'paid') return { label: 'Pago', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle };
    if (status === 'review') return { label: 'Em Análise', color: 'text-brand-purple bg-brand-purple/10 border-brand-purple/20', icon: Clock };
    return { label: 'Pendente', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock };
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="glass p-6 md:p-8 rounded-2xl border border-border relative overflow-hidden flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-emerald-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
        
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-400" />
            Financeiro
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe suas mensalidades, vencimentos e envie comprovantes.
          </p>
        </div>

        <div className="bg-card/50 px-6 py-4 rounded-xl border border-emerald-500/20 text-center shadow-lg">
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Valor da Mensalidade</p>
          <p className="text-2xl font-black text-emerald-400">{student.monthly_fee ? formatCurrency(student.monthly_fee) : 'A Combinar'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold px-1">Histórico de Faturas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(payments || []).map(payment => {
            const statusInfo = getStatusInfo(payment.status, payment.due_date);
            const Icon = statusInfo.icon;
            
            return (
              <div key={payment.id} className="glass p-5 rounded-xl border border-border/50 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 mb-1 block">Referência</span>
                      <h3 className="text-lg font-black">{payment.reference_month}</h3>
                    </div>
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusInfo.color}`}>
                      <Icon className="w-3 h-3" /> {statusInfo.label}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-6">
                    <p className="text-3xl font-black">{formatCurrency(payment.amount || student.monthly_fee || 0)}</p>
                    {payment.due_date && (
                      <p className="text-sm text-muted-foreground font-medium">Vence em {new Date(payment.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border/50">
                  {payment.status === 'paid' && payment.receipt_url && (
                    <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-sm font-bold text-foreground transition-all">
                      Ver Comprovante <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                  {payment.status === 'review' && (
                    <p className="text-xs text-center font-bold text-brand-purple flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Aguardando Confirmação
                    </p>
                  )}
                  {(payment.status === 'pending' || payment.status === 'late') && (
                    <ReceiptUploader paymentId={payment.id} studentId={studentId} />
                  )}
                </div>
              </div>
            );
          })}
          
          {(!payments || payments.length === 0) && (
            <div className="col-span-full text-center py-12 px-6 border-2 border-dashed border-border/30 rounded-2xl text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto opacity-20 mb-3" />
              <p className="font-semibold text-foreground">Nenhuma fatura gerada.</p>
              <p className="text-sm">As suas mensalidades aparecerão aqui quando forem faturadas pela sua professora.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
