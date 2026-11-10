const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The previous patch failed to match correctly because the setFormData block changed to setPrefillPMData in another PR/edit.
code = code.replace(
  "                  setActiveTab('form');\\n                }}\\n              />",
  "                  setActiveTab('form');\\n                }}\\n                onTriggerPDF={(job) => setPdfJob(job)}\\n              />"
);
// Use regex for safer replacement
code = code.replace(
  /setActiveTab\('form'\);\s*\}\}\s*\/>/g,
  "setActiveTab('form');\n                }}\n                onTriggerPDF={(job) => setPdfJob(job)}\n              />"
);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx patched for CM PDF properly.");
