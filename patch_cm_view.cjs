const fs = require('fs');
let code = fs.readFileSync('src/components/CMOnCallServiceView.tsx', 'utf8');

// 1. Update initial formData
code = code.replace(
  "engineer: '',\n    serialNumber: '',\n  });",
  "engineer: '',\n    serialNumber: '',\n    ibDate: '',\n    expiryDate: '',\n  });"
);

// 2. Update formData reset
code = code.replace(
  "engineer: '',\n        serialNumber: ''\n      });",
  "engineer: '',\n        serialNumber: '',\n        ibDate: '',\n        expiryDate: ''\n      });"
);

// 3. Update handleEditRecord
code = code.replace(
  "engineer: record.engineer || '',\n      serialNumber: record.serialNumber || ''\n    });",
  "engineer: record.engineer || '',\n      serialNumber: record.serialNumber || '',\n      ibDate: record.ibDate || '',\n      expiryDate: record.expiryDate || ''\n    });"
);

// 4. Update the form UI
const formHtml = `              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">IB Date (วันติดตั้ง)</label>
                  <input type="date" value={formData.ibDate} onChange={e => setFormData({...formData, ibDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry Date (วันหมดประกัน)</label>
                  <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status (สถานะ)</label>`;

code = code.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 gap-4">\s*<div>\s*<label className="block text-xs font-semibold text-slate-600 mb-1">Status \(สถานะ\)<\/label>/,
  formHtml
);

// 5. Update the Card display
const cardGridStart = `<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-3">`;
code = code.replace(
  /<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">/,
  cardGridStart
);

const additionalCardFields = `
                        {r.ibDate && (
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">IB Date</p>
                            <p className="text-sm font-semibold text-slate-800">{r.ibDate}</p>
                          </div>
                        )}
                        {r.expiryDate && (
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Expiry Date</p>
                            <p className="text-sm font-semibold text-slate-800">{r.expiryDate}</p>
                          </div>
                        )}
                        <div>
`;
code = code.replace(
  /<div>\s*<p className="text-\[10px\] uppercase font-bold text-slate-400 tracking-wider">Contact<\/p>/,
  additionalCardFields
);

fs.writeFileSync('src/components/CMOnCallServiceView.tsx', code);
console.log("CMOnCallServiceView.tsx patched.");
