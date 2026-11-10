const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

// Replace handleSaveToDrive and handlePrint with a combined helper
const oldPrintLogic = code.substring(
  code.indexOf('const handlePrint = () => {'),
  code.indexOf('const handleCanvasTouchStart')
);

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
    } catch (error: any) {
      console.error("PDF Generate/Upload error:", error);
      setUploadStatus('error');
      setErrorMessage(error.message || 'Unknown error');
    }
  };

  `;

code = code.replace(oldPrintLogic, newPrintLogic);

// Fix layout overlapping in print-area
code = code.replace(
  'className="text-[10px] md:text-xs text-black-safe"',
  'className="text-[9px] md:text-[10px] text-black-safe leading-tight"'
);
code = code.replace(
  'min-h-[50px]',
  'min-h-[40px]' // reduce height to avoid overlap
);
code = code.replace(
  'min-h-[50px]',
  'min-h-[40px]'
);
code = code.replace(
  'h-7',
  'h-6'
);
code = code.replace(
  'h-7',
  'h-6'
);
code = code.replace(
  'h-7',
  'h-6'
);
code = code.replace(
  'h-7',
  'h-6'
);
code = code.replace(
  'h-7',
  'h-6'
);
code = code.replace(
  'h-10',
  'h-8'
);

fs.writeFileSync('src/components/JobPDFModal.tsx', code);
console.log("JobPDFModal print logic patched.");
