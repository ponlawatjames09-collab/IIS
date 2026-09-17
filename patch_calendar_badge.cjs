const fs = require('fs');

let code = fs.readFileSync('src/components/DispatchCalendarView.tsx', 'utf8');

const oldDayEventFilter = `      const dayEvents = records.filter(r => r.date === dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();`;

const newDayEventFilter = `      const dayEvents = records.filter(r => r.date === dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
      
      const engineerJobCounts = dayEvents.reduce((acc, curr) => {
        if (curr.engineer) {
          acc[curr.engineer] = (acc[curr.engineer] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);`;

code = code.replace(oldDayEventFilter, newDayEventFilter);

const oldNameRender = `                <div className="flex items-center gap-1 font-bold mb-0.5 truncate">
                  {e.status === 'Completed' ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <User className="w-3 h-3 shrink-0" />}
                  <span className="truncate">{e.engineer}</span>
                </div>`;

const newNameRender = `                <div className="flex items-center gap-1 font-bold mb-0.5 truncate">
                  {e.status === 'Completed' ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <User className="w-3 h-3 shrink-0" />}
                  <span className="truncate">{e.engineer}</span>
                  <span 
                    className={\`ml-auto shrink-0 text-[8px] font-bold px-1 py-0.5 rounded-sm leading-none \${e.status === 'Completed' ? 'bg-emerald-600/20 text-emerald-800' : 'bg-indigo-600/20 text-indigo-800'}\`}
                    title={\`\${engineerJobCounts[e.engineer]} jobs assigned today\`}
                  >
                    {engineerJobCounts[e.engineer]}
                  </span>
                </div>`;

code = code.replace(oldNameRender, newNameRender);

fs.writeFileSync('src/components/DispatchCalendarView.tsx', code);
console.log('Patched DispatchCalendarView with badge counts');
