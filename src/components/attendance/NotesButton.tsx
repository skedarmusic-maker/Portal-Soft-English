'use client';

import { useState } from 'react';
import { Edit3 } from 'lucide-react';
import NotesModal from './NotesModal';

export default function NotesButton({ logId, initialNotes }: { logId: string, initialNotes?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 bg-white/5 hover:bg-brand-purple/20 border border-border hover:border-brand-purple/50 rounded-md text-[10px] font-bold uppercase transition-colors flex items-center gap-1 text-muted-foreground hover:text-brand-purple"
      >
        <Edit3 className="w-3 h-3" />
        Quadro Branco
      </button>

      {isOpen && (
        <NotesModal 
          logId={logId} 
          initialNotes={initialNotes} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
