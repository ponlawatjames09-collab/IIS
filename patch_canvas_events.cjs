const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

code = code.replace(/onMouseDown=\{startDrawing\}/g, 'onMouseDown={handleCanvasTouchStart}');
code = code.replace(/onMouseMove=\{draw\}/g, 'onMouseMove={handleCanvasTouchMove}');
code = code.replace(/onMouseUp=\{stopDrawing\}/g, 'onMouseUp={handleCanvasTouchEnd}');
code = code.replace(/onMouseLeave=\{stopDrawing\}/g, 'onMouseLeave={handleCanvasTouchEnd}');
code = code.replace(/onTouchStart=\{startDrawing\}/g, 'onTouchStart={handleCanvasTouchStart}');
code = code.replace(/onTouchMove=\{draw\}/g, 'onTouchMove={handleCanvasTouchMove}');
code = code.replace(/onTouchEnd=\{stopDrawing\}/g, 'onTouchEnd={handleCanvasTouchEnd}');

fs.writeFileSync('src/components/JobPDFModal.tsx', code);
console.log("Canvas events patched.");
