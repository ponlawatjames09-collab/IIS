const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import TodayDashboard
code = code.replace(
  "import DispatchCalendarView from './components/DispatchCalendarView';",
  "import DispatchCalendarView from './components/DispatchCalendarView';\nimport TodayDashboard from './components/TodayDashboard';"
);

// Add to Sidebar
// Look for Dashboard button, insert Today Operations after it.
const dashboardSidebarBtn = `<button
                onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('dashboard'); }}
                className={\`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors \${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}\`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard Overview</span>
              </button>`;

const todaySidebarBtn = `
              <button
                onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('today-operations'); }}
                className={\`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors \${activeTab === 'today-operations' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}\`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Today's Operations</span>
              </button>`;

code = code.replace(dashboardSidebarBtn, dashboardSidebarBtn + todaySidebarBtn);

// Also need to make sure Users is imported from lucide-react in App.tsx
if (!code.includes('Users,')) {
  code = code.replace(
    "import { Activity, LayoutDashboard, FileSpreadsheet, ClipboardList, Settings as SettingsIcon,",
    "import { Activity, LayoutDashboard, Users, FileSpreadsheet, ClipboardList, Settings as SettingsIcon,"
  );
}

// Add the view rendering component
const dashboardViewRender = `{activeTab === 'dashboard' && (
              <Dashboard 
                jobs={jobs} 
                yearlyJobs={yearlyJobs} 
                settings={settings} 
                activeMonthYear={activeMonthYear} 
                accessToken={accessToken}
                onMonthChange={setActiveMonthYear}
                onNavigateToTab={setActiveTab}
              />
            )}`;

const todayViewRender = `
            {activeTab === 'today-operations' && (
              <TodayDashboard
                settings={settings}
                accessToken={accessToken}
              />
            )}`;

code = code.replace(dashboardViewRender, dashboardViewRender + todayViewRender);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx patched to include TodayDashboard.");
