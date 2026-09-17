import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Save, File, RefreshCw } from 'lucide-react';
import { SystemSettings } from '../types';

interface QuotationReaderProps {
  settings: SystemSettings;
  accessToken: string | null;
}

interface ExtractedData {
  fileName: string;
  date: string;
  quotationNumber: string;
  jobName: string;
  description: string;
  totalAmount: number | string;
  jobType: string;
  winRate: number | string;
  id?: string;
  customerName?: string;
}

export default function QuotationReader({ settings, accessToken }: QuotationReaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.type.startsWith('image/')) {
      setError('Please upload a PDF or Image file.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccessMsg(null);
    setExtractedData(null);

    // Read file as Base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      
      setIsExtracting(true);
      try {
        const response = await fetch('/api/extract-quotation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileData: base64,
            mimeType: selectedFile.type
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to extract data');
        }

        setExtractedData({
          fileName: selectedFile.name,
          date: data.date || '',
          quotationNumber: data.quotationNumber || '',
          customerName: data.customerName || '',
          jobName: data.jobName || '',
          description: data.description || '',
          totalAmount: data.totalAmount || '',
          jobType: data.jobType === 'CM' ? 'CM' : (data.jobType === 'PM' ? 'PM' : (data.jobType || 'PM')),
          winRate: 50,
          id: new Date().getTime().toString()
        });
      } catch (err: any) {
        setError(err.message || 'Error communicating with extraction service.');
      } finally {
        setIsExtracting(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  
  const handleManualEntry = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering the file upload click
    setExtractedData({
      fileName: 'Manual Entry',
      date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY format approx
      quotationNumber: '',
      customerName: '',
      jobName: '',
      description: '',
      totalAmount: '',
      jobType: 'PM',
      winRate: 50,
      id: new Date().getTime().toString()
    });
  };

  const handleDataChange = (field: keyof ExtractedData, value: string) => {
    if (!extractedData) return;
    setExtractedData({ ...extractedData, [field]: value });
  };

  const handleSaveToSheets = async () => {
    if (!extractedData || !accessToken || !settings.spreadsheetId) {
      setError('Missing data or Google Sheets connection.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Create or append to a "Quotations" sheet
      const sheetName = 'Quotations';
      
      // We will define a function in sheetsService to handle this
      const { appendQuotation } = await import('../sheetsService');
      await appendQuotation(settings.spreadsheetId, extractedData, accessToken);
      
      setSuccessMsg('Quotation data successfully saved to Google Sheets!');
      
      // Reset form optionally or keep it visible
      setTimeout(() => {
        setExtractedData(null);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save to Google Sheets.');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            AI Quotation Reader
          </h2>
          <p className="text-sm text-slate-500 mt-1">Upload a PDF or Image quotation to automatically extract and save its details.</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-start gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-md flex items-start gap-3 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{successMsg}</p>
            </div>
          )}

          {!extractedData && !isExtracting && (
            <div 
              className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={triggerFileInput}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf,image/*" 
                className="hidden" 
              />
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Upload Quotation File</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Select a PDF or Image file. AI will scan the document and extract key fields automatically.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleManualEntry}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded shadow-sm hover:bg-slate-50 transition-colors text-sm"
                >
                  Or Enter Data Manually (กรอกข้อมูลเอง)
                </button>
              </div>
            </div>
          )}

          {isExtracting && (
            <div className="border-2 border-slate-200 rounded-lg p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Extracting Data...</h3>
              <p className="text-sm text-slate-500">Gemini AI is analyzing the document.</p>
            </div>
          )}

          {extractedData && !isExtracting && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded flex items-center justify-center text-indigo-600">
                    <File className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">{file?.name}</p>
                    <p className="text-xs text-slate-500">Data extracted successfully. Please review and edit if necessary.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setExtractedData(null);
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Upload Different File
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">File Name (ชื่อไฟล์)</label>
                  <input 
                    type="text" 
                    value={extractedData.fileName}
                    onChange={(e) => handleDataChange('fileName', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Quotation Number (เลขที่)</label>
                  <input 
                    type="text" 
                    value={extractedData.quotationNumber}
                    onChange={(e) => handleDataChange('quotationNumber', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Date (วันที่)</label>
                  <input 
                    type="text" 
                    value={extractedData.date}
                    onChange={(e) => handleDataChange('date', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Total Amount (จำนวนเงินรวมทั้งสิ้น)</label>
                  <input 
                    type="text" 
                    value={extractedData.totalAmount}
                    onChange={(e) => handleDataChange('totalAmount', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Customer / Hospital (ลูกค้า / โรงพยาบาล)</label>
                  <input 
                    type="text" 
                    value={extractedData.customerName || ''}
                    onChange={(e) => handleDataChange('customerName', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                  />
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Job Name (ชื่องาน)</label>
                  <input 
                    type="text" 
                    value={extractedData.jobName}
                    onChange={(e) => handleDataChange('jobName', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Job Type (ประเภทงาน)</label>
                  <select 
                    value={extractedData.jobType}
                    onChange={(e) => handleDataChange('jobType', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PM">PM</option>
                    <option value="CM">CM</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Win Probability % (โอกาสได้งาน)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={extractedData.winRate}
                    onChange={(e) => handleDataChange('winRate', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description (รายละเอียด)</label>
                  <textarea 
                    value={extractedData.description}
                    onChange={(e) => handleDataChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveToSheets}
                  disabled={isSaving || !accessToken}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSaving ? 'Saving...' : 'Save to Google Sheets'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
