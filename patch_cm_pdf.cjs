const fs = require('fs');
let code = fs.readFileSync('src/components/CMOnCallServiceView.tsx', 'utf8');

// Add onTriggerPDF to props
code = code.replace(
  "onOpenCMJob?: (hospitalName: string, equipment: string, serialNumber: string, problem: string) => void;\n}",
  "onOpenCMJob?: (hospitalName: string, equipment: string, serialNumber: string, problem: string) => void;\n  onTriggerPDF?: (job: import('../types').ServiceJob) => void;\n}"
);
code = code.replace(
  "export default function CMOnCallServiceView({ settings, accessToken, onNotifyLine, onOpenCMJob }: CMOnCallServiceViewProps) {",
  "export default function CMOnCallServiceView({ settings, accessToken, onNotifyLine, onOpenCMJob, onTriggerPDF }: CMOnCallServiceViewProps) {"
);

// Add PDF button to the card
const pdfButtonCode = `                  {r.image ? (
                    <a href={r.image} target="_blank" rel="noopener noreferrer" className="w-full text-center py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded transition-colors">
                      View Image
                    </a>
                  ) : (
                    <div className="w-full text-center py-2 px-3 text-xs font-semibold text-slate-500 bg-slate-200 rounded">
                      No Image
                    </div>
                  )}
                  {onTriggerPDF && (
                    <button 
                      onClick={() => {
                        onTriggerPDF({
                          jobNumber: "CM-" + Date.now().toString().slice(-6),
                          callDate: r.reportDate || '',
                          jobStatus: r.status === 'Closed' ? 'Done' : 'Inprogress',
                          pmCycle: '',
                          jobType: 'CM',
                          hospitalName: r.hospital || '',
                          department: '',
                          equipmentName: r.equipment || '',
                          serialNumber: r.serialNumber || '',
                          equipmentType: '',
                          problemDescription: r.problem || '',
                          safetyQ1: 'N/A',
                          safetyQ2: 'N/A',
                          customerName: r.namecontract || '',
                          customerPhone: String(r.phonecontract || ''),
                          buildingFloor: '',
                          engineerName: r.engineer || '',
                          serviceDate: r.reportDate || '',
                          warrantyStatus: (r.warranty === 'Warranty' ? 'Guarantee' : '-- Select --') as any,
                          remark: '',
                          documentStatus: '',
                          revenue: 0,
                          cost: 0,
                          product: '',
                        });
                      }}
                      className="w-full text-center py-2 px-3 text-xs font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded transition-colors mt-2">
                      Generate PDF
                    </button>
                  )}`;

code = code.replace(
  /\{r\.image \? \(\s*<a href=\{r\.image\} target="_blank"[\s\S]*?No Image\s*<\/div>\s*\)\}/,
  pdfButtonCode
);

fs.writeFileSync('src/components/CMOnCallServiceView.tsx', code);
console.log("CMOnCallServiceView patched for PDF.");
