const fs = require('fs');

let code = fs.readFileSync('src/components/JobTracker.tsx', 'utf8');

// Import XLSX
if (!code.includes("import * as XLSX from 'xlsx';")) {
  code = code.replace(
    "import React, { useState, useMemo, useEffect } from 'react';",
    "import React, { useState, useMemo, useEffect } from 'react';\nimport * as XLSX from 'xlsx';"
  );
}

// Replace handleExportCSV with handleExportExcel
const csvExportStart = '  const handleExportCSV = () => {';
const csvExportEndPattern = "document.body.appendChild(link);\n    link.click();\n    document.body.removeChild(link);\n  };";

const startIndex = code.indexOf(csvExportStart);
const endIndex = code.indexOf(csvExportEndPattern, startIndex) + csvExportEndPattern.length;

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find CSV export function boundaries");
  process.exit(1);
}

const excelExportFn = `  const handleExportExcel = () => {
    // Define rows mapping precisely to ServiceJob model fields
    const data = filteredJobs.map(job => ({
      'Job Number': job.jobNumber || '',
      'Call Date': job.callDate || '',
      'Job Status': job.jobStatus || '',
      'PM Cycle': job.pmCycle || '',
      'Job Type': job.jobType || '',
      'PM Times/Total': job.pmTimesTotal || '',
      'Hospital Name': job.hospitalName || '',
      'Department': job.department || '',
      'Equipment Name': job.equipmentName || '',
      'Serial Number': job.serialNumber || '',
      'Equipment Type': job.equipmentType || '',
      'Problem Description': job.problemDescription || '',
      'Safety Q1': job.safetyQ1 || '',
      'Safety Q2': job.safetyQ2 || '',
      'Customer Name': job.customerName || '',
      'Customer Phone': job.customerPhone || '',
      'Building/Floor': job.buildingFloor || '',
      'Engineer Name': [job.engineerName, job.engineer2, job.engineer3, job.engineer4].filter(e => e && e !== '-- Select --').join(', '),
      'Service Date': job.serviceDate || '',
      'Warranty Status': job.warrantyStatus || '',
      'Remark': job.remark || '',
      'Document Status': job.documentStatus || '',
      'Revenue (THB)': job.revenue || 0,
      'Cost (THB)': job.cost || 0,
      'Net Profit (THB)': (job.revenue || 0) - (job.cost || 0)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add column widths for better readability
    const wscols = [
      { wch: 15 }, // Job Number
      { wch: 12 }, // Call Date
      { wch: 12 }, // Job Status
      { wch: 10 }, // PM Cycle
      { wch: 10 }, // Job Type
      { wch: 15 }, // PM Times/Total
      { wch: 25 }, // Hospital Name
      { wch: 15 }, // Department
      { wch: 20 }, // Equipment Name
      { wch: 20 }, // Serial Number
      { wch: 15 }, // Equipment Type
      { wch: 40 }, // Problem Description
      { wch: 15 }, // Safety Q1
      { wch: 15 }, // Safety Q2
      { wch: 20 }, // Customer Name
      { wch: 15 }, // Customer Phone
      { wch: 15 }, // Building/Floor
      { wch: 30 }, // Engineer Name
      { wch: 12 }, // Service Date
      { wch: 15 }, // Warranty Status
      { wch: 30 }, // Remark
      { wch: 15 }, // Document Status
      { wch: 15 }, // Revenue
      { wch: 15 }, // Cost
      { wch: 15 }  // Net Profit
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Service Jobs");

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, \`Service_Jobs_Export_\${timestamp}.xlsx\`);
  };`;

code = code.substring(0, startIndex) + excelExportFn + code.substring(endIndex);

// Update button onClick and label
code = code.replace(/onClick=\{handleExportCSV\}/g, 'onClick={handleExportExcel}');
code = code.replace(/title="Export current filtered view to CSV for Excel"/g, 'title="Export current filtered view to Excel"');
code = code.replace(/<span>Export CSV<\/span>/g, '<span>Export Excel</span>');

fs.writeFileSync('src/components/JobTracker.tsx', code);
console.log("Successfully replaced CSV export with Excel export.");
