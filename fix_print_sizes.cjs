const fs = require('fs');

let content = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

const startMarker = '          {/* This is the visual worksheet preview container */}';
const endMarker = '        {/* Right Side: Interactive Signature & Drive Upload Actions */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers");
  process.exit(1);
}

let printAreaContent = content.substring(startIndex, endIndex);

// Make things smaller and remove 'md:' to ensure consistency and fit
printAreaContent = printAreaContent
  .replace(/p-4 md:p-\[15mm\]/g, 'p-[10mm]')
  .replace(/text-\[9px\] md:text-\[10px\]/g, 'text-[10px]')
  .replace(/text-base md:text-lg/g, 'text-base')
  .replace(/w-24 md:w-32/g, 'w-24')
  .replace(/w-12 h-12 md:w-16 md:h-16/g, 'w-14 h-14')
  .replace(/text-xl md:text-2xl/g, 'text-xl')
  .replace(/p-2 md:p-3/g, 'p-2')
  .replace(/text-xs md:text-sm/g, 'text-xs')
  .replace(/text-\[9px\] md:text-xs/g, 'text-[9px]')
  .replace(/gap-1\.5 md:gap-2/g, 'gap-1.5')
  .replace(/gap-2 md:gap-4/g, 'gap-2')
  .replace(/w-16 md:w-20/g, 'w-16')
  .replace(/w-20 md:w-28/g, 'w-24')
  .replace(/w-8 md:w-10/g, 'w-10')
  .replace(/w-12 md:w-16/g, 'w-14')
  .replace(/w-10 md:w-12/g, 'w-12')
  .replace(/p-1 md:p-1\.5/g, 'p-1.5')
  .replace(/h-6 md:h-8/g, 'h-7')
  .replace(/min-h-\[60px\] md:min-h-\[80px\]/g, 'min-h-[50px]')
  .replace(/min-h-\[50px\] md:min-h-\[70px\]/g, 'min-h-[40px]')
  .replace(/h-10 md:h-14/g, 'h-10')
  .replace(/gap-6 md:gap-16/g, 'gap-10')
  .replace(/h-4 md:h-6/g, 'h-5')
  .replace(/p-3 md:p-4/g, 'p-3')
  .replace(/mb-4 md:mb-6/g, 'mb-3')
  .replace(/px-2 md:px-8/g, 'px-6')
  .replace(/w-52 md:w-64/g, 'w-56')
  .replace(/gap-2 md:gap-3/g, 'gap-2')
  .replace(/text-\[9px\] md:text-\[11px\]/g, 'text-[10px]')
  .replace(/text-\[8px\] md:text-\[10px\]/g, 'text-[9px]')
  .replace(/bottom-1 right-2 md:bottom-2 md:right-4/g, 'bottom-2 right-4');

const finalContent = content.substring(0, startIndex) + printAreaContent + content.substring(endIndex);

fs.writeFileSync('src/components/JobPDFModal.tsx', finalContent);
console.log("Successfully shrunk print sizes.");
