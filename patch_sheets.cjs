const fs = require('fs');
let code = fs.readFileSync('src/sheetsService.ts', 'utf8');

if (!code.includes('Travel Time Start')) {
  // Update HEADERS
  code = code.replace(
    '"Spare Part 3 Remark"\n];',
    '"Spare Part 3 Remark", "Travel Time Start", "Travel Time Stop", "Process Time Start", "Process Time Stop", "Process Description"\n];'
  );

  // Update mapRowToJob
  code = code.replace(
    'engineer4: row[33] ? String(row[33]) : \'\',',
    'engineer4: row[33] ? String(row[33]) : \'\',\n    travelTimeStart: row[42] ? String(row[42]) : \'\',\n    travelTimeStop: row[43] ? String(row[43]) : \'\',\n    processTimeStart: row[44] ? String(row[44]) : \'\',\n    processTimeStop: row[45] ? String(row[45]) : \'\',\n    processDescription: row[46] ? String(row[46]) : \'\','
  );

  // Update mapJobToRow
  code = code.replace(
    'job.sparePartRemark3 || \'\',\n  ];',
    'job.sparePartRemark3 || \'\',\n    job.travelTimeStart || \'\',\n    job.travelTimeStop || \'\',\n    job.processTimeStart || \'\',\n    job.processTimeStop || \'\',\n    job.processDescription || \'\'\n  ];'
  );
  
  // Also we need to make sure mapJobToRow range is large enough A1:AW or similar if it exceeds AP
  // AP is index 41 (A=1...Z=26, AA=27...AP=42)
  // Let's expand range to BC (55 columns) to be safe
  code = code.replace(/A1:AP1/g, 'A1:BC1');
  code = code.replace(/A2:AP/g, 'A2:BC');
  code = code.replace(/!A\${sheetRowNumber}:AP\${sheetRowNumber}/g, '!A${sheetRowNumber}:BC${sheetRowNumber}');

  fs.writeFileSync('src/sheetsService.ts', code);
  console.log('sheetsService.ts patched');
}
