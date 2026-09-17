const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

const startMarker = '          {/* This is the visual worksheet preview container */}';
const endMarker = '        {/* Right Side: Interactive Signature & Drive Upload Actions */}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  let printArea = code.substring(startIndex, endIndex);

  // Replace Tailwind color classes with safe hex classes (or just style attributes)
  // Actually, replacing with style might be tricky with regex. Let's replace the classes with explicit custom classes that we define in index.css
  printArea = printArea.replace(/text-red-600/g, 'text-red-600-safe');
  printArea = printArea.replace(/text-emerald-600/g, 'text-emerald-600-safe');
  printArea = printArea.replace(/text-slate-800/g, 'text-slate-800-safe');
  printArea = printArea.replace(/border-slate-200\/60/g, 'border-slate-200-safe');
  printArea = printArea.replace(/bg-white/g, 'bg-white-safe');
  printArea = printArea.replace(/text-black/g, 'text-black-safe');
  printArea = printArea.replace(/border-black/g, 'border-black-safe');

  code = code.substring(0, startIndex) + printArea + code.substring(endIndex);
  fs.writeFileSync('src/components/JobPDFModal.tsx', code);
  console.log('Replaced color classes.');
}
