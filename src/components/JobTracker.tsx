import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Search, Eye, Filter, Edit, FileText, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Send, Clock, Download } from 'lucide-react';
import { ServiceJob, SystemSettings, PMScheduleItem } from '../types';
import { fetchPMScheduleRecords } from '../sheetsService';

interface JobTrackerProps {
  jobs: ServiceJob[];
  settings: SystemSettings;
  onEditJob: (job: ServiceJob, index: number) => void;
  onUpdateStatus: (index: number, newStatus: ServiceJob['jobStatus']) => Promise<void>;
  onTriggerPDF: (job: ServiceJob) => void;
  isUpdatingStatus: boolean;
  accessToken?: string | null;
}

export default function JobTracker({
  jobs,
  settings,
  onEditJob,
  onUpdateStatus,
  onTriggerPDF,
  isUpdatingStatus,
  accessToken,
}: JobTrackerProps) {
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('job_tracker_search_term') || '';
  });
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterHospital, setFilterHospital] = useState<string>('All');
  const [filterEngineer, setFilterEngineer] = useState<string>('All');
  const [filterWarranty, setFilterWarranty] = useState<string>('All');
  const [filterBilling, setFilterBilling] = useState<string>('All');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const [pmRecords, setPmRecords] = useState<PMScheduleItem[]>([]);
  const [isFetchingPM, setIsFetchingPM] = useState(false);

  useEffect(() => {
    async function loadPM() {
      if (!accessToken || !settings.pmSpreadsheetId) return;
      setIsFetchingPM(true);
      try {
        const data = await fetchPMScheduleRecords(settings.pmSpreadsheetId, accessToken);
        setPmRecords(data);
      } catch (e) {
        console.error('Error fetching PM records in JobTracker', e);
      } finally {
        setIsFetchingPM(false);
      }
    }
    loadPM();
  }, [accessToken, settings.pmSpreadsheetId]);


  // Filter jobs locally based on selection

  const getPMIteration = (job: ServiceJob) => {
    if (job.jobType !== 'PM' || !job.pmCycle || pmRecords.length === 0) return null;
    
    const parts = job.pmCycle.split('/');
    if (parts.length !== 2) return null;
    
    const monthNum = parseInt(parts[0], 10);
    const yearStr = parts[1];
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (monthNum < 1 || monthNum > 12) return null;
    
    const monthStr = monthNames[monthNum - 1];
    
    const match = pmRecords.find(pm => 
      pm.sn === job.serialNumber &&
      pm.hospitalName === job.hospitalName &&
      pm.month === monthStr &&
      pm.year === yearStr
    );
    
    if (match) {
      if (match.iteration && match.pmTimesTotal) {
        return `${match.iteration}/${match.pmTimesTotal}`;
      }
      return match.iteration;
    }
    
    return null;
  };

  const parseDateToMs = (dateStr: string) => {
    if (!dateStr) return 0;
    const dt = new Date(dateStr);
    if (!isNaN(dt.getTime())) return dt.getTime();
    const parts = dateStr.split(/[/-]/);
    if (parts.length >= 3) {
      let d = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10) - 1;
      let y = parseInt(parts[2], 10);
      if (y < 100) y += 2000;
      const dObj = new Date(y, m, d);
      if (!isNaN(dObj.getTime())) return dObj.getTime();
    }
    return 0;
  };

  const filteredJobs = jobs.filter((job, idx) => {
    const matchesSearch = 
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ([job.engineerName, job.engineer2, job.engineer3, job.engineer4].some(e => e && e.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesType = filterType === 'All' || job.jobType === filterType;
    const matchesStatus = filterStatus === 'All' || job.jobStatus === filterStatus;
    const matchesHospital = filterHospital === 'All' || job.hospitalName === filterHospital;
    const matchesEngineer = filterEngineer === 'All' || [job.engineerName, job.engineer2, job.engineer3, job.engineer4].includes(filterEngineer);
    const matchesWarranty = filterWarranty === 'All' || job.warrantyStatus === filterWarranty;
    
    const matchesBilling = (() => {
      if (filterBilling === 'All') return true;
      if (filterBilling === 'Pending Billing') return job.billingStatus === 'ยังไม่ได้วางบิล';
      if (filterBilling === 'Billed') return job.billingStatus === 'วางบิลเรียบร้อยแล้ว';
      if (filterBilling === 'Not Applicable') return !job.billingStatus || job.billingStatus === '-- Select --' || !((job.jobType === 'PM' && job.warrantyStatus === 'Contract') || (job.jobType === 'CM' && job.warrantyStatus === 'Paid Repair'));
      return true;
    })();
    
    const matchesDate = (() => {
      if (!dateRange.start && !dateRange.end) return true;
      if (!job.callDate) return false;
      const jobDate = new Date(job.callDate);
      if (isNaN(jobDate.getTime())) return false;
      
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      if (startDate && endDate) {
        return jobDate >= startDate && jobDate <= endDate;
      } else if (startDate) {
        return jobDate >= startDate;
      } else if (endDate) {
        return jobDate <= endDate;
      }
      return true;
    })();

    return matchesSearch && matchesType && matchesStatus && matchesHospital && matchesEngineer && matchesWarranty && matchesBilling && matchesDate;
  }).sort((a, b) => {
    // Sort by Job Number
    const parseJobNum = (jNum: string) => {
      if (!jNum) return 0;
      const clean = String(jNum).trim();
      if (/^\d+$/.test(clean) && clean.length >= 5) {
        const seqStr = clean.substring(0, clean.length - 4);
        const mmStr = clean.substring(clean.length - 4, clean.length - 2);
        const yyStr = clean.substring(clean.length - 2);
        const seq = parseInt(seqStr, 10) || 0;
        const mm = parseInt(mmStr, 10) || 0;
        const yy = parseInt(yyStr, 10) || 0;
        return (yy * 100000) + (mm * 1000) + seq;
      }
      const m = clean.match(/\d+/g);
      if (m) return parseInt(m.join(''), 10) || 0;
      return 0;
    };
    return parseJobNum(b.jobNumber) - parseJobNum(a.jobNumber);
  });
  const summaryStats = useMemo(() => {
    let active = 0;
    let pending = 0;
    let completed = 0;
    filteredJobs.forEach(job => {
      if (job.jobStatus === 'Done') completed++;
      else if (job.jobStatus === 'Pending') pending++;
      else if (job.jobStatus === 'Inprogress') active++;
    });
    return { active, pending, completed, total: filteredJobs.length };
  }, [filteredJobs]);


  const handleExportExcel = () => {
    // Define rows mapping precisely to ServiceJob model fields
    const data = filteredJobs.map(job => ({
      'Job Number': job.jobNumber || '',
      'Call Date': job.callDate || '',
      'Job Status': job.jobStatus || '',
      'PM Cycle': job.pmCycle || '',
      'Job Type': job.jobType || '',
      'PM Times/Total': job.pmTimesTotal || '',
      'Hospital Name': job.hospitalName || '',
      'Department': job.department || '',
      'Equipment Name': job.equipmentName || '',
      'Serial Number': job.serialNumber || '',
      'Equipment Type': job.equipmentType || '',
      'Problem Description': job.problemDescription || '',
      'Safety Q1': job.safetyQ1 || '',
      'Safety Q2': job.safetyQ2 || '',
      'Customer Name': job.customerName || '',
      'Customer Phone': job.customerPhone || '',
      'Building/Floor': job.buildingFloor || '',
      'Engineer Name': [job.engineerName, job.engineer2, job.engineer3, job.engineer4].filter(e => e && e !== '-- Select --').join(', '),
      'Service Date': job.serviceDate || '',
      'Warranty Status': job.warrantyStatus || '',
      'Remark': job.remark || '',
      'Document Status': job.documentStatus || '',
      'Revenue (THB)': job.revenue || 0,
      'Cost (THB)': job.cost || 0,
      'Net Profit (THB)': (job.revenue || 0) - (job.cost || 0)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add column widths for better readability
    const wscols = [
      { wch: 15 }, // Job Number
      { wch: 12 }, // Call Date
      { wch: 12 }, // Job Status
      { wch: 10 }, // PM Cycle
      { wch: 10 }, // Job Type
      { wch: 15 }, // PM Times/Total
      { wch: 25 }, // Hospital Name
      { wch: 15 }, // Department
      { wch: 20 }, // Equipment Name
      { wch: 20 }, // Serial Number
      { wch: 15 }, // Equipment Type
      { wch: 40 }, // Problem Description
      { wch: 15 }, // Safety Q1
      { wch: 15 }, // Safety Q2
      { wch: 20 }, // Customer Name
      { wch: 15 }, // Customer Phone
      { wch: 15 }, // Building/Floor
      { wch: 30 }, // Engineer Name
      { wch: 12 }, // Service Date
      { wch: 15 }, // Warranty Status
      { wch: 30 }, // Remark
      { wch: 15 }, // Document Status
      { wch: 15 }, // Revenue
      { wch: 15 }, // Cost
      { wch: 15 }  // Net Profit
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Service Jobs");

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Service_Jobs_Export_${timestamp}.xlsx`);
  };

  return (
    <div className="space-y-4 font-sans" id="tracker-view">
      
      {/* TITLE SECTION - COMPACT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-2.5 gap-2 select-none">
        <div>
          <h1 className="text-base font-bold text-slate-800 tracking-tight">Real-Time Tracker</h1>
          <p className="text-slate-500 text-xs mt-0.5">Search, update, and manage job statuses directly. Output verified PDF documents with digital signature pads.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-800 px-2.5 py-1 rounded text-[10px] font-mono font-bold">
          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Tracking: {jobs.length} Active Records</span>
        </div>
      </div>     {/* Summary Card */}
      <div className="bg-white rounded border border-slate-200 shadow-sm p-4 flex gap-6">
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Selection</p>
          <p className="text-2xl font-bold text-slate-800 font-mono mt-1">{summaryStats.total}</p>
        </div>
        <div className="w-px bg-slate-200"></div>
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Completed (Done)</p>
          <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">{summaryStats.completed}</p>
        </div>
        <div className="w-px bg-slate-200"></div>
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-[10px] uppercase font-bold text-orange-500 tracking-wider">Active (In Progress)</p>
          <p className="text-2xl font-bold text-orange-500 font-mono mt-1">{summaryStats.active}</p>
        </div>
        <div className="w-px bg-slate-200"></div>
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-red-500 font-mono mt-1">{summaryStats.pending}</p>
        </div>
      </div>

      <div className="w-full">
        
        {/* Left Side: Table & Filters */}
        <div className="space-y-4">
          
          {/* Filters controls */}
          <div className="bg-white rounded border border-slate-200 shadow-sm p-3 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Job Number, Hospital Name, or Engineer Name..."
                  value={searchTerm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchTerm(val);
                    localStorage.setItem('job_tracker_search_term', val);
                  }}
                  className="w-full pl-8 pr-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 bg-slate-50 border border-slate-300 rounded text-sm md:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportExcel}
                  disabled={filteredJobs.length === 0}
                  className="px-3 min-h-[44px] md:min-h-0 py-2 md:py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded text-sm md:text-xs font-bold cursor-pointer shrink-0 transition-colors flex items-center gap-1.5 select-none"
                  title="Export current filtered view to Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    localStorage.removeItem('job_tracker_search_term');
                    setFilterType('All');
                    setFilterStatus('All');
                    setFilterHospital('All');
                    setFilterEngineer('All');
                    setDateRange({ start: '', end: '' });
                  }}
                  className="px-3 min-h-[44px] md:min-h-0 py-2 md:py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded text-sm md:text-xs font-bold cursor-pointer shrink-0 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1 bg-white border border-slate-300 rounded text-sm md:text-xs text-slate-700"
                >
                  <option value="All">All Types</option>
                  <option value="PM">PM (Maintenance)</option>
                  <option value="CM">CM (Repair)</option>
                  <option value="IB">IB (Install)</option>
                  <option value="FCO">FCO (Upgrade)</option>
                  <option value="Ortho">Ortho (Specialist)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1 bg-white border border-slate-300 rounded text-sm md:text-xs text-slate-700"
                >
                  <option value="All">All Status</option>
                  <option value="Inprogress">In Progress</option>
                  <option value="Done">Done</option>
                  <option value="Pending">Pending</option>
                  
                  <option value="Sale Support">Sale Support</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Hospital</label>
                <select
                  value={filterHospital}
                  onChange={(e) => setFilterHospital(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-700 max-w-full"
                >
                  <option value="All">All Hospitals</option>
                  {settings.hospitals.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Engineer</label>
                <select
                  value={filterEngineer}
                  onChange={(e) => setFilterEngineer(e.target.value)}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1 bg-white border border-slate-300 rounded text-sm md:text-xs text-slate-700"
                >
                  <option value="All">All Engineers</option>
                  {settings.engineers.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1 bg-white border border-slate-300 rounded text-sm md:text-xs text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1 bg-white border border-slate-300 rounded text-sm md:text-xs text-slate-700"
                />
              </div>
              
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Warranty Status</label>
                <select
                  value={filterWarranty}
                  onChange={(e) => setFilterWarranty(e.target.value)}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1 bg-white border border-slate-300 rounded text-sm md:text-xs text-slate-700"
                >
                  <option value="All">All Warranty</option>
                  <option value="Guarantee">Guarantee</option>
                  <option value="Contract">Contract</option>
                  <option value="SaleSupport">SaleSupport</option>
                  <option value="Paid Repair">Paid Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Billing Status</label>
                <select
                  value={filterBilling}
                  onChange={(e) => setFilterBilling(e.target.value)}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1 bg-white border border-slate-300 rounded text-sm md:text-xs text-slate-700"
                >
                  <option value="All">All Billing</option>
                  <option value="Pending Billing">Pending Billing</option>
                  <option value="Billed">Billed</option>
                  <option value="Not Applicable">Not Applicable</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                    <th className="px-3 py-2 font-bold">Job Info</th>
                    <th className="px-3 py-2 font-bold">Hospital & Dept</th>
                    <th className="px-3 py-2 font-bold">Equipment / S/N</th>
                    <th className="px-3 py-2 font-bold">Engineer</th>
                    <th className="px-3 py-2 font-bold text-center">Warranty</th>
                    <th className="px-3 py-2 font-bold">Status</th>
                    <th className="px-3 py-2 font-bold text-center">Billing</th>
                    <th className="px-3 py-2 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                        <span className="font-bold text-xs">No matching records found</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Try widening search terms or verify connections.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job, idx) => {
                      const originalIndex = jobs.findIndex(j => j.jobNumber === job.jobNumber);

                      return (
                        <tr key={`${job.jobNumber || 'job'}-${idx}`} className="hover:bg-slate-50/75 transition-colors">
                          {/* Job Info */}
                          <td className="px-3 py-2 md:py-1.5">
                            <div className="flex flex-col">
                              <span className="font-mono font-bold text-slate-900">{job.jobNumber}</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className={`px-1 py-0.2 rounded text-[8px] font-bold uppercase tracking-tight ${
                                  job.jobType === 'PM' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                  job.jobType === 'CM' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                  job.jobType === 'IB' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                  job.jobType === 'FCO' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                  'bg-slate-50 text-slate-700 border border-slate-150'
                                }`}>
                                  {job.jobType}
                                </span>
                                {(() => {
                                  const iteration = getPMIteration(job);
                                  if (iteration) {
                                    return (
                                      <span className="px-1 py-0.2 rounded text-[8px] font-bold tracking-tight bg-slate-100 text-slate-600 border border-slate-200" title="PM Iteration / Total">
                                        {iteration}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                                <span className="text-[10px] text-slate-400 font-mono">{job.callDate}</span>
                              </div>
                            </div>
                          </td>

                          {/* Hospital & Dept */}
                          <td className="px-3 py-2 md:py-1.5 max-w-[160px]">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 truncate">{job.hospitalName}</span>
                              <span className="text-[10px] text-slate-400 truncate">{job.department || "N/A Dept"}</span>
                            </div>
                          </td>

                          {/* Equipment & S/N */}
                          <td className="px-3 py-2 md:py-1.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-700 truncate max-w-[150px]">{job.equipmentName}</span>
                              <span className="text-[10px] text-slate-500 font-medium truncate">{job.product}</span>
                              <span className="text-[10px] font-mono text-slate-400 mt-0.5">S/N: {job.serialNumber || 'N/A'}</span>
                            </div>
                          </td>

                          {/* Engineer */}
                          <td className="px-3 py-2 md:py-1.5">
                            <span className="font-semibold text-slate-700">{[job.engineerName, job.engineer2, job.engineer3, job.engineer4].filter(e => e && e !== '-- Select --').join(', ') || "Unassigned"}</span>
                          </td>

                          {/* Warranty */}
                          <td className="px-3 py-2 md:py-1.5 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight border ${
                              job.warrantyStatus === 'Guarantee' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              job.warrantyStatus === 'Contract' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              job.warrantyStatus === 'SaleSupport' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                              job.warrantyStatus === 'Paid Repair' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {job.warrantyStatus && job.warrantyStatus !== '-- Select --' ? job.warrantyStatus : 'N/A'}
                            </span>
                          </td>

                          {/* Real-time Status dropdown change */}
                          <td className="px-3 py-2 md:py-1.5">
                            <div className="flex items-center gap-1.5">
                              {job.jobStatus === 'Done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                              {job.jobStatus === 'Inprogress' && <RefreshCw className="w-3.5 h-3.5 text-blue-500" />}
                              {job.jobStatus === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                              
                              {job.jobStatus === 'Sale Support' && <AlertCircle className="w-3.5 h-3.5 text-indigo-500" />}
                              {job.jobStatus === 'Cancelled' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                              {job.jobStatus === '-- Select --' && <AlertCircle className="w-3.5 h-3.5 text-slate-400" />}
                              
                              <select
                                value={job.jobStatus}
                                disabled={isUpdatingStatus}
                                onChange={(e) => onUpdateStatus(originalIndex, e.target.value as any)}
                                className={`text-[10px] font-bold rounded px-1.5 py-0.5 border appearance-none focus:outline-none cursor-pointer transition-all ${
                                  job.jobStatus === 'Done' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                  job.jobStatus === 'Inprogress' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                  job.jobStatus === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  
                                  job.jobStatus === 'Sale Support' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                                  job.jobStatus === 'Cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                                  'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                <option value="-- Select --">-- Select --</option>
                                <option value="Inprogress">In Progress</option>
                                <option value="Done">Done ✓</option>
                                <option value="Pending">Pending ⌛</option>
                                
                                <option value="Sale Support">Sale Support</option>
                                <option value="Cancelled">Cancelled ✕</option>
                              </select>
                            </div>
                          </td>

                          {/* Billing Status (PM and CM Paid Repair) */}
                          <td className="px-3 py-2 md:py-1.5 text-center">
                            {((job.jobType === 'PM' && job.warrantyStatus === 'Contract') || (job.jobType === 'CM' && job.warrantyStatus === 'Paid Repair')) ? (
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight border ${
                                job.billingStatus === 'วางบิลเรียบร้อยแล้ว' 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                  : job.billingStatus === 'ยังไม่ได้วางบิล'
                                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                {job.billingStatus || '--'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-300">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-2 md:py-1.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Edit details */}
                              <button
                                onClick={() => {
                                  const enrichedJob = { ...job };
                                  if (enrichedJob.jobType === 'PM') {
                                    const iteration = getPMIteration(job);
                                    if (iteration) {
                                      enrichedJob.pmTimesTotal = iteration;
                                    }
                                  }
                                  onEditJob(enrichedJob, originalIndex);
                                }}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit Job Properties"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Sign & Save PDF */}
                              <button
                                onClick={() => onTriggerPDF(job)}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                title="Sign & Export Job Card"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
