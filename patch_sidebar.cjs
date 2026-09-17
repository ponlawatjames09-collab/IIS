const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldMenu = `            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('pm-schedule'); }}
              className={\`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer \${
                activeTab === 'pm-schedule' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }\`}
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>PM Schedule</span>
            </button>`;

const newMenu = `            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('pm-schedule'); }}
              className={\`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer \${
                activeTab === 'pm-schedule' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }\`}
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>PM Schedule</span>
            </button>

            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('dispatch-calendar'); }}
              className={\`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer \${
                activeTab === 'dispatch-calendar' 
                  ? 'bg-indigo-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }\`}
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>Dispatch / Assign</span>
            </button>`;

code = code.replace(oldMenu, newMenu);
fs.writeFileSync('src/App.tsx', code);
console.log('Patched Sidebar');
