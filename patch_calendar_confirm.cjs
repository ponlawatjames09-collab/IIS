const fs = require('fs');

let code = fs.readFileSync('src/components/DispatchCalendarView.tsx', 'utf8');

// 1. Add confirm state
if (!code.includes('const [showConfirmDelete, setShowConfirmDelete]')) {
  code = code.replace(
    'const [isSaving, setIsSaving] = useState(false);',
    'const [isSaving, setIsSaving] = useState(false);\n  const [showConfirmDelete, setShowConfirmDelete] = useState(false);'
  );
}

// 2. Reset confirm state when modal opens/closes
const oldHandleDayClick = `  const handleDayClick = (year: number, month: number, day: number) => {`;
const newHandleDayClick = `  const handleDayClick = (year: number, month: number, day: number) => {
    setShowConfirmDelete(false);`;
code = code.replace(oldHandleDayClick, newHandleDayClick);

const oldHandleEventClick = `  const handleEventClick = (e: React.MouseEvent, record: DispatchRecord) => {
    e.stopPropagation();
    setEditingRecord(record);
    setIsModalOpen(true);
  };`;
const newHandleEventClick = `  const handleEventClick = (e: React.MouseEvent, record: DispatchRecord) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
    setEditingRecord(record);
    setIsModalOpen(true);
  };`;
code = code.replace(oldHandleEventClick, newHandleEventClick);

const oldCloseModal = `<button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">`;
const newCloseModal = `<button onClick={() => { setIsModalOpen(false); setShowConfirmDelete(false); }} className="text-slate-400 hover:text-slate-600 p-1">`;
code = code.replace(oldCloseModal, newCloseModal);

// 3. Update delete function (remove window.confirm)
const oldDeleteFunc = `  const deleteRecord = async () => {
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
  };`;

const newDeleteFunc = `  const deleteRecord = async () => {
    if (!settings.spreadsheetId || !accessToken || !editingRecord || !editingRecord.rowIndex || isSaving) return;
    setIsSaving(true);
    try {
      await deleteDispatchRecord(settings.spreadsheetId, accessToken, editingRecord.rowIndex);
      setIsModalOpen(false);
      setShowConfirmDelete(false);
      setEditingRecord(null);
      await loadRecords();
    } catch (err) {
      console.error(err);
      alert("Failed to delete the record.");
    } finally {
      setIsSaving(false);
    }
  };`;
code = code.replace(oldDeleteFunc, newDeleteFunc);


// 4. Update the buttons UI
const oldButtonsUI = `            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
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

const newButtonsUI = `            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
              {showConfirmDelete ? (
                <div className="flex items-center justify-between bg-rose-50 p-2 rounded border border-rose-200">
                  <span className="text-sm font-bold text-rose-700">Are you sure you want to delete this?</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowConfirmDelete(false)}
                      disabled={isSaving}
                      className="px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={deleteRecord}
                      disabled={isSaving}
                      className="px-3 py-1.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded transition-colors"
                    >
                      {isSaving ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    {editingRecord.id && (
                      <button 
                        onClick={() => setShowConfirmDelete(true)}
                        disabled={isSaving}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setIsModalOpen(false); setShowConfirmDelete(false); }}
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
                </div>
              )}
            </div>`;

code = code.replace(oldButtonsUI, newButtonsUI);

fs.writeFileSync('src/components/DispatchCalendarView.tsx', code);
console.log('Patched DispatchCalendarView with custom confirm flow');
