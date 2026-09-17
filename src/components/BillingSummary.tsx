import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { ServiceJob } from '../types';
import { FileText, Building2, DollarSign, ArrowDown, ArrowRight, ChevronDown, ChevronRight, Download, CheckCircle2 } from 'lucide-react';

interface BillingSummaryProps {
  jobs: ServiceJob[];
}

export default function BillingSummary({ jobs }: BillingSummaryProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'billed'>('pending');
  const [expandedHospitals, setExpandedHospitals] = useState<Record<string, boolean>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>('All');

  
const getMonthString = (dateStr: string) => {
  if (!dateStr) return 'Unknown';
  const parts = dateStr.split(/[\/-]/);
  if (parts.length >= 3) {
    if (dateStr.includes('-')) {
      return `${parts[1]}/${parts[0]}`;
    } else {
      let y = parts[2];
      if (y.length === 2) y = "20" + y;
      return `${parts[1]}/${y}`;
    }
  }
  return 'Unknown';
};


  const allMonths = useMemo(() => {
    const months = new Set<string>();
    jobs.forEach(job => {
      months.add(getMonthString(job.callDate));
    });
    const arr = Array.from(months).filter(m => m !== 'Unknown');
    // Sort descending
    arr.sort((a, b) => {
      const [mA, yA] = a.split('/').map(Number);
      const [mB, yB] = b.split('/').map(Number);
      if (yA !== yB) return yB - yA;
      return mB - mA;
    });
    return arr;
  }, [jobs]);

  const filteredJobsByMonth = useMemo(() => {
    if (selectedMonth === 'All') return jobs;
    return jobs.filter(job => getMonthString(job.callDate) === selectedMonth);
  }, [jobs, selectedMonth]);

  const pendingJobs = useMemo(() => {
    return filteredJobsByMonth.filter(job => job.billingStatus === 'ยังไม่ได้วางบิล');
  }, [filteredJobsByMonth]);

  const billedJobs = useMemo(() => {
    return filteredJobsByMonth.filter(job => job.billingStatus === 'วางบิลเรียบร้อยแล้ว');
  }, [filteredJobsByMonth]);


  const activeJobs = activeTab === 'pending' ? pendingJobs : billedJobs;

  const summaryData = useMemo(() => {
    const data: Record<string, { totalAmount: number; jobs: ServiceJob[] }> = {};
    
    activeJobs.forEach(job => {
      const hospital = job.hospitalName || 'Unknown Hospital';
      if (!data[hospital]) {
        data[hospital] = { totalAmount: 0, jobs: [] };
      }
      data[hospital].jobs.push(job);
      data[hospital].totalAmount += (job.revenue || 0);
    });

    return Object.entries(data).sort((a, b) => b[1].totalAmount - a[1].totalAmount);
  }, [activeJobs]);

  const totalPendingAmount = useMemo(() => {
    return pendingJobs.reduce((sum, job) => sum + (job.revenue || 0), 0);
  }, [pendingJobs]);

  const totalBilledAmount = useMemo(() => {
    return billedJobs.reduce((sum, job) => sum + (job.revenue || 0), 0);
  }, [billedJobs]);

  const toggleHospital = (hospital: string) => {
    setExpandedHospitals(prev => ({
      ...prev,
      [hospital]: !prev[hospital]
    }));
  };

  const handleExportExcel = () => {
    const data: any[] = [];
    
    summaryData.forEach(([hospital, hospitalData]) => {
      hospitalData.jobs.forEach(job => {
        data.push({
          'Hospital Name': hospital,
          'Job Number': job.jobNumber || '',
          'Job Type': job.jobType || '',
          'Warranty': job.warrantyStatus || '',
          'Call Date': job.callDate || '',
          'Amount (Revenue)': job.revenue || 0
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    const wscols = [
      { wch: 30 }, // Hospital Name
      { wch: 15 }, // Job Number
      { wch: 15 }, // Job Type
      { wch: 15 }, // Warranty
      { wch: 12 }, // Call Date
      { wch: 15 }  // Amount
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Billing Summary");

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Billing_Summary_${timestamp}.xlsx`);
  };

  return (
    <div className="space-y-4 font-sans" id="billing-summary-view">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-2.5 gap-2 select-none">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Billing Summary
          </h2>
          <p className="text-xs text-slate-500 font-medium">Manage and track jobs for billing status</p>
        </div>
        
        <button
          onClick={handleExportExcel}
          disabled={activeJobs.length === 0}
          className="px-3 min-h-[44px] md:min-h-0 py-2 md:py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded text-sm md:text-xs font-bold cursor-pointer shrink-0 transition-colors flex items-center gap-1.5 select-none"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className={`bg-white rounded border ${activeTab === 'pending' ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-200'} cursor-pointer shadow-sm p-4 flex items-center gap-4 transition-all`}
          onClick={() => setActiveTab('pending')}
        >
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 shrink-0">
            <FileText className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pending (ยังไม่ได้วางบิล)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-amber-600 font-mono mt-0.5">฿{totalPendingAmount.toLocaleString()}</p>
              <span className="text-xs font-semibold text-slate-400">({pendingJobs.length} jobs)</span>
            </div>
          </div>
        </div>
        
        <div 
          className={`bg-white rounded border ${activeTab === 'billed' ? 'border-emerald-400 ring-1 ring-emerald-400' : 'border-slate-200'} cursor-pointer shadow-sm p-4 flex items-center gap-4 transition-all`}
          onClick={() => setActiveTab('billed')}
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Billed (วางบิลแล้ว)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-emerald-600 font-mono mt-0.5">฿{totalBilledAmount.toLocaleString()}</p>
              <span className="text-xs font-semibold text-slate-400">({billedJobs.length} jobs)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border border-slate-200 shadow-sm p-4 flex items-center gap-4 opacity-80">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 shrink-0">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Expected Revenue</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-blue-600 font-mono mt-0.5">฿{(totalPendingAmount + totalBilledAmount).toLocaleString()}</p>
              <span className="text-xs font-semibold text-slate-400">({pendingJobs.length + billedJobs.length} jobs)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        {activeJobs.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <DollarSign className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No jobs found</p>
            <p className="text-xs mt-1">There are no jobs in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                  <th className="px-4 py-3 font-bold w-10"></th>
                  <th className="px-4 py-3 font-bold">Hospital Name</th>
                  <th className="px-4 py-3 font-bold text-center">Jobs</th>
                  <th className="px-4 py-3 font-bold text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summaryData.map(([hospital, data]) => {
                  const isExpanded = expandedHospitals[hospital];
                  return (
                    <React.Fragment key={hospital}>
                      <tr 
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => toggleHospital(hospital)}
                      >
                        <td className="px-4 py-3 text-slate-400">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-700">{hospital}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 ${activeTab === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} border rounded font-mono text-xs font-bold`}>
                            {data.jobs.length}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-mono font-bold ${activeTab === 'pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            ฿{data.totalAmount.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={4} className="p-0 border-t border-slate-200">
                            <div className="px-10 py-3">
                              <table className="w-full border-collapse text-left bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                                    <th className="px-3 py-2 font-bold">Job Number</th>
                                    <th className="px-3 py-2 font-bold text-center">Type</th>
                                    <th className="px-3 py-2 font-bold text-center">Warranty</th>
                                    <th className="px-3 py-2 font-bold text-center">Date</th>
                                    <th className="px-3 py-2 font-bold text-right">Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {data.jobs.map((job, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                      <td className="px-3 py-2 font-mono text-xs font-semibold text-slate-700">
                                        {job.jobNumber}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight border ${
                                          job.jobType === 'PM' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                          job.jobType === 'CM' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                          'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                          {job.jobType}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <span className="text-[10px] font-semibold text-slate-600">
                                          {job.warrantyStatus}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-center text-xs text-slate-500 font-mono">
                                        {job.callDate}
                                      </td>
                                      <td className="px-3 py-2 text-right font-mono text-xs font-bold text-slate-700">
                                        ฿{(job.revenue || 0).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
