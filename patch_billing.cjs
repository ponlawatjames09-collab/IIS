const fs = require('fs');
let code = fs.readFileSync('src/components/BillingSummary.tsx', 'utf8');

const getMonthCode = `
const getMonthString = (dateStr: string) => {
  if (!dateStr) return 'Unknown';
  const parts = dateStr.split(/[\\/-]/);
  if (parts.length >= 3) {
    if (dateStr.includes('-')) {
      return \`\${parts[1]}/\${parts[0]}\`;
    } else {
      let y = parts[2];
      if (y.length === 2) y = "20" + y;
      return \`\${parts[1]}/\${y}\`;
    }
  }
  return 'Unknown';
};
`;

const stateCode = `  const [activeTab, setActiveTab] = useState<'pending' | 'billed'>('pending');
  const [expandedHospitals, setExpandedHospitals] = useState<Record<string, boolean>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>('All');`;

const newCode = `  const [activeTab, setActiveTab] = useState<'pending' | 'billed'>('pending');
  const [expandedHospitals, setExpandedHospitals] = useState<Record<string, boolean>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>('All');

  ${getMonthCode}

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
`;

code = code.replace(`  const [activeTab, setActiveTab] = useState<'pending' | 'billed'>('pending');
  const [expandedHospitals, setExpandedHospitals] = useState<Record<string, boolean>>({});

  const pendingJobs = useMemo(() => {
    return jobs.filter(job => job.billingStatus === 'ยังไม่ได้วางบิล');
  }, [jobs]);

  const billedJobs = useMemo(() => {
    return jobs.filter(job => job.billingStatus === 'วางบิลเรียบร้อยแล้ว');
  }, [jobs]);`, newCode);


const uiHeaderOld = `      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Billing & Revenue Summary
          </h2>
          <p className="text-sm text-slate-500 mt-1">Track expected and collected revenue across hospitals.</p>
        </div>
      </div>`;

const uiHeaderNew = `      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Billing & Revenue Summary
          </h2>
          <p className="text-sm text-slate-500 mt-1">Track expected and collected revenue across hospitals.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-300 rounded-md shadow-sm">
          <label className="text-xs font-bold text-slate-600 uppercase">Month:</label>
          <select 
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="text-sm border-none bg-transparent focus:ring-0 text-slate-800 font-semibold cursor-pointer outline-none"
          >
            <option value="All">All Months</option>
            {allMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>`;

code = code.replace(uiHeaderOld, uiHeaderNew);

fs.writeFileSync('src/components/BillingSummary.tsx', code);
console.log('Patched BillingSummary');
