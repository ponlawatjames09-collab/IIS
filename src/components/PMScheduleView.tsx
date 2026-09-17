import React, { useState, useEffect, useRef } from 'react';
import { PMScheduleItem, SystemSettings, ServiceJob } from '../types';
import { fetchPMScheduleRecords, fetchYearlyJobs } from '../sheetsService';
import { RefreshCw, CalendarDays, AlertCircle, FileSpreadsheet, Search, Loader2, List, Calendar as CalendarIcon, X, ChevronDown } from 'lucide-react';
import PMCalendarView from './PMCalendarView';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PMScheduleViewProps {
  settings: SystemSettings;
  accessToken: string | null;
  yearlyJobs?: ServiceJob[];
  onOpenPMJob?: (hospitalName: string, model: string, sn: string, pmCycle: string, iteration: string, totalPMs?: string, product?: string) => void;
}

export default function PMScheduleView({ settings, accessToken, onOpenPMJob, yearlyJobs }: PMScheduleViewProps) {
  const targetSpreadsheetId = settings.pmSpreadsheetId || settings.spreadsheetId;
  const [records, setRecords] = useState<PMScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState<'list' | 'calendar'>('list');
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'short' });

  const [filterYear, setFilterYear] = useState<string>(currentYear);
  const [filterMonth, setFilterMonth] = useState<string>(currentMonth);
  const [filterEquipment, setFilterEquipment] = useState<string>('All');
  const [filterContract, setFilterContract] = useState<string>('All');
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [searchHospital, setSearchHospital] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  

  const loadRecords = async () => {
    if (!targetSpreadsheetId || !accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const scheduleData = await fetchPMScheduleRecords(targetSpreadsheetId, accessToken);
      setRecords(scheduleData);
    } catch (err: any) {
      if (err.message && err.message.includes('401')) { setError('Session expired. Please sign out and sign in again.'); } else { setError(err.message || 'Failed to load PM schedules.'); }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [settings.spreadsheetId, settings.pmSpreadsheetId, accessToken]);

  const uniqueHospitals = Array.from(new Set(records.map(r => r.hospitalName))).filter(Boolean).sort() as string[];
  const filteredHospitals = uniqueHospitals.filter(h => h.toLowerCase().includes(searchHospital.toLowerCase()));
  const uniqueYears = Array.from(new Set(records.map(r => r.year))).filter(Boolean).sort();
  const uniqueContracts = Array.from(new Set(records.map(r => r.warrantyType))).filter(Boolean).sort();
  const uniqueRegions = Array.from(new Set(records.map(r => r.region))).filter(Boolean).sort();
  const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const isJobOpened = (r: PMScheduleItem) => {
    if (!yearlyJobs || yearlyJobs.length === 0) return false;
    
    // Map month names to numbers for PM Cycle matching
    const monthNumMap: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const rMonthNum = monthNumMap[r.month] || '01';
    const expectedPmCycle = `${rMonthNum}/${r.year}`;

    return yearlyJobs.some(job => {
      const type = job.jobType ? job.jobType.trim().toUpperCase() : '';
      if (!type.includes('PM') && type !== 'IB') return false; // Match any jobType containing 'PM' like 'PM(Contract) 2/3'
      
      if (!job.serialNumber || !r.sn) return false;
      
      const snMatch = job.serialNumber.replace(/\s+/g, '').toLowerCase() === r.sn.replace(/\s+/g, '').toLowerCase();
      if (!snMatch) return false;
      
      const hospitalMatch = (job.hospitalName || '').trim().toLowerCase() === (r.hospitalName || '').trim().toLowerCase();
      if (!hospitalMatch) return false;

      // Check if pmCycle matches the expected month/year of the PM schedule
            if (job.pmCycle) {
        const cycle = job.pmCycle.trim();
        const noZeroMonth = parseInt(rMonthNum, 10).toString();
        const shortYear = r.year.length === 4 ? r.year.substring(2) : r.year;
        
        if (cycle === expectedPmCycle || 
            cycle === `${noZeroMonth}/${r.year}` || 
            cycle === `${rMonthNum}/${shortYear}` ||
            cycle === `${noZeroMonth}/${shortYear}`) {
          return true;
        }
      }
      
      return false;
    });
  };

  const filteredRecords = records.filter(r => {
    if (filterYear !== 'All' && r.year !== filterYear) return false;
    if (filterMonth !== 'All' && r.month !== filterMonth) return false;
    if (filterEquipment !== 'All') {
      if (filterEquipment === 'C-Arm' && r.equipmentCategory !== 'C-Arm') return false;
      if (filterEquipment === 'Ultrasound' && r.equipmentCategory !== 'Ultrasound') return false;
    }
    if (filterContract !== 'All' && r.warrantyType !== filterContract) return false;
    if (filterRegion !== 'All' && r.region !== filterRegion) return false;
    if (searchHospital && !r.hospitalName.toLowerCase().includes(searchHospital.toLowerCase())) return false;
    
    // Hide opened PMs
    if (isJobOpened(r)) return false;

    return true;
  });

  
  const hospitalProgress = React.useMemo(() => {
    const baseRecords = records.filter(r => {
      if (filterYear !== 'All' && r.year !== filterYear) return false;
      if (filterMonth !== 'All' && r.month !== filterMonth) return false;
      if (filterEquipment !== 'All') {
        if (filterEquipment === 'C-Arm' && r.equipmentCategory !== 'C-Arm') return false;
        if (filterEquipment === 'Ultrasound' && r.equipmentCategory !== 'Ultrasound') return false;
      }
      if (filterContract !== 'All' && r.warrantyType !== filterContract) return false;
      if (filterRegion !== 'All' && r.region !== filterRegion) return false;
      if (searchHospital && !r.hospitalName.toLowerCase().includes(searchHospital.toLowerCase())) return false;
      return true;
    });

    const progressMap: Record<string, { hospital: string, total: number, completed: number }> = {};
    baseRecords.forEach(r => {
      const h = r.hospitalName || 'Unknown';
      if (!progressMap[h]) {
        progressMap[h] = { hospital: h, total: 0, completed: 0 };
      }
      progressMap[h].total++;
      
      const opened = isJobOpened(r);

      if (opened) {
        progressMap[h].completed++;
      }
    });

    return Object.values(progressMap).sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        return (b.completed / b.total) - (a.completed / a.total);
    });
  }, [records, yearlyJobs, filterYear, filterMonth, filterEquipment, filterContract, filterRegion, searchHospital]);

  const chartData = monthsOrder.map(month => {
    // If the user selected a specific month and year, we should just show the distribution for the selected year and month,
    // but typically a chart shows all months. If year is selected, we group by month for that year.
    // If we filtered out all other months, the chart will only have one bar.
    // To make the chart more useful, we'll calculate chart data based on the records filtered by year, equipment, contract and search,
    // BUT ignoring the month filter so the chart always shows the full year's distribution.
    const recordsForChart = records.filter(r => {
      if (filterYear !== 'All' && r.year !== filterYear) return false;
      if (filterEquipment !== 'All') {
        if (filterEquipment === 'C-Arm' && r.equipmentCategory !== 'C-Arm') return false;
        if (filterEquipment === 'Ultrasound' && r.equipmentCategory !== 'Ultrasound') return false;
      }
      if (filterContract !== 'All' && r.warrantyType !== filterContract) return false;
      if (filterRegion !== 'All' && r.region !== filterRegion) return false;
      if (searchHospital && !r.hospitalName.toLowerCase().includes(searchHospital.toLowerCase())) return false;
      
      // Hide opened PMs from chart as well to show remaining PMs
      if (isJobOpened(r)) return false;
      
      return true;
    });

    const monthRecords = recordsForChart.filter(r => r.month === month);
    return {
      name: month,
      'C-Arm': monthRecords.filter(r => r.equipmentCategory === 'C-Arm').length,
      'Ultrasound': monthRecords.filter(r => r.equipmentCategory === 'Ultrasound').length,
    };
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 relative rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-white border-b border-slate-200 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded">
              <CalendarDays className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">PM Schedule</h2>
              <p className="text-xs text-slate-500 font-medium">Monthly Maintenance Planning</p>
            </div>
          </div>
          
          <div className="hidden sm:flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setDisplayMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${displayMode === 'list' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setDisplayMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${displayMode === 'calendar' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar View</span>
            </button>
          </div>
        </div>
        <button 
          onClick={loadRecords} 
          disabled={isLoading || !accessToken}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white border-b border-slate-200 px-2 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center gap-4 shrink-0">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Year</label>
          <select 
            value={filterYear} 
            onChange={e => setFilterYear(e.target.value)}
            className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 w-24"
          >
            <option value="All">All Years</option>
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Month</label>
          <select 
            value={filterMonth} 
            onChange={e => setFilterMonth(e.target.value)}
            className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 w-28"
          >
            <option value="All">All Months</option>
            {monthsOrder.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Equipment Type</label>
          <select 
            value={filterEquipment} 
            onChange={e => setFilterEquipment(e.target.value)}
            className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 w-32"
          >
            <option value="All">All Types</option>
            <option value="C-Arm">C-Arm</option>
            <option value="Ultrasound">Ultrasound</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Region</label>
          <select 
            value={filterRegion} 
            onChange={e => setFilterRegion(e.target.value)}
            className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 w-32"
          >
            <option value="All">All Regions</option>
            {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Contract Type</label>
          <select 
            value={filterContract} 
            onChange={e => setFilterContract(e.target.value)}
            className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 w-40"
          >
            <option value="All">All Contracts</option>
            {uniqueContracts.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px] relative" ref={dropdownRef}>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Search Hospital</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
            <input 
              type="text" 
              placeholder="Search or select hospital..." 
              value={searchHospital}
              onChange={e => {
                setSearchHospital(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
            />
            {searchHospital ? (
              <button 
                onClick={() => { setSearchHospital(''); setIsDropdownOpen(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto py-1">
              {filteredHospitals.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 text-center italic">No hospitals found</div>
              ) : (
                filteredHospitals.map(h => (
                  <div 
                    key={h}
                    className={`px-3 py-2 text-xs cursor-pointer transition-colors ${searchHospital === h ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                    onClick={() => {
                      setSearchHospital(h);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {h}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded text-sm flex items-start gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-sm text-slate-500 font-medium">Extracting PM schedules from sheets...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 bg-white border border-slate-200 border-dashed rounded-lg text-slate-400">
            <FileSpreadsheet className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">No PM records found for the selected filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Total PM Due</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-blue-700 leading-none">{filteredRecords.length}</span>
                  <span className="text-xs font-semibold text-slate-400 mb-1">Machines</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">C-Arm Contract</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-indigo-700 leading-none">
                    {filteredRecords.filter(r => r.equipmentCategory === 'C-Arm').length}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 mb-1">Machines</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Ultrasound Contract</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-teal-700 leading-none">
                    {filteredRecords.filter(r => r.equipmentCategory === 'Ultrasound').length}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 mb-1">Machines</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm h-72 flex flex-col">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-4 shrink-0">Monthly PM Distribution (Remaining)</p>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                      <Bar dataKey="C-Arm" stackId="a" fill="#4338ca" radius={[0, 0, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="Ultrasound" stackId="a" fill="#0f766e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded p-4 shadow-sm h-72 flex flex-col">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-4 shrink-0">Hospital PM Progress</p>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {hospitalProgress.map((hp: any) => (
                    <div key={hp.hospital}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700 truncate mr-2" title={hp.hospital}>{hp.hospital}</span>
                        <span className="font-semibold text-slate-500 whitespace-nowrap">{hp.completed} / {hp.total} ({(hp.completed / hp.total * 100).toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                           className={`h-full rounded-full ${hp.completed === hp.total ? 'bg-emerald-500' : 'bg-blue-500'}`}
                           style={{ width: `${Math.max(0, Math.min(100, (hp.completed / hp.total) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {hospitalProgress.length === 0 && (
                     <div className="text-xs text-slate-400 h-full flex items-center justify-center">No data available</div>
                  )}
                </div>
              </div>
            </div>

            {displayMode === 'list' ? (
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex-1 flex flex-col min-h-[300px]">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-20 bg-slate-50">
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <th className="px-2 sm:px-4 py-2 sm:py-3">Month-Year</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3">Hospital</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3">SN / Model</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center hidden sm:table-cell">Iteration</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">Region</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">Contract Info</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 hidden xl:table-cell">Warranty Info</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 hidden xl:table-cell">Source Sheet</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-20">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="font-semibold text-slate-700">{r.month} {r.year}</div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-slate-800">
                          {r.hospitalName}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="text-blue-700 font-medium">{r.sn}</div>
                          <div className="text-slate-500 text-[10px]">{r.model}</div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center hidden sm:table-cell">
                          <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold text-[10px]">
                            {r.iteration}{r.pmTimesTotal ? ` / ${r.pmTimesTotal}` : ''}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            {r.region || '-'}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">
                          <div className="font-semibold text-slate-700 truncate max-w-[200px]" title={r.warrantyType}>{r.warrantyType || '-'}</div>
                          <div className="text-slate-500 text-[10px] truncate max-w-[200px]" title={r.paymentCondition}>{r.paymentCondition || '-'}</div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 hidden xl:table-cell">
                          <div className="font-semibold text-slate-700 truncate max-w-[200px]" title={r.warrantyPeriod}>{r.warrantyPeriod || '-'}</div>
                          <div className="text-slate-500 text-[10px] truncate max-w-[200px]" title={r.warrantyExpiry}>{r.warrantyExpiry || '-'}</div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-400 text-[10px] hidden xl:table-cell">
                          {r.sheetName}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center sticky right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors z-10">
                          <button
                              onClick={() => {
                                if (!onOpenPMJob) return;
                                const monthNumMap: Record<string, string> = {
                                  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                                  'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                                };
                                const rMonthNum = monthNumMap[r.month] || '01';
                                const expectedPmCycle = `${rMonthNum}/${r.year}`;
                                
                                let product = "";
                                if (r.sheetName.includes('C-Arm') || r.equipmentCategory === 'C-Arm') product = "C-ARM";
                                else if (r.sheetName.includes('Ultrasound') || r.equipmentCategory === 'Ultrasound') product = "US";
                                
                                onOpenPMJob(r.hospitalName, r.model, r.sn, expectedPmCycle, r.iteration, r.pmTimesTotal, product);
                              }}
                              className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded border border-blue-200 transition-colors text-[10px] font-bold shadow-3xs"
                              title="Open PM Job"
                            >ตรวจเช็ค PM</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <PMCalendarView 
               records={filteredRecords} 
               monthsOrder={monthsOrder}
               filterYear={filterYear}
               filterMonth={filterMonth}
            />
          )}
          </div>
        )}
      </div>
    </div>
  );
}
