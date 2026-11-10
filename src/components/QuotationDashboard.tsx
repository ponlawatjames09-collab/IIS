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

  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');
  const [selectedJobTypeFilter, setSelectedJobTypeFilter] = useState<'ALL' | 'CM' | 'PM'>('ALL');

  const extractMonthYear = (dateStr?: string, fallbackText?: string): { key: string; sortKey: number } => {
    const raw = String(dateStr || '').trim();
    const normalizeYr = (yRaw: number): number => {
      if (yRaw > 2400) return yRaw - 543;
      if (yRaw < 100) return yRaw >= 60 ? (yRaw + 2500) - 543 : 2000 + yRaw;
      return yRaw;
    };

    const build = (m: number, yRaw: number) => {
      if (m < 1 || m > 12) return null;
      const y = normalizeYr(yRaw);
      const mm = String(m).padStart(2, '0');
      return { key: `${mm}/${y}`, sortKey: y * 100 + m };
    };

    if (raw) {
      const iso = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
      if (iso) {
        const res = build(parseInt(iso[2], 10), parseInt(iso[1], 10));
        if (res) return res;
      }

      const dmy = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
      if (dmy) {
        const p0 = parseInt(dmy[1], 10);
        const p1 = parseInt(dmy[2], 10);
        const p2 = parseInt(dmy[3], 10);
        const m = p0 > 12 ? p1 : p1 > 12 ? p0 : p1;
        const res = build(m, p2);
        if (res) return res;
      }

      const my = raw.match(/^(\d{1,2})[-/.](\d{4})$/);
      if (my) {
        const res = build(parseInt(my[1], 10), parseInt(my[2], 10));
        if (res) return res;
      }

      const thaiMonths: Array<{ keys: string[]; m: number }> = [
        { keys: ['มกราคม', 'ม.ค.', 'jan'], m: 1 },
        { keys: ['กุมภาพันธ์', 'ก.พ.', 'feb'], m: 2 },
        { keys: ['มีนาคม', 'มี.ค.', 'mar'], m: 3 },
        { keys: ['เมษายน', 'เม.ย.', 'apr'], m: 4 },
        { keys: ['พฤษภาคม', 'พ.ค.', 'may'], m: 5 },
        { keys: ['มิถุนายน', 'มิ.ย.', 'jun'], m: 6 },
        { keys: ['กรกฎาคม', 'ก.ค.', 'jul'], m: 7 },
        { keys: ['สิงหาคม', 'ส.ค.', 'aug'], m: 8 },
        { keys: ['กันยายน', 'ก.ย.', 'sep'], m: 9 },
        { keys: ['ตุลาคม', 'ต.ค.', 'oct'], m: 10 },
        { keys: ['พฤศจิกายน', 'พ.ย.', 'nov'], m: 11 },
        { keys: ['ธันวาคม', 'ธ.ค.', 'dec'], m: 12 }
      ];
      const low = raw.toLowerCase();
      for (const tm of thaiMonths) {
        if (tm.keys.some(k => low.includes(k))) {
          const yMatch = raw.match(/(\d{4})/) || raw.match(/(\d{2})$/);
          const yVal = yMatch ? parseInt(yMatch[1], 10) : 2026;
          const res = build(tm.m, yVal);
          if (res) return res;
        }
      }
    }

    if (fallbackText) {
      const qMatch = fallbackText.match(/20(2\d)[-_]?([01]\d)/);
      if (qMatch) {
        const res = build(parseInt(qMatch[2], 10), parseInt(`20${qMatch[1]}`, 10));
        if (res) return res;
      }
    }

    return { key: 'Unknown', sortKey: 0 };
  };

  type MonthlyStatEntry = { pm: number; cm: number; totalValue: number; cmValue: number; pmValue: number; sortKey: number };

  // Group by Month
  const monthlyStats = quotations.reduce<Record<string, MonthlyStatEntry>>((acc, q) => {
    const { key: month, sortKey } = extractMonthYear(q.date, `${q.quotationNumber || ''} ${q.fileName || ''}`);

    if (!acc[month]) {
      acc[month] = { pm: 0, cm: 0, totalValue: 0, cmValue: 0, pmValue: 0, sortKey };
    }

    if ((q.jobType || '').toUpperCase() === 'PM') {
      acc[month].pm += 1;
      acc[month].pmValue += q.totalAmount || 0;
    } else {
      acc[month].cm += 1;
      acc[month].cmValue += q.totalAmount || 0;
    }

    acc[month].totalValue += q.totalAmount || 0;

    return acc;
  }, {});

  const sortedMonthlyEntries: [string, MonthlyStatEntry][] = (Object.entries(monthlyStats) as [string, MonthlyStatEntry][]).sort(
    (a, b) => b[1].sortKey - a[1].sortKey
  );

  const filteredQuotations = quotations.filter(q => {
    const { key: mKey } = extractMonthYear(q.date, `${q.quotationNumber || ''} ${q.fileName || ''}`);
    if (selectedMonthFilter !== 'ALL' && mKey !== selectedMonthFilter) return false;
    if (selectedJobTypeFilter !== 'ALL' && (q.jobType || '').toUpperCase() !== selectedJobTypeFilter) return false;
    return true;
  });

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
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded px-3 py-1.5">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold text-slate-600">กรองเดือน:</span>
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">ทุกเดือน (All Months)</option>
              {sortedMonthlyEntries.map(([mKey, stats]) => (
                <option key={mKey} value={mKey}>
                  เดือน {mKey} (CM: {stats.cm}, PM: {stats.pm})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200">
            {(['ALL', 'CM', 'PM'] as const).map(type => (
              <button
                key={type}
                onClick={() => setSelectedJobTypeFilter(type)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  selectedJobTypeFilter === type
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'ALL' ? 'ทั้งหมด' : `เฉพาะ ${type}`}
              </button>
            ))}
          </div>

          <button 
            onClick={loadQuotations}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Refresh Data
          </button>
        </div>
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
          {/* Monthly Stats Cards (Clickable to filter by month) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedMonthlyEntries.map(([month, stats]: [string, any]) => {
              const isSelected = selectedMonthFilter === month;
              return (
                <div
                  key={month}
                  onClick={() => setSelectedMonthFilter(isSelected ? 'ALL' : month)}
                  className={`bg-white p-5 rounded-lg border transition-all cursor-pointer shadow-sm relative overflow-hidden ${
                    isSelected ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-indigo-600" />
                      Month: {month}
                    </h3>
                    <span className="text-[11px] font-semibold text-indigo-600">
                      {isSelected ? 'กำลังกรองเดือนนี้ (คลิกเพื่อดูทั้งหมด)' : 'คลิกเพื่อกรองเดือนนี้'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">PM Jobs</p>
                      <p className="text-2xl font-black text-blue-800">{stats.pm}</p>
                      <p className="text-[11px] font-mono text-blue-700 mt-0.5">{formatCurrency(stats.pmValue)}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded border border-orange-100">
                      <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">CM Jobs</p>
                      <p className="text-2xl font-black text-orange-800">{stats.cm}</p>
                      <p className="text-[11px] font-mono text-orange-700 mt-0.5">{formatCurrency(stats.cmValue)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-semibold">Total Quoted Value</span>
                      <span className="text-sm font-bold text-slate-700">{formatCurrency(stats.totalValue)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {sortedMonthlyEntries.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p>No quotation data found.</p>
                <p className="text-sm mt-1">Use the Quotation Reader to scan and save quotations.</p>
              </div>
            )}
          </div>

          {/* Quotation List */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm">
                รายการใบเสนอราคา ({selectedMonthFilter === 'ALL' ? 'ทุกเดือน' : `เดือน ${selectedMonthFilter}`}) — แสดง {filteredQuotations.length} รายการ
              </h3>
              {selectedMonthFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedMonthFilter('ALL')}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  ล้างตัวกรองเดือน (แสดงทั้งหมด)
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Month</th>
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
                  {filteredQuotations.map((q) => {
                    const mInfo = extractMonthYear(q.date, `${q.quotationNumber || ''} ${q.fileName || ''}`);
                    return (
                      <tr key={q.id || q.rowIndex} className="hover:bg-slate-50">
                        <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-indigo-700">{mInfo.key}</td>
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
                    );
                  })}
                  {filteredQuotations.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                        No quotations found for the selected filter.
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
