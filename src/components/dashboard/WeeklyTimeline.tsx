'use client';

import { useState } from 'react';
import { Clock, User } from 'lucide-react';
import NewLessonModal from '@/components/attendance/NewLessonModal';

interface Student {
  id: string;
  name: string;
  schedule: string;
}

interface WeeklyTimelineProps {
  students: Student[];
}

const WEEK_DAYS = [
  { id: 1, name: 'Segunda', keys: ['seg', 'segunda'] },
  { id: 2, name: 'Terça', keys: ['ter', 'terça', 'terca'] },
  { id: 3, name: 'Quarta', keys: ['qua', 'quarta', 'quart'] },
  { id: 4, name: 'Quinta', keys: ['qui', 'quinta', 'quitas', 'quinta'] },
  { id: 5, name: 'Sexta', keys: ['sex', 'sexta', 'sexts'] },
];

function parseSchedule(students: Student[]) {
  const events: { dayId: number; time: string; student: Student }[] = [];

  students.forEach(student => {
    if (!student.schedule) return;

    const str = student.schedule.toLowerCase();
    
    // Extrai o primeiro tempo encontrado como padrão (ex: 1800, 18:00, 2030)
    const timeMatches = student.schedule.match(/\d{2}[:h]?\d{2}/g);
    let fallbackTime = 'A definir';
    
    if (timeMatches && timeMatches.length > 0) {
      fallbackTime = timeMatches[0].replace('h', ':');
      if (!fallbackTime.includes(':') && fallbackTime.length === 4) {
        fallbackTime = fallbackTime.replace(/(\d{2})(\d{2})/, '$1:$2');
      }
    }

    WEEK_DAYS.forEach(day => {
      if (day.keys.some(k => str.includes(k))) {
        
        let time = fallbackTime;
        
        // Se houver mais de um horário no texto (ex: Terças 20:30 / Quintas 20:00)
        if (timeMatches && timeMatches.length > 1) {
           // Tenta associar o tempo correto quebrando a string
           const parts = str.split(/[/,e-]/);
           const part = parts.find(p => day.keys.some(k => p.includes(k)));
           if (part) {
             const specificTimeMatch = part.match(/\d{2}[:h]?\d{2}/);
             if (specificTimeMatch) {
               time = specificTimeMatch[0].replace('h', ':');
               if (!time.includes(':') && time.length === 4) {
                 time = time.replace(/(\d{2})(\d{2})/, '$1:$2');
               }
             }
           }
        }

        events.push({ dayId: day.id, time, student });
      }
    });
  });

  // Ordenar os eventos dentro de cada dia pela hora
  return events.sort((a, b) => a.time.localeCompare(b.time));
}

export default function WeeklyTimeline({ students }: WeeklyTimelineProps) {
  const events = parseSchedule(students);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  return (
    <div className="glass rounded-xl p-6 border border-border mt-6 w-full overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Grade da Semana</h2>
          <p className="text-sm text-muted-foreground mt-1">Horários agendados dos alunos ativos</p>
        </div>
      </div>

      <div className="min-w-[800px] grid grid-cols-5 gap-4">
        {WEEK_DAYS.map((day) => {
          const dayEvents = events.filter(e => e.dayId === day.id);
          const isToday = new Date().getDay() === day.id; // getDay: 1=Seg, 2=Ter...

          return (
            <div key={day.id} className={`flex flex-col rounded-xl border ${isToday ? 'border-brand-pink/50 bg-brand-pink/5' : 'border-border/50 bg-card/20'} overflow-hidden`}>
              <div className={`py-3 px-4 text-center border-b font-bold tracking-wide uppercase text-sm ${isToday ? 'bg-brand-pink/20 text-brand-pink border-brand-pink/20' : 'bg-black/20 text-muted-foreground border-border/50'}`}>
                {day.name} {isToday && <span className="ml-1 text-[10px] bg-brand-pink text-white px-1.5 py-0.5 rounded-full">HOJE</span>}
              </div>
              
              <div className="p-3 space-y-3 min-h-[150px] flex-1">
                {dayEvents.map((event, i) => (
                  <div 
                    key={`${event.student.id}-${i}`} 
                    onClick={() => setSelectedStudent(event.student.id)}
                    className="bg-background/80 border border-border/50 p-3 rounded-lg hover:border-brand-purple/50 transition-colors shadow-sm group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[11px] font-bold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                         <Clock className="w-3 h-3" /> {event.time}
                       </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {event.student.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-sm truncate group-hover:text-brand-pink transition-colors">
                        {event.student.name}
                      </p>
                    </div>
                  </div>
                ))}
                
                {dayEvents.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 pt-4 pb-4">
                    <User className="w-6 h-6 mb-2" />
                    <span className="text-xs">Livre</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedStudent && (
        <NewLessonModal 
          onClose={() => setSelectedStudent(null)} 
          preSelectedStudentId={selectedStudent} 
        />
      )}
    </div>
  );
}
