const fs = require('fs');

let code = fs.readFileSync('src/components/BillingSummary.tsx', 'utf8');

// Import XLSX
if (!code.includes("import * as XLSX from 'xlsx';")) {
  code = code.replace(
    "import React, { useMemo, useState } from 'react';",
    "import React, { useMemo, useState } from 'react';\nimport * as XLSX from 'xlsx';"
  );
}

// Replace handleExportCSV with handleExportExcel
const csvExportStart = '  const handleExportCSV = () => {';
const csvExportEndPattern = "document.body.appendChild(link);\n    link.click();\n    document.body.removeChild(link);\n  };";

const startIndex = code.indexOf(csvExportStart);
const endIndex = code.indexOf(csvExportEndPattern, startIndex) + csvExportEndPattern.length;

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find CSV export boundaries in BillingSummary");
  process.exit(1);
}

const excelExportFn = `  const handleExportExcel = () => {
    const data: any[] = [];
    
    summaryData.forEach(([hospital, hospitalData]) => {
      hospitalData.jobs.forEach(job => {
        data.push({
          'Hospital Name': hospital,
          'Job Number': job.jobNumber || '',
          'Job Type': job.jobType || '',
          'Warranty': job.warrantyStatus || '',
          'Call Date': job.callDate || '',
          'Amount (Revenue)': job.revenue || 0
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    const wscols = [
      { wch: 30 }, // Hospital Name
      { wch: 15 }, // Job Number
      { wch: 15 }, // Job Type
      { wch: 15 }, // Warranty
      { wch: 12 }, // Call Date
      { wch: 15 }  // Amount
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Billing Summary");

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, \`Billing_Summary_\${timestamp}.xlsx\`);
  };`;

code = code.substring(0, startIndex) + excelExportFn + code.substring(endIndex);

// Update button onClick and label
code = code.replace(/onClick=\{handleExportCSV\}/g, 'onClick={handleExportExcel}');
code = code.replace(/<span>Export CSV<\/span>/g, '<span>Export Excel</span>');

fs.writeFileSync('src/components/BillingSummary.tsx', code);
console.log("Successfully replaced CSV export with Excel export in BillingSummary.");
