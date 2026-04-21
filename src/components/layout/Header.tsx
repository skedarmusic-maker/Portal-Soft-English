import { Search, Bell, Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-muted-foreground hover:text-foreground">
          <Menu className="w-5 h-5" />
        </button>
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
        <button className="p-2 relative text-muted-foreground hover:text-brand-pink transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-pink rounded-full shadow-[0_0_8px_rgba(219,39,119,0.8)]"></span>
        </button>
        
        <div className="w-8 h-8 rounded-full bg-brand-purple overflow-hidden flex items-center justify-center border border-border ring-2 ring-transparent hover:ring-brand-purple transition-all cursor-pointer">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" alt="Admin Protrait" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
