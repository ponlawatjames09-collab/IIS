const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/@media print \{[\s\S]*?\}/, `@media print {
  @page {
    size: A4 portrait;
    margin: 0mm;
  }
  body * {
    visibility: hidden;
  }
  #print-area, #print-area * {
    visibility: visible;
  }
  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm !important;
    height: 297mm !important;
    max-width: 210mm !important;
    max-height: 297mm !important;
    margin: 0 !important;
    padding: 10mm !important; /* Set print padding */
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    transform: scale(1) !important;
    transform-origin: top left !important;
    overflow: hidden !important;
  }
}`);
fs.writeFileSync('src/index.css', css);
