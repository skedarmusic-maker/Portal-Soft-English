'use client';

import { useState, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronUp, Plus, Paperclip, Clock, CheckCircle2 } from 'lucide-react';
import MaterialUploadPanel from './MaterialUploadPanel';
import { format, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Log {
  id: string;
  lesson_date: string;
  content?: string;
  status: string;
}

interface Material {
  id: string;
  lesson_date: string;
  file_name?: string;
  file_url?: string;
  file_type: string;
  link_url?: string;
  link_title?: string;
  file_size_bytes?: number;
  notes?: string;
  created_at: string;
}

interface SmartMaterialPanelProps {
  studentId: string;
  schedule?: string;   // Ex: "Ter/Qui 18:00"
  logs: Log[];
  materials: Material[];
}

// Gera datas futuras de aula baseado no schedule, por 60 dias
function getFutureLessonDates(schedule: string, daysAhead = 60): string[] {
  const DAY_MAP: Record<string, number> = {
    dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, 'sáb': 6, sab: 6,
  };

  const s = (schedule || '').toLowerCase();
  const scheduledDays: number[] = [];
  Object.entries(DAY_MAP).forEach(([key, val]) => {
    if (s.includes(key)) scheduledDays.push(val);
  });

  if (scheduledDays.length === 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates: string[] = [];

  for (let i = 0; i <= daysAhead; i++) {
    const d = addDays(today, i);
    if (scheduledDays.includes(d.getDay())) {
      dates.push(format(d, 'yyyy-MM-dd'));
    }
  }

  return dates;
}

function formatDateLabel(dateStr: string) {
  const d = parseISO(dateStr + 'T12:00:00');
  return format(d, "EEEE, dd 'de' MMMM", { locale: ptBR });
}

function isUpcoming(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseISO(dateStr + 'T00:00:00') >= today;
}

interface DayBlockProps {
  studentId: string;
  dateStr: string;
  label?: string;
  badge?: React.ReactNode;
  materials: Material[];
  defaultOpen?: boolean;
}

function DayBlock({ studentId, dateStr, label, badge, materials, defaultOpen = false }: DayBlockProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden transition-all">
      {/* Header clicável */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-card/40 hover:bg-card/70 transition-colors text-left"
      >
        <Calendar className="w-4 h-4 text-brand-pink shrink-0" />
        <span className="text-sm font-bold flex-1">{label || formatDateLabel(dateStr)}</span>

        {materials.length > 0 && (
          <span className="text-[10px] font-bold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full border border-brand-purple/20">
            {materials.length} material(is)
          </span>
        )}
        {badge}
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {/* Conteúdo expansível */}
      {open && (
        <div className="p-4 border-t border-border/30 animate-in slide-in-from-top-1 duration-200">
          <MaterialUploadPanel
            studentId={studentId}
            lessonDate={dateStr}
            initialMaterials={materials}
          />
        </div>
      )}
    </div>
  );
}

export default function SmartMaterialPanel({ studentId, schedule, logs, materials }: SmartMaterialPanelProps) {
  const [customDate, setCustomDate] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Materiais agrupados por data
  const matByDate = useMemo(() => {
    const map: Record<string, Material[]> = {};
    materials.forEach(m => {
      if (!map[m.lesson_date]) map[m.lesson_date] = [];
      map[m.lesson_date].push(m);
    });
    return map;
  }, [materials]);

  // Datas futuras projetadas do schedule
  const futureDates = useMemo(() => getFutureLessonDates(schedule || ''), [schedule]);

  // Datas de aulas já registradas no passado
  const pastLogDates = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return (logs || [])
      .filter(l => l.lesson_date < today)
      .map(l => l.lesson_date)
      .filter((v, i, a) => a.indexOf(v) === i) // unique
      .slice(0, 8); // últimas 8
  }, [logs]);

  // Todas as datas únicas que já têm material
  const datesWithMaterials = useMemo(() => Object.keys(matByDate), [matByDate]);

  // Datas a exibir nas próximas aulas: as projetadas + as que têm material e são futuras mas não estão no schedule
  const upcomingDates = useMemo(() => {
    const extra = datesWithMaterials.filter(d => isUpcoming(d) && !futureDates.includes(d));
    return [...new Set([...futureDates, ...extra])].sort();
  }, [futureDates, datesWithMaterials]);

  // Datas passadas: logs + materiais não cobertos pelos logs
  const pastDates = useMemo(() => {
    const extra = datesWithMaterials.filter(d => !isUpcoming(d) && !pastLogDates.includes(d));
    return [...new Set([...pastLogDates, ...extra])].sort().reverse();
  }, [pastLogDates, datesWithMaterials]);

  // Log info por data para o label
  const logByDate = useMemo(() => {
    const map: Record<string, Log> = {};
    logs.forEach(l => { map[l.lesson_date] = l; });
    return map;
  }, [logs]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayDateStr = today;

  return (
    <div className="space-y-8">

      {/* ═══ PRÓXIMAS AULAS ══════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Próximas Aulas</h3>
          <span className="text-xs text-muted-foreground">(prepare os materiais com antecedência)</span>
        </div>

        {upcomingDates.length > 0 ? (
          <div className="space-y-2">
            {upcomingDates.slice(0, 10).map(dateStr => {
              const isToday = dateStr === todayDateStr;
              return (
                <DayBlock
                  key={dateStr}
                  studentId={studentId}
                  dateStr={dateStr}
                  label={isToday ? `Hoje — ${formatDateLabel(dateStr)}` : formatDateLabel(dateStr)}
                  badge={
                    isToday ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        HOJE
                      </span>
                    ) : undefined
                  }
                  materials={matByDate[dateStr] ?? []}
                  defaultOpen={isToday || (matByDate[dateStr]?.length ?? 0) > 0}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Configure o horário do aluno para ver as próximas aulas projetadas.
          </p>
        )}
      </div>

      {/* ═══ AULAS PASSADAS ══════════════════════════════════════ */}
      {pastDates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Aulas Passadas</h3>
          </div>

          <div className="space-y-2">
            {pastDates.map(dateStr => {
              const log = logByDate[dateStr];
              return (
                <DayBlock
                  key={dateStr}
                  studentId={studentId}
                  dateStr={dateStr}
                  label={
                    log
                      ? `${formatDateLabel(dateStr)}${log.content ? ` — ${log.content.slice(0, 40)}` : ''}`
                      : formatDateLabel(dateStr)
                  }
                  materials={matByDate[dateStr] ?? []}
                  defaultOpen={(matByDate[dateStr]?.length ?? 0) > 0}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ DATA PERSONALIZADA ══════════════════════════════════ */}
      <div className="border border-dashed border-border/50 rounded-xl p-4">
        <button
          type="button"
          onClick={() => setShowCustom(p => !p)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar material em outra data...
        </button>

        {showCustom && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Data da Aula</label>
              <input
                type="date"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-brand-purple outline-none"
              />
            </div>
            {customDate && (
              <div className="border border-border/50 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-card/30 border-b border-border/30">
                  <Paperclip className="w-4 h-4 text-brand-pink" />
                  <span className="text-sm font-bold">{formatDateLabel(customDate)}</span>
                </div>
                <div className="p-4">
                  <MaterialUploadPanel
                    studentId={studentId}
                    lessonDate={customDate}
                    initialMaterials={matByDate[customDate] ?? []}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
