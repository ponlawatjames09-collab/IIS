const fs = require('fs');
let code = fs.readFileSync('src/components/JobForm.tsx', 'utf8');

// initial state
const oldState = `    sparePartDescription: '',
    sparePartRemark: '', billingStatus: '-- Select --'
  });`;
const newState = `    sparePartDescription: '',
    sparePartRemark: '',
    spareParts2: '',
    sparePartSerial2: '',
    sparePartDescription2: '',
    sparePartRemark2: '',
    spareParts3: '',
    sparePartSerial3: '',
    sparePartDescription3: '',
    sparePartRemark3: '',
    billingStatus: '-- Select --'
  });`;
code = code.replace(oldState, newState);

// replace UI
const oldUI = `          {/* Spare Parts Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">SPAREPARTS / อะไหล่</label>
              <input
                type="text"
                placeholder="e.g. Part Name"
                value={formData.spareParts || ''}
                onChange={(e) => handleInputChange('spareParts', e.target.value)}
                className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Serial No. / 12 NC.</label>
              <input
                type="text"
                placeholder="e.g. 12NC or S/N"
                value={formData.sparePartSerial || ''}
                onChange={(e) => handleInputChange('sparePartSerial', e.target.value)}
                className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">DESCRIPTION</label>
              <input
                type="text"
                placeholder="e.g. Description"
                value={formData.sparePartDescription || ''}
                onChange={(e) => handleInputChange('sparePartDescription', e.target.value)}
                className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">REMARK / หมายเหตุ</label>
              <input
                type="text"
                placeholder="e.g. Remark"
                value={formData.sparePartRemark || ''}
                onChange={(e) => handleInputChange('sparePartRemark', e.target.value)}
                className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>`;

const newUI = `          {/* Spare Parts Information (Up to 3 parts) */}
          <div className="space-y-4 pt-2">
            {[ 
              { prefix: '', label: '1' }, 
              { prefix: '2', label: '2' }, 
              { prefix: '3', label: '3' } 
            ].map(({ prefix, label }) => (
              <div key={label} className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <h5 className="text-[11px] font-bold text-slate-600 mb-2 uppercase border-b border-slate-200 pb-1">Spare Part {label}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">SPAREPARTS / อะไหล่</label>
                    <input
                      type="text"
                      placeholder="e.g. Part Name"
                      value={(formData as any)[\`spareParts\${prefix}\`] || ''}
                      onChange={(e) => handleInputChange(\`spareParts\${prefix}\` as keyof ServiceJob, e.target.value)}
                      className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Serial No. / 12 NC.</label>
                    <input
                      type="text"
                      placeholder="e.g. 12NC or S/N"
                      value={(formData as any)[\`sparePartSerial\${prefix}\`] || ''}
                      onChange={(e) => handleInputChange(\`sparePartSerial\${prefix}\` as keyof ServiceJob, e.target.value)}
                      className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">DESCRIPTION</label>
                    <input
                      type="text"
                      placeholder="e.g. Description"
                      value={(formData as any)[\`sparePartDescription\${prefix}\`] || ''}
                      onChange={(e) => handleInputChange(\`sparePartDescription\${prefix}\` as keyof ServiceJob, e.target.value)}
                      className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">REMARK / หมายเหตุ</label>
                    <input
                      type="text"
                      placeholder="e.g. Remark"
                      value={(formData as any)[\`sparePartRemark\${prefix}\`] || ''}
                      onChange={(e) => handleInputChange(\`sparePartRemark\${prefix}\` as keyof ServiceJob, e.target.value)}
                      className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>`;

code = code.replace(oldUI, newUI);
fs.writeFileSync('src/components/JobForm.tsx', code);
