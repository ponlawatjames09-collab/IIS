import fs from 'fs';
const code = fs.readFileSync('src/components/CMOnCallServiceView.tsx', 'utf8');
const tableIdx = code.indexOf('<table');
console.log(code.substring(tableIdx, tableIdx + 2000));
