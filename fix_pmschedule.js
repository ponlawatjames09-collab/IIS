const fs = require('fs');
let code = fs.readFileSync('src/sheetsService.ts', 'utf8');

const replacement = `
      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const row = rows[r];
        if (!row) continue;
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || '').trim().toLowerCase();
          
          if (val === 'jan' || val === 'january') {
            const nextVal = String(row[c+1] || '').trim().toLowerCase();
            if (nextVal === 'feb' || nextVal === 'february') {
              if (monthRowIndex === -1) {
                monthRowIndex = r;
                monthStartCol = c;
              }
            }
          }
          
          if (val.includes('hospital') && hospitalCol === 0 && r < 5) hospitalCol = c;
          if ((val.includes('s/n') || val === 'sn' || val.includes('serial')) && snCol === 1 && r < 5) snCol = c;
          if ((val === 'model' || val === 'system') && modelCol === 2 && r < 5) modelCol = c;
          if ((val.includes('warranty') || val.includes('contract')) && warrantyCol === 7 && r < 5) warrantyCol = c;
          if ((val.includes('payment') || val.includes('remark')) && paymentCol === 8 && r < 5) paymentCol = c;
        }
      }
`;

code = code.replace(/      for \(let r = 0; r < Math\.min\(rows\.length, 10\); r\+\+\) \{[\s\S]*?      \}/, replacement.trim());

fs.writeFileSync('src/sheetsService.ts', code);
console.log("Done replacing header extraction.");
