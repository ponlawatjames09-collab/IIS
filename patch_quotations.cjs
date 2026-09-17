const fs = require('fs');
let code = fs.readFileSync('src/components/QuotationDashboard.tsx', 'utf8');

const oldSetQuotations = `      const data = await fetchQuotations(settings.spreadsheetId, accessToken);
      setQuotations(data);`;

const newSetQuotations = `      const parseDateToMs = (dateStr: string) => {
        if (!dateStr) return 0;
        const dt = new Date(dateStr);
        if (!isNaN(dt.getTime())) return dt.getTime();
        const parts = dateStr.split(/[/-]/);
        if (parts.length >= 3) {
          let d = parseInt(parts[0], 10);
          let m = parseInt(parts[1], 10) - 1;
          let y = parseInt(parts[2], 10);
          if (y < 100) y += 2000;
          const dObj = new Date(y, m, d);
          if (!isNaN(dObj.getTime())) return dObj.getTime();
        }
        return 0;
      };
      
      const data = await fetchQuotations(settings.spreadsheetId, accessToken);
      // Sort by newest first
      data.sort((a, b) => parseDateToMs(b.date) - parseDateToMs(a.date));
      setQuotations(data);`;

code = code.replace(oldSetQuotations, newSetQuotations);

// Update UI to separate by month
const oldUI = `          {/* Quotation List */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-700 text-sm">Recent Quotations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Quotation No.</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Job Name</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Job Type</th>
                    <th className="px-4 py-3">Win Prob (%)</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotations.map((q) => (
                    <tr key={q.id || q.rowIndex} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">{q.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{q.quotationNumber}</td>
                      <td className="px-4 py-3 max-w-[150px] truncate" title={q.customerName}>{q.customerName}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate" title={q.jobName}>{q.jobName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(q.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <select 
                          value={q.jobType}
                          onChange={(e) => handleJobTypeChangeLocally(q.rowIndex, e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="PM">PM</option>
                          <option value="CM">CM</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="0" max="100" 
                            value={q.winRate} 
                            onChange={(e) => handleWinRateChangeLocally(q.rowIndex, e.target.value)}
                            className="w-16 px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => handleUpdateQuotation(q)}
                          disabled={updatingRowIndex === q.rowIndex}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition-colors disabled:opacity-50"
                        >
                          {updatingRowIndex === q.rowIndex ? 'Saving...' : 'Update'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {quotations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No quotations recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>`;


const newUI = `          {/* Quotation List By Month */}
          <div className="space-y-6">
            {Object.keys(monthlyStats).length > 0 ? (
              Object.keys(monthlyStats).sort((a,b) => {
                // sort months descending if possible, basic string reverse sort usually works for MM/YYYY if we reverse it to YYYY/MM
                const parseMY = (my: string) => {
                  const p = my.split('/');
                  if(p.length===2) return parseInt(p[1])*100 + parseInt(p[0]);
                  return 0;
                };
                return parseMY(b) - parseMY(a);
              }).map(monthKey => {
                const monthQuotations = quotations.filter(q => {
                  let m = "Unknown";
                  if (q.date) {
                    const parts = q.date.split('/');
                    if (parts.length >= 2) m = \`\${parts[1]}/\${parts[parts.length-1]}\`;
                  }
                  return m === monthKey;
                });
                
                return (
                  <div key={monthKey} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-slate-700 text-sm">Month: {monthKey}</h3>
                      <span className="text-xs font-semibold text-slate-500">{monthQuotations.length} Items</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Quotation No.</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Job Name</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Job Type</th>
                            <th className="px-4 py-3">Win Prob (%)</th>
                            <th className="px-4 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {monthQuotations.map((q) => (
                            <tr key={q.id || q.rowIndex} className="hover:bg-slate-50">
                              <td className="px-4 py-3 whitespace-nowrap">{q.date}</td>
                              <td className="px-4 py-3 whitespace-nowrap font-medium">{q.quotationNumber}</td>
                              <td className="px-4 py-3 max-w-[150px] truncate" title={q.customerName}>{q.customerName}</td>
                              <td className="px-4 py-3 max-w-[200px] truncate" title={q.jobName}>{q.jobName}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(q.totalAmount)}</td>
                              <td className="px-4 py-3">
                                <select 
                                  value={q.jobType}
                                  onChange={(e) => handleJobTypeChangeLocally(q.rowIndex, e.target.value)}
                                  className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                                >
                                  <option value="PM">PM</option>
                                  <option value="CM">CM</option>
                                  <option value="Other">Other</option>
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    min="0" max="100" 
                                    value={q.winRate} 
                                    onChange={(e) => handleWinRateChangeLocally(q.rowIndex, e.target.value)}
                                    className="w-16 px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <button 
                                  onClick={() => handleUpdateQuotation(q)}
                                  disabled={updatingRowIndex === q.rowIndex}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition-colors disabled:opacity-50"
                                >
                                  {updatingRowIndex === q.rowIndex ? 'Saving...' : 'Update'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                 <table className="w-full text-sm text-left"><tbody className="divide-y divide-slate-100">
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No quotations recorded yet.</td></tr>
                 </tbody></table>
              </div>
            )}
          </div>`;

code = code.replace(oldUI, newUI);
fs.writeFileSync('src/components/QuotationDashboard.tsx', code);
console.log('Patched QuotationDashboard');
