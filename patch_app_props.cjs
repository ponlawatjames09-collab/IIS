const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "onMonthChange={setActiveMonthYear}",
  "onMonthChange={setActiveMonthYear}\n                onNavigateToTab={setActiveTab}"
);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx patched to pass onNavigateToTab.");
