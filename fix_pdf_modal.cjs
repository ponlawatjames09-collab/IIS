const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

const prefix = `import React, { useRef, useState, useEffect } from 'react';
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

`;

// Remove the generated duplicate part up to the end of the old handleSaveToDrive
// The old code has "const handleSaveToDrive = async () => {" and ends before "const handleCanvasTouchStart"
// Let's just find "const handleCanvasTouchStart" and prepend prefix + newPrintLogic to it.

const startIdx = code.indexOf('const handleCanvasTouchStart');
if (startIdx > -1) {
  const newPrintLogic = `  const generatePDF = async () => {
    const printArea = document.getElementById('print-area');
    if (!printArea) throw new Error("Print area not found");

    const oldMaxWidth = printArea.style.maxWidth;
    printArea.style.maxWidth = '210mm';
    printArea.style.width = '210mm';
    printArea.style.height = '297mm';
    
    const canvas = await html2canvas(printArea, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794
    });
    
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
    
    return pdf;
  };

  const handlePrint = async () => {
    try {
      setUploadStatus('generating');
      const pdf = await generatePDF();
      pdf.autoPrint();
      window.open(pdf.output('bloburl'), '_blank');
      setUploadStatus('idle');
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
    }
  };

  const handleSaveToDrive = async () => {
    setUploadStatus('generating');
    setErrorMessage(null);
    try {
      const pdf = await generatePDF();
      const pdfBlob = pdf.output('blob');
      
      setUploadStatus('uploading');
      const folderId = localStorage.getItem('drive_pdf_folder_id') || undefined;
      const res = await uploadPDFToDrive(accessToken, pdfBlob, \`Service_Job_\${job.jobNumber}_\${job.serviceDate || job.callDate}.pdf\`, folderId);
      
      setUploadedLink(res.webViewLink);
      setUploadStatus('success');
    } catch (error) {
      console.error("PDF Generate/Upload error:", error);
      setUploadStatus('error');
      setErrorMessage(error.message || 'Unknown error');
    }
  };

  `;
  
  const restOfCode = code.substring(startIdx);
  fs.writeFileSync('src/components/JobPDFModal.tsx', prefix + newPrintLogic + restOfCode);
  console.log("JobPDFModal restored successfully.");
} else {
  console.log("Could not find handleCanvasTouchStart");
}

