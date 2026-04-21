import { User, Bell, Shield, Palette, Database } from 'lucide-react';
import SettingsForm from '@/components/settings/SettingsForm';
import { getSettings } from '@/app/actions/settings-actions';

export default async function SettingsPage() {
  const initialData = await getSettings();

  const sections = [
    { name: 'Perfil', icon: User, desc: 'Informações pessoais e da sua escola.' },
    { name: 'Notificações', icon: Bell, desc: 'Alertas de aulas e lembretes para alunos.' },
    { name: 'Segurança', icon: Shield, desc: 'Senha e chaves de API do Supabase.' },
    { name: 'Aparência', icon: Palette, desc: 'Cores do painel e logo da escola.' },
    { name: 'Banco de Dados', icon: Database, desc: 'Gerenciamento de dados e backups.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as preferências do seu portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Menu Lateral de Configurações */}
        <div className="md:col-span-1 space-y-2">
          {sections.map((section, i) => (
            <button 
              key={section.name} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                i === 0 
                  ? 'bg-brand-purple/10 border-brand-purple/30 text-foreground' 
                  : 'bg-transparent border-transparent text-muted-foreground hover:bg-white/5'
              }`}
            >
              <section.icon className={`w-5 h-5 ${i === 0 ? 'text-brand-purple' : ''}`} />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{section.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Área de Conteúdo da Configuração */}
        <div className="md:col-span-2">
           <SettingsForm initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
