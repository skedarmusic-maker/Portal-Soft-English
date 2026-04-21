import Link from 'next/link';
import { Filter, GraduationCap } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import NewStudentButton from '@/components/students/NewStudentButton';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COLORS = [
  'from-brand-purple to-brand-pink',
  'from-blue-500 to-cyan-400',
  'from-emerald-500 to-teal-400',
  'from-orange-500 to-red-400',
  'from-pink-500 to-rose-400',
  'from-violet-500 to-purple-400',
];

export default async function StudentsPage() {
  const { data: students } = await supabase
    .from('students')
    .select(`
      id, name, schedule, level, status, notes,
      attendance_logs(count)
    `)
    .order('name');

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Meus Alunos</h1>
          <p className="text-muted-foreground">Gerencie todos os seus alunos ativos e inativos.</p>
        </div>
        <NewStudentButton />
      </div>

      <div className="glass p-4 rounded-xl border border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Buscar aluno por nome..."
            className="bg-background border border-border rounded-lg pl-4 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple w-full text-foreground placeholder:text-muted-foreground transition-all"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-border hover:bg-white/10 rounded-md text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(students ?? []).map((student, i) => {
          const initials = student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
          const color = COLORS[i % COLORS.length];
          const logCount = (student.attendance_logs as unknown as { count: number }[])?.[0]?.count ?? 0;

          return (
            <Link key={student.id} href={`/students/${student.id}`} className="block group">
              <div className="glass rounded-xl p-6 border border-border hover:border-brand-purple/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {initials}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                    student.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {student.status === 'active' ? 'Ativo' : 'Pausado'}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-brand-pink transition-colors">{student.name}</h3>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <GraduationCap className="w-3 h-3" /> Nível {student.level ?? '—'}
                  </span>
                  {student.notes && (
                    <span className="text-xs text-brand-purple mt-1 block">{student.notes}</span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground block text-xs mb-0.5">Horário</span>
                    <span className="font-medium text-sm">{student.schedule || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Aulas registradas</span>
                    <span className="font-bold text-brand-purple">{logCount}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {(!students || students.length === 0) && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            <p className="text-lg">Nenhum aluno encontrado.</p>
            <p className="text-sm mt-1">Cadastre o primeiro aluno usando o botão acima.</p>
          </div>
        )}
      </div>
    </div>
  );
}
