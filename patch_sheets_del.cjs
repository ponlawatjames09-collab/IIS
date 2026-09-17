const fs = require('fs');

let code = fs.readFileSync('src/sheetsService.ts', 'utf8');

// Add deleteDispatchRecord
const deleteFunc = `
export const deleteDispatchRecord = async (spreadsheetId: string, accessToken: string, rowIndex: number): Promise<void> => {
  const sheetName = 'DispatchSchedule';
  const range = \`\${sheetName}!A\${rowIndex}:G\${rowIndex}\`;
  const values = [['', '', '', '', '', '', '']];
  
  await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}/values/\${range}?valueInputOption=USER_ENTERED\`, {
    method: 'PUT',
    headers: { 'Authorization': \`Bearer \${accessToken}\`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  });
};
`;

if (!code.includes('deleteDispatchRecord')) {
  code = code.replace(
    "export const updateDispatchRecord",
    deleteFunc + "\nexport const updateDispatchRecord"
  );
}

// Modify fetchDispatchRecords to filter empty ids
const oldFetch = `    return data.values.map((row: any[], index: number) => ({
      id: row[0] || '',
      date: row[1] || '',
      engineer: row[2] || '',
      taskTitle: row[3] || '',
      location: row[4] || '',
      remark: row[5] || '',
      status: row[6] || 'Pending',
      rowIndex: index + 2
    }));`;

const newFetch = `    return data.values.map((row: any[], index: number) => ({
      id: row[0] || '',
      date: row[1] || '',
      engineer: row[2] || '',
      taskTitle: row[3] || '',
      location: row[4] || '',
      remark: row[5] || '',
      status: row[6] || 'Pending',
      rowIndex: index + 2
    })).filter((r: any) => r.id !== '');`;

if (code.includes(oldFetch)) {
  code = code.replace(oldFetch, newFetch);
}

fs.writeFileSync('src/sheetsService.ts', code);
console.log('Patched sheetsService for deletion');
