const fs = require('fs');
let code = fs.readFileSync('src/components/TodayDashboard.tsx', 'utf8');

// Function to safely normalize dates to YYYY-MM-DD
const normalizeStr = `
  const normalizeDate = (dStr: string) => {
    if (!dStr) return '';
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(dStr)) return dStr;
    
    // Try DD/MM/YYYY or MM/DD/YYYY
    const parts = dStr.split(/[\\/\\-]/);
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
        
        return \`\${year}-\${String(month).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
      } else if (parts[0].length === 4) { // starts with year
        const year = parts[0];
        const month = String(parts[1]).padStart(2, '0');
        const day = String(parts[2]).padStart(2, '0');
        return \`\${year}-\${month}-\${day}\`;
      }
    }
    
    return dStr;
  };
`;

code = code.replace("const engineerSchedules = useMemo(() => {", normalizeStr + "\n  const engineerSchedules = useMemo(() => {");

// Now replace the comparison to use normalizeDate
code = code.replace(
  "if (r.date === todayStr) {",
  "if (normalizeDate(r.date) === todayStr) {"
);

code = code.replace(
  "if (j.serviceDate === todayStr || (j.callDate === todayStr && !j.serviceDate)) {",
  "if (normalizeDate(j.serviceDate) === todayStr || (normalizeDate(j.callDate) === todayStr && !j.serviceDate)) {"
);

fs.writeFileSync('src/components/TodayDashboard.tsx', code);
console.log("TodayDashboard date parsing patched.");
