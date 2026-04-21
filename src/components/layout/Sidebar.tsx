import Link from 'next/link';
import Image from 'next/image';
import { Home, Users, Calendar, Settings, BookOpen } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Alunos', href: '/students', icon: Users },
  { name: 'Planogramas', href: '/lesson-plans', icon: BookOpen },
  { name: 'Calendário', href: '/calendar', icon: Calendar },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-card h-screen flex-shrink-0 hidden md:flex flex-col z-20">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-[0_0_15px_rgba(124,58,237,0.3)] border border-white/10">
            <Image 
              src="/images/filesooft.png" 
              alt="Soft English Logo" 
              fill
              className="object-cover"
            />
          </div>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-pink whitespace-nowrap">
            Soft English
          </span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors group font-medium"
          >
            <item.icon className="w-5 h-5 group-hover:text-brand-pink transition-colors" />
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="glass-pink p-4 rounded-xl flex flex-col items-center text-center">
           <span className="text-sm font-medium mb-1 text-foreground">Próxima Aula</span>
           <span className="text-xs text-brand-pink font-semibold tracking-wide">HOJE, 18:00</span>
           <span className="text-sm text-foreground mt-1 text-center">Joaquim Silva</span>
        </div>
      </div>
    </aside>
  );
}
