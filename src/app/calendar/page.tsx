'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  User,
  Loader2
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createClient } from '@supabase/supabase-js';
import NewLessonButton from '@/components/attendance/NewLessonButton';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data } = await supabase
        .from('attendance_logs')
        .select('id, lesson_date, status, students(name)')
        .gte('lesson_date', format(startDate, 'yyyy-MM-dd'))
        .lte('lesson_date', format(endDate, 'yyyy-MM-dd'));
      
      setEvents(data || []);
      setLoading(false);
    }
    fetchEvents();
  }, [currentDate]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Calendário de Aulas</h1>
          <p className="text-muted-foreground">Visualize e organize seus horários.</p>
        </div>
        <div className="flex gap-2">
          <NewLessonButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-xl border border-border">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-brand-pink" /> 
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-brand-purple/10 border-l-4 border-brand-purple">
                <p className="text-xs text-brand-purple font-bold">Total no mês</p>
                <p className="font-medium text-sm">{events.length} aulas registradas</p>
              </div>
              <p className="text-center text-xs text-muted-foreground py-4 italic">As aulas aparecem no calendário conforme você as registra.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass rounded-xl border border-border overflow-hidden shadow-2xl relative">
            {loading && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-brand-purple" />
              </div>
            )}

            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-xl first-letter:uppercase shrink-0 min-w-[150px]">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h3>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-brand-purple/20 rounded-lg border border-white/10 transition-all active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={nextMonth} className="p-2 hover:bg-brand-purple/20 rounded-lg border border-white/10 transition-all active:scale-95"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
              {weekDays.map(day => (
                <div key={day} className="py-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-r border-white/5 last:border-r-0">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 ">
              {days.map((day, i) => {
                const dayEvents = events.filter(e => isSameDay(parseISO(e.lesson_date), day));
                const currentMonth = isSameMonth(day, monthStart);
                
                return (
                  <div key={i} className={`min-h-[120px] p-3 border-r border-b border-white/5 last:border-r-0 transition-all hover:bg-brand-purple/5 relative group ${!currentMonth ? 'opacity-10' : ''} ${isToday(day) ? 'bg-brand-purple/5' : ''}`}>
                    <span className={`text-sm font-bold ${isToday(day) ? 'text-brand-pink underline underline-offset-4' : 'text-foreground/80'}`}>{format(day, 'd')}</span>
                    
                    <div className="mt-2 space-y-1 overflow-hidden">
                      {dayEvents.map((event: any, idx) => (
                        <div key={idx} className={`rounded px-1.5 py-0.5 text-[10px] truncate border ${event.status === 'absent' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-brand-purple/20 border-brand-purple/30 text-brand-purple'}`}>
                          {event.students?.name || 'Aula'}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
