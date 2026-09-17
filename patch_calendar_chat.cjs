const fs = require('fs');

let code = fs.readFileSync('src/components/DispatchCalendarView.tsx', 'utf8');

if (!code.includes('sendChatMessage')) {
  code = code.replace(
    "deleteDispatchRecord } from '../sheetsService';",
    "deleteDispatchRecord } from '../sheetsService';\nimport { sendChatMessage } from '../chatService';"
  );
}

const oldSave = `      if (editingRecord.id) {
        // Update
        await updateDispatchRecord(settings.spreadsheetId, accessToken, editingRecord as DispatchRecord);
      } else {
        // Create
        const newRecord: DispatchRecord = {
          ...editingRecord,
          id: \`dsp-\${Date.now()}\`
        } as DispatchRecord;
        await appendDispatchRecord(settings.spreadsheetId, accessToken, newRecord);
      }
      setIsModalOpen(false);
      setEditingRecord(null);
      await loadRecords();
    } catch (err) {`;

const newSave = `      const isUpdate = !!editingRecord.id;
      if (isUpdate) {
        // Update
        await updateDispatchRecord(settings.spreadsheetId, accessToken, editingRecord as DispatchRecord);
      } else {
        // Create
        const newRecord: DispatchRecord = {
          ...editingRecord,
          id: \`dsp-\${Date.now()}\`
        } as DispatchRecord;
        await appendDispatchRecord(settings.spreadsheetId, accessToken, newRecord);
      }
      
      setIsModalOpen(false);
      
      // Try to send Google Chat message
      const engineerEmail = settings.engineerEmails?.[editingRecord.engineer];
      if (engineerEmail) {
        try {
          const actionText = isUpdate ? 'updated an assignment' : 'assigned a new task';
          const msg = \`Hello \${editingRecord.engineer}, you have been \${actionText} on \${editingRecord.date}.\\nTask: \${editingRecord.taskTitle}\\nLocation: \${editingRecord.location || 'N/A'}\\nRemark: \${editingRecord.remark || '-'}\`;
          await sendChatMessage(accessToken, engineerEmail, msg);
        } catch (chatErr) {
          console.error('Failed to send chat alert:', chatErr);
          // Don't alert the user directly, just log, since the save was successful.
        }
      }

      setEditingRecord(null);
      await loadRecords();
    } catch (err) {`;

code = code.replace(oldSave, newSave);

fs.writeFileSync('src/components/DispatchCalendarView.tsx', code);
console.log('Patched DispatchCalendarView with Chat');
