'use client';

import { useState } from 'react';
import { updateClassNotes } from '@/app/actions/notes';
import { X, Loader2, Edit3 } from 'lucide-react';

export default function NotesModal({ 
  logId, 
  initialNotes, 
  onClose 
}: { 
  logId: string;
  initialNotes?: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(initialNotes || '');

  async function handleSubmit() {
    setLoading(true);
    const result = await updateClassNotes(logId, notes);

    if (result.success) {
      onClose();
    } else {
      alert(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass w-full max-w-3xl rounded-2xl border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Quadro Branco da Aula</h2>
              <p className="text-xs text-muted-foreground">Anotações que o aluno verá no portal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6 bg-black/20 flex flex-col">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Digite aqui as anotações, vocabulário novo, dicas, links úteis..."
            className="flex-1 w-full bg-transparent resize-none text-foreground text-sm font-medium focus:outline-none placeholder:text-muted-foreground/30 p-2"
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex-shrink-0 border-t border-white/10 pt-4 flex items-center justify-between gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 max-w-xs bg-gradient-to-r from-brand-purple to-brand-pink text-white py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
            ) : (
              'Salvar Anotações'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
