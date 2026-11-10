const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

// The travel row
code = code.replace(
  '<td className="border-r border-black-safe">12:00</td>\\n                    <td className="border-r border-black-safe">13:00</td>',
  '<td className="border-r border-black-safe">{job.travelTimeStart || \'\'}</td>\\n                    <td className="border-r border-black-safe">{job.travelTimeStop || \'\'}</td>'
);

// The process row
code = code.replace(
  '<td className="border-r border-black-safe">14:30</td>\\n                    <td className="border-r border-black-safe">15:30</td>',
  '<td className="border-r border-black-safe">{job.processTimeStart || \'\'}</td>\\n                    <td className="border-r border-black-safe">{job.processTimeStop || \'\'}</td>'
);

code = code.replace(
  '<td className="border-r border-black-safe">Check System.</td>',
  '<td className="border-r border-black-safe text-[9px] leading-[1.1] p-0.5">{job.processDescription || (job.jobType === \'PM\' ? \'PM, Performance test, Cleaning.\' : \'Check System.\')}</td>'
);

// The exact string replacement might fail due to spaces. Let's use regex.
code = code.replace(
  /<td className="border-r border-black-safe">12:00<\/td>\s*<td className="border-r border-black-safe">13:00<\/td>/g,
  '<td className="border-r border-black-safe">{job.travelTimeStart || \'\'}</td>\n                    <td className="border-r border-black-safe">{job.travelTimeStop || \'\'}</td>'
);

code = code.replace(
  /<td className="border-r border-black-safe">14:30<\/td>\s*<td className="border-r border-black-safe">15:30<\/td>/g,
  '<td className="border-r border-black-safe">{job.processTimeStart || \'\'}</td>\n                    <td className="border-r border-black-safe">{job.processTimeStop || \'\'}</td>'
);

code = code.replace(
  /<td className="border-r border-black-safe">Check System\.<\/td>/g,
  '<td className="border-r border-black-safe text-[9px] leading-[1.1] p-0.5">{job.processDescription || (job.jobType === \'PM\' ? \'PM, Performance test, Cleaning.\' : \'Check System.\')}</td>'
);

fs.writeFileSync('src/components/JobPDFModal.tsx', code);
console.log("JobPDFModal time rows patched.");
