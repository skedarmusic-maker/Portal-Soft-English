'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  User,
  Loader2,
  CheckCircle2,
  X,
  AlertCircle
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
import NewLessonModal from '@/components/attendance/NewLessonModal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("RENDER CALENDAR PAGE: ", currentDate);
  
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    studentId?: string;
    date?: string;
    logId?: string;
  }>({ isOpen: false });

  const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  // Derivadas do currentDate - calculadas na renderização
  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(monthStart);
  const startDate  = startOfWeek(monthStart);
  const endDate    = endOfWeek(monthEnd);
  const days       = eachDayOfInterval({ start: startDate, end: endDate });

  const fetchData = async (start: Date, end: Date) => {
    setLoading(true);
    
    const [{ data: logsData }, { data: studentsData }] = await Promise.all([
      supabase
        .from('attendance_logs')
        .select('id, lesson_date, status, student_id, lesson_time, students(name)')
        .gte('lesson_date', format(start, 'yyyy-MM-dd'))
        .lte('lesson_date', format(end, 'yyyy-MM-dd')),
      supabase
        .from('students')
        .select('id, name, schedule')
        .eq('status', 'active')
    ]);

    setEvents(logsData || []);
    setStudents(studentsData || []);
    setLoading(false);
  };

  useEffect(() => {
    const ms = startOfMonth(currentDate);
    const me = endOfMonth(ms);
    const sd = startOfWeek(ms);
    const ed = endOfWeek(me);
    fetchData(sd, ed);
  }, [currentDate]);

  const openLessonModal = (studentId?: string, date?: string, logId?: string) => {
    setModalData({ isOpen: true, studentId, date, logId });
  };

  const closeLessonModal = () => {
    setModalData({ isOpen: false });
    const ms = startOfMonth(currentDate);
    const me = endOfMonth(ms);
    const sd = startOfWeek(ms);
    const ed = endOfWeek(me);
    fetchData(sd, ed);
  };

  // Helper para identificar o dia da semana a partir do texto de horário
  const getScheduledDays = (schedule: string) => {
    const days: number[] = [];
    if (schedule.includes('Seg')) days.push(1);
    if (schedule.includes('Ter')) days.push(2);
    if (schedule.includes('Qua')) days.push(3);
    if (schedule.includes('Qui')) days.push(4);
    if (schedule.includes('Sex')) days.push(5);
    if (schedule.includes('Sáb')) days.push(6);
    return days;
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendário de Aulas</h1>
          <p className="text-muted-foreground mt-1">Gestão de horários e histórico de frequência</p>
        </div>
        <div className="flex items-center gap-3">
          <NewLessonButton />
          <a 
            href="/api/auth/google"
            className="flex items-center gap-2 px-4 py-2 bg-[#4285F4]/10 hover:bg-[#4285F4]/20 border border-[#4285F4]/30 text-[#4285F4] rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#4285F4]/10"
          >
            <CalendarIcon className="w-4 h-4" />
            Conectar Google Agenda
          </a>
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
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayLogs = events.filter(e => e.lesson_date === dateKey);
                
                // Projetar alunos agendados se não houver log (APENAS PARA HOJE OU FUTURO)
                const isPast = day < new Date(new Date().setHours(0,0,0,0));
                
                const scheduledStudents = isPast ? [] : students.filter(s => {
                  const dayOfWeek = day.getDay();
                  const studentDays = getScheduledDays(s.schedule || '');
                  
                  // Verifica se o dia bate e se ainda não foi registrado log para esse aluno hoje
                  return studentDays.includes(dayOfWeek) && !dayLogs.some(l => l.student_id === s.id);
                });

                const currentMonth = isSameMonth(day, monthStart);
                
                return (
                  <div key={i} className={`min-h-[120px] p-3 border-r border-b border-white/5 last:border-r-0 transition-all hover:bg-brand-purple/5 relative group ${!currentMonth ? 'opacity-20' : ''} ${isToday(day) ? 'bg-brand-purple/5' : ''}`}>
                    <span className={`text-sm font-bold ${isToday(day) ? 'text-brand-pink underline underline-offset-4' : 'text-foreground/80'}`}>{format(day, 'd')}</span>
                    
                    <div className="mt-2 space-y-1 overflow-hidden">
                      {/* Logs Reais */}
                      {dayLogs.map((event: any, idx) => {
                        let colorClass = '';
                        let Icon = CheckCircle2;
                        
                        if (event.status === 'present') {
                          colorClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
                          Icon = CheckCircle2;
                        } else if (event.status === 'absent') {
                          colorClass = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
                          Icon = X;
                        } else {
                          // justified, holiday
                          colorClass = 'bg-amber-500/10 border-amber-500/30 text-amber-500';
                          Icon = AlertCircle;
                        }

                        return (
                          <div 
                            key={`log-${idx}`} 
                            onClick={() => openLessonModal(event.student_id, event.lesson_date, event.id)}
                            className={`rounded px-1.5 py-1 text-[10px] truncate border cursor-pointer hover:brightness-125 transition-all ${colorClass}`}
                          >
                            <div className="flex items-center gap-1">
                              <Icon className="w-2.5 h-2.5" />
                              <div className="flex flex-col">
                                <span>{event.students?.name || 'Aula'}</span>
                                {event.lesson_time && <span className="opacity-70">{event.lesson_time}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Agendados (Projeção) */}
                      {scheduledStudents.map((student: any, idx) => (
                        <div 
                          key={`sched-${idx}`} 
                          onClick={() => openLessonModal(student.id, dateKey)}
                          className="rounded px-1.5 py-1 text-[10px] truncate border border-dashed border-white/20 bg-white/5 text-muted-foreground/60 cursor-pointer hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 opacity-50" />
                            {student.name}
                          </div>
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

      {/* Modal de Apontamento */}
      {modalData.isOpen && (
        <NewLessonModal 
          onClose={closeLessonModal}
          preSelectedStudentId={modalData.studentId}
          preSelectedDate={modalData.date}
          logId={modalData.logId}
        />
      )}
    </div>
  );
}
