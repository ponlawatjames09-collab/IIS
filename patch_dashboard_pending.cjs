const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const useMemoBlock = `
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
        const snMatch = job.serialNumber.replace(/\\s+/g, '').toLowerCase() === r.sn.replace(/\\s+/g, '').toLowerCase();
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
`;

code = code.replace(
  "const yearlyPmStats = useMemo(() => {",
  `${useMemoBlock}\n  const yearlyPmStats = useMemo(() => {`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Dashboard pending PMs patched.");
