import { Users, GraduationCap, Clock, TrendingUp, BookOpen } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import NewStudentButton from '@/components/students/NewStudentButton';
import NewLessonButton from '@/components/attendance/NewLessonButton';
import WeeklyTimeline from '@/components/dashboard/WeeklyTimeline';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function DashboardPage() {
  const [{ data: students }, { data: recentLogs }, { count: totalLogs }] = await Promise.all([
    supabase.from('students').select('id, name, schedule, status').eq('status', 'active').order('name'),
    supabase
      .from('attendance_logs')
      .select('id, lesson_date, content, status, is_reposicao, student_id, students(name)')
      .order('lesson_date', { ascending: false })
      .limit(5),
    supabase.from('attendance_logs').select('*', { count: 'exact', head: true }).eq('status', 'present'),
  ]);

  const activeCount = students?.length ?? 0;
  const totalPresent = totalLogs ?? 0;
  const reposicaoCount = (recentLogs ?? []).filter((l) => l.is_reposicao).length;

  const stats = [
    { title: 'Alunos Ativos', value: String(activeCount), icon: Users, change: 'No banco de dados' },
    { title: 'Aulas Registradas', value: String(totalPresent), icon: GraduationCap, change: 'Total de presenças' },
    { title: 'Horas Estimadas', value: `${totalPresent}h`, icon: Clock, change: '1h por aula' },
    { title: 'Taxa de Retenção', value: `${totalPresent > 0 ? Math.round((reposicaoCount / totalPresent) * 100) : 0}%`, icon: TrendingUp, change: 'Das últimas aulas' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Painel Gerencial</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui está o resumo da sua escola.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/students" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-border text-foreground rounded-md font-medium transition-colors">
            Ver Alunos
          </Link>
          <NewStudentButton />
          <NewLessonButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="glass p-6 rounded-xl flex flex-col gap-4 border border-border hover:border-brand-purple/30 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground font-medium">{stat.title}</span>
              <div className="p-2 bg-white/5 rounded-lg">
                <stat.icon className="w-5 h-5 text-brand-pink" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-brand-purple">{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grade Semanal Full Width */}
      <WeeklyTimeline students={students || []} />

      {/* Lista de Alunos Ativos no Rodapé */}
      <div className="glass rounded-xl p-6 border border-border">
        <h2 className="text-xl font-bold mb-6">Todos os Alunos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(students ?? []).map((student) => (
            <Link key={student.id} href={`/students/${student.id}`} className="block">
              <div className="p-4 bg-card/40 border border-border/50 rounded-xl hover:border-brand-pink transition-colors group h-full">
                <p className="font-bold group-hover:text-brand-pink transition-colors">{student.name}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {student.schedule}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
