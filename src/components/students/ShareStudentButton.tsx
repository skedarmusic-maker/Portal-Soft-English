'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareStudentButtonProps {
  studentName: string;
  accessCode: string;
}

export default function ShareStudentButton({ studentName, accessCode }: ShareStudentButtonProps) {
  const [copied, setCopied] = useState(false);

  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/aluno/login?pin=${accessCode}` : '';
  const shareMessage = `Olá ${studentName}! Aqui está o link do seu Portal do Aluno: ${portalUrl}\n\nSeu código de acesso (PIN) é: *${accessCode}*`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Portal do Aluno - Soft English',
          text: shareMessage,
          url: portalUrl,
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      copyToClipboard();
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-sm font-medium transition-all group"
        title="Compartilhar portal do aluno"
      >
        <Share2 className="w-4 h-4 text-brand-pink group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Compartilhar Acesso</span>
      </button>

      <button
        onClick={copyToClipboard}
        className="p-2 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-sm font-medium transition-all group"
        title="Copiar mensagem de acesso"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>
    </div>
  );
}
