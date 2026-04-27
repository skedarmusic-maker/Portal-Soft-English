import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Calendar, CheckCircle2, Clock, BookOpen, AlertCircle, ExternalLink, Paperclip } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AlunoDashboard() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get('portal_student_id')?.value;

  // 1. Buscar Aluno
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();

  // 2. Buscar Aulas (presenças do mês atual para calcular as restantes)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [{ data: logs }, { data: materials }, { data: homeworks }] = await Promise.all([
    supabase
      .from('attendance_logs')
      .select('*')
      .eq('student_id', studentId)
      .order('lesson_date', { ascending: false }),
    supabase
      .from('lesson_materials')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }),
    supabase
      .from('homeworks')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: true })
  ]);

  // Cálculos de Aulas Restantes no Mês Atual
  const allLogs = logs || [];
  const thisMonthPresent = allLogs.filter(l => 
    l.lesson_date >= firstDay && 
    l.lesson_date <= lastDay && 
    l.status === 'present'
  );
  
  const totalClassesTarget = student.monthly_plan_classes || 8; // Default 8 se nulo
  const lessonsTaken = thisMonthPresent.length;
  const lessonsRemaining = Math.max(0, totalClassesTarget - lessonsTaken);
  
  // Agrupar materiais
  const materialsByDate: Record<string, any[]> = {};
  (materials || []).forEach(mat => {
    if (!materialsByDate[mat.lesson_date]) materialsByDate[mat.lesson_date] = [];
    materialsByDate[mat.lesson_date].push(mat);
  });

  const pendingHomeworks = (homeworks || []).filter(h => h.status === 'pending');

  // Calcular próxima data de aula (para exibir materiais futuros no portal do aluno)
  const DAY_MAP: Record<string, number> = {
    dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, 'sáb': 6, sab: 6,
  };
  const scheduleStr = (student.schedule || '').toLowerCase();
  const scheduledWeekDays: number[] = [];
  Object.entries(DAY_MAP).forEach(([key, val]) => {
    if (scheduleStr.includes(key)) scheduledWeekDays.push(val);
  });

  // Próxima aula = próximo dia da semana com aula, a partir de hoje
  let nextLessonDate = '';
  if (scheduledWeekDays.length > 0) {
    for (let i = 0; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (scheduledWeekDays.includes(d.getDay())) {
        nextLessonDate = d.toISOString().split('T')[0];
        break;
      }
    }
  }

  const nextLessonMaterials = nextLessonDate
    ? (materials || []).filter(m => m.lesson_date === nextLessonDate)
    : [];

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER MACRO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card Aluno Info */}
        <div className="glass p-6 rounded-2xl border border-border flex items-center gap-6 col-span-1 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-purple/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">
              {student.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Olá, {student.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground mt-1">Bem-vindo(a) de volta ao seu portal de estudos.</p>
            <div className="flex items-center gap-2 mt-3 text-sm font-medium flex-wrap">
              <span className="bg-white/5 border border-border px-2 py-1 rounded-md text-brand-pink">
                Nível: {student.level || '—'}
              </span>
              <span className="bg-white/5 border border-border px-2 py-1 rounded-md text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {student.schedule || 'Sem horário'}
              </span>
              {student.meeting_link && (
                <a 
                  href={student.meeting_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-brand-purple hover:bg-brand-purple-hover text-white border border-brand-purple/50 px-3 py-1 rounded-md flex items-center gap-2 font-bold shadow-lg shadow-brand-purple/20 transition-all ml-auto sm:ml-2"
                >
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Entrar na Aula
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Card Aulas Mês Atual */}
        <div className="glass p-6 rounded-2xl border border-border relative overflow-hidden flex flex-col justify-center">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -z-10 translate-x-1/3 translate-y-1/3" />
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" /> Pacote (Este Mês)
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-foreground drop-shadow-lg">{lessonsRemaining}</span>
            <span className="text-lg text-muted-foreground mb-1 font-medium">aulas restantes</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Você já teve <strong className="text-cyan-400">{lessonsTaken}</strong> aulas de um total de <strong className="text-foreground">{totalClassesTarget}</strong> neste mês.
          </p>
          <div className="w-full bg-black/40 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-cyan-500 h-full rounded-full transition-all duration-1000 relative"
              style={{ width: `${Math.min(100, (lessonsTaken / totalClassesTarget) * 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: PRÓXIMA AULA + HISTÓRICO */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── PRÓXIMA AULA ─────────────────────────────── */}
          {nextLessonDate && (
            <div className="glass p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Próxima Aula
                  </p>
                  <h3 className="text-xl font-bold text-foreground">
                    {new Date(nextLessonDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  {student.schedule && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {student.schedule}
                    </p>
                  )}
                </div>
                {student.meeting_link && (
                  <a
                    href={student.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-purple hover:bg-brand-purple-hover text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-purple/30 transition-all shrink-0"
                  >
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Entrar na Aula
                  </a>
                )}
              </div>

              {/* Materiais da próxima aula */}
              {nextLessonMaterials.length > 0 ? (
                <div className="mt-5 pt-5 border-t border-emerald-500/20">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-brand-purple" />
                    Materiais Preparados para esta Aula
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {nextLessonMaterials.map(m => (
                      <a
                        key={m.id}
                        href={m.file_url || m.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-black/20 border border-brand-purple/20 hover:border-brand-purple/50 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all group/link"
                      >
                        <div className="w-9 h-9 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center shrink-0 group-hover/link:bg-brand-purple/20 transition-colors">
                          <Paperclip className="w-4 h-4 text-brand-purple" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{m.file_name || m.link_title || 'Material'}</p>
                          <p className="text-[10px] uppercase font-bold text-brand-purple/70">{m.file_type}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-auto opacity-50 group-hover/link:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-emerald-500/20">
                  <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    Nenhum material preparado para esta aula ainda.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── HISTÓRICO ─────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-pink" />
            <h2 className="text-xl font-bold">Histórico de Aulas & Materiais</h2>
          </div>
          
          <div className="space-y-4">
            {allLogs.slice(0, 15).map(log => {
              const dateObj = new Date(log.lesson_date + 'T12:00:00');
              const mats = materialsByDate[log.lesson_date] || [];
              const isPresent = log.status === 'present';
              
              if (!isPresent && mats.length === 0 && !log.content) return null; // Esconde faltas vazias para o aluno focar no conteúdo

              return (
                <div key={log.id} className="glass p-5 rounded-xl border border-border/50 hover:border-brand-purple/30 transition-all flex gap-4 group">
                  <div className="flex flex-col items-center pt-1 min-w-[50px]">
                    <span className="text-[10px] font-bold text-brand-purple uppercase tracking-widest">
                      {dateObj.toLocaleDateString('pt-BR', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-black text-foreground">
                      {dateObj.getDate().toString().padStart(2, '0')}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0 border-l border-border/50 pl-4">
                    {/* Status da Aula no topo, caso justificado ou feriado */}
                    {!isPresent && (
                       <span className="inline-block text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full mb-2">
                         {log.status === 'holiday' ? 'Feriado' : log.status === 'justified' ? 'Justificada' : 'Faltou'}
                       </span>
                    )}

                    <h4 className="font-semibold text-base mb-1 text-foreground">
                      {log.content || <em className="text-muted-foreground/50">Conteúdo não preenchido</em>}
                    </h4>

                    {/* Quadro Branco */}
                    {log.class_notes && (
                      <div className="mt-3 mb-4 bg-black/20 border border-brand-purple/20 rounded-xl p-4 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-purple to-brand-pink" />
                        <h5 className="text-[10px] uppercase font-bold text-brand-purple tracking-widest mb-2">Quadro Branco / Anotações</h5>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-medium">
                          {log.class_notes}
                        </p>
                      </div>
                    )}
                    
                    {/* Lista de Materiais para Download */}
                    {mats.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Paperclip className="w-3 h-3 text-brand-purple" /> Materiais Anexados
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {mats.map(m => (
                            <a 
                              key={m.id} 
                              href={m.file_url || m.link_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-black/20 border border-border hover:border-brand-purple/50 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all group/link"
                            >
                              <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center shrink-0 text-brand-purple group-hover/link:bg-brand-purple/20 transition-colors">
                                {m.file_type === 'pdf' && <span className="text-xs font-bold">PDF</span>}
                                {m.file_type === 'link' && <ExternalLink className="w-4 h-4" />}
                                {m.file_type === 'video' && <span className="text-xs font-bold">VID</span>}
                                {m.file_type === 'audio' && <span className="text-xs font-bold">MP3</span>}
                                {['word', 'ppt', 'file'].includes(m.file_type) && <Paperclip className="w-4 h-4" />}
                              </div>
                              <span className="truncate flex-1 font-medium">{m.file_name || m.link_title || 'Material'}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {allLogs.length === 0 && (
              <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground">
                <p>Nenhuma aula registrada ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: LIÇÃO DE CASA */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold">Lição de Casa</h2>
          </div>

          {pendingHomeworks.length > 0 ? (
            <div className="space-y-4">
              {pendingHomeworks.map(hw => {
                const isOverdue = hw.due_date && new Date(hw.due_date) < today;
                return (
                  <div key={hw.id} className={`glass p-5 rounded-xl border ${isOverdue ? 'border-rose-500/50' : 'border-emerald-500/30'}`}>
                    <div className="flex items-start justify-between mb-2">
                       <h3 className="font-bold text-foreground">{hw.title}</h3>
                       {isOverdue && (
                         <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                           <AlertCircle className="w-3 h-3" /> Atrasada
                         </span>
                       )}
                    </div>
                    {hw.description && (
                      <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{hw.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      {hw.due_date && (
                        <div className="text-xs text-muted-foreground font-medium">
                          Prazo: <span className={isOverdue ? 'text-rose-400' : 'text-emerald-400 font-bold'}>
                            {new Date(hw.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      
                      {/* O aluno não resolve por aqui, ele apenas avisa o professor / ou marcamos como feito */}
                      <button className="px-3 py-1.5 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-border rounded-lg text-xs font-bold transition-colors">
                        Marcar como Feito
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass p-8 rounded-xl border border-border text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-bold text-foreground">Tudo em dia!</h3>
              <p className="text-sm text-muted-foreground mt-1">Você não tem nenhuma tarefa pendente no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
