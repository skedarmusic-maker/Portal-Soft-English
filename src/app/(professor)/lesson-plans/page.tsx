import { BookOpen, Plus, Search, Book, Layers, GraduationCap } from 'lucide-react';

export default function LessonPlansPage() {
  const plans = [
    { title: 'Inglês Iniciante (A1)', modules: 12, lessons: 48, students: 5, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
    { title: 'Business English (B2)', modules: 8, lessons: 32, students: 3, color: 'text-brand-pink', bg: 'bg-brand-pink/10' },
    { title: 'IELTS Preparation', modules: 10, lessons: 40, students: 2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Conversation Mastery', modules: 6, lessons: 24, students: 4, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Planogramas de Aula</h1>
          <p className="text-muted-foreground">Estruture o currículo e os materiais dos seus cursos.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-purple hover:bg-brand-purple-hover text-white rounded-md font-medium transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <Plus className="w-4 h-4" />
          Novo Programado
        </button>
      </div>

      <div className="glass p-4 rounded-xl border border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por plano ou nível..." 
            className="bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple w-full text-foreground placeholder:text-muted-foreground transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.title} className="glass rounded-xl p-6 border border-border hover:border-brand-purple/50 transition-all cursor-pointer group">
            <div className={`w-12 h-12 rounded-lg ${plan.bg} ${plan.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Book className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold mb-4 group-hover:text-brand-pink transition-colors">{plan.title}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers className="w-4 h-4" />
                <span>{plan.modules} Módulos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>{plan.lessons} Aulas Prontas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="w-4 h-4" />
                <span>{plan.students} Alunos Cursando</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <button className="w-full py-2 rounded-lg bg-card hover:bg-white/5 border border-border text-sm font-medium transition-colors">
                Ver Estrutura
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
