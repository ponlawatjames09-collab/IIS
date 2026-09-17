const fs = require('fs');
const content = fs.readFileSync('test-data.csv', 'utf8');
const rows = content.split('\n').map(r => r.split(','));

      let monthRowIndex = -1;
      let monthStartCol = -1;
      let headerRowIndex = -1;
      
      let hospitalCol = 0;
      let snCol = 1;
      let modelCol = 2;
      let warrantyCol = 7;
      let paymentCol = 8;
      
      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const row = rows[r];
        if (!row) continue;
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || '').trim().toLowerCase();
          
          if (val === 'jan' || val === 'january') {
            const nextVal = String(row[c+1] || '').trim().toLowerCase();
            if (nextVal === 'feb' || nextVal === 'february') {
              monthRowIndex = r;
              monthStartCol = c;
            }
          }
          
          if (val.includes('hospital')) hospitalCol = c;
          if (val.includes('s/n') || val === 'sn' || val.includes('serial')) snCol = c;
          if (val.includes('model') || val.includes('system')) modelCol = c;
          if (val.includes('warranty') || val.includes('contract')) warrantyCol = c;
          if (val.includes('payment') || val.includes('remark')) paymentCol = c;
        }
      }

      if (monthRowIndex === -1) {
        monthRowIndex = 2;
        monthStartCol = 9;
      }

console.log("monthRowIndex", monthRowIndex, "monthStartCol", monthStartCol);
console.log("Cols", hospitalCol, snCol, modelCol, warrantyCol, paymentCol);

