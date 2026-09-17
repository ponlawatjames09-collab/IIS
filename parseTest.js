const fs = require('fs');
let code = fs.readFileSync('src/sheetsService.ts', 'utf8');

const replacement = `
    if (!metaRes.ok) {
      let errMsg = \`Code: \${metaRes.status}\`;
      try {
        const errJson = await metaRes.json();
        if (errJson.error && errJson.error.message) {
          errMsg += \` - \${errJson.error.message}\`;
        }
      } catch (e) {
        const errText = await metaRes.text().catch(()=>'');
        if (errText) errMsg += \` - \${errText}\`;
      }
      throw new Error(\`Failed to fetch spreadsheet metadata. \${errMsg}\`);
    }
`;

code = code.replace(/    if \(\!metaRes\.ok\) \{\n      throw new Error\(`Failed to fetch spreadsheet metadata\. Code: \$\{metaRes\.status\}`\);\n    \}/g, replacement);

const cmReplacement = `
    if (!res.ok) {
      if (res.status === 400 || res.status === 404) return []; // Tab might not exist
      let errMsg = \`Code: \${res.status}\`;
      try {
        const errJson = await res.json();
        if (errJson.error && errJson.error.message) {
          errMsg += \` - \${errJson.error.message}\`;
        }
      } catch (e) {
        const errText = await res.text().catch(()=>'');
        if (errText) errMsg += \` - \${errText}\`;
      }
      throw new Error(\`Failed to fetch CMStatus records. \${errMsg}\`);
    }
`;

code = code.replace(/    if \(\!res\.ok\) \{\n      if \(res\.status === 400 \|\| res\.status === 404\) return \[\]; \/\/ Tab might not exist\n      throw new Error\(`Failed to fetch CMStatus records\. Code: \$\{res\.status\}`\);\n    \}/g, cmReplacement);

fs.writeFileSync('src/sheetsService.ts', code);
