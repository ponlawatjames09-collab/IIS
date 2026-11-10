const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('travelTimeStart')) {
  code = code.replace(
    'billingStatus?: string;\n}',
    'billingStatus?: string;\n  travelTimeStart?: string;\n  travelTimeStop?: string;\n  processTimeStart?: string;\n  processTimeStop?: string;\n  processDescription?: string;\n}'
  );
  fs.writeFileSync('src/types.ts', code);
  console.log('types.ts patched');
}
