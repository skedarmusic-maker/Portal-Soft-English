const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', 'public', 'Lista de Presença .xlsx');

if (!fs.existsSync(filePath)) {
  console.error('Arquivo não encontrado:', filePath);
  process.exit(1);
}

const workbook = XLSX.readFile(filePath);

console.log('\n=== ABAS ENCONTRADAS ===');
workbook.SheetNames.forEach((name, i) => {
  console.log(`[${i}] ${name}`);
});

console.log('\n=== DADOS DE CADA ABA ===');
workbook.SheetNames.forEach((sheetName) => {
  console.log(`\n--- Aba: "${sheetName}" ---`);
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  rows.slice(0, 30).forEach((row, i) => {
    if (row.some(c => c !== '')) {
      console.log(`Linha ${i + 1}:`, JSON.stringify(row));
    }
  });
});
