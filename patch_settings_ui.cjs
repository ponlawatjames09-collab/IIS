const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const oldEngineersUI = `        {/* Right column: Dropdowns list management */}
        <div className="space-y-4">
          <div className="bg-white rounded border border-slate-200 p-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Engineer Dropdown Data</h3>
            <div className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add Engineer Name"
                  value={newEngineer}
                  onChange={(e) => setNewEngineer(e.target.value)}
                  className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                />
                <button
                  onClick={() => addListItem('engineers', newEngineer, setNewEngineer)}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-1 rounded cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {settings.engineers.map((item) => (
                  <div key={item} className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-100 text-xs text-slate-700">
                    <span className="truncate max-w-[180px]">{item}</span>
                    <button
                      onClick={() => removeListItem('engineers', item)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>`;

const newEngineersUI = `        {/* Right column: Dropdowns list management */}
        <div className="space-y-4">
          <div className="bg-white rounded border border-slate-200 p-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Engineer Dropdown Data</h3>
            <div className="space-y-2">
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Engineer Name"
                  value={newEngineer}
                  onChange={(e) => setNewEngineer(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                />
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder="Email for Google Chat (Optional)"
                    value={newEngineerEmail}
                    onChange={(e) => setNewEngineerEmail(e.target.value)}
                    className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                  />
                  <button
                    onClick={handleAddEngineer}
                    className="bg-slate-900 hover:bg-slate-800 text-white p-1 rounded cursor-pointer shrink-0 flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {settings.engineers.map((item) => (
                  <div key={item} className="flex flex-col bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-100 text-xs text-slate-700 group">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold truncate max-w-[180px]">{item}</span>
                      <button
                        onClick={() => removeListItem('engineers', item)}
                        className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {settings.engineerEmails?.[item] && (
                      <span className="text-[10px] text-slate-500 truncate">{settings.engineerEmails[item]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>`;

if (code.includes('Engineer Dropdown Data')) {
  code = code.replace(oldEngineersUI, newEngineersUI);
} else {
  console.log("Could not find string in code");
}
fs.writeFileSync('src/components/Settings.tsx', code);
console.log('Patched SettingsUI');
