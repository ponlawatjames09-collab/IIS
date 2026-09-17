import React, { useRef, useState, useEffect } from 'react';
import logoImage from '../assets/logo.png';
import { X, Printer, CloudLightning, Download, CheckCircle2, RefreshCw, Eye, FileText, PenTool } from 'lucide-react';
import { ServiceJob } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { uploadPDFToDrive } from '../driveService';

interface JobPDFModalProps {
  job: ServiceJob;
  onClose: () => void;
  accessToken: string;
}

export default function JobPDFModal({ job, onClose, accessToken }: JobPDFModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const jobTags = [];
  if (job.isRepair) jobTags.push('Repair');
  if (job.isComplain) jobTags.push('Complain');
  const [hasSigned, setHasSigned] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'generating' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedLink, setUploadedLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize signature canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set brush characteristics
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a'; // slate-900
  }, []);

  // Canvas drawing events
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Scale factor between canvas attribute dimensions and display bounding client rect
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasSigned(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate jsPDF from visual preview and upload to Google Drive
  const handleSaveToDrive = async () => {
    setUploadStatus('generating');
    setErrorMessage(null);

    try {
      const printArea = document.getElementById('print-area');
      if (!printArea) throw new Error("Print area not found");

      // Temporarily remove max-width/max-height constraint for rendering so it gets the full layout
      const oldMaxWidth = printArea.style.maxWidth;
      printArea.style.maxWidth = '210mm';
      printArea.style.width = '210mm';
      printArea.style.height = '297mm'; // Force exact A4 for html2canvas
      
      const canvas = await html2canvas(printArea, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794 // 210mm width approx in px
      });
      
      // Restore styles
      printArea.style.maxWidth = oldMaxWidth;
      printArea.style.width = '100%';
      printArea.style.height = 'auto';

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      const pdfBlob = pdf.output('blob');

      setUploadStatus('uploading');
      const folderId = localStorage.getItem('drive_pdf_folder_id') || undefined;
      const res = await uploadPDFToDrive(accessToken, pdfBlob, `Service_Job_${job.jobNumber}_Worksheet.pdf`, folderId);
      
      setUploadedLink(res.webViewLink);
      setUploadStatus('success');
    } catch (err: any) {
      console.error("PDF / Drive Upload Failure:", err);
      setErrorMessage(err.message || err);
      setUploadStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex justify-center items-start py-8 px-4" id="pdf-modal">
      
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200">
        
        {/* Left Side: Worksheet Live Rendering */}
        <div className="flex-1 p-6 md:p-8 bg-slate-50 border-r border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">Live Document Review</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">Done Draft</span>
          </div>

          {/* This is the visual worksheet preview container */}
          <div id="print-area" className="bg-white-safe rounded shadow-md border border-slate-200-safe p-[10mm] text-black-safe font-sans aspect-[1/1.414] leading-tight relative flex flex-col mx-auto overflow-hidden" style={{ width: "100%", maxWidth: "210mm", fontFamily: "\"AngsanaUPC\", \"Angsana New\", \"TH Sarabun New\", serif", fontSize: "14pt" }}>
            
            {/* Header Title */}
            <div className="text-center font-bold text-[18pt] mb-2 relative">
              JOB SHEET
              <span className="absolute right-0 top-0 font-normal">Original</span>
            </div>
            
            {/* Main Table Container */}
            <div className="border-[1.5px] border-black-safe flex flex-col flex-1">
              
              {/* Company Info */}
              <div className="flex border-b-[1.5px] border-black-safe">
                <div className="w-24 flex items-center justify-center p-2 border-r-[1.5px] border-black-safe shrink-0">
                  <img src={logoImage} alt="ISI Logo" className="w-14 h-14 object-contain" />
                </div>
                <div className="flex-1 p-2 flex flex-col justify-center leading-tight">
                  <div className="font-bold mb-1">
                    บริษัท อินโนเวทีฟ อิมเมจจิ้ง ซิสเต็มส์ จำกัด <span className="font-normal">เลขที่ 86/1 ซอยรามอินทรา 58 แยก 7-2 แขวงรามอินทรา</span>
                  </div>
                  <div>เขตคันนายาว กรุงเทพมหานคร 10230 โทร.02-584-4447 แฟกซ์. 02-584-4448</div>
                </div>
              </div>

              {/* Job Info Block */}
              <div className="p-2 border-b-[1.5px] border-black-safe flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <span className="font-bold w-16">Service Type.</span>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={job.jobType === 'IB'} readOnly className="border-black-safe rounded-none" /> IB</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={job.jobType === 'FCO'} readOnly className="border-black-safe rounded-none" /> FCO</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={job.jobType === 'PM'} readOnly className="border-black-safe rounded-none" /> PM {job.pmTimesTotal || '- / -'}</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={job.jobType === 'CM' || job.jobType === 'CM ซ่อมซ้ำ'} readOnly className="border-black-safe rounded-none" /> CM ซ่อมซ้ำ</label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-bold w-10">Date</span>
                    <span className="border-b border-black-safe border-dotted w-24 text-center">{job.serviceDate || job.callDate}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <span className="font-bold w-16">Type</span>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={job.warrantyStatus === 'Guarantee' || job.warrantyStatus === 'Contract'} readOnly className="border-black-safe rounded-none" /> Guarantee</label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-bold w-14 text-right">Job No.</span>
                    <span className="border-b border-black-safe border-dotted w-24 text-center">{job.jobNumber}</span>
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
              <table className="w-full text-center border-b-[1.5px] border-black-safe border-collapse">
                <thead>
                  <tr className="border-b border-black-safe bg-white-safe">
                    <th rowSpan={2} className="border-r border-black-safe p-1.5 w-16 md:w-24 font-bold">DATE</th>
                    <th colSpan={2} className="border-r border-black-safe border-b border-black-safe p-1.5 font-bold">TIME</th>
                    <th colSpan={2} className="border-r border-black-safe border-b border-black-safe p-1.5 font-bold">STATUS</th>
                    <th rowSpan={2} className="border-r border-black-safe p-1.5 font-bold">PROCESS</th>
                    <th rowSpan={2} className="p-1.5 w-24 font-bold">ENGINEERS</th>
                  </tr>
                  <tr className="bg-white-safe">
                    <th className="border-r border-black-safe p-1 font-bold w-12">Start</th>
                    <th className="border-r border-black-safe p-1 font-bold w-12">Stop</th>
                    <th className="border-r border-black-safe p-1 font-bold w-12">Wait</th>
                    <th className="border-r border-black-safe p-1 font-bold w-12">Finish</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black-safe h-7">
                    <td className="border-r border-black-safe">{job.serviceDate || job.callDate}</td>
                    <td className="border-r border-black-safe">12:00</td>
                    <td className="border-r border-black-safe">13:00</td>
                    <td className="border-r border-black-safe"></td>
                    <td className="border-r border-black-safe">/</td>
                    <td className="border-r border-black-safe">Travel</td>
                    <td className="">{job.engineerName}</td>
                  </tr>
                  <tr className="border-b border-black-safe h-7">
                    <td className="border-r border-black-safe">{job.serviceDate || job.callDate}</td>
                    <td className="border-r border-black-safe">14:30</td>
                    <td className="border-r border-black-safe">15:30</td>
                    <td className="border-r border-black-safe"></td>
                    <td className="border-r border-black-safe">/</td>
                    <td className="border-r border-black-safe">Check System.</td>
                    <td className="">{job.engineerName}</td>
                  </tr>
                  {/* Fill empty space */}
                  <tr className="border-b border-black-safe h-7">
                    <td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td></td>
                  </tr>
                  <tr className="border-b border-black-safe h-7">
                    <td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td></td>
                  </tr>
                  <tr className="border-b-[1.5px] border-black-safe h-7">
                    <td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td className="border-r border-black-safe"></td><td></td>
                  </tr>
                </tbody>
              </table>

              {/* Text Blocks */}
              <div className="flex flex-col border-b-[1.5px] border-black-safe">
                <div className="p-2 border-b border-black-safe min-h-[50px]">
                  <div className="font-bold mb-1 uppercase">FAILURE DESCRIPTION / อาการเสีย</div>
                  <div className="text-red-600-safe text-center whitespace-pre-line">{job.problemDescription || '-'}</div>
                </div>
                <div className="p-2 border-b border-black-safe min-h-[50px]">
                  <div className="font-bold mb-1 uppercase">REMEDY / การแก้ไข</div>
                  <div className="text-red-600-safe text-center whitespace-pre-line">{job.remark || '-'}</div>
                </div>
                <div className="p-2 min-h-[40px]">
                  <div className="font-bold mb-1 uppercase">REMARK / หมายเหตุ</div>
                  <div className="text-red-600-safe text-center">{job.jobStatus === 'Pending' ? 'รอเครมอะไหล่ประมาณ 3 - 7 วัน' : '-'}</div>
                </div>
              </div>

              {/* Spare parts */}
              <table className="w-full text-center border-b-[1.5px] border-black-safe border-collapse bg-white-safe">
                <thead>
                  <tr className="border-y-[1.5px] border-black-safe">
                    <th className="border-r border-black-safe p-1 w-1/3 font-bold">SPAREPARTS / อะไหล่</th>
                    <th className="border-r border-black-safe p-1 w-1/3 font-bold">Serial No. / 12 NC.</th>
                    <th className="p-1 w-1/3 font-bold">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-10">
                    <td className="border-r border-black-safe text-center">{job.spareParts || 'NA'}</td>
                    <td className="border-r border-black-safe text-center">{job.sparePartSerial || 'NA'}</td>
                    <td className="text-center">{job.sparePartDescription || 'NA'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Checkboxes Row */}
              <div className="p-2 border-b border-black-safe flex gap-10 justify-center">
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={job.jobStatus === 'Pending'} readOnly className="border-black-safe rounded-none" /> รออะไหล่ / Waiting For Spae Part</label>
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={job.isRepair} readOnly className="border-black-safe rounded-none" /> Repair</label>
                <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={job.isComplain} readOnly className="border-black-safe rounded-none" /> Complain</label>
              </div>

              <div className="border-b-[1.5px] border-black-safe h-5 w-full flex items-center justify-start pl-8">
                 <label className="flex items-center gap-1.5"><input type="checkbox" checked={false} readOnly className="border-black-safe rounded-none" /> </label>
              </div>

              {/* Signatures */}
              <div className="p-3 flex flex-col items-center justify-center text-center flex-1 relative">
                <p className="mb-1 leading-tight">ข้าพเจ้าได้อ่านเข้าใจและลงนามรับรองข้อตกลงตามเงื่อนไขการใช้บริการและข้าพเจ้าขอรับรองว่ารายละเอียดที่ระบุในคำขอนี้เป็นความจริงและถูกต้อง</p>
                <p className="mb-3 leading-tight">I have read and understood the service under the terms and hereby confirm that all of the above statements are true and correc</p>
                
                <div className="flex w-full justify-between px-6 mt-auto mb-2">
                  <div className="flex flex-col items-center w-56 gap-2 text-left">
                    <div className="w-full font-bold">CUSTOMER SIGN</div>
                    <div className="w-full border-b border-black-safe border-dotted mb-1 h-3 relative"></div>
                    <div className="w-full flex items-center">
                      <span className="w-16">FULL NAME</span>
                      <span className="flex-1 border-b border-black-safe border-dotted text-center h-4 relative">
                        <span className="absolute bottom-0 w-full">{job.customerName || ' '}</span>
                      </span>
                    </div>
                    <div className="w-full flex items-center">
                      <span className="w-16">Email</span>
                      <span className="flex-1 border-b border-black-safe border-dotted text-center h-4"> </span>
                    </div>
                    <div className="w-full text-center mt-2 border-b border-black-safe border-dotted h-4 relative">
                       <span className="absolute bottom-0 w-full">{job.serviceDate || job.callDate || ' '}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center w-56 gap-2 text-left">
                    <div className="w-full font-bold text-center">ENGINEER SIGN</div>
                    <div className="w-full border-b border-black-safe border-dotted flex justify-center items-end h-6 relative pb-1">
                      {hasSigned && <span className="absolute text-emerald-600-safe font-mono font-bold bottom-1 left-0 right-0 text-center">✓ Verified Signature</span>}
                    </div>
                    <div className="w-full flex items-center">
                      <span className="w-16 text-center">FULL NAME</span>
                      <span className="flex-1 text-center border-b border-black-safe border-dotted h-4 relative">
                        <span className="absolute bottom-0 w-full">{job.engineerName}</span>
                      </span>
                    </div>
                    <div className="w-full text-center mt-6 border-b border-black-safe border-dotted h-4 relative">
                       <span className="absolute bottom-0 w-full">{'092-2529441'}</span>
                    </div>
                  </div>
                </div>
                
              </div>
              
            </div>
            
            {/* Footer Form Number */}
            <div className="absolute bottom-2 right-4 text-right font-medium text-slate-800-safe">
              FR-SV-03 Job Sheet Rev.03
            </div>
          </div>
        </div>
        {/* Right Side: Interactive Signature & Drive Upload Actions */}
        <div className="w-full md:w-80 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm">Client Signature Pad</h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Signature Drawpad */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-blue-500" />
                <span>Draw on Pad with cursor/touch:</span>
              </span>
              <div className="relative border-2 border-slate-250 bg-slate-50 hover:bg-white transition-colors rounded-xl overflow-hidden aspect-[4/3] shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={240}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair touch-none"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400 font-mono">* Signature embeds to PDF instantly</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  Clear Pad
                </button>
              </div>
            </div>

            {/* Status indicators */}
            {uploadStatus !== 'idle' && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Drive Sync Status</span>
                  {uploadStatus === 'generating' && <span className="text-blue-600 text-xs font-semibold animate-pulse">Drafting...</span>}
                  {uploadStatus === 'uploading' && <span className="text-indigo-600 text-xs font-semibold animate-pulse">Uploading...</span>}
                  {uploadStatus === 'success' && <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">✓ Complete</span>}
                  {uploadStatus === 'error' && <span className="text-rose-600 text-xs font-semibold">✕ Failed</span>}
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      uploadStatus === 'generating' ? 'bg-blue-500 w-1/3' :
                      uploadStatus === 'uploading' ? 'bg-indigo-600 w-2/3' :
                      uploadStatus === 'success' ? 'bg-emerald-500 w-full' : 'bg-rose-500 w-full'
                    }`} 
                  />
                </div>

                {errorMessage && (
                  <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded border border-red-100 leading-tight">
                    {errorMessage}
                  </p>
                )}

                {uploadedLink && (
                  <a
                    href={uploadedLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 py-2 rounded-lg font-semibold text-xs transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View in Google Drive</span>
                  </a>
                )}
              </div>
            )}

          </div>

          {/* Direct Actions */}
          <div className="space-y-3 mt-6">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Preview</span>
            </button>

            <button
              onClick={handleSaveToDrive}
              disabled={uploadStatus === 'generating' || uploadStatus === 'uploading'}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-3 rounded-xl font-semibold text-sm cursor-pointer transition-colors shadow-md"
            >
              {uploadStatus === 'generating' || uploadStatus === 'uploading' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Tunnel...</span>
                </>
              ) : (
                <>
                  <CloudLightning className="w-4 h-4 text-amber-400" />
                  <span>Sign & Save to Google Drive</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
