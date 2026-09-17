import * as XLSX from "xlsx";
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart } from 'recharts';
import { ServiceJob, SystemSettings, CMStatusRecord, PMScheduleItem } from '../types';
import { fetchCMStatusRecords, fetchPMScheduleRecords, fetchCMOnCallRecords } from '../sheetsService';
import { TrendingUp, Users, DollarSign, CheckCircle2, ShieldCheck, AlertTriangle, Briefcase, Clock, Activity, AlertCircle, Wrench, Package, Building2, CalendarDays, Download } from 'lucide-react';

interface DashboardProps {
  jobs: ServiceJob[];
  yearlyJobs?: ServiceJob[];
  settings: SystemSettings;
  activeMonthYear: string;
  accessToken?: string | null;
  onMonthChange?: (month: string) => void;
  onNavigateToTab?: (tab: 'pm-schedule' | 'pm-service' | string) => void;
}

export default function Dashboard({ jobs: rawJobs, yearlyJobs: rawYearlyJobs, settings, activeMonthYear, accessToken, onMonthChange, onNavigateToTab }: DashboardProps) {
  const [cmRecords, setCmRecords] = useState<CMStatusRecord[]>([]);
  const [cmOnCallRecords, setCmOnCallRecords] = useState<CMStatusRecord[]>([]);
  const [pmRecords, setPmRecords] = useState<PMScheduleItem[]>([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);

  useEffect(() => {
    async function loadExternal() {
      if (!accessToken) return;
      setIsLoadingExternal(true);
      try {
        if (settings.spreadsheetId || settings.pmSpreadsheetId) {
          const targetCM = settings.pmSpreadsheetId || settings.spreadsheetId;
          if (targetCM) {
            const cm = await fetchCMStatusRecords(targetCM, accessToken).catch(() => []);
            setCmRecords(cm);
          }
          
          const targetCMOnCall = settings.cmOnCallSpreadsheetId || '19c9vJhO4qMdCP1O7rwWP_aUZyTqQrTwnzWWxtH7zDdE';
          if (targetCMOnCall) {
            const cmOnCall = await fetchCMOnCallRecords(targetCMOnCall, accessToken).catch(() => []);
            setCmOnCallRecords(cmOnCall);
          }
          const targetPM = settings.pmSpreadsheetId || settings.spreadsheetId;
          if (targetPM) {
            const pm = await fetchPMScheduleRecords(targetPM, accessToken).catch(() => []);
            setPmRecords(pm);
          }
        }
      } catch (err) {
        // console.error(err);
      } finally {
        setIsLoadingExternal(false);
      }
    }
    loadExternal();
  }, [settings.spreadsheetId, settings.pmSpreadsheetId, accessToken]);

  const jobs = useMemo(() => {
    return rawJobs.map(job => {
      let type = job.jobType || '';
      if (typeof type === 'string' && type.toUpperCase().includes('PM')) type = 'PM' as any;
      return { ...job, jobType: type };
    });
  }, [rawJobs]);

  const displayMonthYear = activeMonthYear === 'YEARLY2026' ? 'Year 2026' : activeMonthYear;

  // 1. FINANCIAL & BUSINESS GROWTH
  const financialMetrics = useMemo(() => {
    const totalRevenue = jobs.reduce((sum, j) => sum + (j.revenue || 0), 0);
    const totalCost = jobs.reduce((sum, j) => sum + (j.cost || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    const revByJobType = jobs.reduce((acc, job) => {
      const type = job.jobType || 'Other';
      acc[type] = (acc[type] || 0) + (job.revenue || 0);
      return acc;
    }, {} as Record<string, number>);

    return { totalRevenue, totalCost, totalProfit, profitMargin, revByJobType };
  }, [jobs]);

  const contractRenewals = useMemo(() => {
    // Attempt to find PM items with near expiry (mocking logic using year/month if expiry not set)
    // We just return a sample list if actual date parsing is too complex without moment.js
    const renewals = pmRecords
      .filter(p => p.warrantyType && p.warrantyType.toLowerCase().includes('contract'))
      .slice(0, 5); // Just top 5 for display
    return renewals;
  }, [pmRecords]);
  // 5. JOB TYPE TREND
  const jobTypeTrend = useMemo(() => {
    // Group jobs by date (day if month view, month if year view)
    const isYearly = activeMonthYear.startsWith('YEARLY');
    
    const dateGroups = jobs.reduce((acc, job) => {
      if (!job.callDate) return acc;
      
      let dateKey = '';
      try {
        const d = new Date(job.callDate);
        if (isNaN(d.getTime())) return acc;
        
        if (isYearly) {
          // Format as "Jan", "Feb" etc.
          dateKey = d.toLocaleString('en-US', { month: 'short' });
        } else {
          // Format as "DD"
          dateKey = d.getDate().toString().padStart(2, '0');
        }
      } catch(e) {
        return acc;
      }

      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, PM: 0, CM: 0, Other: 0 };
      }
      
      const type = (job.jobType === 'PM' || job.jobType === 'CM') ? job.jobType : 'Other';
      acc[dateKey][type] += 1;
      
      return acc;
    }, {} as Record<string, { date: string, PM: number, CM: number, Other: number }>);
    
    // Sort logic
    let result: { date: string, PM: number, CM: number, Other: number }[] = Object.values(dateGroups);
    if (isYearly) {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      result.sort((a, b) => monthOrder.indexOf(a.date) - monthOrder.indexOf(b.date));
    } else {
      result.sort((a, b) => parseInt(a.date) - parseInt(b.date));
    }
    
    return result;
  }, [jobs, activeMonthYear]);


  // 2. OPERATIONS & SLA
  const opMetrics = useMemo(() => {
    const total = jobs.length;
    const done = jobs.filter(j => j.jobStatus === 'Done').length;
    const inProgress = jobs.filter(j => j.jobStatus === 'Inprogress').length;
    const pending = jobs.filter(j => j.jobStatus === 'Pending').length;
    
    const pmCount = jobs.filter(j => j.jobType === 'PM').length;
    const cmCount = jobs.filter(j => j.jobType === 'CM').length;
    
    const engineerWorkload = jobs.reduce((acc, job) => {
      const eng = [job.engineerName, job.engineer2, job.engineer3, job.engineer4].filter(e => e && e !== '-- Select --').join(', ') || 'Unassigned';
      if (!acc[eng]) acc[eng] = { name: eng, total: 0, done: 0, active: 0, totalResolutionDays: 0, resolutionCount: 0 };
      acc[eng].total += 1;
      if (job.jobStatus === 'Done') {
        acc[eng].done += 1;
        if (job.callDate && job.finishedDate) {
          let callDate = new Date(job.callDate);
          let finishedDate = new Date(job.finishedDate);
          
          if (isNaN(callDate.getTime())) {
            const parts = String(job.callDate).split(/[-/]/);
            if (parts.length >= 3) {
              callDate = new Date(parseInt(parts[0], 10) > 12 ? `${parts[2]}-${parts[1]}-${parts[0]}` : `${parts[2]}-${parts[0]}-${parts[1]}`);
            }
          }
          if (isNaN(finishedDate.getTime())) {
            const parts = String(job.finishedDate).split(/[-/]/);
            if (parts.length >= 3) {
              finishedDate = new Date(parseInt(parts[0], 10) > 12 ? `${parts[2]}-${parts[1]}-${parts[0]}` : `${parts[2]}-${parts[0]}-${parts[1]}`);
            }
          }

          if (!isNaN(callDate.getTime()) && !isNaN(finishedDate.getTime()) && finishedDate >= callDate) {
            const diffTime = Math.abs(finishedDate.getTime() - callDate.getTime());
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            acc[eng].totalResolutionDays += diffDays;
            acc[eng].resolutionCount += 1;
          }
        }
      }
      else if (job.jobStatus === 'Inprogress' || job.jobStatus === 'Pending') {
        acc[eng].active += 1;
      }
      return acc;
    }, {} as Record<string, { name: string; total: number; done: number; active: number; totalResolutionDays: number; resolutionCount: number; }>);
    
    const engineerData = (Object.values(engineerWorkload) as { name: string; total: number; done: number; active: number; totalResolutionDays: number; resolutionCount: number; }[]).map(eng => ({
      ...eng,
      avgResolutionDays: eng.resolutionCount > 0 ? Number((eng.totalResolutionDays / eng.resolutionCount).toFixed(1)) : 0
    }));

    return { total, done, inProgress, pending, pmCount, cmCount, engineerWorkload: engineerData.sort((a,b) => b.active - a.active), engineerResolution: engineerData.filter(e => e.resolutionCount > 0).sort((a,b) => a.avgResolutionDays - b.avgResolutionDays) };
  }, [jobs]);

  // 3. CUSTOMER HEALTH
  const customerHealth = useMemo(() => {
    const hospCounts = jobs.reduce((acc, job) => {
      const hosp = job.hospitalName || 'Unknown';
      if (!acc[hosp]) acc[hosp] = { name: hosp, total: 0, PM: 0, CM: 0, Other: 0 };
      acc[hosp].total += 1;
      
      const type = job.jobType === 'PM' || job.jobType === 'CM' ? job.jobType : 'Other';
      acc[hosp][type] += 1;
      return acc;
    }, {} as Record<string, { name: string; total: number; PM: number; CM: number; Other: number }>);

    const topHospitals = (Object.values(hospCounts) as { name: string; total: number; PM: number; CM: number; Other: number }[]).sort((a, b) => b.total - a.total).slice(0, 10);
    const top5CMHospitals = (Object.values(hospCounts) as { name: string; total: number; PM: number; CM: number; Other: number }[]).sort((a, b) => b.CM - a.CM).slice(0, 5);
    return { topHospitals, top5CMHospitals };
  }, [jobs]);

  // 4. EQUIPMENT & QUALITY
  const equipmentQuality = useMemo(() => {
    const eqFailures = jobs.filter(j => j.jobType === 'CM').reduce((acc, job) => {
      const eq = job.equipmentName || 'Unknown';
      acc[eq] = (acc[eq] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topFailures = (Object.entries(eqFailures) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const problems = jobs.filter(j => j.jobType === 'CM' && j.problemDescription).reduce((acc, job) => {
      const prob = job.problemDescription.toLowerCase().trim();
      acc[prob] = (acc[prob] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topProblems = (Object.entries(problems) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const partsUsed = jobs.filter(j => j.spareParts).length;

    return { topFailures, topProblems, partsUsed };
  }, [jobs]);



  const cmStatusMetrics = useMemo(() => {
    const total = cmRecords.length;
    const activeRecords = cmRecords.filter(r => (r.status || 'Repair request') !== 'Closed');
    const active = activeRecords.length;
    const closed = total - active;
    
    const byStatus = cmRecords.reduce((acc, r) => {
      const s = r.status || 'Repair request';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const activeByEngineer = activeRecords.reduce((acc, r) => {
      const e = r.engineer || 'Unassigned';
      if (!acc[e]) acc[e] = [];
      acc[e].push(r);
      return acc;
    }, {} as Record<string, CMStatusRecord[]>);
    
    return { total, active, closed, byStatus, activeByEngineer };
  }, [cmRecords]);

  
  const pendingPmsThisMonth = useMemo(() => {
    const date = new Date();
    const currentYearStr = date.getFullYear().toString();
    const currentMonthStr = date.toLocaleString('en-US', { month: 'short' });
    
    const scheduledThisMonth = pmRecords.filter(r => r.month === currentMonthStr && r.year.includes(currentYearStr));
    
    const monthNumMap: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const rMonthNum = monthNumMap[currentMonthStr] || '01';
    
    const pending = scheduledThisMonth.filter(r => {
      const isCompleted = (rawYearlyJobs || []).some(job => {
        const type = job.jobType ? job.jobType.trim().toUpperCase() : '';
        if (!type.includes('PM') && type !== 'IB') return false;
        if (!job.serialNumber || !r.sn) return false;
        const snMatch = job.serialNumber.replace(/\s+/g, '').toLowerCase() === r.sn.replace(/\s+/g, '').toLowerCase();
        if (!snMatch) return false;
        const hospitalMatch = (job.hospitalName || '').trim().toLowerCase() === (r.hospitalName || '').trim().toLowerCase();
        if (!hospitalMatch) return false;
        return true;
      });
      return !isCompleted;
    });
    
    return {
      monthName: currentMonthStr,
      total: scheduledThisMonth.length,
      pendingCount: pending.length,
      list: pending
    };
  }, [pmRecords, rawYearlyJobs]);

  const yearlyPmStats = useMemo(() => {
    let plannedCArm = 0;
    let plannedUS = 0;
    
    const currentYear = new Date().getFullYear().toString();
    pmRecords.forEach(r => {
      if (r.year && !r.year.includes(currentYear)) return; // Only count PMs in the current year
      if (r.equipmentCategory === 'C-Arm' || (r.sheetName && r.sheetName.includes('C-Arm'))) plannedCArm++;
      else if (r.equipmentCategory === 'Ultrasound' || (r.sheetName && r.sheetName.includes('Ultrasound'))) plannedUS++;
    });

    let completedCArm = 0;
    let completedUS = 0;

    const yearlyPmJobs = (rawYearlyJobs || []).filter(j => {
      const type = (j.jobType || '').toString().toUpperCase().trim();
      const status = (j.jobStatus || '').toString().toUpperCase().trim();
      return type.includes('PM') && status === 'DONE';
    });

    yearlyPmJobs.forEach(job => {
      
      let prod = job.product || '';
      if (!prod && job.equipmentName) {
        const cArmModels = ['bv', 'zenition', 'veradius', 'c-arm', 'pulsera', 'endura'];
        const modelLower = job.equipmentName.toLowerCase();
        if (cArmModels.some(m => modelLower.includes(m))) {
          prod = 'C-ARM';
        } else {
          prod = 'US';
        }
      }
      
      if (prod === 'C-ARM' || prod === 'C-Arm') completedCArm++;
      else if (prod === 'US' || prod === 'Ultrasound') completedUS++;
    });

    return {
      cArm: { planned: plannedCArm, completed: completedCArm },
      us: { planned: plannedUS, completed: completedUS },
      total: { 
        planned: plannedCArm + plannedUS, 
        completed: completedCArm + completedUS 
      }
    };
  }, [pmRecords, rawYearlyJobs]);

  const cmOnCallMetrics = useMemo(() => {
    const total = cmOnCallRecords.length;
    const active = cmOnCallRecords.filter(r => (r.status || 'Repair request') !== 'Closed').length;
    const closed = total - active;
    
    const byStatus = cmOnCallRecords.reduce((acc, r) => {
      const s = r.status || 'Repair request';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, active, closed, byStatus };
  }, [cmOnCallRecords]);

  const handleExportExcel = () => {
    if (jobs.length === 0) return;
    
    const data = jobs.map(job => ({
      'Job Number': job.jobNumber || '',
      'Call Date': job.callDate || '',
      'Status': job.jobStatus || '',
      'Job Type': job.jobType || '',
      'Hospital': job.hospitalName || '',
      'Department': job.department || '',
      'Equipment': job.equipmentName || '',
      'Serial Number': job.serialNumber || '',
      'Problem': job.problemDescription || '',
      'Engineer': job.engineerName || '',
      'Service Date': job.serviceDate || '',
      'Warranty': job.warrantyStatus || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    const wscols = [
      { wch: 15 }, // Job Number
      { wch: 12 }, // Call Date
      { wch: 12 }, // Status
      { wch: 12 }, // Job Type
      { wch: 25 }, // Hospital
      { wch: 15 }, // Department
      { wch: 20 }, // Equipment
      { wch: 20 }, // Serial Number
      { wch: 30 }, // Problem
      { wch: 20 }, // Engineer
      { wch: 12 }, // Service Date
      { wch: 15 }  // Warranty
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard Jobs");

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Dashboard_Export_${timestamp}.xlsx`);
  };

  // Custom Colors
  const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#f43f5e'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded border border-slate-800 text-white shadow-lg">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Executive Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">Comprehensive overview of financial, operational, and customer health metrics.</p>
        </div>
        {onMonthChange && (
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded border border-slate-600 transition-colors"
              title="Export to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">Period:</span>
              <select 
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
                value={activeMonthYear}
                onChange={(e) => onMonthChange(e.target.value)}
              >
                <option value="YEARLY2026">Entire Year 2026</option>
                {['JAN2026', 'FEB2026', 'MAR2026', 'APR2026', 'MAY2026', 'JUN2026', 'JUL2026', 'AUG2026', 'SEP2026', 'OCT2026', 'NOV2026', 'DEC2026'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      
      {/* PENDING PM ALERTS WIDGET */}
      <div className="bg-white rounded border border-orange-200 p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-orange-400"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600 shrink-0 mt-1">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-800 tracking-tight">Pending PM Alerts</h2>
              <p className="text-sm text-slate-500 mt-1">
                You have <strong className="text-orange-600 text-lg">{pendingPmsThisMonth.pendingCount}</strong> pending PM schedules out of {pendingPmsThisMonth.total} scheduled for <strong>{pendingPmsThisMonth.monthName}</strong>.
              </p>
            </div>
          </div>
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('pm-schedule')}
              className="px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-bold rounded-lg text-sm transition-colors whitespace-nowrap shadow-sm flex items-center gap-2"
            >
              Go to PM Schedule
              <Activity className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>


      {/* PM PROGRESS SUMMARY */}
      <div className="bg-white rounded border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <CalendarDays className="w-5 h-5 text-blue-500" />
          <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Yearly PM Progress</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase">C-ARM PMs</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-blue-600 font-mono">{yearlyPmStats.cArm.completed}</span>
              <span className="text-sm font-bold text-slate-400 font-mono mb-1">/ {yearlyPmStats.cArm.planned}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-1 overflow-hidden">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${yearlyPmStats.cArm.planned > 0 ? Math.min(100, (yearlyPmStats.cArm.completed / yearlyPmStats.cArm.planned) * 100) : 0}%` }}></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase">US PMs</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-blue-600 font-mono">{yearlyPmStats.us.completed}</span>
              <span className="text-sm font-bold text-slate-400 font-mono mb-1">/ {yearlyPmStats.us.planned}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-1 overflow-hidden">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${yearlyPmStats.us.planned > 0 ? Math.min(100, (yearlyPmStats.us.completed / yearlyPmStats.us.planned) * 100) : 0}%` }}></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase">Total PMs</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-800 font-mono">{yearlyPmStats.total.completed}</span>
              <span className="text-sm font-bold text-slate-400 font-mono mb-1">/ {yearlyPmStats.total.planned}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-1 overflow-hidden">
              <div className="bg-slate-700 h-2.5 rounded-full" style={{ width: `${yearlyPmStats.total.planned > 0 ? Math.min(100, (yearlyPmStats.total.completed / yearlyPmStats.total.planned) * 100) : 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* 2. OPERATIONS & SLA */}
        <section className="bg-white rounded border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Operations & SLA</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Done</p>
              <p className="text-xl font-bold text-emerald-600 font-mono mt-1">{opMetrics.done}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active</p>
              <p className="text-xl font-bold text-orange-500 font-mono mt-1">{opMetrics.inProgress + opMetrics.pending}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">PM:CM Ratio</p>
              <p className="text-xl font-bold text-indigo-600 font-mono mt-1">
                {opMetrics.cmCount > 0 ? (opMetrics.pmCount / opMetrics.cmCount).toFixed(1) : opMetrics.pmCount}:1
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-slate-600 uppercase mb-2">Engineer Workload</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {opMetrics.engineerWorkload.map((eng, idx) => {
                const maxVal = Math.max(...opMetrics.engineerWorkload.map(e => e.total));
                const pDone = (eng.done / maxVal) * 100;
                const pActive = (eng.active / maxVal) * 100;
                return (
                  <div key={idx} className="text-[11px]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-700">{eng.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{eng.active} Active / {eng.total} Total</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded flex overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${pDone}%` }} title="Done"></div>
                      <div className="h-full bg-orange-400" style={{ width: `${pActive}%` }} title="Active"></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>


        </section>

        {/* 3. CUSTOMER HEALTH */}
        <section className="bg-white rounded border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Customer Health</h2>
          </div>
          
          <h3 className="text-[11px] font-bold text-slate-600 uppercase mb-2">Top Hospitals by Service Frequency</h3>
          <div className="h-56 w-full text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerHealth.topHospitals} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={9} tickLine={false} stroke="#94a3b8" />
                <YAxis type="category" dataKey="name" fontSize={9} tickLine={false} stroke="#94a3b8" width={120} tickFormatter={(v) => v.length > 15 ? v.substring(0, 15) + '...' : v} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '9px', marginTop: '4px' }} />
                <Bar dataKey="PM" stackId="a" fill="#3b82f6" name="Preventive (PM)" />
                <Bar dataKey="CM" stackId="a" fill="#f97316" name="Corrective (CM)" />
                <Bar dataKey="Other" stackId="a" fill="#94a3b8" name="Other" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 4. EQUIPMENT & QUALITY */}
        <section className="bg-white rounded border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Wrench className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Equipment & Quality</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-[11px] font-bold text-slate-600 uppercase mb-2">High-Failure Equipment (CM)</h3>
              <div className="space-y-2">
                {equipmentQuality.topFailures.map((eq, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-rose-50 border border-rose-100 rounded text-[11px]">
                    <span className="text-rose-800 font-semibold truncate pr-2">{eq[0]}</span>
                    <span className="text-rose-600 font-bold font-mono">{eq[1]} <span className="text-[9px] font-normal">fails</span></span>
                  </div>
                ))}
                {equipmentQuality.topFailures.length === 0 && <div className="text-[10px] text-slate-500">No data</div>}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold text-slate-600 uppercase mb-2">Most Common Problems</h3>
              <div className="space-y-2">
                {equipmentQuality.topProblems.map((prob, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-100 rounded text-[11px]">
                    <span className="text-slate-700 truncate pr-2" title={prob[0]}>{prob[0] || 'Unspecified'}</span>
                    <span className="text-slate-500 font-bold font-mono">{prob[1]}</span>
                  </div>
                ))}
                {equipmentQuality.topProblems.length === 0 && <div className="text-[10px] text-slate-500">No data</div>}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-800">
              <Package className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Spare Parts Usage</span>
            </div>
            <div className="text-lg font-bold font-mono text-orange-600">
              {equipmentQuality.partsUsed} <span className="text-[9px] font-normal text-orange-800/70">jobs required parts</span>
            </div>
          </div>
        </section>        {/* 5. JOB TYPE TREND */}
        <section className="bg-white rounded border border-slate-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Job Type Trend</h2>
            </div>
            <div className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {displayMonthYear}
            </div>
          </div>
          
          <div className="flex-1 min-h-[220px] flex flex-col justify-center">
            {jobTypeTrend.length > 0 ? (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={jobTypeTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{ fontSize: '11px', borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend 
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }}
                    />
                    <Line type="monotone" dataKey="PM" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="CM" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Other" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 h-full">
                <Activity className="w-10 h-10 mb-2 opacity-20" />
                <span className="text-xs">No trend data available</span>
              </div>
            )}
          </div>
        </section>
      </div>
      {/* Top 5 Hospitals CM Volume - Added by Request */}
      <div className="bg-white rounded border border-slate-200 p-4 mt-4 shadow-sm">
        <div>
          <h2 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Top 5 Hospitals by CM Volume</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Hospitals with the highest number of corrective maintenance (CM) requests.</p>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {customerHealth.top5CMHospitals.length === 0 ? (
              <div className="text-[10px] text-slate-500">No data available.</div>
            ) : (
              customerHealth.top5CMHospitals.map((hosp, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded">
                  <div className="flex items-center gap-3 truncate pr-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 truncate">{hosp.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-bold text-orange-600 font-mono">{hosp.CM}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tickets</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex flex-col justify-center items-center p-4 border border-slate-100 rounded bg-slate-50 relative overflow-hidden">
             <Activity className="w-16 h-16 text-orange-100 absolute -bottom-2 -right-2" />
             <div className="text-center z-10 relative">
               <span className="block text-4xl font-bold text-orange-600 font-mono">
                 {customerHealth.top5CMHospitals[0] ? customerHealth.top5CMHospitals[0].CM : 0}
               </span>
               <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tickets from #1 Hospital</span>
             </div>
          </div>
        </div>
      </div>

      {/* CM STATUS OVERVIEW */}
      <div className="bg-white rounded border border-slate-200 p-4 mt-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Wrench className="w-5 h-5 text-indigo-500" />
          <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider">CM Status Overview</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-center relative overflow-hidden">
               <Wrench className="w-16 h-16 text-indigo-100/50 absolute -bottom-2 -right-2" />
               <div className="relative z-10">
                 <span className="block text-4xl font-bold text-indigo-600 font-mono">{cmStatusMetrics.total}</span>
                 <span className="text-xs uppercase font-bold text-indigo-500 tracking-wider">Total Tickets</span>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                 <span className="block text-2xl font-bold text-slate-800 font-mono">{cmStatusMetrics.active}</span>
                 <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active</span>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-center">
                 <span className="block text-2xl font-bold text-emerald-600 font-mono">{cmStatusMetrics.closed}</span>
                 <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Closed</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Status Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(cmStatusMetrics.byStatus).map(([status, count]) => {
                let colorClass = 'bg-slate-50 border-slate-200 text-slate-700';
                if (status === 'Pending') colorClass = 'bg-amber-50 border-amber-200 text-amber-700';
                if (status === 'In Progress Checking') colorClass = 'bg-blue-50 border-blue-200 text-blue-700';
                if (status === 'Waiting for replacement parts') colorClass = 'bg-orange-50 border-orange-200 text-orange-700';
                if (status === 'Waiting for Claim spare parts') colorClass = 'bg-purple-50 border-purple-200 text-purple-700';
                if (status === 'Submit a price offer') colorClass = 'bg-indigo-50 border-indigo-200 text-indigo-700';
                if (status === 'Submit the invoice') colorClass = 'bg-teal-50 border-teal-200 text-teal-700';
                if (status === 'Closed') colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-700';
                
                return (
                  <div key={status} className={`p-3 border rounded-lg flex items-center justify-between ${colorClass}`}>
                    <span className="text-xs font-semibold truncate pr-2">{status}</span>
                    <span className="text-base font-bold font-mono">{count}</span>
                  </div>
                );
              })}
              {Object.keys(cmStatusMetrics.byStatus).length === 0 && (
                <div className="col-span-full text-xs text-slate-400 py-4 text-center">No CM Status records found.</div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Engineer Workload (Active CM Status)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(cmStatusMetrics.activeByEngineer).length === 0 ? (
              <div className="col-span-full text-xs text-slate-400 py-2">No active jobs assigned to engineers.</div>
            ) : (
              Object.entries(cmStatusMetrics.activeByEngineer).map(([engineer, records]: [string, any]) => (
                <div key={engineer} className="bg-slate-50 border border-slate-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-700">{engineer}</span>
                    <span className="text-xs font-bold font-mono text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{records.length} Active</span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                    {records.map((r, i) => (
                      <div key={i} className="text-[10px] bg-white border border-slate-100 rounded p-2">
                        <div className="font-bold text-slate-800 truncate mb-0.5" title={r.hospital}>{r.hospital || 'Unknown Hospital'}</div>
                        <div className="flex justify-between items-center text-slate-500">
                           <span className="truncate pr-2" title={r.equipment}>{r.equipment || 'No equipment'}</span>
                           <span className="text-orange-500 font-semibold truncate shrink-0 max-w-[80px]" title={r.status}>{r.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CM ON CALL OVERVIEW */}
      <div className="bg-white rounded border border-slate-200 p-4 mt-4 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Activity className="w-5 h-5 text-rose-500" />
          <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider">CM On Call Overview (Warranty)</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-center relative overflow-hidden">
               <Activity className="w-16 h-16 text-rose-100/50 absolute -bottom-2 -right-2" />
               <div className="relative z-10">
                 <span className="block text-4xl font-bold text-rose-600 font-mono">{cmOnCallMetrics.total}</span>
                 <span className="text-xs uppercase font-bold text-rose-500 tracking-wider">Total Tickets</span>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                 <span className="block text-2xl font-bold text-slate-800 font-mono">{cmOnCallMetrics.active}</span>
                 <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active</span>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-center">
                 <span className="block text-2xl font-bold text-emerald-600 font-mono">{cmOnCallMetrics.closed}</span>
                 <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Closed</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Status Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(cmOnCallMetrics.byStatus).map(([status, count]) => {
                let colorClass = 'bg-slate-50 border-slate-200 text-slate-700';
                if (status === 'Pending') colorClass = 'bg-amber-50 border-amber-200 text-amber-700';
                if (status === 'In Progress Checking') colorClass = 'bg-blue-50 border-blue-200 text-blue-700';
                if (status === 'Waiting for replacement parts') colorClass = 'bg-orange-50 border-orange-200 text-orange-700';
                if (status === 'Waiting for Claim spare parts') colorClass = 'bg-purple-50 border-purple-200 text-purple-700';
                if (status === 'Submit a price offer') colorClass = 'bg-indigo-50 border-indigo-200 text-indigo-700';
                if (status === 'Submit the invoice') colorClass = 'bg-teal-50 border-teal-200 text-teal-700';
                if (status === 'Closed') colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-700';
                
                return (
                  <div key={status} className={`p-3 border rounded-lg flex items-center justify-between ${colorClass}`}>
                    <span className="text-xs font-semibold truncate pr-2">{status}</span>
                    <span className="text-base font-bold font-mono">{count}</span>
                  </div>
                );
              })}
              {Object.keys(cmOnCallMetrics.byStatus).length === 0 && (
                <div className="col-span-full text-xs text-slate-400 py-4 text-center">No CM On Call records found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}