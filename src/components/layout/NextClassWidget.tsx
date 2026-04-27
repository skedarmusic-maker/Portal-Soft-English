'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DAYS_MAP: Record<string, number> = {
  'dom': 0, 'seg': 1, 'ter': 2, 'qua': 3, 'qui': 4, 'sex': 5, 'sáb': 6, 'sab': 6
};

const DAYS_NAME = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface ClassSlot {
  studentName: string;
  dayOfWeek: number;
  timeStr: string;
  timeMins: number;
}

export default function NextClassWidget() {
  const [nextClass, setNextClass] = useState<{ name: string; dayLabel: string; time: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNextClass() {
      const { data: students } = await supabase
        .from('students')
        .select('name, schedule')
        .eq('status', 'active');

      if (!students || students.length === 0) {
        setLoading(false);
        return;
      }

      const slots: ClassSlot[] = [];
      const regex = /(dom|seg|ter|qua|qui|sex|s[áa]b)[^0-9]*(\d{2}:\d{2})/gi;

      for (const s of students) {
        if (!s.schedule) continue;
        
        let match;
        // Reset regex index
        regex.lastIndex = 0;
        
        while ((match = regex.exec(s.schedule)) !== null) {
          let dayStr = match[1].toLowerCase();
          if (dayStr === 'sab') dayStr = 'sáb'; // Normalize
          
          const timeStr = match[2];
          const dayOfWeek = DAYS_MAP[dayStr] ?? -1;
          
          if (dayOfWeek === -1) continue;
          
          const [h, m] = timeStr.split(':').map(Number);
          slots.push({
            studentName: s.name,
            dayOfWeek,
            timeStr,
            timeMins: h * 60 + m
          });
        }
      }

      if (slots.length === 0) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const currentDay = now.getDay();
      const currentMins = now.getHours() * 60 + now.getMinutes();

      let bestSlot: ClassSlot | null = null;
      let minDiff = Infinity;

      for (const slot of slots) {
        let dayDiff = slot.dayOfWeek - currentDay;
        
        // Se for hoje, mas o horário já passou (com 15 min de tolerância para "aula atual"), joga pra próxima semana
        if (dayDiff === 0 && slot.timeMins < currentMins - 15) {
          dayDiff = 7;
        } else if (dayDiff < 0) {
          dayDiff += 7;
        }

        const timeDiff = (dayDiff * 24 * 60) + (slot.timeMins - currentMins);

        if (timeDiff >= -15 && timeDiff < minDiff) {
          minDiff = timeDiff;
          bestSlot = slot;
        }
      }

      if (bestSlot) {
        let dayLabel = '';
        const dayDiff = bestSlot.dayOfWeek - currentDay;
        
        if (dayDiff === 0 && bestSlot.timeMins >= currentMins - 15) {
          dayLabel = 'HOJE';
        } else if (dayDiff === 1 || dayDiff === -6) {
          dayLabel = 'AMANHÃ';
        } else {
          dayLabel = DAYS_NAME[bestSlot.dayOfWeek].toUpperCase();
        }

        setNextClass({
          name: bestSlot.studentName,
          dayLabel,
          time: bestSlot.timeStr
        });
      }

      setLoading(false);
    }

    fetchNextClass();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchNextClass, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="glass-pink p-4 rounded-xl flex flex-col items-center justify-center h-24 animate-pulse opacity-50">
        <div className="h-4 w-20 bg-white/20 rounded mb-2"></div>
        <div className="h-3 w-16 bg-white/20 rounded"></div>
      </div>
    );
  }

  if (!nextClass) {
    return null; // Oculta se não houver aulas cadastradas
  }

  return (
    <div className="glass-pink p-4 rounded-xl flex flex-col items-center text-center shadow-lg border border-brand-pink/20 relative overflow-hidden group">
      {nextClass.dayLabel === 'HOJE' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-pink to-transparent opacity-50"></div>
      )}
      <span className="text-xs font-medium mb-1 text-foreground/70 uppercase tracking-wider">Próxima Aula</span>
      <span className="text-sm text-brand-pink font-bold tracking-widest flex items-center gap-1.5">
        {nextClass.dayLabel === 'HOJE' && <span className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse" />}
        {nextClass.dayLabel}, {nextClass.time}
      </span>
      <span className="text-sm text-foreground mt-1.5 font-medium truncate w-full px-2">{nextClass.name}</span>
    </div>
  );
}
