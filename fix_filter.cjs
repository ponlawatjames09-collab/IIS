const fs = require('fs');
let code = fs.readFileSync('src/components/DispatchCalendarView.tsx', 'utf8');

const oldLogic = `      const engineerJobCounts = dayEvents.reduce((acc, curr) => {
        if (curr.engineer) {
          acc[curr.engineer] = (acc[curr.engineer] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      days.push(`;

const newLogic = `      const engineerJobCounts = dayEvents.reduce((acc, curr) => {
        if (curr.engineer) {
          acc[curr.engineer] = (acc[curr.engineer] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const filteredDayEvents = filterEngineer === 'All' ? dayEvents : dayEvents.filter(r => r.engineer === filterEngineer);
      
      days.push(`;

code = code.replace(oldLogic, newLogic);

code = code.replace(
  "{dayEvents.map(e => (",
  "{filteredDayEvents.map(e => ("
);

fs.writeFileSync('src/components/DispatchCalendarView.tsx', code);
console.log("Fixed filter");
