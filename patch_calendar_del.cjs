const fs = require('fs');

let code = fs.readFileSync('src/components/DispatchCalendarView.tsx', 'utf8');

// 1. Add Trash2 to imports
if (!code.includes('Trash2')) {
  code = code.replace(
    "CheckCircle2, FileText, Plus, X } from 'lucide-react';",
    "CheckCircle2, FileText, Plus, X, Trash2 } from 'lucide-react';"
  );
}

// 2. Add deleteDispatchRecord to imports
if (!code.includes('deleteDispatchRecord')) {
  code = code.replace(
    "appendDispatchRecord, updateDispatchRecord } from '../sheetsService';",
    "appendDispatchRecord, updateDispatchRecord, deleteDispatchRecord } from '../sheetsService';"
  );
}

// 3. Add deleteRecord method
const deleteMethod = `
  const deleteRecord = async () => {
    if (!settings.spreadsheetId || !accessToken || !editingRecord || !editingRecord.rowIndex || isSaving) return;
    if (confirm("Are you sure you want to delete this assignment?")) {
      setIsSaving(true);
      try {
        await deleteDispatchRecord(settings.spreadsheetId, accessToken, editingRecord.rowIndex);
        setIsModalOpen(false);
        setEditingRecord(null);
        await loadRecords();
      } catch (err) {
        console.error(err);
        alert("Failed to delete the record.");
      } finally {
        setIsSaving(false);
      }
    }
  };
`;
if (!code.includes('const deleteRecord = async ()')) {
  code = code.replace(
    "const saveRecord = async () => {",
    deleteMethod + "\n  const saveRecord = async () => {"
  );
}

// 4. Add Delete button to UI
const oldButtons = `            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveRecord}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Assignment'}
              </button>
            </div>`;

const newButtons = `            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div>
                {editingRecord.id && (
                  <button 
                    onClick={deleteRecord}
                    disabled={isSaving}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveRecord}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </div>`;

if (code.includes(oldButtons)) {
  code = code.replace(oldButtons, newButtons);
}

fs.writeFileSync('src/components/DispatchCalendarView.tsx', code);
console.log('Patched DispatchCalendarView for deletion');
