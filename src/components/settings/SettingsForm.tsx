'use client';

import { useState } from 'react';
import { saveSettings } from '@/app/actions/settings-actions';
import { Save, Loader2, Check } from 'lucide-react';

interface SettingsProps {
  initialData: {
    school_name: string;
    teacher_name: string;
    contact_email: string;
    bio: string;
  };
}

export default function SettingsForm({ initialData }: SettingsProps) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const result = await saveSettings(formData);

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert(result.error);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl border border-border space-y-6">
      <h2 className="text-xl font-bold border-b border-border pb-4">Perfil do Professor</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome da Escola</label>
            <input 
              name="school_name"
              type="text" 
              defaultValue={initialData.school_name} 
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome do Professor</label>
            <input 
              name="teacher_name"
              type="text" 
              defaultValue={initialData.teacher_name} 
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none" 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email de Contato</label>
          <input 
            name="contact_email"
            type="email" 
            defaultValue={initialData.contact_email} 
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none" 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bio / Descrição</label>
          <textarea 
            name="bio"
            rows={4} 
            defaultValue={initialData.bio} 
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none resize-none" 
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit"
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all shadow-lg ${
            saved ? 'bg-emerald-500 text-white' : 'bg-brand-purple hover:bg-brand-purple-hover text-white'
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
}
