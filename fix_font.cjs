const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

const startMarker = '          {/* This is the visual worksheet preview container */}';
const endMarker = '        {/* Right Side: Interactive Signature & Drive Upload Actions */}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  let printArea = code.substring(startIndex, endIndex);

  // Update the print-area div
  printArea = printArea.replace(
    /className="([^"]*)text-\[10px\]([^"]*)font-sans([^"]*)"/g,
    'className="$1$2$3"'
  );
  printArea = printArea.replace(
    /style=\{\{ width: '100%', maxWidth: '210mm' \}\}/g,
    'style={{ width: "100%", maxWidth: "210mm", fontFamily: "\\"AngsanaUPC\\", \\"Angsana New\\", \\"TH Sarabun New\\", serif", fontSize: "14pt" }}'
  );

  // Strip out explicit text size classes to let 14pt inherit
  printArea = printArea.replace(/text-xs/g, '');
  printArea = printArea.replace(/text-sm/g, '');
  printArea = printArea.replace(/text-base/g, 'text-[18pt]'); // Slightly larger for header
  printArea = printArea.replace(/text-xl/g, 'text-[24pt]');
  printArea = printArea.replace(/text-\[9px\]/g, '');
  printArea = printArea.replace(/text-\[10px\]/g, '');
  printArea = printArea.replace(/text-\[11px\]/g, '');
  
  // Cleanup multiple spaces in className
  printArea = printArea.replace(/className="([^"]+)"/g, (match, p1) => {
    return 'className="' + p1.replace(/\s+/g, ' ').trim() + '"';
  });

  code = code.substring(0, startIndex) + printArea + code.substring(endIndex);
  fs.writeFileSync('src/components/JobPDFModal.tsx', code);
  console.log('Font and size updated.');
} else {
  console.log('Markers not found.');
}
