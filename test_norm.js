const normalizeDate = (dStr) => {
    if (!dStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return dStr;
    
    // Try DD/MM/YYYY or MM/DD/YYYY
    const parts = dStr.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) { // ends with year
        const year = parts[2];
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        
        let month, day;
        if (p1 > 12) { 
           // definitely MM/DD/YYYY
           month = p0; day = p1;
        } else if (p0 > 12) {
           // definitely DD/MM/YYYY
           day = p0; month = p1;
        } else {
           // Ambiguous, assume DD/MM/YYYY
           day = p0; month = p1;
        }
        
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else if (parts[0].length === 4) { // starts with year
        const year = parts[0];
        const month = String(parts[1]).padStart(2, '0');
        const day = String(parts[2]).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    return dStr;
  };

console.log(normalizeDate('18/09/2026')); // Expect 2026-09-18
console.log(normalizeDate('9/18/2026'));  // Expect 2026-09-18
console.log(normalizeDate('2026-09-18')); // Expect 2026-09-18
console.log(normalizeDate('2026/09/18')); // Expect 2026-09-18
