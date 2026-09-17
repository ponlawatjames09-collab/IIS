const fs = require('fs');
let code = fs.readFileSync('src/sheetsService.ts', 'utf8');

// In fetchCMOnCallRecords
code = code.replace(
  "const range = encodeURIComponent(\"'DATABASE TARGET USER'!A2:K\");",
  "const range = encodeURIComponent(\"'DATABASE TARGET USER'!A2:M\");"
);
code = code.replace(
  "serialNumber: row[10] ? String(row[10]) : '',",
  "serialNumber: row[10] ? String(row[10]) : '',\n      ibDate: row[11] ? String(row[11]) : '',\n      expiryDate: row[12] ? String(row[12]) : '',"
);

// In appendCMOnCallRecord
code = code.replace(
  "record.engineer,\n        record.serialNumber\n      ]",
  "record.engineer,\n        record.serialNumber,\n        record.ibDate || '',\n        record.expiryDate || ''\n      ]"
);

// In updateCMOnCallRecord
code = code.replace(
  "record.engineer,\n        record.serialNumber\n      ]",
  "record.engineer,\n        record.serialNumber,\n        record.ibDate || '',\n        record.expiryDate || ''\n      ]"
);
code = code.replace(
  "const range = encodeURIComponent(`'DATABASE TARGET USER'!A${rowIndex}:K${rowIndex}`);",
  "const range = encodeURIComponent(`'DATABASE TARGET USER'!A${rowIndex}:M${rowIndex}`);"
);

fs.writeFileSync('src/sheetsService.ts', code);
console.log("sheetsService.ts patched.");
