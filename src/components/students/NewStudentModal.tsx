'use client';

import { useState } from 'react';
import { createStudent } from '@/app/actions/student-actions';
import { X, Loader2, User, Mail, Phone, Target, Lock, DollarSign, Calendar, BookOpen, Hash } from 'lucide-react';

const DAYS = [
  { id: 'seg', label: 'SEG' },
  { id: 'ter', label: 'TER' },
  { id: 'qua', label: 'QUA' },
  { id: 'qui', label: 'QUI' },
  { id: 'sex', label: 'SEX' },
  { id: 'sab', label: 'SÁB' },
];

const LEVELS = [
  { value: 'A1', label: 'A1 - Iniciante' },
  { value: 'A2', label: 'A2 - Básico' },
  { value: 'B1', label: 'B1 - Pré-Intermediário' },
  { value: 'B2', label: 'B2 - Intermediário' },
  { value: 'C1', label: 'C1 - Avançado' },
  { value: 'C2', label: 'C2 - Fluente/Proficiente' },
];

function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
      <Icon className="w-3 h-3 text-brand-purple" /> {label}
    </label>
  );
}

export default function NewStudentModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  function toggleDay(day: string) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // Garantir que dias marcados entram corretamente
    selectedDays.forEach(d => formData.set(`day_${d}`, 'on'));

    const result = await createStudent(formData);

    if (result.success) {
      onClose();
    } else {
      alert(result.error);
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-brand-purple outline-none placeholder:text-muted-foreground/40 transition";
  const selectCls = `${inputCls} appearance-none`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass w-full max-w-2xl rounded-2xl border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Cadastrar Novo Aluno</h2>
              <p className="text-xs text-muted-foreground">Preencha os dados para criar o perfil completo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form com scroll interno */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* ─ Seção 1: Dados Pessoais ─ */}
            <div>
              <h3 className="text-xs font-bold text-brand-pink uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-px bg-brand-pink inline-block" /> Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FieldLabel icon={User} label="Nome Completo *" />
                  <input name="name" required placeholder="Ex: Larissa Oliveira" className={inputCls} />
                </div>
                <div>
                  <FieldLabel icon={Hash} label="Idade" />
                  <input name="age" type="number" min={5} max={80} placeholder="Ex: 22" className={inputCls} />
                </div>
                <div>
                  <FieldLabel icon={Phone} label="Telefone / WhatsApp" />
                  <input name="phone" type="tel" placeholder="Ex: (11) 99999-9999" className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel icon={Mail} label="E-mail" />
                  <input name="email" type="email" placeholder="Ex: larissa@email.com" className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel icon={Target} label="Objetivo" />
                  <textarea name="objective" rows={2} placeholder="Ex: Preparação para viagem aos EUA, inglês para negócios..." className={`${inputCls} resize-none`} />
                </div>
              </div>
            </div>

            {/* ─ Seção 2: Nível & Horário ─ */}
            <div>
              <h3 className="text-xs font-bold text-brand-purple uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-px bg-brand-purple inline-block" /> Nível & Horário
              </h3>

              <div className="space-y-4">
                <div>
                  <FieldLabel icon={BookOpen} label="Nível do Inglês" />
                  <select name="level" className={selectCls} defaultValue="B2">
                    {LEVELS.map(l => (
                      <option key={l.value} value={l.value} className="bg-slate-900">{l.label}</option>
                    ))}
                  </select>
                </div>

                {/* Seletor de Dias da Semana */}
                <div>
                  <FieldLabel icon={Calendar} label="Dias da Semana" />
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-black tracking-wider transition-all border ${
                          selectedDays.includes(day.id)
                            ? 'bg-brand-purple text-white border-brand-purple shadow-[0_0_12px_rgba(124,58,237,0.5)]'
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:border-brand-purple/50 hover:text-foreground'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {/* Inputs hidden para os dias */}
                  {DAYS.map(day => (
                    <input
                      key={day.id}
                      type="hidden"
                      name={`day_${day.id}`}
                      value={selectedDays.includes(day.id) ? 'on' : ''}
                    />
                  ))}
                </div>

                {/* Horário */}
                <div>
                  <FieldLabel icon={Calendar} label="Horário da Aula" />
                  <input name="class_time" type="time" className={`${inputCls} w-40`} />
                </div>
              </div>
            </div>

            {/* ─ Seção 3: Financeiro & Acesso ─ */}
            <div>
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-px bg-emerald-400 inline-block" /> Financeiro & Acesso ao Portal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FieldLabel icon={DollarSign} label="Mensalidade (R$)" />
                  <input name="monthly_fee" type="number" step="0.01" min={0} placeholder="Ex: 350.00" className={inputCls} />
                </div>
                <div>
                  <FieldLabel icon={Calendar} label="Aulas/Mês" />
                  <input name="monthly_plan_classes" type="number" min={1} defaultValue={8} className={inputCls} />
                </div>
                <div>
                  <FieldLabel icon={Lock} label="PIN de Acesso ao Portal" />
                  <input name="access_code" type="text" placeholder="Ex: 1234" maxLength={20} className={inputCls} />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-2">O PIN é usado pelo aluno para acessar o painel individual em <span className="font-mono text-brand-purple">/aluno/login</span></p>
            </div>

            {/* ─ Seção 4: Observações ─ */}
            <div>
              <FieldLabel icon={BookOpen} label="Observações Internas" />
              <textarea name="notes" rows={2} placeholder="Ex: Aluna muito dedicada, foca em pronúncia..." className={`${inputCls} resize-none`} />
            </div>
          </div>

          {/* Footer stick */}
          <div className="px-6 pb-6 flex-shrink-0 border-t border-white/10 pt-4 flex items-center justify-between gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 max-w-sm bg-gradient-to-r from-brand-purple to-brand-pink text-white py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Cadastrando...</>
              ) : (
                <><User className="w-4 h-4" /> Cadastrar Aluno</>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
