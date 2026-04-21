import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { LogOut, BookOpen, User, Wallet } from 'lucide-react';
import Image from 'next/image';
import { logoutStudent } from '../../actions/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AlunoLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const studentId = cookieStore.get('portal_student_id')?.value;

  if (!studentId) {
    redirect('/aluno/login');
  }

  const { data: student } = await supabase
    .from('students')
    .select('name')
    .eq('id', studentId)
    .single();

  if (!student) {
    redirect('/aluno/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-brand-purple/30">
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/filesooft.png" alt="Logo" width={100} height={32} className="object-contain" />
              <span className="hidden sm:inline-block text-xs font-bold text-muted-foreground uppercase tracking-wider border-l border-border pl-3">
                Portal do Aluno
              </span>
            </div>

            <nav className="flex items-center gap-1 sm:gap-4">
              <Link href="/aluno" className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 text-sm font-medium hover:bg-white/5 rounded-lg transition-colors text-foreground">
                <BookOpen className="w-4 h-4 text-brand-purple" />
                <span className="hidden sm:inline-block">Minhas Aulas</span>
              </Link>
              <Link href="/aluno/financeiro" className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 text-sm font-medium hover:bg-white/5 rounded-lg transition-colors text-foreground">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline-block">Mensalidade</span>
              </Link>

              <div className="h-6 w-px bg-border/50 mx-2" />

              <form action={logoutStudent}>
                <button type="submit" className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline-block">Sair</span>
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
