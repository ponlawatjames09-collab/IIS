const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const sidebarButton = `
            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('pm-service'); }}
              className={\`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer \${
                activeTab === 'pm-service' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }\`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>PM Service Tasks</span>
            </button>
`;

code = code.replace(
  /<\/button>\s*<button\s*onClick=\{\(\) => \{ setEditingJob\(null\); setEditingJobIndex\(null\); setActiveTab\('dispatch-calendar'\); \}\}/,
  `</button>\n${sidebarButton}\n            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('dispatch-calendar'); }}`
);

const renderContent = `
            {activeTab === 'pm-service' && (
              <PMServiceTab
                settings={settings}
                accessToken={accessToken}
                onUpdateSettings={(newSettings) => {
                  setSettings(newSettings);
                  localStorage.setItem('service_hub_settings', JSON.stringify(newSettings));
                }}
                onOpenPMJob={handleOpenPMJob}
              />
            )}
`;

code = code.replace(
  /\{activeTab === 'dispatch-calendar' && \(/,
  `${renderContent}\n            {activeTab === 'dispatch-calendar' && (`
);

const mobileButton = `
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('pm-service'); }} className={\`flex flex-col items-center justify-center gap-1 w-full h-full \${activeTab === 'pm-service' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}\`}>
          <ClipboardList className="w-5 h-5" />
          <span>PM Tasks</span>
        </button>
`;

code = code.replace(
  /<button onClick=\{\(\) => \{ setEditingJob\(null\); setEditingJobIndex\(null\); setActiveTab\('quotation-reader'\);/,
  `${mobileButton}\n        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('quotation-reader');`
);

fs.writeFileSync('src/App.tsx', code);
console.log("App patched successfully.");
