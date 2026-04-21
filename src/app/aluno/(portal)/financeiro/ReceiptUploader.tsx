'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { uploadPaymentReceipt } from '@/app/actions/finance';

interface Props {
  paymentId: string;
  studentId: string;
}

export default function ReceiptUploader({ paymentId, studentId }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Arquivo muito grande. Limite de 10MB.");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append('paymentId', paymentId);
    fd.append('studentId', studentId);
    fd.append('file', file);

    const result = await uploadPaymentReceipt(fd);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert(result.error);
    }
    
    setLoading(false);
  }

  return (
    <div>
      <input 
        type="file" 
        ref={fileRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf"
      />
      <button 
        onClick={() => fileRef.current?.click()}
        disabled={loading || success}
        className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
          success ? 'bg-emerald-500 text-white' : 'bg-brand-purple hover:bg-brand-purple-hover text-white disabled:opacity-50'
        }`}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
        ) : success ? (
          <><CheckCircle className="w-4 h-4" /> Comprovante Enviado!</>
        ) : (
          <><Upload className="w-4 h-4" /> Anexar Comprovante</>
        )}
      </button>
    </div>
  );
}
