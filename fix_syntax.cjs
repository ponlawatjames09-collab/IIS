const fs = require('fs');
let code = fs.readFileSync('src/components/TodayDashboard.tsx', 'utf8');

code = code.replace(
  "className={\\`text-xs font-semibold px-2 py-0.5 rounded-full \\${hasWork ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}\\`}",
  "className={`text-xs font-semibold px-2 py-0.5 rounded-full ${hasWork ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}"
);

fs.writeFileSync('src/components/TodayDashboard.tsx', code);
console.log("Syntax error fixed.");
