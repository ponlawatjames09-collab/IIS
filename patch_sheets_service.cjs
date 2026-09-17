const fs = require('fs');
let code = fs.readFileSync('src/sheetsService.ts', 'utf8');

const newFunctions = `
// ==========================================
// PM ASSIGNMENTS
// ==========================================

export const fetchPMAssignmentsFromSheet = async (spreadsheetId: string, accessToken: string): Promise<Record<string, string>> => {
  const sheetName = 'PM_Assignments';
  
  // 1. Check if sheet exists
  const metaRes = await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}\`, {
    headers: { Authorization: \`Bearer \${accessToken}\` }
  });
  const metaData = await metaRes.json();
  
  if (metaData.error) {
    throw new Error(metaData.error.message);
  }
  
  const hasSheet = metaData.sheets.some((s: any) => s.properties.title === sheetName);
  
  // If not exists, create it
  if (!hasSheet) {
    await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}:batchUpdate\`, {
      method: 'POST',
      headers: { 
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          addSheet: { properties: { title: sheetName } }
        }]
      })
    });
    
    // Add headers
    await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}/values/\${sheetName}!A1:C1?valueInputOption=USER_ENTERED\`, {
      method: 'PUT',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [["RecordKey", "EngineerName", "UpdatedAt"]]
      })
    });
    
    return {};
  }
  
  // 2. Fetch data
  const res = await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}/values/\${sheetName}!A2:C\`, {
    headers: { Authorization: \`Bearer \${accessToken}\` }
  });
  
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  
  const rows = data.values || [];
  const assignments: Record<string, string> = {};
  
  // Process rows: latest row for a recordKey takes precedence if duplicates exist
  rows.forEach((row: any[]) => {
    const key = row[0];
    const engineer = row[1];
    if (key && engineer !== undefined) {
      if (engineer === '') {
        delete assignments[key];
      } else {
        assignments[key] = engineer;
      }
    }
  });
  
  return assignments;
};

export const updatePMAssignmentsInSheet = async (spreadsheetId: string, accessToken: string, recordKey: string, engineerName: string): Promise<void> => {
  const sheetName = 'PM_Assignments';
  
  // Ensure sheet exists before appending (optimistically assume it exists most of the time, 
  // if fetchPMAssignmentsFromSheet was called earlier, it exists)
  
  const timestamp = new Date().toISOString();
  
  // We simply append a new row. The fetch function processes them in order, so the latest prevails.
  // Alternatively, we could find and update, but append is much faster and simpler.
  
  await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}/values/\${sheetName}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS\`, {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [[recordKey, engineerName, timestamp]]
    })
  });
};
`;

code = code + '\n' + newFunctions;
fs.writeFileSync('src/sheetsService.ts', code);
console.log('Appended PM Assignments functions to sheetsService.ts');
