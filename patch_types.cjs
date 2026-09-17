const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "  serialNumber?: string;\n  rowIndex?: number;\n}",
  "  serialNumber?: string;\n  ibDate?: string;\n  expiryDate?: string;\n  rowIndex?: number;\n}"
);

fs.writeFileSync('src/types.ts', code);
console.log("types.ts patched.");
