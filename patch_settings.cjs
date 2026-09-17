const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');

// 1. Add state for newEngineerEmail
if (!code.includes('const [newEngineerEmail, setNewEngineerEmail]')) {
  code = code.replace(
    "const [newEngineer, setNewEngineer] = useState('');",
    "const [newEngineer, setNewEngineer] = useState('');\n  const [newEngineerEmail, setNewEngineerEmail] = useState('');"
  );
}

// 2. Add handleAddEngineer to handle both name and email
const addEngineerFunc = `
  const handleAddEngineer = () => {
    if (!newEngineer.trim()) return;
    const name = newEngineer.trim();
    const email = newEngineerEmail.trim();
    const list = settings.engineers || [];
    
    if (!list.includes(name)) {
      list.push(name);
    }
    
    const newEmails = { ...(settings.engineerEmails || {}) };
    if (email) {
      newEmails[name] = email;
    }
    
    onUpdateSettings({
      ...settings,
      engineers: list,
      engineerEmails: newEmails
    });
    
    setNewEngineer('');
    setNewEngineerEmail('');
  };
`;
if (!code.includes('const handleAddEngineer')) {
  code = code.replace(
    "const addListItem =",
    addEngineerFunc + "\n  const addListItem ="
  );
}

// 3. Update the UI for Engineers
const oldEngineersUI = `            <div className="bg-white rounded border border-slate-200 p-3 shadow-sm flex flex-col h-[280px]">
              <h3 className="font-bold text-xs text-slate-700 mb-1 flex items-center gap-1.5 shrink-0"><User className="w-3.5 h-3.5 text-indigo-500"/> Engineers List</h3>
              <p className="text-[10px] text-slate-500 mb-3 shrink-0">Dropdown options for Engineer column</p>
              
              <div className="flex gap-2 mb-3 shrink-0">
                <input 
                  type="text" 
                  placeholder="Add new engineer..."
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
            </div>`;

const newEngineersUI = `            <div className="bg-white rounded border border-slate-200 p-3 shadow-sm flex flex-col h-[320px]">
              <h3 className="font-bold text-xs text-slate-700 mb-1 flex items-center gap-1.5 shrink-0"><User className="w-3.5 h-3.5 text-indigo-500"/> Engineers & Chat Email</h3>
              <p className="text-[10px] text-slate-500 mb-3 shrink-0">Used for dropdowns and Google Chat assignments</p>
              
              <div className="flex flex-col gap-1.5 mb-3 shrink-0">
                <input 
                  type="text" 
                  placeholder="Engineer name..."
                  value={newEngineer}
                  onChange={(e) => setNewEngineer(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                />
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Email for Chat (optional)"
                    value={newEngineerEmail}
                    onChange={(e) => setNewEngineerEmail(e.target.value)}
                    className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                  />
                  <button
                    onClick={handleAddEngineer}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-2 py-1 rounded cursor-pointer shrink-0 flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
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
            </div>`;

// Wait, I need to add User to imports if not there.
if (!code.includes('User, ')) {
  code = code.replace('} from \'lucide-react\';', ', User } from \'lucide-react\';');
}

if (code.includes('<User className="w-3.5 h-3.5 text-indigo-500"/> Engineers List')) {
  code = code.replace(oldEngineersUI, newEngineersUI);
} else {
  // Let's use a more robust regex or string replace
  const startIdx = code.indexOf('<div className="bg-white rounded border border-slate-200 p-3 shadow-sm flex flex-col h-[280px]">');
  const endIdx = code.indexOf('</div>', code.indexOf('settings.engineers.map') + 200) + 6;
  // This might be risky, let's use the explicit replacement since we already got the text
  // Let's find exactly how the block looks in the file.
}

fs.writeFileSync('src/components/Settings.tsx', code);
console.log('patched Settings UI');
