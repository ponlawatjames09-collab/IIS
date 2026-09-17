const fs = require('fs');

let content = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

const startMarker = '          {/* This is the visual worksheet preview container */}';
const endMarker = '        {/* Right Side: Interactive Signature & Drive Upload Actions */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers: startIndex=" + startIndex + " endIndex=" + endIndex);
  process.exit(1);
}

// Find the last </div> exactly before endMarker
const subContent = content.substring(startIndex, endIndex);
const lastDivIndex = subContent.lastIndexOf('</div>');
const trueEndIndex = startIndex + lastDivIndex + 6; // length of </div>

const newTemplate = `          {/* This is the visual worksheet preview container */}
          <div id="print-area" className="bg-white rounded shadow-md border border-slate-200/60 p-4 md:p-[15mm] text-black font-sans aspect-[1/1.414] leading-relaxed relative flex flex-col mx-auto overflow-hidden text-[9px] md:text-[10px]" style={{ width: '100%', maxWidth: '210mm' }}>
            
            {/* Header Title */}
            <div className="text-center font-bold text-base md:text-lg mb-2 relative">
              JOB SHEET
              <span className="absolute right-0 top-0 text-xs font-normal">Original</span>
            </div>
            
            {/* Main Table Container */}
            <div className="border-[1.5px] border-black flex flex-col flex-1">
              
              {/* Company Info */}
              <div className="flex border-b-[1.5px] border-black">
                <div className="w-24 md:w-32 flex items-center justify-center p-2 border-r-[1.5px] border-black shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-[2.5px] border-[#d4a373] flex items-center justify-center text-[#d4a373] font-bold text-xl md:text-2xl font-serif">ISI</div>
                </div>
                <div className="flex-1 p-2 md:p-3 flex flex-col justify-center leading-tight">
                  <div className="font-bold text-xs md:text-sm mb-1">
                    บริษัท อินโนเวทีฟ อิมเมจจิ้ง ซิสเต็มส์ จำกัด <span className="font-normal text-[9px] md:text-xs">เลขที่ 86/1 ซอยรามอินทรา 58 แยก 7-2 แขวงรามอินทรา</span>
                  </div>
                  <div>เขตคันนายาว กรุงเทพมหานคร 10230 โทร.02-584-4447 แฟกซ์. 02-584-4448</div>
                </div>
              </div>

              {/* Job Info Block */}
              <div className="p-2 md:p-3 border-b-[1.5px] border-black flex flex-col gap-1.5 md:gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 md:gap-4 items-center">
                    <span className="font-bold w-16 md:w-20">Service Type.</span>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={job.jobType === 'IB'} readOnly className="border-black rounded-none" /> IB</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={job.jobType === 'FCO'} readOnly className="border-black rounded-none" /> FCO</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={job.jobType === 'PM'} readOnly className="border-black rounded-none" /> PM {job.pmTimesTotal || '- / -'}</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={job.jobType === 'CM' || job.jobType === 'CM ซ่อมซ้ำ'} readOnly className="border-black rounded-none" /> CM ซ่อมซ้ำ</label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-bold w-8 md:w-10">Date</span>
                    <span className="border-b border-black border-dotted w-20 md:w-28 text-center">{job.serviceDate || job.callDate}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 md:gap-4 items-center">
                    <span className="font-bold w-16 md:w-20">Type</span>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={job.warrantyStatus === 'Guarantee' || job.warrantyStatus === 'Contract'} readOnly className="border-black rounded-none" /> Guarantee</label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-bold w-12 md:w-16 text-right">Job No.</span>
                    <span className="border-b border-black border-dotted w-20 md:w-28 text-center">{job.jobNumber}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1 gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-bold whitespace-nowrap">Hospital / โรงพยาบาล</span>
                    <span className="flex-1 truncate">{job.hospitalName}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-bold whitespace-nowrap">Department / แผนก</span>
                    <span className="flex-1 truncate">{job.department || 'X-RAY'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1 gap-2">
                  <div className="flex items-center gap-2 flex-[0.8]">
                    <span className="font-bold whitespace-nowrap">Product / ชนิดสินค้า</span>
                    <span className="flex-1 truncate">{job.product || 'US'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-[1.2]">
                    <span className="font-bold whitespace-nowrap">Model / รุ่น</span>
                    <span className="flex-1 truncate">{job.equipmentName}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-bold whitespace-nowrap">Serial No. / หมายเลขเครื่อง</span>
                    <span className="flex-1 truncate">{job.serialNumber}</span>
                  </div>
                </div>
              </div>

              {/* Grid Table */}
              <table className="w-full text-center border-b-[1.5px] border-black border-collapse">
                <thead>
                  <tr className="border-b border-black bg-white">
                    <th rowSpan={2} className="border-r border-black p-1 md:p-1.5 w-16 md:w-24 font-bold">DATE</th>
                    <th colSpan={2} className="border-r border-black border-b border-black p-1 md:p-1.5 font-bold">TIME</th>
                    <th colSpan={2} className="border-r border-black border-b border-black p-1 md:p-1.5 font-bold">STATUS</th>
                    <th rowSpan={2} className="border-r border-black p-1 md:p-1.5 font-bold">PROCESS</th>
                    <th rowSpan={2} className="p-1 md:p-1.5 w-20 md:w-28 font-bold">ENGINEERS</th>
                  </tr>
                  <tr className="bg-white">
                    <th className="border-r border-black p-1 font-bold w-10 md:w-12">Start</th>
                    <th className="border-r border-black p-1 font-bold w-10 md:w-12">Stop</th>
                    <th className="border-r border-black p-1 font-bold w-10 md:w-12">Wait</th>
                    <th className="border-r border-black p-1 font-bold w-10 md:w-12">Finish</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black h-6 md:h-8">
                    <td className="border-r border-black">{job.serviceDate || job.callDate}</td>
                    <td className="border-r border-black">12:00</td>
                    <td className="border-r border-black">13:00</td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black">/</td>
                    <td className="border-r border-black">Travel</td>
                    <td className="">{job.engineerName}</td>
                  </tr>
                  <tr className="border-b border-black h-6 md:h-8">
                    <td className="border-r border-black">{job.serviceDate || job.callDate}</td>
                    <td className="border-r border-black">14:30</td>
                    <td className="border-r border-black">15:30</td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black">/</td>
                    <td className="border-r border-black">Check System.</td>
                    <td className="">{job.engineerName}</td>
                  </tr>
                  {/* Fill empty space */}
                  <tr className="border-b border-black h-6 md:h-8">
                    <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                  </tr>
                  <tr className="border-b border-black h-6 md:h-8">
                    <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                  </tr>
                  <tr className="border-b-[1.5px] border-black h-6 md:h-8">
                    <td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                  </tr>
                </tbody>
              </table>

              {/* Text Blocks */}
              <div className="flex flex-col border-b-[1.5px] border-black">
                <div className="p-2 border-b border-black min-h-[60px] md:min-h-[80px]">
                  <div className="font-bold mb-1 uppercase">FAILURE DESCRIPTION / อาการเสีย</div>
                  <div className="text-red-600 text-center whitespace-pre-line">{job.problemDescription || '-'}</div>
                </div>
                <div className="p-2 border-b border-black min-h-[60px] md:min-h-[80px]">
                  <div className="font-bold mb-1 uppercase">REMEDY / การแก้ไข</div>
                  <div className="text-red-600 text-center whitespace-pre-line">{job.remark || '-'}</div>
                </div>
                <div className="p-2 min-h-[50px] md:min-h-[70px]">
                  <div className="font-bold mb-1 uppercase">REMARK / หมายเหตุ</div>
                  <div className="text-red-600 text-center">{job.jobStatus === 'Pending' ? 'รอเครมอะไหล่ประมาณ 3 - 7 วัน' : '-'}</div>
                </div>
              </div>

              {/* Spare parts */}
              <table className="w-full text-center border-b-[1.5px] border-black border-collapse bg-white">
                <thead>
                  <tr className="border-y-[1.5px] border-black">
                    <th className="border-r border-black p-1 w-1/3 font-bold">SPAREPARTS / อะไหล่</th>
                    <th className="border-r border-black p-1 w-1/3 font-bold">Serial No. / 12 NC.</th>
                    <th className="p-1 w-1/3 font-bold">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-10 md:h-14">
                    <td className="border-r border-black text-center">{job.spareParts || 'NA'}</td>
                    <td className="border-r border-black text-center">{job.sparePartSerial || 'NA'}</td>
                    <td className="text-center">{job.sparePartDescription || 'NA'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Checkboxes Row */}
              <div className="p-2 md:p-3 border-b border-black flex gap-6 md:gap-16 justify-center">
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={job.jobStatus === 'Pending'} readOnly className="border-black rounded-none" /> รออะไหล่ / Waiting For Spae Part</label>
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={job.isRepair} readOnly className="border-black rounded-none" /> Repair</label>
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={job.isComplain} readOnly className="border-black rounded-none" /> Complain</label>
              </div>

              <div className="border-b-[1.5px] border-black h-4 md:h-6 w-full flex items-center justify-start pl-8">
                 <label className="flex items-center gap-1.5"><input type="checkbox" checked={false} readOnly className="border-black rounded-none" /> </label>
              </div>

              {/* Signatures */}
              <div className="p-3 md:p-4 flex flex-col items-center justify-center text-center flex-1 relative">
                <p className="mb-1 leading-tight">ข้าพเจ้าได้อ่านเข้าใจและลงนามรับรองข้อตกลงตามเงื่อนไขการใช้บริการและข้าพเจ้าขอรับรองว่ารายละเอียดที่ระบุในคำขอนี้เป็นความจริงและถูกต้อง</p>
                <p className="mb-4 md:mb-6 leading-tight">I have read and understood the service under the terms and hereby confirm that all of the above statements are true and correc</p>
                
                <div className="flex w-full justify-between px-2 md:px-8 mt-auto mb-2">
                  <div className="flex flex-col items-center w-52 md:w-64 gap-2 md:gap-3 text-left">
                    <div className="w-full font-bold">CUSTOMER SIGN</div>
                    <div className="w-full border-b border-black border-dotted mb-1 h-3 relative"></div>
                    <div className="w-full flex items-center">
                      <span className="w-16 md:w-20">FULL NAME</span>
                      <span className="flex-1 border-b border-black border-dotted text-center h-4 relative">
                        <span className="absolute bottom-0 w-full">{job.customerName || ' '}</span>
                      </span>
                    </div>
                    <div className="w-full flex items-center">
                      <span className="w-16 md:w-20">Email</span>
                      <span className="flex-1 border-b border-black border-dotted text-center h-4"> </span>
                    </div>
                    <div className="w-full text-center mt-2 border-b border-black border-dotted h-4 relative">
                       <span className="absolute bottom-0 w-full">{job.serviceDate || job.callDate || ' '}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center w-52 md:w-64 gap-2 md:gap-3 text-left">
                    <div className="w-full font-bold text-center">ENGINEER SIGN</div>
                    <div className="w-full border-b border-black border-dotted flex justify-center items-end h-6 relative pb-1">
                      {hasSigned && <span className="absolute text-emerald-600 font-mono text-[9px] md:text-[11px] font-bold bottom-1 left-0 right-0 text-center">✓ Verified Signature</span>}
                    </div>
                    <div className="w-full flex items-center">
                      <span className="w-16 md:w-20 text-center">FULL NAME</span>
                      <span className="flex-1 text-center border-b border-black border-dotted h-4 relative">
                        <span className="absolute bottom-0 w-full">{job.engineerName}</span>
                      </span>
                    </div>
                    <div className="w-full text-center mt-6 border-b border-black border-dotted h-4 relative">
                       <span className="absolute bottom-0 w-full">{'092-2529441'}</span>
                    </div>
                  </div>
                </div>
                
              </div>
              
            </div>
            
            {/* Footer Form Number */}
            <div className="absolute bottom-1 right-2 md:bottom-2 md:right-4 text-[8px] md:text-[10px] text-right font-medium text-slate-800">
              FR-SV-03 Job Sheet Rev.03
            </div>
          </div>
        </div>
`;

// Replace from startIndex to the index just before endMarker
const finalContent = content.substring(0, startIndex) + newTemplate + content.substring(endIndex);

fs.writeFileSync('src/components/JobPDFModal.tsx', finalContent);
console.log("Successfully replaced the PDF template in JobPDFModal.tsx");
