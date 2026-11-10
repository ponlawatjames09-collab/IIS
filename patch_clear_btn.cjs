const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

code = code.replace(/onClick=\{clearCanvas\}/g, 'onClick={clearSignature}');

fs.writeFileSync('src/components/JobPDFModal.tsx', code);
console.log("clearCanvas patched to clearSignature.");
