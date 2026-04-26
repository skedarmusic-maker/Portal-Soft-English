'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginStudent } from '@/app/actions/auth';
import { Loader2, Lock, UserCheck } from 'lucide-react';
import Image from 'next/image';
import { useEffect, Suspense } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const [pin, setPin] = useState(searchParams.get('pin') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Se o PIN vier na URL, tenta logar automaticamente ou pelo menos preenche
  useEffect(() => {
    const urlPin = searchParams.get('pin');
    if (urlPin) {
      setPin(urlPin);
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData();
    fd.append('pin', pin);

    const result = await loginStudent(fd);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(result.redirect!);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-pink/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm animate-in zoom-in-95 duration-500 fade-in z-10 relative">
        <div className="flex justify-center mb-8">
          <Image src="/images/filesooft.png" alt="Soft English Logo" width={180} height={60} className="object-contain drop-shadow-2xl" />
        </div>

        <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-brand-pink rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Painel do Aluno</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Digite seu código de acesso para ver suas aulas e tarefas.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Código de Acesso"
                maxLength={20}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-center tracking-widest font-bold focus:ring-2 focus:ring-brand-purple outline-none transition-all placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground/50"
              />
            </div>

            {error && <p className="text-sm text-rose-400 font-medium">{error}</p>}

            <button 
              type="submit"
              disabled={loading || pin.length < 3}
              className="w-full bg-foreground text-background hover:bg-white py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar no Portal'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">
          Soft English © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default function StudentLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-purple" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
