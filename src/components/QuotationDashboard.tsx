import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, TrendingUp, AlertCircle, Loader2, CheckCircle2, DollarSign, CalendarDays } from 'lucide-react';
import { QuotationRecord, fetchQuotations, updateQuotationWinRate } from '../sheetsService';
import { SystemSettings } from '../types';

interface QuotationDashboardProps {
  settings: SystemSettings;
  accessToken: string | null;
}

export default function QuotationDashboard({ settings, accessToken }: QuotationDashboardProps) {
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [updatingRowIndex, setUpdatingRowIndex] = useState<number | null>(null);

  useEffect(() => {
    loadQuotations();
  }, [settings.spreadsheetId, accessToken]);

  const loadQuotations = async () => {
    if (!settings.spreadsheetId || !accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
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
      
      const data = await fetchQuotations(settings.spreadsheetId, accessToken);
      // Sort by newest first
      data.sort((a, b) => parseDateToMs(b.date) - parseDateToMs(a.date));
      setQuotations(data);
    } catch (err: any) {
      console.error(err);
      setError('Could not load quotation data. Please ensure the "Quotations" sheet exists.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWinRate = async (rowIndex: number, newRate: number, jobType: string) => {
    if (!settings.spreadsheetId || !accessToken) return;
    setUpdatingRowIndex(rowIndex);
    setError(null);
    setSuccessMsg(null);
    
    try {
      await updateQuotationWinRate(settings.spreadsheetId, rowIndex, newRate, jobType, accessToken);
      setSuccessMsg('Win probability updated successfully!');
      
      // Update local state
      setQuotations(prev => prev.map(q => 
        q.rowIndex === rowIndex ? { ...q, winRate: newRate, jobType: jobType } : q
      ));
      
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update win rate');
    } finally {
      setUpdatingRowIndex(null);
    }
  };

  const handleWinRateChangeLocally = (rowIndex: number, value: string) => {
    setQuotations(prev => prev.map(q => 
      q.rowIndex === rowIndex ? { ...q, winRate: parseInt(value) || 0 } : q
    ));
  };
  
  const handleJobTypeChangeLocally = (rowIndex: number, value: string) => {
    setQuotations(prev => prev.map(q => 
      q.rowIndex === rowIndex ? { ...q, jobType: value } : q
    ));
  };

  // Group by Month (using the date field, naive parsing)
  const monthlyStats = quotations.reduce((acc, q) => {
    // Attempt to extract month/year from date, fallback to "Unknown"
    let month = "Unknown";
    if (q.date) {
      // e.g., 17/08/2026 -> 08/2026
      const parts = q.date.split('/');
      if (parts.length >= 2) {
        month = `${parts[1]}/${parts[parts.length-1]}`;
      }
    }
    
    if (!acc[month]) {
      acc[month] = { pm: 0, cm: 0, totalValue: 0 };
    }
    
    if (q.jobType === 'PM') acc[month].pm += 1;
    if (q.jobType === 'CM') acc[month].cm += 1;
    
    acc[month].totalValue += q.totalAmount;
    
    return acc;
  }, {} as Record<string, { pm: number, cm: number, totalValue: number }>);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Quotations Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">Track monthly quotations, win probabilities, and expected revenue.</p>
        </div>
        <button 
          onClick={loadQuotations}
          className="px-4 py-2 bg-white border border-slate-300 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-md flex items-start gap-3 border border-emerald-100">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Monthly Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(monthlyStats).map(([month, stats]: [string, any]) => (
              <div key={month} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-50 rounded-full opacity-50"></div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  Month: {month}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">PM Jobs</p>
                    <p className="text-2xl font-black text-blue-800">{stats.pm}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded border border-orange-100">
                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">CM Jobs</p>
                    <p className="text-2xl font-black text-orange-800">{stats.cm}</p>
                  </div>
                </div>
                
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-semibold">Total Quoted Value</span>
                    <span className="text-sm font-bold text-slate-700">{formatCurrency(stats.totalValue)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {Object.keys(monthlyStats).length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p>No quotation data found.</p>
                <p className="text-sm mt-1">Use the Quotation Reader to scan and save quotations.</p>
              </div>
            )}
          </div>

          {/* Quotation List */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-700 text-sm">Recent Quotations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Quotation No.</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Job Name</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Job Type</th>
                    <th className="px-4 py-3">Win Prob (%)</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotations.map((q) => (
                    <tr key={q.id || q.rowIndex} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">{q.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{q.quotationNumber}</td>
                      <td className="px-4 py-3 max-w-[150px] truncate" title={q.customerName}>{q.customerName}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate" title={q.jobName}>{q.jobName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(q.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <select 
                          value={q.jobType}
                          onChange={(e) => handleJobTypeChangeLocally(q.rowIndex, e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="PM">PM</option>
                          <option value="CM">CM</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="0" max="100"
                            value={q.winRate}
                            onChange={(e) => handleWinRateChangeLocally(q.rowIndex, e.target.value)}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-slate-500">%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => handleUpdateWinRate(q.rowIndex, q.winRate, q.jobType)}
                          disabled={updatingRowIndex === q.rowIndex}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {updatingRowIndex === q.rowIndex ? 'Saving...' : 'Update'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {quotations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No quotations recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
