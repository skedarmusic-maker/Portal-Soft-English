'use client';

import { useState } from 'react';
import { saveAttendance } from '@/app/actions/attendance';
import { Loader2 } from 'lucide-react';

export default function AttendanceForm({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('present');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('date', date);
    formData.append('content', content);
    formData.append('status', status);

    const result = await saveAttendance(formData);

    if (result.success) {
      setContent('');
      // Feedback visual opcional
    } else {
      alert(result.error);
    }

    setLoading(false);
  }

  return (
    <tr className="bg-brand-purple/5 hover:bg-brand-purple/10 transition-colors">
      <td className="py-4 px-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-transparent border border-brand-purple/30 text-foreground text-sm rounded-md px-2 py-1.5 focus:ring-1 focus:ring-brand-purple focus:outline-none w-full"
        />
      </td>
      <td className="py-4 px-4">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Anotar conteúdo da aula..."
          className="bg-transparent border border-brand-purple/30 text-foreground text-sm rounded-md px-3 py-1.5 focus:ring-1 focus:ring-brand-purple focus:outline-none w-full placeholder:text-muted-foreground/60"
        />
      </td>
      <td className="py-4 px-4 text-center">
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-card border border-border text-foreground text-xs rounded-md px-2 py-1.5 focus:ring-1 focus:ring-brand-purple focus:outline-none"
        >
          <option value="present">Presente</option>
          <option value="absent">Faltou</option>
          <option value="justified">Justificado</option>
          <option value="holiday">Feriado</option>
        </select>
      </td>
      <td className="py-4 px-4 text-center">
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-brand-purple hover:bg-brand-purple-hover text-white px-3 py-1.5 rounded-md font-medium transition-colors text-xs flex items-center justify-center min-w-[70px] disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Salvar'}
        </button>
      </td>
    </tr>
  );
}
