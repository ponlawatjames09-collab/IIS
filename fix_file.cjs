const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

// The original file started with the incorrect generated part, then the old `const handlePrint`, then `return (`
const returnIdx = code.indexOf('  return (\n    <div className="fixed inset-0 z-50 overflow-y-auto');

const restOfFile = code.substring(returnIdx);

const newTop = `import React, { useRef, useState, useEffect } from 'react';
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a'; 
  }, []);

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSigned(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); 
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const handleCanvasTouchEnd = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const generatePDF = async () => {
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
    } catch (error: any) {
      console.error("PDF Generate/Upload error:", error);
      setUploadStatus('error');
      setErrorMessage(error.message || 'Unknown error');
    }
  };

`;

fs.writeFileSync('src/components/JobPDFModal.tsx', newTop + restOfFile);
console.log("JobPDFModal structure successfully fixed!");
