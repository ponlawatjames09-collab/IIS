const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const pendingWidget = `
      {/* PENDING PM ALERTS WIDGET */}
      <div className="bg-white rounded border border-orange-200 p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-orange-400"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600 shrink-0 mt-1">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-800 tracking-tight">Pending PM Alerts</h2>
              <p className="text-sm text-slate-500 mt-1">
                You have <strong className="text-orange-600 text-lg">{pendingPmsThisMonth.pendingCount}</strong> pending PM schedules out of {pendingPmsThisMonth.total} scheduled for <strong>{pendingPmsThisMonth.monthName}</strong>.
              </p>
            </div>
          </div>
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('pm-schedule')}
              className="px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-bold rounded-lg text-sm transition-colors whitespace-nowrap shadow-sm flex items-center gap-2"
            >
              Go to PM Schedule
              <Activity className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
`;

code = code.replace(
  "{/* PM PROGRESS SUMMARY */}",
  `${pendingWidget}\n\n      {/* PM PROGRESS SUMMARY */}`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Dashboard UI patched.");
