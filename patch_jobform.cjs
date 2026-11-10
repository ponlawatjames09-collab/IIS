const fs = require('fs');
let code = fs.readFileSync('src/components/JobForm.tsx', 'utf8');

// Update handleInputChange
code = code.replace(
  "  const handleInputChange = (field: keyof ServiceJob, val: any) => {\n    setFormData(prev => ({ ...prev, [field]: val }));\n  };",
  `  const handleInputChange = (field: keyof ServiceJob, val: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'jobType' && !editingJob) {
        if (val === 'PM') {
          next.processDescription = 'PM, Performance test, Cleaning.';
        } else if (val === 'CM') {
          next.processDescription = 'Check System.';
        }
      }
      return next;
    });
  };`
);

const newFields = `
            {/* Travel Time */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time Travel (Start - Stop)</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={formData.travelTimeStart || ''}
                  onChange={(e) => handleInputChange('travelTimeStart', e.target.value)}
                  className="w-1/2 px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={formData.travelTimeStop || ''}
                  onChange={(e) => handleInputChange('travelTimeStop', e.target.value)}
                  className="w-1/2 px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Process Time */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time Process (Start - Stop)</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={formData.processTimeStart || ''}
                  onChange={(e) => handleInputChange('processTimeStart', e.target.value)}
                  className="w-1/2 px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={formData.processTimeStop || ''}
                  onChange={(e) => handleInputChange('processTimeStop', e.target.value)}
                  className="w-1/2 px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Process Description */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Process</label>
              <input
                type="text"
                list="process-list"
                placeholder="Select or enter process..."
                value={formData.processDescription || ''}
                onChange={(e) => handleInputChange('processDescription', e.target.value)}
                className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <datalist id="process-list">
                <option value="System Install." />
                <option value="System Install and Dicom Configuration." />
                <option value="Check System." />
                <option value="System all calibration." />
                <option value="Replace Spare part and Adjustment." />
                <option value="Replace Spare part." />
                <option value="PM, Performance test, Cleaning." />
              </datalist>
            </div>
`;

code = code.replace(
  '              </div>\n            </div>\n\n          </div>\n        </div>\n\n        {/* SECTION 4: Customer Details & Safety Questions */',
  '              </div>\n            </div>\n\n' + newFields + '          </div>\n        </div>\n\n        {/* SECTION 4: Customer Details & Safety Questions */'
);

fs.writeFileSync('src/components/JobForm.tsx', code);
console.log("JobForm patched.");
