# 🏫 Portal Soft - Resumo de Desenvolvimento e Estrutura

Este documento resume a arquitetura, o banco de dados e as decisões de design adotadas durante o desenvolvimento do **Portal Soft** (Sistema de Gestão para Escola de Inglês Online).

O histórico completo da conversa original (com mais de 90 mensagens e os códigos completos gerados) foi recuperado e salvo em [historico_recuperado.md](file:///C:/Users/Skedar/.gemini/antigravity-ide/brain/bb3b6c2e-f08d-49f3-9184-14e57f28997d/historico_recuperado.md).

---

## 🎨 Decisões de Design (UI/UX)
- **Tema:** Dark Mode Premium.
- **Paleta de Cores:** Fundo escuro (`#0f0a19`) combinado com realces e botões em tons de **Rosa** (`#db2777`) e **Roxo** (`#7c3aed`).
- **Fontes:** Geist Sans e Geist Mono (padrão moderno do Next.js).

---

## 🏗️ Estrutura do Projeto (Next.js App Router)
O projeto está estruturado da seguinte forma:
- **`src/app/page.tsx`**: Dashboard principal com métricas, gráficos e próximas aulas.
- **`src/app/students/page.tsx`**: Listagem de alunos ativos/inativos exibidos em cartões modernos.
- **`src/app/students/[id]/page.tsx`**: Perfil detalhado de cada aluno contendo:
  - **Planograma:** Controle das matérias e progresso.
  - **Diário de Presença:** Tabela rápida de notas e anotações de aulas (substituindo o fluxo do Excel).
- **`src/app/calendar/page.tsx`**: Calendário de aulas integrado com visualização mensal e agenda.
- **`src/app/lesson-plans/page.tsx`**: Estrutura dos cursos e módulos (A1, A2, etc.).
- **`src/app/settings/page.tsx`**: Configurações gerais e credenciais do banco de dados.

---

## 🔌 Integração com Supabase (Banco de Dados)
O banco de dados foi integrado usando o cliente oficial em `@/lib/supabase.ts` e configurado no arquivo `.env.local` com as seguintes credenciais:
- **Projeto Ref:** `ttmrkissdzwqgnqypvlk`
- **URL:** `https://ttmrkissdzwqgnqypvlk.supabase.co`

### 📝 Esquema de Tabelas (`schema.sql`)
As tabelas criadas no banco de dados para alimentar o sistema são:
1. **`students`**: Dados cadastrais do aluno, nível de inglês e status.
2. **`lesson_plans`**: Conteúdo programático e progresso de cada aluno.
3. **`attendance_logs`**: Diário de presença, datas das aulas e notas do professor.

---

## 📊 Importação do Excel (Seed)
Foi desenvolvido o script `scripts/seed-supabase.js` que lê a planilha `Lista de Presença .xlsx` localizada na pasta `/public` e popula o Supabase automaticamente.

Os seguintes alunos foram importados com sucesso:
- **Joaquim**, **Gabrielle**, **Mychel**, **Thaís**, **Letícia**, **Natália**, **Larissa**, **Mirella** e **Enzo**.

---

### 📂 Links Úteis
* 📄 [Histórico Completo de Conversa (Recuperado)](file:///C:/Users/Skedar/.gemini/antigravity-ide/brain/bb3b6c2e-f08d-49f3-9184-14e57f28997d/historico_recuperado.md)
* 🛠️ [Script de Seed do Banco](file:///c:/Users/Skedar/Desktop/IA%20-%20SITES/Portal%20Soft/scripts/seed-supabase.js)
* 🗄️ [Esquema do Banco SQL](file:///c:/Users/Skedar/Desktop/IA%20-%20SITES/Portal%20Soft/scripts/schema.sql)
