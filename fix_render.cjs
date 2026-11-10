const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const dashboardRender = `{activeTab === 'dashboard' && (
              <Dashboard 
                jobs={jobs}
                yearlyJobs={yearlyJobs}
                settings={settings}
                accessToken={accessToken}
                activeMonthYear={activeMonthYear}
                onMonthChange={setActiveMonthYear}
                onNavigateToTab={setActiveTab}
              />
            )}`;

const todayRender = `
            {activeTab === 'today-operations' && (
              <TodayDashboard 
                settings={settings}
                accessToken={accessToken}
              />
            )}`;

if (code.includes('activeTab === \'dashboard\' && (')) {
    // Find the end of the Dashboard render block
    code = code.replace(
      dashboardRender,
      dashboardRender + todayRender
    );
    fs.writeFileSync('src/App.tsx', code);
    console.log("App.tsx patched with component render.");
} else {
    console.log("Could not find dashboardRender exact string.");
}
