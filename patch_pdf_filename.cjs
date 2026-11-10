const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

code = code.replace(
  "\`Service_Job_\${job.jobNumber}_Worksheet.pdf\`",
  "\`Service_Job_\${job.jobNumber}_\${job.serviceDate || job.callDate}.pdf\`"
);

fs.writeFileSync('src/components/JobPDFModal.tsx', code);
console.log("JobPDFModal filename patched.");
