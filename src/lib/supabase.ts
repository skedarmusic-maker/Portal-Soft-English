import { createClient } from '@supabase/supabase-js';

// Essas variáveis deverão ser preenchidas no .env.local posteriormente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* 
  Exemplo de Tipos do Banco de Dados baseados no nosso Plano de Implementação:
  - Estudantes: { id, nome, email, phone, nivel, data_criacao }
  - Aulas (Planograma): { id, student_id, content, modulo, status(pendente/concluida) }
  - Diário (Logs): { id, student_id, date, content, is_reposicao, status(presente/falta) }
*/
