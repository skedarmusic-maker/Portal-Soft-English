'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Users, Calendar, Settings, BookOpen, X } from 'lucide-react';
import NextClassWidget from './NextClassWidget';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Alunos', href: '/students', icon: Users },
  { name: 'Planogramas', href: '/lesson-plans', icon: BookOpen },
  { name: 'Calendário', href: '/calendar', icon: Calendar },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setIsMobileOpen(true);
    }
    function handleClose() {
      setIsMobileOpen(false);
    }

    window.addEventListener('open-sidebar', handleOpen);
    window.addEventListener('close-sidebar', handleClose);

    return () => {
      window.removeEventListener('open-sidebar', handleOpen);
      window.removeEventListener('close-sidebar', handleClose);
    };
  }, []);

  return (
    <>
      {/* Overlay escuro no mobile quando aberta */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Aside principal */}
      <aside className={`
        fixed md:relative top-0 left-0 h-screen w-64 border-r border-border bg-card 
        flex-shrink-0 flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isMobileOpen ? 'shadow-2xl' : ''}
        md:flex
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-[0_0_15px_rgba(124,58,237,0.3)] border border-white/10">
              <Image 
                src="/images/filesooft.png" 
                alt="Soft English Logo" 
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-pink whitespace-nowrap">
              Soft English
            </span>
          </div>

          {/* Botão de Fechar no Mobile */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)} // Fecha a sidebar ao clicar em um link no mobile
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors group font-medium"
            >
              <item.icon className="w-5 h-5 group-hover:text-brand-pink transition-colors" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border">
          <NextClassWidget />
        </div>
      </aside>
    </>
  );
}
