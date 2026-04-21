-- =============================================
-- ENGSCHOOL - Schema do Banco de Dados
-- Rodar no SQL Editor do Supabase
-- =============================================

-- Tabela de Alunos
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  schedule text,   -- Ex: "Terças e Quintas 18:00"
  level text,      -- Ex: "B2", "C1"
  status text default 'active', -- active | inactive
  notes text,
  created_at timestamptz default now()
);

-- Tabela de Logs de Aula (o "Diário")
create table if not exists attendance_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  lesson_date date not null,
  content text,
  raw_date_text text,     -- guardar o texto original da data (ex: "20/01-Present")
  status text default 'present',  -- present | absent
  is_reposicao boolean default false,
  reposicao_date text,    -- data original da reposição, se houver
  created_at timestamptz default now()
);

-- Índices para performance
create index if not exists idx_attendance_student_id on attendance_logs(student_id);
create index if not exists idx_attendance_date on attendance_logs(lesson_date);

-- Habilitar RLS
alter table students enable row level security;
alter table attendance_logs enable row level security;

-- Policies abertas (sem auth por enquanto, ajustar depois com login)
create policy "allow all students" on students for all using (true) with check (true);
create policy "allow all logs" on attendance_logs for all using (true) with check (true);
