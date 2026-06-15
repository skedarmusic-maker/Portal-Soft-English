'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, Settings, LogOut, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'Presença Confirmada',
      description: 'Gabriel Amorim confirmou presença para a aula de hoje às 22:52.',
      time: 'Há 5 minutos',
      type: 'success'
    },
    {
      id: 2,
      title: 'Mensalidade Pendente',
      description: 'A mensalidade do aluno Pedro Henrique vence amanhã.',
      time: 'Há 2 horas',
      type: 'warning'
    },
    {
      id: 3,
      title: 'Aula Desmarcada',
      description: 'Mariana Souza cancelou a aula de amanhã via portal (justificada).',
      time: 'Há 1 dia',
      type: 'info'
    }
  ];

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Botão do Menu Mobile */}
        <button 
          onClick={() => window.dispatchEvent(new Event('open-sidebar'))}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-all"
          title="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Barra de Busca */}
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar alunos ou aulas..." 
            className="bg-card border border-border rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple w-64 text-foreground placeholder:text-muted-foreground transition-all focus:w-72 shadow-sm"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Sino de Notificações */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setHasNewNotifications(false); // limpa a bolinha vermelha ao abrir
            }}
            className="p-2 relative text-muted-foreground hover:text-brand-pink transition-colors rounded-lg hover:bg-white/5"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {hasNewNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-pink rounded-full shadow-[0_0_8px_rgba(219,39,119,0.8)]"></span>
            )}
          </button>

          {/* Popover de Notificações */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <span className="font-bold text-sm">Notificações Recentes</span>
                <button 
                  onClick={() => setHasNewNotifications(false)}
                  className="text-[10px] text-brand-pink font-bold hover:underline"
                >
                  Limpar
                </button>
              </div>
              <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 hover:bg-white/5 transition-colors text-left">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        n.type === 'success' ? 'bg-emerald-400' : n.type === 'warning' ? 'bg-amber-500' : 'bg-cyan-400'
                      }`} />
                      <span className="font-bold text-xs text-foreground">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Menu de Perfil / Foto do Admin */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full bg-brand-purple overflow-hidden flex items-center justify-center border border-border ring-2 ring-transparent hover:ring-brand-purple transition-all cursor-pointer shadow-lg"
            title="Menu do Usuário"
          >
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" alt="Admin Portrait" className="w-full h-full object-cover" />
          </div>

          {/* Dropdown do Perfil */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 glass border border-border rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2 bg-white/5">
                <div className="w-8 h-8 rounded-full bg-brand-purple overflow-hidden flex items-center justify-center shrink-0">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" alt="Admin portrait" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-foreground truncate">Professora Admin</p>
                  <p className="text-[10px] text-muted-foreground truncate">focus.arts.english@gmail.com</p>
                </div>
              </div>

              <div className="py-1">
                <Link 
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors font-medium text-left"
                >
                  <Settings className="w-4 h-4 text-brand-purple" />
                  Configurações
                </Link>

                <Link 
                  href="/aluno/login"
                  target="_blank"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors font-medium text-left"
                >
                  <ExternalLink className="w-4 h-4 text-brand-pink" />
                  Portal do Aluno (Testar)
                </Link>
              </div>

              <div className="border-t border-white/10 pt-1">
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    // Limpar cookie e deslogar fictício
                    document.cookie = "portal_student_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    window.location.href = '/aluno/login';
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors font-bold w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Desconectar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
