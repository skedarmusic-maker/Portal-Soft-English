// Script para instrução de atualização do banco de dados
console.log(`
Execute isso no SQL Editor do Supabase:

CREATE TABLE IF NOT EXISTS public.google_tokens (
  id INT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date BIGINT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Permite que usuários anon leiam/atualizem (em produção, é melhor restringir isso com RLS, mas para este MVP de admin única, funcionará)
ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all actions" ON public.google_tokens FOR ALL USING (true) WITH CHECK (true);
`);
