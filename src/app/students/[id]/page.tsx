import { ArrowLeft, Calendar, Paperclip, Wallet, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import AttendanceForm from '@/components/attendance/AttendanceForm';
import RescheduleButton from '@/components/attendance/RescheduleButton';
import MaterialUploadPanel from '@/components/materials/MaterialUploadPanel';
import TeacherHomeworkPanel from '@/components/TeacherHomeworkPanel';
import TeacherFinancePanel from '@/components/TeacherFinancePanel';
import { getMaterials } from '@/app/actions/materials';

import NotesButton from '@/components/attendance/NotesButton';

import EditStudentButton from '@/components/students/EditStudentButton';
import ShareStudentButton from '@/components/students/ShareStudentButton';
import GenerateMeetLinkButton from '@/components/students/GenerateMeetLinkButton';

import DeleteLessonButton from '@/components/attendance/DeleteLessonButton';
import { Trash2 } from 'lucide-react';

const statusStyles: Record<string, string> = {
  present: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  absent:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
  justified: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  holiday: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

const statusLabels: Record<string, string> = {
  present: 'Presente',
  absent:  'Faltou',
  justified: 'Justificado',
  holiday: 'Feriado',
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (!student) notFound();

  const [{ data: logs }, materials, { data: homeworks }, { data: payments }, { data: allStudents }] = await Promise.all([
    supabase
      .from('attendance_logs')
      .select('*')
      .eq('student_id', id)
      .order('lesson_date', { ascending: false }),
    getMaterials(id),
    supabase
      .from('homeworks')
      .select('*')
      .eq('student_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('payments')
      .select('*')
      .eq('student_id', id)
      .order('due_date', { ascending: false }),
    supabase
      .from('students')
      .select('id, name, schedule, status')
  ]);

  const initials = student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const presentCount = logs?.filter(l => l.status === 'present').length ?? 0;
  const absentCount  = logs?.filter(l => l.status === 'absent').length ?? 0;
  const totalCount   = logs?.length ?? 0;

  const reschedulesDone = (logs ?? []).filter(l => l.is_reposicao).map(l => l.reposicao_date);
  const pendingReschedules = (logs ?? []).filter(l => ['holiday', 'justified'].includes(l.status) && !reschedulesDone.includes(l.lesson_date));

  // Agrupar materiais por data de aula
  const materialsByDate: Record<string, typeof materials> = {};
  materials.forEach(mat => {
    if (!materialsByDate[mat.lesson_date]) materialsByDate[mat.lesson_date] = [];
    materialsByDate[mat.lesson_date].push(mat);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Navegação */}
      <Link href="/students" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Voltar para Alunos</span>
      </Link>

      {/* Cartão de Perfil */}
      <div className="glass p-6 md:p-8 rounded-2xl border border-border flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center shadow-[0_0_20px_rgba(219,39,119,0.3)] flex-shrink-0">
          <span className="text-4xl font-bold text-white">{initials}</span>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{student.name}</h1>
              <p className="text-brand-pink font-medium">Nível: {student.level ?? '—'}</p>
            </div>
            <div className="flex items-center gap-3">
              {student.meeting_link && (
                <a 
                  href={student.meeting_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-brand-purple hover:bg-brand-purple-hover text-white rounded-lg text-sm font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Entrar na Aula
                </a>
              )}
              <GenerateMeetLinkButton 
                studentId={student.id} 
                studentName={student.name} 
                hasLink={!!student.meeting_link} 
              />
              <ShareStudentButton studentName={student.name} accessCode={student.access_code} />
              <EditStudentButton student={student} allStudents={allStudents || []} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-card/50 px-3 py-1.5 rounded-md border border-border">
              <Calendar className="w-4 h-4" /> {student.schedule}
            </div>
            {student.notes && (
              <div className="flex items-center gap-1.5 bg-brand-purple/10 text-brand-purple px-3 py-1.5 rounded-md border border-brand-purple/20 text-xs font-medium">
                {student.notes}
              </div>
            )}
          </div>

          {/* Mini Stats */}
          <div className="flex flex-wrap gap-8 mt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalCount}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{presentCount}</div>
              <div className="text-xs text-muted-foreground">Presenças</div>
            </div>
            {student.access_code && (
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-purple tracking-widest">{student.access_code}</div>
                <div className="text-xs text-brand-purple font-bold uppercase tracking-wide mt-1">PIN do Aluno</div>
              </div>
            )}
            {pendingReschedules.length > 0 && (
              <div className="text-center relative">
                <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-brand-pink animate-ping"></span>
                <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-brand-pink"></span>
                <div className="text-2xl font-bold text-cyan-400">{pendingReschedules.length}</div>
                <div className="text-xs text-brand-pink uppercase tracking-wide font-bold mt-1">A Remarcar</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Lição de Casa & Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold">Lição de Casa</h2>
          </div>
          <TeacherHomeworkPanel studentId={id} homeworks={homeworks || []} />
        </div>

        <div className="glass rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold">Financeiro & Mensalidade</h2>
          </div>
          <TeacherFinancePanel studentId={id} payments={payments || []} defaultFee={student.monthly_fee} />
        </div>
      </div>

      {/* Diário de Aulas */}
      <div className="glass rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-pink" /> Diário de Bordo
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Histórico completo de aulas importado da planilha.
            </p>
          </div>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-sm font-medium transition-colors">
            Exportar PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 font-medium px-4 w-36">DATA</th>
                <th className="pb-3 font-medium px-4">CONTEÚDO DA AULA</th>
                <th className="pb-3 font-medium px-4 text-center w-24">MATERIAIS</th>
                <th className="pb-3 font-medium px-4 text-center w-36">STATUS</th>
                <th className="pb-3 font-medium px-4 text-center w-28">AÇÃO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {/* Linha para nova aula */}
              <AttendanceForm studentId={id} />

              {/* Histórico Real do Supabase */}
              {(logs ?? []).map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-medium text-foreground whitespace-nowrap">
                    <div>{new Date(log.lesson_date + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                    {log.lesson_time && <div className="text-[10px] text-brand-pink font-bold">{log.lesson_time}</div>}
                  </td>
                  <td className="py-4 px-4 text-muted-foreground max-w-md">
                    <span className="line-clamp-2">{log.content || <em className="opacity-50">Sem conteúdo</em>}</span>
                    {log.reposicao_date && (
                      <span className="text-xs text-brand-purple block mt-1">↻ Reposição: {log.reposicao_date}</span>
                    )}
                    <div className="mt-2">
                      <NotesButton logId={log.id} initialNotes={log.class_notes} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {materialsByDate[log.lesson_date]?.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-brand-purple text-xs font-bold bg-brand-purple/10 border border-brand-purple/20 px-2 py-1 rounded-md">
                        <Paperclip className="w-3 h-3" />
                        {materialsByDate[log.lesson_date].length}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/20 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${statusStyles[log.status] ?? statusStyles.present}`}>
                      {statusLabels[log.status] ?? statusLabels.present}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {['holiday', 'justified'].includes(log.status) ? (
                        reschedulesDone.includes(log.lesson_date) ? (
                          <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Remarcada</span>
                        ) : (
                          <RescheduleButton studentId={id} originalDate={log.lesson_date} />
                        )
                      ) : log.is_reposicao ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] uppercase font-bold bg-brand-purple/20 text-brand-purple border border-brand-purple/20">
                          Reposição
                        </span>
                      ) : null}
                      
                      <DeleteLessonButton logId={log.id} studentId={id} />
                    </div>
                  </td>
                </tr>
              ))}

              {(!logs || logs.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground text-sm">
                    Nenhuma aula registrada para este aluno.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção de Upload de Materiais */}
      <div className="glass rounded-xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <Paperclip className="w-5 h-5 text-brand-pink" />
          <h2 className="text-xl font-bold">Materiais de Aula</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Anexe PDFs, apresentações, áudios, vídeos ou links de estudo vinculados a uma aula específica.
        </p>

        {/* Selector de aula */}
        {logs && logs.length > 0 ? (
          <div className="space-y-6">
            {(logs ?? []).slice(0, 10).map(log => (
              <div key={log.id} className="border border-border/50 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-card/30 border-b border-border/30">
                  <Calendar className="w-4 h-4 text-brand-pink" />
                  <span className="text-sm font-bold">
                    {new Date(log.lesson_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1 flex-1">{log.content || 'Sem conteúdo'}</span>
                  {materialsByDate[log.lesson_date]?.length > 0 && (
                    <span className="text-[10px] font-bold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full border border-brand-purple/20">
                      {materialsByDate[log.lesson_date].length} arquivo(s)
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <MaterialUploadPanel
                    studentId={id}
                    lessonDate={log.lesson_date}
                    initialMaterials={materialsByDate[log.lesson_date] ?? []}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">Registre aulas primeiro para poder anexar materiais.</p>
        )}
      </div>
    </div>
  );
}
