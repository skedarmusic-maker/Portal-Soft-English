'use client';

import { useState } from 'react';
import EditStudentModal from './EditStudentModal';

export default function EditStudentButton({ student, allStudents }: { student: any, allStudents?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-sm font-medium transition-colors"
      >
        Editar Perfil
      </button>

      {isOpen && (
        <EditStudentModal 
          student={student} 
          allStudents={allStudents}
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
