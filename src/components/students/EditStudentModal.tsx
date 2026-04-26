'use client';

import { useState } from 'react';
import { updateStudent } from '@/app/actions/student-actions';
import { X, Loader2, User, Mail, Phone, Target, Lock, DollarSign, Calendar, BookOpen, Hash, Power, AlertCircle } from 'lucide-react';

const DAYS = [
  { id: 'seg', label: 'SEG', key: 'Seg' },
  { id: 'ter', label: 'TER', key: 'Ter' },
  { id: 'qua', label: 'QUA', key: 'Qua' },
  { id: 'qui', label: 'QUI', key: 'Qui' },
  { id: 'sex', label: 'SEX', key: 'Sex' },
  { id: 'sab', label: 'SÁB', key: 'Sáb' },
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

export default function EditStudentModal({ student, onClose, allStudents = [] }: { student: any, onClose: () => void, allStudents?: any[] }) {
  const [loading, setLoading] = useState(false);
  
  // Parse schedule string to find selected days and time
  const initialDays = DAYS.filter(d => student.schedule?.includes(d.key)).map(d => d.id);
  const initialTime = student.schedule?.split(' ').pop()?.includes(':') ? student.schedule?.split(' ').pop() : '';

  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);
  const [classTime, setClassTime] = useState(initialTime || '');
  const [conflicts, setConflicts] = useState<any[]>([]);

  function toggleDay(dayId: string) {
    const newDays = selectedDays.includes(dayId)
      ? selectedDays.filter(d => d !== dayId)
      : [...selectedDays, dayId];
    
    setSelectedDays(newDays);
    checkConflicts(newDays, classTime);
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTime = e.target.value;
    setClassTime(newTime);
    checkConflicts(selectedDays, newTime);
  }

  function checkConflicts(days: string[], time: string) {
    if (days.length === 0 || !time) {
      setConflicts([]);
      return;
    }

    const foundConflicts = allStudents.filter(s => {
      // Não comparar com o próprio aluno sendo editado
      if (s.id === student.id || !s.schedule || s.status !== 'active') return false;
      
      const sTime = s.schedule.match(/(\d{2}:\d{2})/)?.[1];
      if (!sTime) return false;

      const [h1, m1] = time.split(':').map(Number);
      const [h2, m2] = sTime.split(':').map(Number);
      const t1 = h1 * 60 + m1;
      const t2 = h2 * 60 + m2;

      const timeOverlap = Math.abs(t1 - t2) < 60;
      const dayOverlap = days.some(dayId => {
        const dayLabel = DAYS.find(d => d.id === dayId)?.key;
        return dayLabel && s.schedule.includes(dayLabel);
      });

      return timeOverlap && dayOverlap;
    });

    setConflicts(foundConflicts);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('id', student.id);
    selectedDays.forEach(d => formData.set(`day_${d}`, 'on'));

    const result = await updateStudent(formData);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass w-full max-w-2xl rounded-2xl border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Editar Perfil do Aluno</h2>
              <p className="text-xs text-muted-foreground">Atualize as informações de {student.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form com scroll interno */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Status */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Power className={`w-5 h-5 ${student.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`} />
                <div>
                  <p className="text-sm font-bold">Status do Aluno</p>
                  <p className="text-xs text-muted-foreground">O aluno está {student.status === 'active' ? 'Ativo' : 'Inativo'}</p>
                </div>
              </div>
              <select name="status" defaultValue={student.status} className="bg-card border border-border text-sm rounded-lg px-3 py-1.5 focus:outline-none">
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            {/* ─ Seção 1: Dados Pessoais ─ */}
            <div>
              <h3 className="text-xs font-bold text-brand-pink uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-px bg-brand-pink inline-block" /> Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FieldLabel icon={User} label="Nome Completo *" />
                  <input name="name" required defaultValue={student.name} placeholder="Ex: Larissa Oliveira" className={inputCls} />
                </div>
                <div>
                  <FieldLabel icon={Hash} label="Idade" />
                  <input name="age" type="number" defaultValue={student.age || ''} min={5} max={80} placeholder="Ex: 22" className={inputCls} />
                </div>
                <div>
                  <FieldLabel icon={Phone} label="Telefone / WhatsApp" />
                  <input name="phone" type="tel" defaultValue={student.phone || ''} placeholder="Ex: (11) 99999-9999" className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel icon={Mail} label="E-mail" />
                  <input name="email" type="email" defaultValue={student.email || ''} placeholder="Ex: larissa@email.com" className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel icon={Target} label="Objetivo" />
                  <textarea name="objective" rows={2} defaultValue={student.objective || ''} placeholder="Ex: Inglês para negócios..." className={`${inputCls} resize-none`} />
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
                  <select name="level" className={selectCls} defaultValue={student.level || 'B2'}>
                    {LEVELS.map(l => (
                      <option key={l.value} value={l.value} className="bg-slate-900">{l.label}</option>
                    ))}
                  </select>
                </div>

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
                  {DAYS.map(day => (
                    <input
                      key={day.id}
                      type="hidden"
                      name={`day_${day.id}`}
                      value={selectedDays.includes(day.id) ? 'on' : ''}
                    />
                  ))}
                </div>

                <div>
                  <FieldLabel icon={Calendar} label="Horário da Aula" />
                  <input 
                    name="class_time" 
                    type="time" 
                    required
                    value={classTime}
                    onChange={handleTimeChange}
                    className={`${inputCls} w-40 ${conflicts.length > 0 ? 'border-amber-500/50 ring-1 ring-amber-500/20' : ''}`} 
                  />
                </div>

                {/* Alerta de Conflitos */}
                {conflicts.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 animate-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-500">Conflito de Horário!</p>
                        <p className="text-xs text-amber-500/80 mt-1">
                          Este horário já está ocupado por: 
                          <span className="font-bold ml-1">
                            {conflicts.map(c => c.name).join(', ')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─ Seção 3: Financeiro & Acesso ─ */}
            <div>
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-px bg-emerald-400 inline-block" /> Financeiro & Acesso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel icon={DollarSign} label="Mensalidade (R$)" />
                  <input name="monthly_fee" type="number" step="0.01" min={0} defaultValue={student.monthly_fee || ''} placeholder="Ex: 350.00" className={inputCls} />
                </div>
                <div>
                  <FieldLabel icon={Calendar} label="Aulas/Mês" />
                  <input name="monthly_plan_classes" type="number" min={1} defaultValue={student.monthly_plan_classes || 8} className={inputCls} />
                </div>
                <div>
                  <FieldLabel icon={Lock} label="PIN de Acesso ao Portal" />
                  <input name="access_code" type="text" defaultValue={student.access_code || ''} placeholder="Ex: 1234" maxLength={20} className={inputCls} />
                </div>
                <div>
                  <FieldLabel icon={User} label="Link Fixo do Meet" />
                  <input name="meeting_link" type="url" defaultValue={student.meeting_link || ''} placeholder="https://meet.google.com/xxx-xxxx-xxx" className={inputCls} />
                </div>
              </div>
            </div>

            <div>
              <FieldLabel icon={BookOpen} label="Observações Internas" />
              <textarea name="notes" rows={2} defaultValue={student.notes || ''} placeholder="Ex: Aluna dedicada..." className={`${inputCls} resize-none`} />
            </div>
          </div>

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
                <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              ) : (
                <><User className="w-4 h-4" /> Salvar Alterações</>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
