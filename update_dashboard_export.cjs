const fs = require('fs');

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Import XLSX
if (!code.includes("import * as XLSX from 'xlsx';")) {
  code = code.replace(
    "import React, { useMemo } from 'react';",
    "import React, { useMemo } from 'react';\nimport * as XLSX from 'xlsx';"
  );
}

// Replace handleExportCSV with handleExportExcel
const csvExportStart = '  const handleExportCSV = () => {';
const csvExportEndPattern = "document.body.appendChild(link);\n    link.click();\n    document.body.removeChild(link);\n  };";

const startIndex = code.indexOf(csvExportStart);
const endIndex = code.indexOf(csvExportEndPattern, startIndex) + csvExportEndPattern.length;

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find CSV export boundaries in Dashboard");
  process.exit(1);
}

const excelExportFn = `  const handleExportExcel = () => {
    if (jobs.length === 0) return;
    
    const data = jobs.map(job => ({
      'Job Number': job.jobNumber || '',
      'Call Date': job.callDate || '',
      'Status': job.jobStatus || '',
      'Job Type': job.jobType || '',
      'Hospital': job.hospitalName || '',
      'Department': job.department || '',
      'Equipment': job.equipmentName || '',
      'Serial Number': job.serialNumber || '',
      'Problem': job.problemDescription || '',
      'Engineer': job.engineerName || '',
      'Service Date': job.serviceDate || '',
      'Warranty': job.warrantyStatus || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    const wscols = [
      { wch: 15 }, // Job Number
      { wch: 12 }, // Call Date
      { wch: 12 }, // Status
      { wch: 12 }, // Job Type
      { wch: 25 }, // Hospital
      { wch: 15 }, // Department
      { wch: 20 }, // Equipment
      { wch: 20 }, // Serial Number
      { wch: 30 }, // Problem
      { wch: 20 }, // Engineer
      { wch: 12 }, // Service Date
      { wch: 15 }  // Warranty
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dashboard Jobs");

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, \`Dashboard_Export_\${timestamp}.xlsx\`);
  };`;

code = code.substring(0, startIndex) + excelExportFn + code.substring(endIndex);

// Update button onClick and label
code = code.replace(/onClick=\{handleExportCSV\}/g, 'onClick={handleExportExcel}');
code = code.replace(/<span>Export CSV<\/span>/g, '<span>Export Excel</span>');

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Successfully replaced CSV export with Excel export in Dashboard.");
