'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import NewStudentModal from './NewStudentModal';

export default function NewStudentButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-brand-purple hover:bg-brand-purple-hover text-white rounded-md font-medium transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)]"
      >
        <Plus className="w-4 h-4" />
        Novo Aluno
      </button>

      {isOpen && <NewStudentModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
