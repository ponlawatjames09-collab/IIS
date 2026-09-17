const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

// Add import if not exists
if (!code.includes("import logoImage from")) {
  code = code.replace(
    "import React, ",
    "import React, { useEffect, useRef } from 'react';\nimport logoImage from '../assets/logo.png';\n//"
  );
  // fallback if "import React, " wasn't the exact match
  if (!code.includes("import logoImage from")) {
     code = "import logoImage from '../assets/logo.png';\n" + code;
  }
}

// Replace string src with imported variable
code = code.replace(/src="\/logo\.png"/g, "src={logoImage}");

fs.writeFileSync('src/components/JobPDFModal.tsx', code);
console.log('Logo import added.');
