const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  "  onMonthChange?: (month: string) => void;",
  "  onMonthChange?: (month: string) => void;\n  onNavigateToTab?: (tab: 'pm-schedule' | 'pm-service' | string) => void;"
);

code = code.replace(
  "export default function Dashboard({ jobs: rawJobs, yearlyJobs: rawYearlyJobs, settings, activeMonthYear, accessToken, onMonthChange }: DashboardProps) {",
  "export default function Dashboard({ jobs: rawJobs, yearlyJobs: rawYearlyJobs, settings, activeMonthYear, accessToken, onMonthChange, onNavigateToTab }: DashboardProps) {"
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Dashboard props patched.");
