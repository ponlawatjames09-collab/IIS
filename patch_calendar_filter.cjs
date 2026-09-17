const fs = require('fs');

let code = fs.readFileSync('src/components/DispatchCalendarView.tsx', 'utf8');

// 1. Add filter state
if (!code.includes('const [filterEngineer, setFilterEngineer]')) {
  code = code.replace(
    'const [isSaving, setIsSaving] = useState(false);',
    'const [isSaving, setIsSaving] = useState(false);\n  const [filterEngineer, setFilterEngineer] = useState<string>(\'All\');'
  );
}

// 2. Add filtering in renderMonthView
const oldRenderLogic = `      const engineerJobCounts = dayEvents.reduce((acc, curr) => {
        if (curr.engineer) {
          acc[curr.engineer] = (acc[curr.engineer] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      days.push(
        <div 
          key={d} 
          className="bg-white border border-slate-100 min-h-[80px] p-1 flex flex-col group hover:bg-indigo-50/30 transition-colors cursor-pointer"
          onClick={() => handleDayClick(year, month, d)}
        >
          <div className="flex justify-between items-start mb-1 px-1">
            <div className={\`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full \${isToday ? 'bg-indigo-600 text-white' : 'text-slate-500 group-hover:text-slate-800'}\`}>
              {d}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {dayEvents.map(e => (`;

const newRenderLogic = `      const engineerJobCounts = dayEvents.reduce((acc, curr) => {
        if (curr.engineer) {
          acc[curr.engineer] = (acc[curr.engineer] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const filteredDayEvents = filterEngineer === 'All' ? dayEvents : dayEvents.filter(r => r.engineer === filterEngineer);

      days.push(
        <div 
          key={d} 
          className="bg-white border border-slate-100 min-h-[80px] p-1 flex flex-col group hover:bg-indigo-50/30 transition-colors cursor-pointer"
          onClick={() => handleDayClick(year, month, d)}
        >
          <div className="flex justify-between items-start mb-1 px-1">
            <div className={\`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full \${isToday ? 'bg-indigo-600 text-white' : 'text-slate-500 group-hover:text-slate-800'}\`}>
              {d}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredDayEvents.map(e => (`;

code = code.replace(oldRenderLogic, newRenderLogic);

// 3. Add filter UI
const oldUI = `        <div className="flex items-center gap-3">
          {isLoading && <span className="text-xs font-semibold text-slate-500 animate-pulse">Syncing...</span>}
          <button 
            onClick={loadRecords}`;

const newUI = `        <div className="flex flex-wrap items-center justify-end gap-3">
          {isLoading && <span className="text-xs font-semibold text-slate-500 animate-pulse hidden sm:inline-block">Syncing...</span>}
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Filter:</span>
            <select
              value={filterEngineer}
              onChange={(e) => setFilterEngineer(e.target.value)}
              className="px-2 py-1.5 bg-white border border-slate-300 rounded text-sm font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Engineers</option>
              {settings.engineers.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={loadRecords}`;

code = code.replace(oldUI, newUI);

fs.writeFileSync('src/components/DispatchCalendarView.tsx', code);
console.log('Patched DispatchCalendarView with engineer filter');
