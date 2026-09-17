const fs = require('fs');

let code = fs.readFileSync('src/components/DispatchCalendarView.tsx', 'utf8');

// 1. Add isSaving state
if (!code.includes('const [isSaving, setIsSaving]')) {
  code = code.replace(
    'const [error, setError] = useState<string | null>(null);',
    'const [error, setError] = useState<string | null>(null);\n  const [isSaving, setIsSaving] = useState(false);'
  );
}

// 2. Deduplicate records in loadRecords
const oldLoad = `      const data = await fetchDispatchRecords(settings.spreadsheetId, accessToken);
      setRecords(data);`;
const newLoad = `      const data = await fetchDispatchRecords(settings.spreadsheetId, accessToken);
      // Deduplicate records to prevent duplicate rendering
      const uniqueMap = new Map();
      data.forEach(r => {
        const key = r.id || \`\${r.date}-\${r.engineer}-\${r.taskTitle}\`;
        if (!uniqueMap.has(key) || r.rowIndex > (uniqueMap.get(key).rowIndex || 0)) {
          uniqueMap.set(key, r);
        }
      });
      setRecords(Array.from(uniqueMap.values()));`;
code = code.replace(oldLoad, newLoad);

// 3. Add isSaving to saveRecord
const oldSave = `  const saveRecord = async () => {
    if (!settings.spreadsheetId || !accessToken || !editingRecord) return;
    if (!editingRecord.date || !editingRecord.engineer || !editingRecord.taskTitle) {
      alert("Please fill in Date, Engineer, and Task Title.");
      return;
    }

    try {`;
const newSave = `  const saveRecord = async () => {
    if (!settings.spreadsheetId || !accessToken || !editingRecord || isSaving) return;
    if (!editingRecord.date || !editingRecord.engineer || !editingRecord.taskTitle) {
      alert("Please fill in Date, Engineer, and Task Title.");
      return;
    }

    setIsSaving(true);
    try {`;
code = code.replace(oldSave, newSave);

const oldSaveEnd = `      setEditingRecord(null);
      loadRecords();
    } catch (err) {
      console.error(err);
      alert("Failed to save the record. Check console for details.");
    }
  };`;
const newSaveEnd = `      setEditingRecord(null);
      await loadRecords();
    } catch (err) {
      console.error(err);
      alert("Failed to save the record. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };`;
code = code.replace(oldSaveEnd, newSaveEnd);

// 4. Update the save button UI to show "Saving..."
const oldSaveBtn = `              <button 
                onClick={saveRecord}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
              >
                Save Assignment
              </button>`;
const newSaveBtn = `              <button 
                onClick={saveRecord}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Assignment'}
              </button>`;
code = code.replace(oldSaveBtn, newSaveBtn);

// 5. Fix calendar grid layout height
const oldEmptyDay = `<div key={\`empty-\${i}\`} className="bg-slate-50 border border-slate-100 min-h-[120px]"></div>`;
const newEmptyDay = `<div key={\`empty-\${i}\`} className="bg-slate-50 border border-slate-100 min-h-[80px]"></div>`;
code = code.replace(oldEmptyDay, newEmptyDay);

const oldDay = `<div 
          key={d} 
          className="bg-white border border-slate-100 min-h-[120px] p-1 flex flex-col group hover:bg-indigo-50/30 transition-colors cursor-pointer"`;
const newDay = `<div 
          key={d} 
          className="bg-white border border-slate-100 min-h-[80px] p-1 flex flex-col group hover:bg-indigo-50/30 transition-colors cursor-pointer"`;
code = code.replace(oldDay, newDay);

const oldMonthViewReturn = `    return (
      <div className="grid grid-cols-7 gap-px bg-slate-200 border-t border-slate-200 flex-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center py-2">
            {day}
          </div>
        ))}
        {days}
      </div>
    );`;

const newMonthViewReturn = `    return (
      <div className="flex flex-col h-full flex-1">
        <div className="grid grid-cols-7 bg-slate-100 border-y border-slate-200 shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[minmax(80px,1fr)] gap-px bg-slate-200 flex-1 overflow-y-auto">
          {days}
        </div>
      </div>
    );`;
code = code.replace(oldMonthViewReturn, newMonthViewReturn);

fs.writeFileSync('src/components/DispatchCalendarView.tsx', code);
console.log('Patched DispatchCalendarView');
