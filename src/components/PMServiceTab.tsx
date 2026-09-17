import React, { useState, useEffect, useMemo } from 'react';
import { SystemSettings, PMScheduleItem } from '../types';
import { fetchPMScheduleRecords, fetchPMAssignmentsFromSheet, updatePMAssignmentsInSheet } from '../sheetsService';
import { Search, Loader2, User, MapPin, Building2, Calendar, ClipboardCheck, ArrowRight, UserPlus, FileSpreadsheet } from 'lucide-react';

interface PMServiceTabProps {
  settings: SystemSettings;
  accessToken: string | null;
  onUpdateSettings: (settings: SystemSettings) => void;
  onOpenPMJob: (hospitalName: string, model: string, sn: string, pmCycle: string, iteration: string, totalPMs?: string, product?: string) => void;
}

export default function PMServiceTab({ settings, accessToken, onUpdateSettings, onOpenPMJob }: PMServiceTabProps) {
  const [activeView, setActiveView] = useState<'admin' | 'my-jobs'>('my-jobs');
  const [myEngineerName, setMyEngineerName] = useState<string>('');
  
  const [records, setRecords] = useState<PMScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remoteAssignments, setRemoteAssignments] = useState<Record<string, string>>({});
  const [isSyncing, setIsSyncing] = useState(false);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'short' });
  
  const [filterYear, setFilterYear] = useState<string>(currentYear);
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [filterEngineer, setFilterEngineer] = useState<string>('All'); // For admin view
  const [searchHospital, setSearchHospital] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('pm_service_my_name');
    if (savedName) setMyEngineerName(savedName);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [settings.pmSpreadsheetId, settings.spreadsheetId, accessToken]);

  const loadRecords = async () => {
    const targetSpreadsheetId = settings.pmSpreadsheetId || settings.spreadsheetId;
    if (!targetSpreadsheetId || !accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPMScheduleRecords(targetSpreadsheetId, accessToken);
      setRecords(data);
      
      try {
        const assignments = await fetchPMAssignmentsFromSheet(targetSpreadsheetId, accessToken);
        setRemoteAssignments(assignments);
      } catch (err) {
        console.warn("Could not fetch PM assignments:", err);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load PM Schedule data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate unique key for a PM record
  const getRecordKey = (r: PMScheduleItem) => `${r.sn}-${r.month}-${r.year}`;

    const handleAssignEngineer = async (recordKey: string, engineerName: string) => {
    // Optimistic UI update
    setRemoteAssignments(prev => {
      const next = { ...prev };
      if (engineerName === '') delete next[recordKey];
      else next[recordKey] = engineerName;
      return next;
    });
    
    // Also update local settings just for fallback/cache
    const currentAssignments = settings.pmAssignments || {};
    const updatedAssignments = { ...currentAssignments };
    if (engineerName === '') delete updatedAssignments[recordKey];
    else updatedAssignments[recordKey] = engineerName;
    onUpdateSettings({ ...settings, pmAssignments: updatedAssignments });

    const targetSpreadsheetId = settings.pmSpreadsheetId || settings.spreadsheetId;
    if (!targetSpreadsheetId || !accessToken) return;
    
    setIsSyncing(true);
    try {
      await updatePMAssignmentsInSheet(targetSpreadsheetId, accessToken, recordKey, engineerName);
    } catch (err) {
      console.error("Failed to sync assignment:", err);
      alert("Failed to sync assignment to database. It may not be visible to others.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectMyName = (name: string) => {
    setMyEngineerName(name);
    localStorage.setItem('pm_service_my_name', name);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const isYearMatch = r.year.includes(filterYear);
      const isMonthMatch = r.month === filterMonth;
      
      const isRegionMatch = filterRegion === 'All' || (r.region && r.region.toLowerCase() === filterRegion.toLowerCase());
      const isHospitalMatch = r.hospitalName.toLowerCase().includes(searchHospital.toLowerCase());
      
      const recordKey = getRecordKey(r);
      const assignedTo = remoteAssignments[recordKey] || (settings.pmAssignments || {})[recordKey];

      let isEngineerMatch = true;
      if (activeView === 'admin') {
        if (filterEngineer === 'Unassigned') {
          isEngineerMatch = !assignedTo;
        } else if (filterEngineer !== 'All') {
          isEngineerMatch = assignedTo === filterEngineer;
        }
      } else {
        // My Jobs view
        isEngineerMatch = assignedTo === myEngineerName;
      }

      return isYearMatch && isMonthMatch && isRegionMatch && isHospitalMatch && isEngineerMatch;
    });
  }, [records, filterYear, filterMonth, filterRegion, filterEngineer, searchHospital, activeView, myEngineerName, settings.pmAssignments, remoteAssignments]);

  const uniqueRegions = useMemo(() => {
    const regions = new Set<string>();
    records.forEach(r => {
      if (r.region) regions.add(r.region);
    });
    return Array.from(regions).sort();
  }, [records]);

  const years = ['2023', '2024', '2025', '2026', '2027'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="h-full flex flex-col font-sans bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-none z-10 shadow-sm relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
              PM Service & Dispatch
            </h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              Distribute PM jobs to engineers and view assigned tasks.
              {isSyncing && <span className="text-indigo-500 text-xs flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Syncing...</span>}
            </p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveView('my-jobs')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-2 ${activeView === 'my-jobs' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <User className="w-4 h-4" /> My PM Jobs
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-2 ${activeView === 'admin' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <UserPlus className="w-4 h-4" /> Admin Assign
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        {/* Identity selection for My Jobs mode */}
        {activeView === 'my-jobs' && (
          <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-indigo-100 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase">Select Your Profile</div>
                <select
                  value={myEngineerName}
                  onChange={(e) => handleSelectMyName(e.target.value)}
                  className="mt-1 text-sm font-bold text-slate-800 bg-transparent border-b-2 border-indigo-500 focus:outline-none pb-1"
                >
                  <option value="">-- Select Your Name --</option>
                  {settings.engineers.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Year
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Month</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Region
              </label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Regions</option>
                {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {activeView === 'admin' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <UserPlus className="w-3 h-3" /> Assigned To
                </label>
                <select
                  value={filterEngineer}
                  onChange={(e) => setFilterEngineer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Unassigned">-- Unassigned --</option>
                  {settings.engineers.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Hospital Name..."
              value={searchHospital}
              onChange={(e) => setSearchHospital(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Loading & Error States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-indigo-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium animate-pulse">Loading PM Schedule...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center">
            <p className="font-bold mb-2">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border border-slate-200 text-center shadow-sm">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 text-lg">No PM Jobs Found</p>
            <p className="text-slate-500 mt-1">
              {activeView === 'my-jobs' && !myEngineerName 
                ? "Please select your profile to see assigned jobs." 
                : "No jobs match your current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="font-bold text-slate-700">
                {activeView === 'admin' ? 'Distribution List' : 'My Assigned Jobs'}
                <span className="ml-2 bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full text-xs">{filteredRecords.length} found</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRecords.map((record, idx) => {
                const recordKey = getRecordKey(record);
                const assignedTo = remoteAssignments[recordKey] || (settings.pmAssignments || {})[recordKey];
                
                return (
                  <div key={`${recordKey}-${idx}`} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {record.month} {filterYear}
                            </span>
                            {record.region && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {record.region}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-800 text-lg line-clamp-1" title={record.hospitalName}>
                            {record.hospitalName}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-3">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Model</p>
                          <p className="font-bold text-slate-700 truncate" title={record.model}>{record.model || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">S/N</p>
                          <p className="font-bold text-slate-700 font-mono text-xs mt-0.5">{record.sn || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Iteration</p>
                          <p className="font-bold text-slate-700">{record.iteration || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Times/Total</p>
                          <p className="font-bold text-slate-700">{record.pmTimesTotal || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Area */}
                    <div className="bg-slate-50 border-t border-slate-100 p-3">
                      {activeView === 'admin' ? (
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-500 uppercase">Assign To:</label>
                          <select
                            value={assignedTo || ''}
                            onChange={(e) => handleAssignEngineer(recordKey, e.target.value)}
                            className={`text-sm font-bold border rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${assignedTo ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-300 text-slate-600'}`}
                          >
                            <option value="">-- Unassigned --</option>
                            {settings.engineers.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              onOpenPMJob(
                                record.hospitalName,
                                record.model,
                                record.sn,
                                `${record.month}/${filterYear}`,
                                record.iteration,
                                record.pmTimesTotal,
                                record.equipmentCategory
                              );
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md text-sm flex items-center gap-2 transition-colors shadow-sm"
                          >
                            Start PM Job <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
