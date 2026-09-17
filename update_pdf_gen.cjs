const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

if (!code.includes("import html2canvas from 'html2canvas';")) {
  code = code.replace(
    "import { jsPDF } from 'jspdf';",
    "import { jsPDF } from 'jspdf';\nimport html2canvas from 'html2canvas';"
  );
}

const startMarker = '  // Generate jsPDF and upload to Google Drive\n  const handleSaveToDrive = async () => {';
const endMarker = '    } catch (err: any) {';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers for handleSaveToDrive", startIndex, endIndex);
  process.exit(1);
}

const newFunction = `  // Generate jsPDF from visual preview and upload to Google Drive
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
      const res = await uploadPDFToDrive(accessToken, pdfBlob, \`Service_Job_\${job.jobNumber}_Worksheet.pdf\`, folderId);
      
      setUploadedLink(res.webViewLink);
      setUploadStatus('success');
`;

code = code.substring(0, startIndex) + newFunction + code.substring(endIndex);

fs.writeFileSync('src/components/JobPDFModal.tsx', code);
console.log("Successfully updated handleSaveToDrive to use html2canvas.");
