/**
 * seed-supabase.js
 * Lê o arquivo Lista de Presença.xlsx e importa todos os dados no Supabase.
 * Rodar com: node scripts/seed-supabase.js
 */

require('dotenv').config({ path: '.env.local' });
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Definição dos alunos extraídos das abas
const STUDENT_MAP = {
  'JOAQUIM - TERÇAS E QUINTAS 1800': { name: 'Joaquim', schedule: 'Terças e Quintas 18:00', level: 'B2', status: 'active' },
  'Gabrielle- Terças 1500':          { name: 'Gabrielle', schedule: 'Terças 15:00', level: 'B2', status: 'active' },
  'MYCHEL- QUARTAS 2100':            { name: 'Mychel', schedule: 'Quartas 21:00', level: 'B2', status: 'active' },
  'Thaís- Terças 2030Quitas 2000':   { name: 'Thaís', schedule: 'Terças 20:30 / Quintas 20:00', level: 'A2', status: 'active' },
  'Letícia Quart. Sexts 1900':       { name: 'Letícia', schedule: 'Quartas e Sextas 19:00', level: 'C1', status: 'active', notes: 'IELTS - Intensivo' },
  'NATALIA-SEGUNDAS1800':            { name: 'Natália', schedule: 'Segundas 18:00', level: 'B2', status: 'active' },
  'LARISSA-SEGUNDAS2000':            { name: 'Larissa', schedule: 'Segundas 20:00', level: 'B2', status: 'active' },
  'MIRELLA -SEXTAS 1400':            { name: 'Mirella', schedule: 'Sextas 14:00', level: 'B1', status: 'active' },
  'ENZO-QUINTA 2100':                { name: 'Enzo', schedule: 'Quintas 21:00', level: 'A2', status: 'active' },
};

/**
 * Converte número serial do Excel para objeto Date
 */
function excelSerialToDate(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
}

/**
 * Tenta extrair uma data legível do campo de data do Excel
 */
function parseDate(rawDate, yearHint = 2025) {
  if (!rawDate && rawDate !== 0) return null;

  // É número serial do Excel (ex: 45810)
  if (typeof rawDate === 'number' && rawDate > 40000) {
    const d = excelSerialToDate(rawDate);
    return d ? d.toISOString().split('T')[0] : null;
  }

  const raw = String(rawDate).trim();

  const match1 = raw.match(/^(\d{1,2})[\/](\d{1,2})[-–\s]/);
  if (match1) {
    let day = parseInt(match1[1], 10);
    let month = parseInt(match1[2], 10);
    
    if (month > 12 && day <= 12) {
      const temp = day;
      day = month;
      month = temp;
    }
    
    // Inferir ano: se mês >= 10 -> provavelmente anoHint atual, senão anoHint + 1
    const year = month >= 10 ? yearHint : yearHint + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }


  // Formatos como "21/01/2026", "07/01/2026/Present"
  const match2 = raw.match(/^(\d{1,2})[\/](\d{1,2})[\/](\d{4})/);
  if (match2) {
    let day = parseInt(match2[1], 10);
    let month = parseInt(match2[2], 10);
    const year = match2[3];

    // Tratar datas invertidas americanas MM/DD/YYYY
    if (month > 12 && day <= 12) {
      const temp = day;
      day = month;
      month = temp;
    }

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return null;
}

/**
 * Determina status (present/absent) e se é reposição a partir do texto bruto
 */
function parseStatus(rawDate, reposicaoField) {
  const rawStr = String(rawDate || '').toLowerCase();
  const reposStr = String(reposicaoField || '').toLowerCase().trim();

  const isAbsent = rawStr.includes('absent');
  const hasReposicao = reposStr.length > 0 && !['content', 'reposição', 'reposicao', 'replacement'].includes(reposStr);

  return {
    status: isAbsent ? 'absent' : 'present',
    is_reposicao: hasReposicao,
    reposicao_date: hasReposicao ? reposicaoField : null,
  };
}

/**
 * Extrai registros de aula de uma aba do Excel
 */
function parseSheetLogs(sheet, studentName, yearHint) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const logs = [];

  for (const row of rows) {
    const cells = row.map(c => String(c || '').trim());
    const nameCell = cells[0].toLowerCase();

    // Pular linhas que são cabeçalho ou separadores de mês
    if (!nameCell || nameCell === 'aluno' || nameCell === 'aluna' || nameCell === 'student' || nameCell === 'auno') continue;
    const isStudentRow = nameCell.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .startsWith(studentName.toLowerCase().substring(0, 4).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
    
    if (!isStudentRow) continue;

    // As colunas variam por aba. Tentamos identificar por conteúdo:
    // Padrão mais comum: [Nome, Data, Conteúdo/Reposição, Conteúdo]
    // Determinamos lendo os headers dinamicamente, mas usamos heurística
    const col1 = cells[1]; // geralmente DATE
    const col2 = cells[2]; // geralmente CONTENT ou REPOSIÇÃO
    const col3 = cells[3]; // geralmente CONTENT ou vazio

    if (!col1) continue;

    const rawDateStr = col1;
    const lesson_date = parseDate(col1, yearHint);
    if (!lesson_date) continue;

    // Heurística: se col2 é uma data parcial (reposição) ou tem "Present/Absent" no col1
    let content = '';
    let reposicaoRaw = '';

    // Se tem 4+ colunas com content em col3, é o padrão: Nome/Data/Reposição/Content
    if (col3 && col3.length > 3 && !col3.match(/^\d/) && !col3.toLowerCase().includes('present') && !col3.toLowerCase().includes('absent')) {
      content = col3;
      reposicaoRaw = col2;
    } else if (col2 && col2.length > 3 && !col2.match(/^\d{1,2}\//) && !col2.toLowerCase().includes('present') && !col2.toLowerCase().includes('absent')) {
      content = col2;
    }

    const { status, is_reposicao, reposicao_date } = parseStatus(rawDateStr, reposicaoRaw);

    logs.push({
      lesson_date,
      raw_date_text: rawDateStr,
      content: content || null,
      status,
      is_reposicao,
      reposicao_date: reposicao_date || null,
    });
  }

  return logs;
}

// ================================
// MAIN
// ================================
async function main() {
  console.log('🚀 Iniciando importação do Excel para Supabase...\n');

  const filePath = path.join(__dirname, '..', 'public', 'Lista de Presença .xlsx');
  const workbook = XLSX.readFile(filePath);

  // Limpar dados existentes para evitar duplicatas
  console.log('🧹 Limpando tabelas existentes...');
  await supabase.from('attendance_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const sheetName of workbook.SheetNames) {
    const studentDef = STUDENT_MAP[sheetName];
    if (!studentDef) {
      console.log(`⚠️  Aba não mapeada, pulando: "${sheetName}"`);
      continue;
    }

    console.log(`\n📋 Processando: ${studentDef.name} (${sheetName})`);

    // Inserir aluno
    const { data: studentData, error: studentErr } = await supabase
      .from('students')
      .insert({
        name: studentDef.name,
        schedule: studentDef.schedule,
        level: studentDef.level,
        status: studentDef.status,
        notes: studentDef.notes || null,
      })
      .select('id')
      .single();

    if (studentErr) {
      console.error(`   ❌ Erro ao inserir aluno ${studentDef.name}:`, studentErr.message);
      continue;
    }
    console.log(`   ✅ Aluno criado: ${studentDef.name} (id: ${studentData.id})`);

    // Parsear logs da aba
    const sheet = workbook.Sheets[sheetName];
    const logs = parseSheetLogs(sheet, studentDef.name, 2025);

    if (logs.length === 0) {
      console.log(`   ℹ️  Nenhum registro de aula encontrado.`);
      continue;
    }

    // Inserir logs em lote
    const logsToInsert = logs.map(log => ({ ...log, student_id: studentData.id }));
    const { error: logsErr } = await supabase.from('attendance_logs').insert(logsToInsert);

    if (logsErr) {
      console.error(`   ❌ Erro ao inserir logs:`, logsErr.message);
    } else {
      console.log(`   ✅ ${logs.length} logs de aula inseridos.`);
    }
  }

  console.log('\n🎉 Importação concluída! Verifique o Supabase.');
}

main().catch(console.error);
