import React, { useState, useMemo } from 'react';
import { PMScheduleItem } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Wrench } from 'lucide-react';

interface PMCalendarViewProps {
  records: PMScheduleItem[];
  monthsOrder: string[];
  filterYear: string;
  filterMonth: string;
}

export default function PMCalendarView({ records, monthsOrder, filterYear, filterMonth }: PMCalendarViewProps) {
  const [view, setView] = useState<'month' | 'week'>('month');
  
  // Always use a valid year for calendar math
  const currentYear = new Date().getFullYear();
  const yearToUse = filterYear !== 'All' ? parseInt(filterYear, 10) : currentYear;
  
  // If month is 'All', default to current month or January
  const currentMonthIdx = new Date().getMonth();
  const monthToUseStr = filterMonth !== 'All' ? filterMonth : monthsOrder[currentMonthIdx];
  const monthIdxToUse = monthsOrder.indexOf(monthToUseStr) !== -1 ? monthsOrder.indexOf(monthToUseStr) : currentMonthIdx;

  const [currentDate, setCurrentDate] = useState(new Date(yearToUse, monthIdxToUse, 1));

  // Sync date when filters change
  React.useEffect(() => {
    const y = filterYear !== 'All' ? parseInt(filterYear, 10) : currentDate.getFullYear();
    const m = filterMonth !== 'All' ? monthsOrder.indexOf(filterMonth) : currentDate.getMonth();
    if (y !== currentDate.getFullYear() || m !== currentDate.getMonth()) {
      setCurrentDate(new Date(y, m !== -1 ? m : 0, 1));
    }
  }, [filterYear, filterMonth, monthsOrder]);

  const getConsistentDay = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 28 + 1; // 1-28 to be safe for all months
  };

  const parseDeadline = (expiryStr: string | undefined): Date | null => {
    if (!expiryStr) return null;
    const parts = expiryStr.split(/[\/\-]/);
    if (parts.length === 3) {
      // assume DD/MM/YYYY or YYYY-MM-DD
      if (parts[0].length === 4) {
        return new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
      } else {
        return new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
      }
    }
    return null;
  };

  const events = useMemo(() => {
    const evts: any[] = [];
    records.forEach((r, idx) => {
      const y = parseInt(r.year, 10) || currentYear;
      const m = monthsOrder.indexOf(r.month);
      if (m !== -1) {
        const day = getConsistentDay(r.hospitalName + r.sn);
        evts.push({
          id: `pm-${idx}`,
          title: `PM: ${r.hospitalName}`,
          date: new Date(y, m, day),
          type: 'pm',
          record: r
        });
      }

      const deadlineDate = parseDeadline(r.warrantyExpiry);
      if (deadlineDate && !isNaN(deadlineDate.getTime())) {
         evts.push({
            id: `dl-${idx}`,
            title: `Warranty Exp: ${r.hospitalName}`,
            date: deadlineDate,
            type: 'deadline',
            record: r
         });
      }
    });
    return evts;
  }, [records, monthsOrder, currentYear]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    }
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-slate-50 border border-slate-100 min-h-[100px]"></div>);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const dayEvents = events.filter(e => e.date.getDate() === d && e.date.getMonth() === month && e.date.getFullYear() === year);
      
      days.push(
        <div key={d} className="bg-white border border-slate-100 min-h-[100px] p-1 flex flex-col group hover:bg-slate-50 transition-colors">
          <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${new Date().toDateString() === dayDate.toDateString() ? 'bg-blue-600 text-white' : 'text-slate-500 group-hover:text-slate-800'}`}>
            {d}
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {dayEvents.map(e => (
              <div key={e.id} className={`text-[9px] font-medium p-1 rounded truncate border ${e.type === 'pm' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`} title={`${e.title} - ${e.record.model}`}>
                {e.type === 'pm' ? <Wrench className="w-2.5 h-2.5 inline mr-1" /> : <Clock className="w-2.5 h-2.5 inline mr-1 text-rose-500" />}
                {e.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-slate-200 border-t border-slate-200 flex-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center py-2">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const dayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const isToday = new Date().toDateString() === dayDate.toDateString();
      
      const dayEvents = events.filter(e => e.date.getDate() === dayDate.getDate() && e.date.getMonth() === dayDate.getMonth() && e.date.getFullYear() === dayDate.getFullYear());

      days.push(
        <div key={i} className="flex-1 bg-white border border-slate-100 flex flex-col">
          <div className={`py-2 text-center border-b ${isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
              {dayDate.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-bold mt-0.5 ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
              {dayDate.getDate()}
            </div>
          </div>
          <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[300px]">
            {dayEvents.map(e => (
              <div key={e.id} className={`p-2 rounded border shadow-sm ${e.type === 'pm' ? 'bg-blue-50 border-blue-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${e.type === 'pm' ? 'text-blue-600' : 'text-rose-600'}`}>
                  {e.type === 'pm' ? <Wrench className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {e.type === 'pm' ? 'Scheduled PM' : 'Warranty Deadline'}
                </div>
                <div className="text-xs font-bold text-slate-800">{e.record.hospitalName}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Model: {e.record.model}</div>
                <div className="text-[10px] text-slate-600">S/N: <span className="font-mono">{e.record.sn}</span></div>
              </div>
            ))}
            {dayEvents.length === 0 && (
              <div className="text-xs text-slate-400 text-center mt-4">No events</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-1">
        {days}
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex-1 min-h-[500px]">
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-sm text-slate-700">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {view === 'week' && ` (Week of ${currentDate.getDate()})`}
          </h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-200 rounded p-0.5">
            <button 
              onClick={() => setView('month')}
              className={`px-3 py-1 text-xs font-bold rounded ${view === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-3 py-1 text-xs font-bold rounded ${view === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Week
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <button onClick={handlePrev} className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded transition-colors">
              Today
            </button>
            <button onClick={handleNext} className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {view === 'month' ? renderMonthView() : renderWeekView()}
      </div>
    </div>
  );
}
