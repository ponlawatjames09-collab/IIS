const fs = require('fs');
let code = fs.readFileSync('src/components/CMOnCallServiceView.tsx', 'utf8');

code = code.replace(
  "      engineer: record.engineer || '',\n      serialNumber: record.serialNumber || '',\n    });",
  "      engineer: record.engineer || '',\n      serialNumber: record.serialNumber || '',\n      ibDate: record.ibDate || '',\n      expiryDate: record.expiryDate || ''\n    });"
);

fs.writeFileSync('src/components/CMOnCallServiceView.tsx', code);
console.log("handleEditRecord patched.");
