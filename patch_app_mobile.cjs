const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const dashMobileBtn = `<button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('dashboard'); }} className={\`flex flex-col items-center justify-center gap-1 w-full h-full \${activeTab === 'dashboard' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}\`}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>`;
        
const todayMobileBtn = `
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('today-operations'); }} className={\`flex flex-col items-center justify-center gap-1 w-full h-full \${activeTab === 'today-operations' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}\`}>
          <Users className="w-5 h-5" />
          <span>Today</span>
        </button>`;

if (code.includes(dashMobileBtn)) {
  code = code.replace(dashMobileBtn, dashMobileBtn + todayMobileBtn);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Mobile bottom menu patched.");
} else {
  console.log("Could not find dashMobileBtn exact string.");
}
