const fs = require('fs');
let code = fs.readFileSync('src/sheetsService.ts', 'utf8');

code = code.replace(
  "      serialNumber: row[10] ? String(row[10]) : '',\\n      rowIndex: index + 2,",
  "      serialNumber: row[10] ? String(row[10]) : '',\\n      ibDate: row[11] ? String(row[11]) : '',\\n      expiryDate: row[12] ? String(row[12]) : '',\\n      rowIndex: index + 2,"
);
// wait, the literal string has \n, I should use regex
code = code.replace(/serialNumber: row\[10\] \? String\(row\[10\]\) : '',\s*rowIndex: index \+ 2,/, 
  "serialNumber: row[10] ? String(row[10]) : '',\n      ibDate: row[11] ? String(row[11]) : '',\n      expiryDate: row[12] ? String(row[12]) : '',\n      rowIndex: index + 2,"
);
fs.writeFileSync('src/sheetsService.ts', code);
console.log("patched!");
