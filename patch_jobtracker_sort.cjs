const fs = require('fs');

let code = fs.readFileSync('src/components/JobTracker.tsx', 'utf8');

const oldSort = `  }).sort((a, b) => parseDateToMs(b.callDate) - parseDateToMs(a.callDate));`;

const newSort = `  }).sort((a, b) => {
    // Sort by Job Number
    const parseJobNum = (jNum: string) => {
      if (!jNum) return 0;
      const clean = String(jNum).trim();
      if (/^\\d+$/.test(clean) && clean.length >= 5) {
        const seqStr = clean.substring(0, clean.length - 4);
        const mmStr = clean.substring(clean.length - 4, clean.length - 2);
        const yyStr = clean.substring(clean.length - 2);
        const seq = parseInt(seqStr, 10) || 0;
        const mm = parseInt(mmStr, 10) || 0;
        const yy = parseInt(yyStr, 10) || 0;
        return (yy * 100000) + (mm * 1000) + seq;
      }
      const m = clean.match(/\\d+/g);
      if (m) return parseInt(m.join(''), 10) || 0;
      return 0;
    };
    return parseJobNum(b.jobNumber) - parseJobNum(a.jobNumber);
  });`;

code = code.replace(oldSort, newSort);

fs.writeFileSync('src/components/JobTracker.tsx', code);
console.log('Patched JobTracker sorting by jobNumber');
