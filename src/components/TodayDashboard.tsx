import React, { useState, useEffect, useMemo } from 'react';
import { DispatchRecord, ServiceJob, SystemSettings } from '../types';
import { fetchDispatchRecords, fetchMonthlyJobs, getMonthYearFromDate } from '../sheetsService';
import { Users, MapPin, Briefcase, Clock, Calendar as CalendarIcon, ShieldAlert } from 'lucide-react';

interface TodayDashboardProps {
  settings: SystemSettings;
  accessToken: string | null;
}

export default function TodayDashboard({ settings, accessToken }: TodayDashboardProps) {
  const [dispatchRecords, setDispatchRecords] = useState<DispatchRecord[]>([]);
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  
  // Get date in YYYY-MM-DD in local Thailand time (or standard local time)
  // toISOString uses UTC which might be wrong at certain hours
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const displayDate = new Date().toLocaleDateString('th-TH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    async function loadTodayData() {
      if (!settings.spreadsheetId || !accessToken) return;
      setIsLoading(true);
      try {
        // Fetch Dispatch Records
        const dRecords = await fetchDispatchRecords(settings.spreadsheetId, accessToken).catch(() => []);
        setDispatchRecords(dRecords);

        // Fetch Current Month Jobs
        const monthYear = getMonthYearFromDate(todayStr);
        const mJobs = await fetchMonthlyJobs(settings.spreadsheetId, monthYear, accessToken).catch(() => []);
        setJobs(mJobs);

      } catch (error) {
        console.error("Error loading today data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTodayData();
  }, [settings.spreadsheetId, accessToken]);

  
  const normalizeDate = (dStr: string) => {
    if (!dStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return dStr;
    
    // Try DD/MM/YYYY or MM/DD/YYYY
    const parts = dStr.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) { // ends with year
        const year = parts[2];
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        
        let month, day;
        if (p1 > 12) { 
           // definitely MM/DD/YYYY
           month = p0; day = p1;
        } else if (p0 > 12) {
           // definitely DD/MM/YYYY
           day = p0; month = p1;
        } else {
           // Ambiguous, assume DD/MM/YYYY
           day = p0; month = p1;
        }
        
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else if (parts[0].length === 4) { // starts with year
        const year = parts[0];
        const month = String(parts[1]).padStart(2, '0');
        const day = String(parts[2]).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    return dStr;
  };

  const engineerSchedules = useMemo(() => {
    const schedules: Record<string, { dispatch: DispatchRecord[], jobs: ServiceJob[] }> = {};
    
    // Initialize all engineers from settings
    settings.engineers.forEach(eng => {
      schedules[eng] = { dispatch: [], jobs: [] };
    });

    // Filter today's dispatch records
    dispatchRecords.forEach(r => {
      if (normalizeDate(r.date) === todayStr) {
        const engs = r.engineer.split(',').map(e => e.trim());
        engs.forEach(eng => {
          if (!schedules[eng]) schedules[eng] = { dispatch: [], jobs: [] };
          schedules[eng].dispatch.push(r);
        });
      }
    });

    // Filter today's service jobs
    jobs.forEach(j => {
      if (normalizeDate(j.serviceDate) === todayStr || (normalizeDate(j.callDate) === todayStr && !j.serviceDate)) {
        const engs = [j.engineerName, j.engineer2, j.engineer3, j.engineer4].filter(Boolean) as string[];
        engs.forEach(eng => {
          if (!schedules[eng]) schedules[eng] = { dispatch: [], jobs: [] };
          // Prevent duplicates if multiple engineers map to the same job
          if (!schedules[eng].jobs.find(existing => existing.jobNumber === j.jobNumber)) {
            schedules[eng].jobs.push(j);
          }
        });
      }
    });

    return schedules;
  }, [dispatchRecords, jobs, settings.engineers, todayStr]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-10 text-slate-500">
        <Clock className="w-6 h-6 animate-spin mr-2" />
        <span>Loading Today's Operations...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Today's Operations
          </h2>
          <p className="text-slate-500 flex items-center gap-1.5 mt-1">
            <CalendarIcon className="w-4 h-4" />
            {displayDate}
          </p>
          <div className="text-xs text-slate-400 mt-2">
            Debug: Date={todayStr} | Jobs Fetched: {jobs.length} | Dispatches Fetched: {dispatchRecords.length}
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(Object.entries(engineerSchedules) as [string, { dispatch: DispatchRecord[]; jobs: ServiceJob[] }][]).map(([eng, data]) => {
          const hasWork = data.dispatch.length > 0 || data.jobs.length > 0;
          return (
            <div key={eng} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                    {eng.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{eng}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${hasWork ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {hasWork ? 'On Duty' : 'Available / No Task'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-1 bg-white space-y-4">
                {!hasWork && (
                  <div className="text-center py-6 text-slate-400 flex flex-col items-center">
                    <ShieldAlert className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-sm">No tasks assigned today</span>
                  </div>
                )}

                {/* Dispatch Tasks */}
                {data.dispatch.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Planned Dispatches</h4>
                    {data.dispatch.map(d => (
                      <div key={d.id} className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/50">
                        <div className="font-semibold text-indigo-900 text-sm mb-1">{d.taskTitle}</div>
                        <div className="flex items-start gap-1.5 text-xs text-indigo-700 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-70" />
                          <span className="leading-tight">{d.location}</span>
                        </div>
                        {d.remark && (
                          <div className="mt-2 text-[11px] text-indigo-600/80 italic border-t border-indigo-100 pt-1.5">
                            {d.remark}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Service Jobs */}
                {data.jobs.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Jobs Logged</h4>
                    {data.jobs.map(j => (
                      <div key={j.jobNumber} className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/50">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-semibold text-emerald-900 text-sm">
                            [{j.jobType}] {j.equipmentName}
                          </div>
                          <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-700">
                            {j.jobNumber}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs text-emerald-700 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-70" />
                          <span className="leading-tight">{j.hospitalName}</span>
                        </div>
                        {j.problemDescription && (
                          <div className="mt-2 text-[11px] text-emerald-600/80 italic border-t border-emerald-100 pt-1.5 line-clamp-2">
                            {j.problemDescription}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
