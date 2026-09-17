const fs = require('fs');
let code = fs.readFileSync('src/components/CMOnCallServiceView.tsx', 'utf8');

code = code.replace(
  "engineer: formData.engineer,\n        serialNumber: formData.serialNumber\n      };",
  "engineer: formData.engineer,\n        serialNumber: formData.serialNumber,\n        ibDate: formData.ibDate,\n        expiryDate: formData.expiryDate\n      };"
);

fs.writeFileSync('src/components/CMOnCallServiceView.tsx', code);
console.log("CMOnCallServiceView updated for handleSubmit");
