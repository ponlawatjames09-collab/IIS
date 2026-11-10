import React, { useState, useEffect, useMemo } from 'react';
import { SystemSettings, CMStatusRecord, PMScheduleItem, DispatchRecord, ServiceJob } from '../types';
import { 
  fetchCMOnCallRecords, 
  fetchCMStatusRecords, 
  fetchPMScheduleRecords, 
  fetchDispatchRecords,
  fetchMonthlyJobs,
  getMonthYearFromDate
} from '../sheetsService';
import { 
  Users, 
  UserCheck, 
  PhoneCall, 
  Wrench, 
  CalendarDays, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Briefcase, 
  ShieldAlert, 
  Filter, 
  ChevronRight,
  Layers,
  CalendarClock
} from 'lucide-react';

interface EngineerAvailabilityViewProps {
  settings: SystemSettings;
  accessToken: string | null;
  jobs?: ServiceJob[];
  yearlyJobs?: ServiceJob[];
  onNavigateToTab?: (tab: string) => void;
  onOpenFormWithEngineer?: (engineerName: string) => void;
}

export type EngineerStatusType = 'working' | 'on-call' | 'scheduled' | 'available';

interface EngineerDutyProfile {
  name: string;
  status: EngineerStatusType;
  phone?: string;
  email?: string;
  activeCMOnCall: CMStatusRecord[];
  activeCMRepairs: CMStatusRecord[];
  todayDispatches: DispatchRecord[];
  activeJobsToday: ServiceJob[];
  scheduledPMs: PMScheduleItem[];
  locationNote?: string;
}

export default function EngineerAvailabilityView({
  settings,
  accessToken,
  jobs: parentJobs,
  yearlyJobs: parentYearlyJobs,
  onNavigateToTab,
  onOpenFormWithEngineer
}: EngineerAvailabilityViewProps) {
  const [cmOnCallRecords, setCmOnCallRecords] = useState<CMStatusRecord[]>([]);
  const [cmStatusRecords, setCmStatusRecords] = useState<CMStatusRecord[]>([]);
  const [pmScheduleRecords, setPmScheduleRecords] = useState<PMScheduleItem[]>([]);
  const [dispatchRecords, setDispatchRecords] = useState<DispatchRecord[]>([]);
  const [todayJobs, setTodayJobs] = useState<ServiceJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EngineerStatusType>('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  const targetCMOnCall = settings.cmOnCallSpreadsheetId || '19c9vJhO4qMdCP1O7rwWP_aUZyTqQrTwnzWWxtH7zDdE';
  const targetPM = settings.pmSpreadsheetId || settings.spreadsheetId;
  const targetCM = settings.spreadsheetId || settings.pmSpreadsheetId;

  // Format today's date in local YYYY-MM-DD
  const today = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const currentMonthStr = useMemo(() => {
    return new Date().toLocaleString('en-US', { month: 'short' });
  }, []);

  const currentYearStr = useMemo(() => {
    return new Date().getFullYear().toString();
  }, []);

  const loadData = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);

    try {
      const promises: Promise<any>[] = [];

      // 1. CM On-Call
      if (targetCMOnCall) {
        promises.push(
          fetchCMOnCallRecords(targetCMOnCall, accessToken)
            .then(data => setCmOnCallRecords(data))
            .catch(err => {
              console.warn("Could not fetch CM on-call records", err);
              return [];
            })
        );
      }

      // 2. CM Status Board
      if (targetCM) {
        promises.push(
          fetchCMStatusRecords(targetCM, accessToken)
            .then(data => setCmStatusRecords(data))
            .catch(err => {
              console.warn("Could not fetch CM status records", err);
              return [];
            })
        );
      }

      // 3. PM Schedules
      if (targetPM) {
        promises.push(
          fetchPMScheduleRecords(targetPM, accessToken)
            .then(data => setPmScheduleRecords(data))
            .catch(err => {
              console.warn("Could not fetch PM schedules", err);
              return [];
            })
        );
      }

      // 4. Dispatches
      if (settings.spreadsheetId) {
        promises.push(
          fetchDispatchRecords(settings.spreadsheetId, accessToken)
            .then(data => setDispatchRecords(data))
            .catch(err => {
              console.warn("Could not fetch dispatch records", err);
              return [];
            })
        );
      }

      // 5. Jobs for today
      if (settings.spreadsheetId) {
        const monthYear = getMonthYearFromDate(today);
        promises.push(
          fetchMonthlyJobs(settings.spreadsheetId, monthYear, accessToken)
            .then(data => setTodayJobs(data))
            .catch(err => {
              console.warn("Could not fetch monthly jobs", err);
              return [];
            })
        );
      }

      await Promise.all(promises);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to load availability data:", err);
      setError(err.message || 'Failed to refresh schedule data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [accessToken, settings.spreadsheetId, targetCMOnCall, targetPM]);

  // Engineer nickname and alias normalization: 'เจมส์' is 'พลวัฒน์ โพธิ์ผลัด'
  const normalizeEngineerName = (name?: string): string => {
    if (!name) return '';
    const trimmed = name.trim();
    if (trimmed === 'เจมส์' || trimmed.toLowerCase() === 'james') {
      return 'พลวัฒน์ โพธิ์ผลัด';
    }
    return trimmed;
  };

  // Name matching helper with alias resolution (e.g. 'เจมส์' -> 'พลวัฒน์ โพธิ์ผลัด')
  const isMatch = (targetName: string, candidate?: string): boolean => {
    if (!candidate || !targetName) return false;
    const t = targetName.trim().toLowerCase();
    const c = candidate.trim().toLowerCase();
    if (t === c) return true;

    // Resolve 'เจมส์' alias to 'พลวัฒน์ โพธิ์ผลัด'
    const isJamesCandidate = c === 'เจมส์' || c === 'james';
    const isPonlawatTarget = t.includes('พลวัฒน์') || t.includes('ponlawat');
    if (isPonlawatTarget && isJamesCandidate) return true;

    const isJamesTarget = t === 'เจมส์' || t === 'james';
    const isPonlawatCandidate = c.includes('พลวัฒน์') || c.includes('ponlawat');
    if (isJamesTarget && isPonlawatCandidate) return true;

    if (t.includes(c) || c.includes(t)) return true;
    const tFirst = t.split(' ')[0];
    const cFirst = c.split(' ')[0];
    if (tFirst.length >= 3 && tFirst === cFirst) return true;
    return false;
  };

  // Compile list of unique engineers (excluding nickname 'เจมส์' which is mapped to 'พลวัฒน์ โพธิ์ผลัด')
  const allEngineers = useMemo(() => {
    const list = new Set<string>();

    (settings.engineers || []).forEach(name => {
      const normalized = normalizeEngineerName(name);
      if (normalized && normalized !== 'เจมส์' && normalized.toLowerCase() !== 'james') {
        list.add(normalized);
      }
    });
    
    // Also include any engineer found in CM On-call, CM status, or dispatches
    cmOnCallRecords.forEach(r => {
      if (r.engineer && r.engineer.trim() && r.engineer !== 'Unassigned') {
        const normalized = normalizeEngineerName(r.engineer);
        if (normalized && normalized !== 'เจมส์' && normalized.toLowerCase() !== 'james') {
          list.add(normalized);
        }
      }
    });

    cmStatusRecords.forEach(r => {
      if (r.engineer && r.engineer.trim() && r.engineer !== 'Unassigned') {
        const normalized = normalizeEngineerName(r.engineer);
        if (normalized && normalized !== 'เจมส์' && normalized.toLowerCase() !== 'james') {
          list.add(normalized);
        }
      }
    });

    dispatchRecords.forEach(d => {
      if (d.engineer && d.engineer.trim() && d.engineer !== 'Unassigned') {
        const normalized = normalizeEngineerName(d.engineer);
        if (normalized && normalized !== 'เจมส์' && normalized.toLowerCase() !== 'james') {
          list.add(normalized);
        }
      }
    });

    // Explicitly guarantee 'เจมส์' is removed and 'พลวัฒน์ โพธิ์ผลัด' is kept
    list.delete('เจมส์');
    list.delete('James');
    list.delete('james');

    return Array.from(list).sort((a, b) => a.localeCompare(b, 'th'));
  }, [settings.engineers, cmOnCallRecords, cmStatusRecords, dispatchRecords]);

  // Build Duty Profiles
  const dutyProfiles: EngineerDutyProfile[] = useMemo(() => {
    return allEngineers.map(engName => {
      // 1. CM On-Call items
      // Open / Active statuses in CM On Call
      const activeCMOnCall = cmOnCallRecords.filter(r => {
        if (!isMatch(engName, r.engineer)) return false;
        const st = (r.status || 'Repair request').toLowerCase();
        return st !== 'closed' && st !== 'done' && st !== 'completed';
      });

      // 2. CM Status items (Repairs)
      const activeCMRepairs = cmStatusRecords.filter(r => {
        if (!isMatch(engName, r.engineer)) return false;
        const st = (r.status || 'Repair request').toLowerCase();
        return st !== 'closed' && st !== 'done' && st !== 'completed';
      });

      // 3. Today's Dispatches
      const todayDispatches = dispatchRecords.filter(d => {
        if (!isMatch(engName, d.engineer)) return false;
        // Check date
        const dDate = d.date ? d.date.trim() : '';
        const isToday = dDate === today || dDate.includes(today);
        return isToday && d.status !== 'Cancelled';
      });

      // 4. Jobs active today
      const jobsPool = todayJobs.length > 0 ? todayJobs : (parentJobs || []);
      const activeJobsToday = jobsPool.filter(j => {
        const engs = [j.engineerName, j.engineer2, j.engineer3, j.engineer4].filter(Boolean);
        const matchesEng = engs.some(e => isMatch(engName, e));
        if (!matchesEng) return false;

        const sDate = j.serviceDate || j.callDate || '';
        const isToday = sDate === today || sDate.startsWith(today);
        const isNotDone = (j.jobStatus || '').toLowerCase() !== 'done' && (j.jobStatus || '').toLowerCase() !== 'cancelled';
        return isToday || isNotDone;
      });

      // 5. Scheduled PMs for current month / cycle
      const scheduledPMs = pmScheduleRecords.filter(item => {
        // Check month/year
        if (item.year && !item.year.includes(currentYearStr)) return false;
        if (item.month && item.month.toLowerCase() !== currentMonthStr.toLowerCase()) return false;

        // Check if assigned to this engineer via settings.pmAssignments
        if (settings.pmAssignments) {
          const assignedEng = settings.pmAssignments[item.hospitalName] || 
                              settings.pmAssignments[item.sn] || 
                              settings.pmAssignments[item.region || ''];
          if (assignedEng && isMatch(engName, assignedEng)) return true;
        }

        // Check if any job matches
        return false;
      });

      // Determine Status Priority:
      // 1. Working: If has dispatch today, or active in-progress job today
      // 2. On-Call: If assigned active CM on-call request
      // 3. Scheduled: If has PMs scheduled this month or pending CM repair
      // 4. Available: Otherwise
      let status: EngineerStatusType = 'available';

      const isWorkingNow = todayDispatches.some(d => d.status === 'Pending') || 
                           activeJobsToday.some(j => (j.jobStatus || '').toLowerCase() === 'inprogress') ||
                           activeCMOnCall.some(r => (r.status || '').toLowerCase().includes('in progress'));

      const hasOnCallDuty = activeCMOnCall.length > 0;
      const hasScheduledPM = scheduledPMs.length > 0;
      const hasCMRepair = activeCMRepairs.length > 0;

      if (isWorkingNow) {
        status = 'working';
      } else if (hasOnCallDuty) {
        status = 'on-call';
      } else if (hasScheduledPM || hasCMRepair || todayDispatches.length > 0) {
        status = 'scheduled';
      } else {
        status = 'available';
      }

      // Location Note
      let locationNote: string | undefined;
      if (todayDispatches.length > 0) {
        locationNote = todayDispatches[0].location || todayDispatches[0].taskTitle;
      } else if (activeJobsToday.length > 0) {
        locationNote = activeJobsToday[0].hospitalName;
      } else if (activeCMOnCall.length > 0) {
        locationNote = activeCMOnCall[0].hospital;
      }

      return {
        name: engName,
        status,
        phone: settings.engineerEmails?.[engName] || undefined,
        activeCMOnCall,
        activeCMRepairs,
        todayDispatches,
        activeJobsToday,
        scheduledPMs,
        locationNote
      };
    });
  }, [
    allEngineers,
    cmOnCallRecords,
    cmStatusRecords,
    dispatchRecords,
    todayJobs,
    parentJobs,
    pmScheduleRecords,
    today,
    currentMonthStr,
    currentYearStr,
    settings.pmAssignments,
    settings.engineerEmails
  ]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = dutyProfiles.length;
    const working = dutyProfiles.filter(e => e.status === 'working').length;
    const onCall = dutyProfiles.filter(e => e.status === 'on-call').length;
    const scheduled = dutyProfiles.filter(e => e.status === 'scheduled').length;
    const available = dutyProfiles.filter(e => e.status === 'available').length;
    const totalCMOnCallTickets = cmOnCallRecords.filter(r => {
      const s = (r.status || '').toLowerCase();
      return s !== 'closed' && s !== 'done';
    }).length;

    return { total, working, onCall, scheduled, available, totalCMOnCallTickets };
  }, [dutyProfiles, cmOnCallRecords]);

  // Filtered List
  const filteredProfiles = useMemo(() => {
    return dutyProfiles.filter(prof => {
      // Status filter
      if (statusFilter !== 'all' && prof.status !== statusFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const isJamesQuery = (query === 'เจมส์' || query === 'james') && prof.name.includes('พลวัฒน์');
        const matchesName = prof.name.toLowerCase().includes(query) || isJamesQuery;
        const matchesLocation = (prof.locationNote || '').toLowerCase().includes(query);
        const matchesCM = prof.activeCMOnCall.some(c => 
          c.hospital.toLowerCase().includes(query) || 
          c.equipment.toLowerCase().includes(query) || 
          c.problem.toLowerCase().includes(query)
        );
        const matchesPM = prof.scheduledPMs.some(p => 
          p.hospitalName.toLowerCase().includes(query) || 
          p.model.toLowerCase().includes(query)
        );
        const matchesDispatch = prof.todayDispatches.some(d => 
          d.taskTitle.toLowerCase().includes(query) || 
          d.location.toLowerCase().includes(query)
        );

        return matchesName || matchesLocation || matchesCM || matchesPM || matchesDispatch;
      }

      return true;
    });
  }, [dutyProfiles, statusFilter, searchTerm]);

  // Status Badge Rendering Helper
  const renderStatusBadge = (status: EngineerStatusType) => {
    switch (status) {
      case 'working':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Working (On-Site)
          </span>
        );
      case 'on-call':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
            On-Call (CM Duty)
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
            Scheduled
          </span>
        );
      case 'available':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            Available / Standby
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12" id="engineer-availability-view">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-lg border border-slate-800 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight">Engineer Availability & Live Duty</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of engineering team status, on-call assignments, and scheduled field work
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
              Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-md border border-slate-700 transition-colors cursor-pointer"
            title="Refresh availability data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Refresh Status'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === 'all' ? 'bg-blue-50/80 border-blue-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Team</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 font-mono">{stats.total}</span>
            <span className="text-xs text-slate-400">Engineers</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('working')}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === 'working' ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Working Now</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">{stats.working}</span>
            <span className="text-xs text-emerald-600 font-medium">On-Site / Active</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('on-call')}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === 'on-call' ? 'bg-amber-50 border-amber-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">On-Call Duty</span>
            <PhoneCall className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">{stats.onCall}</span>
            <span className="text-xs text-amber-600 font-medium">{stats.totalCMOnCallTickets} Active CM</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('scheduled')}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === 'scheduled' ? 'bg-blue-50 border-blue-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Scheduled</span>
            <CalendarClock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">{stats.scheduled}</span>
            <span className="text-xs text-blue-600 font-medium">PM / Repair</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('available')}
          className={`p-4 rounded-lg border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            statusFilter === 'available' ? 'bg-slate-100 border-slate-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Available</span>
            <UserCheck className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-700 font-mono">{stats.available}</span>
            <span className="text-xs text-slate-500 font-medium">Ready</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search engineer, hospital, equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden lg:inline mr-1">Status:</span>
          {(['all', 'working', 'on-call', 'scheduled', 'available'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer capitalize ${
                statusFilter === st
                  ? 'bg-slate-800 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'all' ? 'Show All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Engineers Grid / Cards View */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-sm text-slate-600">No engineers match the selected criteria</p>
          <p className="text-xs mt-1">Try resetting the search filter or status selection</p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProfiles.map((eng) => {
            const hasActivity = eng.activeCMOnCall.length > 0 || eng.todayDispatches.length > 0 || eng.scheduledPMs.length > 0 || eng.activeCMRepairs.length > 0;

            return (
              <div 
                key={eng.name}
                className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow transition-all"
              >
                {/* Card Top Header */}
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                        eng.status === 'working' ? 'bg-emerald-600' :
                        eng.status === 'on-call' ? 'bg-amber-600' :
                        eng.status === 'scheduled' ? 'bg-blue-600' : 'bg-slate-600'
                      }`}>
                        {eng.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="font-bold text-sm text-slate-800">{eng.name}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                          {eng.locationNote ? (
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[170px]">{eng.locationNote}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Headquarters / Base</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {renderStatusBadge(eng.status)}
                    </div>
                  </div>
                </div>

                {/* Card Body: Active Engagements */}
                <div className="p-4 space-y-3.5 flex-1 text-xs">
                  {/* 1. CM On-Call Duties (Highest urgency) */}
                  {eng.activeCMOnCall.length > 0 && (
                    <div className="p-2.5 rounded-md bg-amber-50/80 border border-amber-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-[11px] text-amber-800 flex items-center gap-1.5 uppercase tracking-wide">
                          <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                          Active CM On-Call ({eng.activeCMOnCall.length})
                        </span>
                        {onNavigateToTab && (
                          <button
                            onClick={() => onNavigateToTab('cm-oncall')}
                            className="text-[10px] text-amber-700 font-bold hover:underline"
                          >
                            View Board
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {eng.activeCMOnCall.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="bg-white/90 p-2 rounded border border-amber-200/80 text-[11px]">
                            <div className="font-bold text-slate-800 truncate">{item.hospital}</div>
                            <div className="text-slate-600 text-[10px] mt-0.5">
                              <span className="font-medium text-slate-700">{item.equipment}</span>
                              {item.problem && ` - ${item.problem}`}
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[9px]">
                              <span className="text-amber-700 font-semibold">{item.status || 'Pending'}</span>
                              <span className="text-slate-400">{item.reportDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Today's Dispatches & On-site Tasks */}
                  {eng.todayDispatches.length > 0 && (
                    <div className="p-2.5 rounded-md bg-emerald-50/80 border border-emerald-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-[11px] text-emerald-800 flex items-center gap-1.5 uppercase tracking-wide">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          Today's Field Dispatch ({eng.todayDispatches.length})
                        </span>
                        {onNavigateToTab && (
                          <button
                            onClick={() => onNavigateToTab('today-operations')}
                            className="text-[10px] text-emerald-700 font-bold hover:underline"
                          >
                            Today View
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {eng.todayDispatches.slice(0, 2).map((d, idx) => (
                          <div key={idx} className="bg-white/90 p-2 rounded border border-emerald-200/80 text-[11px]">
                            <div className="font-bold text-slate-800">{d.taskTitle}</div>
                            <div className="text-slate-600 text-[10px] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{d.location}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. PM Scheduled Tasks this Month */}
                  {eng.scheduledPMs.length > 0 && (
                    <div className="p-2.5 rounded-md bg-blue-50/80 border border-blue-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-[11px] text-blue-800 flex items-center gap-1.5 uppercase tracking-wide">
                          <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                          PM Schedule ({eng.scheduledPMs.length} this month)
                        </span>
                        {onNavigateToTab && (
                          <button
                            onClick={() => onNavigateToTab('pm-schedule')}
                            className="text-[10px] text-blue-700 font-bold hover:underline"
                          >
                            PM View
                          </button>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {eng.scheduledPMs.slice(0, 2).map((pm, idx) => (
                          <div key={idx} className="bg-white/90 p-2 rounded border border-blue-200/80 text-[11px]">
                            <div className="font-bold text-slate-800 truncate">{pm.hospitalName}</div>
                            <div className="text-slate-500 text-[10px] flex items-center justify-between mt-0.5">
                              <span>{pm.model} (S/N: {pm.sn})</span>
                              <span className="font-semibold text-blue-600">{pm.month} {pm.year}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standby / No current active tickets */}
                  {!hasActivity && (
                    <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-md border border-slate-100">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-500" />
                      <p className="font-semibold text-xs text-slate-600">Available for Assignment</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">No urgent on-call or field tickets pending</p>
                    </div>
                  )}
                </div>

                {/* Card Footer: Quick Action */}
                <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span>CM: <strong className="text-slate-700">{eng.activeCMOnCall.length}</strong></span>
                    <span>PM: <strong className="text-slate-700">{eng.scheduledPMs.length}</strong></span>
                    <span>Dispatch: <strong className="text-slate-700">{eng.todayDispatches.length}</strong></span>
                  </div>

                  {onOpenFormWithEngineer && (
                    <button
                      onClick={() => onOpenFormWithEngineer(eng.name)}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-bold rounded text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Assign Job</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
