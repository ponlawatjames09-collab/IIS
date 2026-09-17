import React, { useState, useEffect, useMemo } from 'react';
import { DispatchRecord, SystemSettings } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, MapPin, CheckCircle2, FileText, Plus, X, Trash2 } from 'lucide-react';
import { fetchDispatchRecords, appendDispatchRecord, updateDispatchRecord, deleteDispatchRecord } from '../sheetsService';
import { sendChatMessage } from '../chatService';

interface DispatchCalendarViewProps {
  settings: SystemSettings;
  accessToken: string | null;
}

export default function DispatchCalendarView({ settings, accessToken }: DispatchCalendarViewProps) {
  const [records, setRecords] = useState<DispatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filterEngineer, setFilterEngineer] = useState<string>('All');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<DispatchRecord> | null>(null);

  useEffect(() => {
    loadRecords();
  }, [settings.spreadsheetId, accessToken]);

  const loadRecords = async () => {
    if (!settings.spreadsheetId || !accessToken) return;
    setIsLoading(true);
    try {
      const data = await fetchDispatchRecords(settings.spreadsheetId, accessToken);
      // Deduplicate records to prevent duplicate rendering
      const uniqueMap = new Map();
      data.forEach(r => {
        const key = r.id || `${r.date}-${r.engineer}-${r.taskTitle}`;
        if (!uniqueMap.has(key) || r.rowIndex > (uniqueMap.get(key).rowIndex || 0)) {
          uniqueMap.set(key, r);
        }
      });
      setRecords(Array.from(uniqueMap.values()));
    } catch (err) {
      console.error(err);
      setError('Could not load dispatch records.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (year: number, month: number, day: number) => {
    setShowConfirmDelete(false);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setEditingRecord({
      date: dateStr,
      engineer: '',
      taskTitle: '',
      location: '',
      remark: '',
      status: 'Pending'
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, record: DispatchRecord) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  
  const deleteRecord = async () => {
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
  };

  const saveRecord = async () => {
    if (!settings.spreadsheetId || !accessToken || !editingRecord || isSaving) return;
    if (!editingRecord.date || !editingRecord.engineer || !editingRecord.taskTitle) {
      alert("Please fill in Date, Engineer, and Task Title.");
      return;
    }

    setIsSaving(true);
    try {
      const isUpdate = !!editingRecord.id;
      if (isUpdate) {
        // Update
        await updateDispatchRecord(settings.spreadsheetId, accessToken, editingRecord as DispatchRecord);
      } else {
        // Create
        const newRecord: DispatchRecord = {
          ...editingRecord,
          id: `dsp-${Date.now()}`
        } as DispatchRecord;
        await appendDispatchRecord(settings.spreadsheetId, accessToken, newRecord);
      }
      
      setIsModalOpen(false);
      
      // Try to send Google Chat message
      const engineerEmail = settings.engineerEmails?.[editingRecord.engineer];
      if (engineerEmail) {
        try {
          const actionText = isUpdate ? 'updated an assignment' : 'assigned a new task';
          const msg = `Hello ${editingRecord.engineer}, you have been ${actionText} on ${editingRecord.date}.\nTask: ${editingRecord.taskTitle}\nLocation: ${editingRecord.location || 'N/A'}\nRemark: ${editingRecord.remark || '-'}`;
          await sendChatMessage(accessToken, engineerEmail, msg);
        } catch (chatErr) {
          console.error('Failed to send chat alert:', chatErr);
          // Don't alert the user directly, just log, since the save was successful.
        }
      }

      setEditingRecord(null);
      await loadRecords();
    } catch (err) {
      console.error(err);
      alert("Failed to save the record. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-slate-50 border border-slate-100 min-h-[80px]"></div>);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = records.filter(r => r.date === dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
      
      const engineerJobCounts = dayEvents.reduce((acc, curr) => {
        if (curr.engineer) {
          acc[curr.engineer] = (acc[curr.engineer] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const filteredDayEvents = filterEngineer === 'All' ? dayEvents : dayEvents.filter(r => r.engineer === filterEngineer);
      
      days.push(
        <div 
          key={d} 
          className="bg-white border border-slate-100 min-h-[80px] p-1 flex flex-col group hover:bg-indigo-50/30 transition-colors cursor-pointer"
          onClick={() => handleDayClick(year, month, d)}
        >
          <div className="flex justify-between items-start mb-1 px-1">
            <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-500 group-hover:text-slate-800'}`}>
              {d}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredDayEvents.map(e => (
              <div 
                key={e.id} 
                onClick={(ev) => handleEventClick(ev, e)}
                className={`text-[10px] font-medium p-1.5 rounded border cursor-pointer hover:brightness-95 transition-all ${e.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`} 
                title={`${e.taskTitle} - ${e.engineer}`}
              >
                <div className="flex items-center gap-1 font-bold mb-0.5 truncate">
                  {e.status === 'Completed' ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <User className="w-3 h-3 shrink-0" />}
                  <span className="truncate">{e.engineer}</span>
                  <span 
                    className={`ml-auto shrink-0 text-[8px] font-bold px-1 py-0.5 rounded-sm leading-none ${e.status === 'Completed' ? 'bg-emerald-600/20 text-emerald-800' : 'bg-indigo-600/20 text-indigo-800'}`}
                    title={`${engineerJobCounts[e.engineer]} jobs assigned today`}
                  >
                    {engineerJobCounts[e.engineer]}
                  </span>
                </div>
                <div className="truncate opacity-90">{e.taskTitle}</div>
                {e.location && <div className="truncate text-[9px] opacity-75 mt-0.5 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{e.location}</div>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
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
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Engineer Dispatch
          </h2>
          <p className="text-sm text-slate-500 mt-1">Assign advance jobs and schedule tasks for engineers.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {isLoading && <span className="text-xs font-semibold text-slate-500 animate-pulse hidden sm:inline-block">Syncing...</span>}
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Filter:</span>
            <select
              value={filterEngineer}
              onChange={(e) => setFilterEngineer(e.target.value)}
              className="px-2 py-1.5 bg-white border border-slate-300 rounded text-sm font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Engineers</option>
              {settings.engineers.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={loadRecords}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
          <button 
            onClick={() => handleDayClick(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())}
            className="px-3 py-1.5 bg-indigo-600 text-white border border-transparent rounded text-sm font-bold hover:bg-indigo-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> New Assignment
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-md text-sm font-medium border border-rose-100">
          {error}
        </div>
      )}

      <div className="flex flex-col bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex-1 min-h-[500px]">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <h3 className="font-bold text-sm text-slate-700">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          
          <div className="flex items-center gap-1">
            <button onClick={handlePrev} className="p-1.5 rounded hover:bg-slate-200 text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded">
              Today
            </button>
            <button onClick={handleNext} className="p-1.5 rounded hover:bg-slate-200 text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {renderMonthView()}
        </div>
      </div>

      {/* Dispatch Modal */}
      {isModalOpen && editingRecord && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingRecord.id ? 'Edit Assignment' : 'New Assignment'}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setShowConfirmDelete(false); }} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-4 text-sm flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={editingRecord.date || ''}
                    onChange={e => setEditingRecord({...editingRecord, date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
                  <select 
                    value={editingRecord.status || 'Pending'}
                    onChange={e => setEditingRecord({...editingRecord, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Assigned Engineer</label>
                <select
                  value={editingRecord.engineer || ''}
                  onChange={e => setEditingRecord({...editingRecord, engineer: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="" disabled>Select Engineer</option>
                  {settings.engineers.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Task / Job Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Install new X-Ray tube"
                  value={editingRecord.taskTitle || ''}
                  onChange={e => setEditingRecord({...editingRecord, taskTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Location / Hospital</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bangkok Hospital (Building A)"
                  value={editingRecord.location || ''}
                  onChange={e => setEditingRecord({...editingRecord, location: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Remarks & Things to Prepare</label>
                <textarea 
                  rows={3}
                  placeholder="Parts needed, contact person, specific tools..."
                  value={editingRecord.remark || ''}
                  onChange={e => setEditingRecord({...editingRecord, remark: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
