const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I inserted the wrong sidebar button earlier, let's clean it if it exists.
const wrongBtn = `<button
                onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('today-operations'); }}
                className={\`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors \${activeTab === 'today-operations' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}\`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Today's Operations</span>
              </button>`;
code = code.replace(wrongBtn, ''); // remove it

// Find the real dashboard button:
const targetToFind = `<span>Dashboard Overview</span>\n            </button>`;

const newSidebarBtn = `
            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('today-operations'); }}
              className={\`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer \${
                activeTab === 'today-operations' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }\`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Today's Operations</span>
            </button>`;

code = code.replace(targetToFind, targetToFind + newSidebarBtn);

// Ensure the type is correct in activeTab
code = code.replace(
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'tracker' | 'billing' | 'settings' | 'cm-status' | 'cm-oncall' | 'pm-schedule' | 'quotation-reader' | 'quotation-dashboard' | 'dispatch-calendar' | 'pm-service'>",
  "const [activeTab, setActiveTab] = useState<'dashboard' | 'today-operations' | 'form' | 'tracker' | 'billing' | 'settings' | 'cm-status' | 'cm-oncall' | 'pm-schedule' | 'quotation-reader' | 'quotation-dashboard' | 'dispatch-calendar' | 'pm-service'>"
);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx fixed");
