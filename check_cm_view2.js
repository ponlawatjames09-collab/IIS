import fs from 'fs';
const code = fs.readFileSync('src/components/CMOnCallServiceView.tsx', 'utf8');
const rIdx = code.indexOf('records.map');
console.log(code.substring(rIdx - 100, rIdx + 2000));
