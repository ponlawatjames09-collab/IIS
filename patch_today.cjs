const fs = require('fs');
let code = fs.readFileSync('src/components/TodayDashboard.tsx', 'utf8');

// We will use local time date instead of UTC for todayStr, just in case.
code = code.replace(
  "const todayStr = new Date().toISOString().split('T')[0];",
  `
  // Get date in YYYY-MM-DD in local Thailand time (or standard local time)
  // toISOString uses UTC which might be wrong at certain hours
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const todayStr = \`\${year}-\${month}-\${day}\`;
`
);

// We will pass jobs as props if possible, but let's just make sure it loads first.
// I'll add a debug banner so we can see what it's comparing.
const replacement = `
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Today's Operations
          </h2>
          <p className="text-slate-500 flex items-center gap-1.5 mt-1">
            <CalendarIcon className="w-4 h-4" />
            {displayDate}
          </p>
          <div className="text-xs text-slate-400 mt-2">
            Debug: Date={todayStr} | Jobs Fetched: {jobs.length} | Dispatches Fetched: {dispatchRecords.length}
          </div>
        </div>
      </div>
`;
code = code.replace(
  /<div className="flex items-center justify-between">[\s\S]*?<\/div>\s*<\/div>/,
  replacement
);

fs.writeFileSync('src/components/TodayDashboard.tsx', code);
console.log("TodayDashboard debug added.");
