const fs = require('fs');
let code = fs.readFileSync('src/components/PMServiceTab.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { fetchPMScheduleRecords } from '../sheetsService';",
  "import { fetchPMScheduleRecords, fetchPMAssignmentsFromSheet, updatePMAssignmentsInSheet } from '../sheetsService';"
);

// Add state for remote assignments
code = code.replace(
  "const [error, setError] = useState<string | null>(null);",
  "const [error, setError] = useState<string | null>(null);\n  const [remoteAssignments, setRemoteAssignments] = useState<Record<string, string>>({});\n  const [isSyncing, setIsSyncing] = useState(false);"
);

// Modify loadRecords to also fetch assignments
code = code.replace(
  "const data = await fetchPMScheduleRecords(targetSpreadsheetId, accessToken);\n      setRecords(data);",
  `const data = await fetchPMScheduleRecords(targetSpreadsheetId, accessToken);
      setRecords(data);
      
      try {
        const assignments = await fetchPMAssignmentsFromSheet(targetSpreadsheetId, accessToken);
        setRemoteAssignments(assignments);
      } catch (err) {
        console.warn("Could not fetch PM assignments:", err);
      }`
);

// Update handleAssignEngineer
const newAssignFn = `  const handleAssignEngineer = async (recordKey: string, engineerName: string) => {
    // Optimistic UI update
    setRemoteAssignments(prev => {
      const next = { ...prev };
      if (engineerName === '') delete next[recordKey];
      else next[recordKey] = engineerName;
      return next;
    });
    
    // Also update local settings just for fallback/cache
    const currentAssignments = settings.pmAssignments || {};
    const updatedAssignments = { ...currentAssignments };
    if (engineerName === '') delete updatedAssignments[recordKey];
    else updatedAssignments[recordKey] = engineerName;
    onUpdateSettings({ ...settings, pmAssignments: updatedAssignments });

    const targetSpreadsheetId = settings.pmSpreadsheetId || settings.spreadsheetId;
    if (!targetSpreadsheetId || !accessToken) return;
    
    setIsSyncing(true);
    try {
      await updatePMAssignmentsInSheet(targetSpreadsheetId, accessToken, recordKey, engineerName);
    } catch (err) {
      console.error("Failed to sync assignment:", err);
      alert("Failed to sync assignment to database. It may not be visible to others.");
    } finally {
      setIsSyncing(false);
    }
  };`;

code = code.replace(
  /const handleAssignEngineer = \(recordKey: string, engineerName: string\) => \{[\s\S]*?\}\);[\s]*\};/,
  newAssignFn
);

// Replace uses of settings.pmAssignments with remoteAssignments in useMemo
code = code.replace(
  "const assignedTo = (settings.pmAssignments || {})[recordKey];",
  "const assignedTo = remoteAssignments[recordKey] || (settings.pmAssignments || {})[recordKey];"
);

code = code.replace(
  "const assignedTo = (settings.pmAssignments || {})[recordKey];",
  "const assignedTo = remoteAssignments[recordKey] || (settings.pmAssignments || {})[recordKey];"
);

code = code.replace(
  "settings.pmAssignments]",
  "settings.pmAssignments, remoteAssignments]"
);

// Add visual indicator for syncing if desired
code = code.replace(
  /<p className="text-sm text-slate-500 mt-1">\s*Distribute PM jobs to engineers and view assigned tasks\.\s*<\/p>/,
  `<p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              Distribute PM jobs to engineers and view assigned tasks.
              {isSyncing && <span className="text-indigo-500 text-xs flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Syncing...</span>}
            </p>`
);

fs.writeFileSync('src/components/PMServiceTab.tsx', code);
console.log("PMServiceTab patched.");
