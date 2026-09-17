const fs = require('fs');

let code = fs.readFileSync('src/components/JobTracker.tsx', 'utf8');

// Reverse filteredJobs in place OR just add .sort before assigning
const oldFilter = `  const filteredJobs = jobs.filter((job, idx) => {`;

const newFilter = `  const parseDateToMs = (dateStr: string) => {
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

  const filteredJobs = jobs.filter((job, idx) => {`;

code = code.replace(oldFilter, newFilter);

const oldSort = `    return matchesSearch && matchesType && matchesStatus && matchesHospital && matchesEngineer && matchesWarranty && matchesBilling && matchesDate;
  });`;

const newSort = `    return matchesSearch && matchesType && matchesStatus && matchesHospital && matchesEngineer && matchesWarranty && matchesBilling && matchesDate;
  }).sort((a, b) => parseDateToMs(b.callDate) - parseDateToMs(a.callDate));`;

code = code.replace(oldSort, newSort);

fs.writeFileSync('src/components/JobTracker.tsx', code);
console.log('Patched JobTracker sorting');
