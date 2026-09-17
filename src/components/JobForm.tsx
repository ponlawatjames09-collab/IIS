import React, { useState, useEffect } from 'react';
import { Calendar, Tag, HardDrive, Clipboard, User, Phone, CheckSquare, DollarSign, Wrench, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { ServiceJob, SystemSettings } from '../types';

interface JobFormProps {
  settings: SystemSettings;
  onSaveJob: (job: ServiceJob) => Promise<any>;
  onCalculateJobNumber: (date: string) => Promise<string>;
  editingJob?: ServiceJob | null;
  onCancelEdit?: () => void;
  prefillData?: Partial<ServiceJob>;
}

export default function JobForm({ settings, onSaveJob, onCalculateJobNumber, editingJob, onCancelEdit, prefillData }: JobFormProps) {
  const [formData, setFormData] = useState<Partial<ServiceJob>>({
    jobNumber: '',
    callDate: new Date().toISOString().split('T')[0],
    jobStatus: '-- Select --',
    pmCycle: '',
    jobType: '-- Select --',
    hospitalName: '-- Select --',
    department: '',
    equipmentName: '-- Select --',
    serialNumber: '',
    equipmentType: '',
    problemDescription: '',
    safetyQ1: 'N/A',
    safetyQ2: 'N/A',
    customerName: '',
    customerPhone: '',
    buildingFloor: '',
    engineerName: '-- Select --',
    engineer2: '-- Select --',
    engineer3: '-- Select --',
    engineer4: '-- Select --',
    serviceDate: new Date().toISOString().split('T')[0],
    warrantyStatus: '-- Select --',
    remark: '',
    documentStatus: 'Job Sheet',
    revenue: 0,
    cost: 0,
    product: '',
    isRepair: false,
    isComplain: false,
    spareParts: '',
    sparePartSerial: '',
    sparePartDescription: '',
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
  });

  const [isGeneratingNum, setIsGeneratingNum] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync with editing job when it changes
  useEffect(() => {
    if (editingJob) {
      setFormData(editingJob);
    } else if (prefillData) {
      setFormData(prev => ({...prev, ...prefillData}));
    } else {
      resetForm();
    }
  }, [editingJob, prefillData]);

  // Handle Call Date changed -> Auto-Update Service Date & Calculate next Job Number
  const handleCallDateChange = async (dateVal: string) => {
    if (!dateVal) return;
    
    // Auto sync service date if it wasn't manually altered
    const shouldSyncServiceDate = formData.serviceDate === formData.callDate;

    setFormData(prev => ({
      ...prev,
      callDate: dateVal,
      serviceDate: shouldSyncServiceDate ? dateVal : prev.serviceDate || dateVal
    }));

    if (!editingJob && settings.spreadsheetId) {
      setIsGeneratingNum(true);
      try {
        const nextJobNum = await onCalculateJobNumber(dateVal);
        setFormData(prev => ({ ...prev, jobNumber: nextJobNum }));
      } catch (err: any) {
        // Suppress console.error if it's a 401 (auth) or handle gracefully
        if (err.message && err.message.includes('401')) {
          // It will be handled globally or we can just ignore it here since saving will also fail
        } else {
          console.warn("Failed to generate job number:", err);
        }
      } finally {
        setIsGeneratingNum(false);
      }
    }
  };

  // Run on mount to initialize first Job Number
  useEffect(() => {
    if (!editingJob && settings.spreadsheetId && formData.callDate) {
      handleCallDateChange(formData.callDate);
    }
  }, [settings.spreadsheetId]);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      jobNumber: '',
      callDate: today,
      jobStatus: '-- Select --',
      pmCycle: '',
      jobType: '-- Select --',
      pmTimesTotal: '',
      hospitalName: '-- Select --',
      department: '',
      equipmentName: '-- Select --',
      serialNumber: '',
      equipmentType: '',
      problemDescription: '',
      safetyQ1: 'N/A',
      safetyQ2: 'N/A',
      customerName: '',
      customerPhone: '',
      buildingFloor: '',
      engineerName: '-- Select --',
      serviceDate: today,
      warrantyStatus: '-- Select --',
      remark: '',
      documentStatus: 'Job Sheet',
      revenue: 0,
      cost: 0,
      product: '-- Select --',
      isRepair: false,
      isComplain: false,
      spareParts: '',
      sparePartSerial: '',
      sparePartDescription: '',
      sparePartRemark: '', billingStatus: '-- Select --'
    });
    setErrorMsg(null);
    setSuccessMsg(null);
    // recalculate for the reset date
    handleCallDateChange(today);
  };

  const handleInputChange = (field: keyof ServiceJob, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Form Validations
    if (!formData.jobNumber) {
      setErrorMsg("Job Number is required. Please check your Google Spreadsheet connection.");
      return;
    }
    if (!formData.hospitalName) {
      setErrorMsg("Please select or enter a Hospital Name.");
      return;
    }
    if (!formData.equipmentName) {
      setErrorMsg("Please select or enter an Equipment Name.");
      return;
    }
    if (!formData.engineerName) {
      setErrorMsg("Please select an Engineer.");
      return;
    }

    setIsSaving(true);
    try {
      const savedJob = await onSaveJob(formData as ServiceJob);
      const assignedNum = savedJob?.jobNumber || formData.jobNumber;
      setSuccessMsg(editingJob 
        ? `Service job #${assignedNum} successfully updated!` 
        : `Service job successfully recorded and synced to Google Sheets as Job #${assignedNum}!`
      );
      if (!editingJob) {
        resetForm();
      }
    } catch (err: any) {
      setErrorMsg(`Failed to save job record: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden font-sans" id="job-form-view">
      
      {/* COMPACT HIGH-DENSITY FORM HEADER */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between select-none">
        <h2 className="font-bold text-slate-700 flex items-center gap-2 text-xs uppercase tracking-wider">
          <Wrench className="w-4 h-4 text-blue-600" />
          {editingJob ? `Modify Job Record: #${formData.jobNumber}` : "New Service Record"}
        </h2>
        <span className="text-[10px] bg-blue-100 text-blue-800 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          {editingJob ? "Edit Active" : "Intake Module"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        
        {/* Messages */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs animate-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Validation Notice</span>
              <p className="text-slate-600 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded text-xs animate-in slide-in-from-top-1">
            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">System Status: OK</span>
              <p className="text-slate-600 mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {/* SECTION 1: Core Identifiers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">1. Core Identifiers</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Call Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Call Date (วันที่แจ้ง)</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  required
                  value={formData.callDate}
                  onChange={(e) => handleCallDateChange(e.target.value)}
                  className="w-full pl-8 pr-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Service Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Service Date (วันที่เข้าทำ)</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  required
                  value={formData.serviceDate}
                  onChange={(e) => handleInputChange('serviceDate', e.target.value)}
                  className="w-full pl-8 pr-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Job Number (Auto) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Job Number (เลขที่ใบงาน)</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  disabled
                  value={formData.jobNumber || ''}
                  placeholder={isGeneratingNum ? "Calculating..." : "Auto-Generated ID"}
                  className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                />
                {isGeneratingNum && (
                  <RefreshCw className="absolute right-2.5 top-2 w-3.5 h-3.5 text-blue-500 animate-spin" />
                )}
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: Work Parameters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2. Work Parameters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            
            {/* Job Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Job Status</label>
              <select
                value={formData.jobStatus}
                onChange={(e) => handleInputChange('jobStatus', e.target.value)}
                className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="-- Select --">-- Select --</option>
                <option value="Inprogress">In Progress</option>
                <option value="Done">Done</option>
                <option value="Pending">Pending</option>
                
                <option value="Cancelled">Cancelled</option>
                <option value="Sale Support">Sale Support</option>
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Job Type</label>
              <select
                value={formData.jobType}
                onChange={(e) => handleInputChange('jobType', e.target.value)}
                className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="-- Select --">-- Select --</option>
                <option value="PM">PM (Preventive)</option>
                <option value="CM">CM (Corrective)</option>
                <option value="IB">IB (Installation)</option>
                <option value="FCO">FCO (Upgrade)</option>
                <option value="other">Orther (Orther)</option>
              </select>
            </div>

            {/* PM Cycle - only visible for PM jobs */}
            <div className={`transition-all duration-200 ${formData.jobType === 'PM' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                PM Cycle <span className="text-[9px] text-slate-400 font-mono">(PM Only)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 01/2026"
                disabled={formData.jobType !== 'PM'}
                value={formData.pmCycle || ''}
                onChange={(e) => handleInputChange('pmCycle', e.target.value)}
                className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* PM Times/Total - only visible for PM jobs */}
            <div className={`transition-all duration-200 ${formData.jobType === 'PM' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                PM Times <span className="text-[9px] text-slate-400 font-mono">(Current / Total)</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  disabled={formData.jobType !== 'PM'}
                  value={formData.pmTimesTotal?.split('/')[0] || ''}
                  onChange={(e) => {
                    const current = e.target.value;
                    const total = formData.pmTimesTotal?.split('/')[1] || '1';
                    if (current) {
                      handleInputChange('pmTimesTotal', `${current}/${total}`);
                    } else {
                      handleInputChange('pmTimesTotal', '');
                    }
                  }}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-</option>
                  {Array.from({ length: 32 }, (_, i) => i + 1).map(num => (
                    <option key={`curr-${num}`} value={num}>{num}</option>
                  ))}
                </select>
                <span className="text-slate-500 font-bold">/</span>
                <select
                  disabled={formData.jobType !== 'PM'}
                  value={formData.pmTimesTotal?.split('/')[1] || ''}
                  onChange={(e) => {
                    const total = e.target.value;
                    const current = formData.pmTimesTotal?.split('/')[0] || '1';
                    if (total) {
                      handleInputChange('pmTimesTotal', `${current}/${total}`);
                    } else {
                      handleInputChange('pmTimesTotal', '');
                    }
                  }}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-</option>
                  {Array.from({ length: 32 }, (_, i) => i + 1).map(num => (
                    <option key={`total-${num}`} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Warranty Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Warranty Status</label>
              <select
                value={formData.warrantyStatus}
                onChange={(e) => handleInputChange('warrantyStatus', e.target.value)}
                className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="-- Select --">-- Select --</option>
                <option value="Guarantee">Guarantee</option>
                <option value="Contract">Contract</option>
                <option value="SaleSupport">SaleSupport</option>
                <option value="Paid Repair">Paid Repair</option>
              </select>
            </div>

          </div>
        </div>

        {/* SECTION 3: Device & Site Location */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">3. Device & Location</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Hospital Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hospital Name (โรงพยาบาล)</label>
              <input
                type="text"
                list="hospital-list"
                placeholder="Select or enter new hospital..."
                value={formData.hospitalName}
                onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <datalist id="hospital-list">
                {settings.hospitals.map((hospital) => (
                  <option key={hospital} value={hospital} />
                ))}
              </datalist>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department (แผนกที่ตั้งเครื่อง)</label>
              <input
                type="text"
                placeholder="e.g. OR, ER, X-RAY"
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Product */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Product (ชนิดสินค้า)</label>
              <select
                value={formData.product || ''}
                onChange={(e) => handleInputChange('product', e.target.value)}
                className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Select --</option>
                {settings.products?.map((prod) => (
                  <option key={prod} value={prod}>{prod}</option>
                ))}
              </select>
            </div>

            {/* Equipment Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Equipment Name (รุ่น/ชื่อเครื่อง)</label>
              <select
                value={formData.equipmentName}
                onChange={(e) => handleInputChange('equipmentName', e.target.value)}
                className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Select --</option>
                {settings.equipments.map((eq) => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
                {formData.equipmentName && !settings.equipments.includes(formData.equipmentName) && (
                  <option key="custom" value={formData.equipmentName}>{formData.equipmentName}</option>
                )}
              </select>
            </div>

            {/* Serial Number & Equipment Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Serial Number (S/N)</label>
                <input
                  type="text"
                  placeholder="e.g. 01J0PM123/1234"
                  value={formData.serialNumber || ''}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Equipment Type</label>
                <input
                  type="text"
                  placeholder="e.g. 718 095, 718 096, 718 033"
                  value={formData.equipmentType || ''}
                  onChange={(e) => handleInputChange('equipmentType', e.target.value)}
                  className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 4: Customer Details & Safety Questions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">4. Customer & Safety Questions</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Customer Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Customer Name (ผู้ติดต่อ)</label>
              <div className="relative">
                <User className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Customer Representative"
                  value={formData.customerName || ''}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="w-full pl-8 pr-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Customer Phone (เบอร์โทร)</label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Phone number"
                  value={formData.customerPhone || ''}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  className="w-full pl-8 pr-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Building Floor */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Building & Floor (อาคาร/ชั้น)</label>
              <input
                type="text"
                placeholder="e.g. Building A, Floor 3"
                value={formData.buildingFloor || ''}
                onChange={(e) => handleInputChange('buildingFloor', e.target.value)}
                className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded border border-slate-200">
            {/* Safety Q1 */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Safety Q1: Electrical & Grounding Check?
              </label>
              <div className="flex gap-1.5">
                {(['No', 'Yes', 'N/A'] as const).map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleInputChange('safetyQ1', option)}
                    className={`flex-1 py-1 text-xs font-bold rounded cursor-pointer transition-all border ${
                      formData.safetyQ1 === option
                        ? option === 'Yes' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : option === 'No' ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-700 text-white border-slate-700 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Safety Q2 */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Safety Q2: Mechanical & Radiation Integrity?
              </label>
              <div className="flex gap-1.5">
                {(['No', 'Yes', 'N/A'] as const).map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleInputChange('safetyQ2', option)}
                    className={`flex-1 py-1 text-xs font-bold rounded cursor-pointer transition-all border ${
                      formData.safetyQ2 === option
                        ? option === 'Yes' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : option === 'No' ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-700 text-white border-slate-700 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Technical Findings & Profit Logging */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">5. Work Details & Financials</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Problem Description */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Problem Description & Error Codes อาการเสีย</label>
              <textarea
                rows={2}
                placeholder="Describe fault reported or error codes..."
                value={formData.problemDescription || ''}
                onChange={(e) => handleInputChange('problemDescription', e.target.value)}
                className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Remarks / Fix Action */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Correction Details & Spare Parts Replaced การแก้ไข</label>
              <textarea
                rows={2}
                placeholder="Describe actions taken or parts replaced..."
                value={formData.remark || ''}
                onChange={(e) => handleInputChange('remark', e.target.value)}
                className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Job Options: Repair & Complain */}
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={formData.isRepair || false}
                onChange={(e) => handleInputChange('isRepair', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-700">Repair</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={formData.isComplain || false}
                onChange={(e) => handleInputChange('isComplain', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-700">Complain</span>
            </label>
          </div>

          {/* Spare Parts Information (Up to 3 parts) */}
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
                      value={(formData as any)[`spareParts${prefix}`] || ''}
                      onChange={(e) => handleInputChange(`spareParts${prefix}` as keyof ServiceJob, e.target.value)}
                      className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Serial No. / 12 NC.</label>
                    <input
                      type="text"
                      placeholder="e.g. 12NC or S/N"
                      value={(formData as any)[`sparePartSerial${prefix}`] || ''}
                      onChange={(e) => handleInputChange(`sparePartSerial${prefix}` as keyof ServiceJob, e.target.value)}
                      className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">DESCRIPTION</label>
                    <input
                      type="text"
                      placeholder="e.g. Description"
                      value={(formData as any)[`sparePartDescription${prefix}`] || ''}
                      onChange={(e) => handleInputChange(`sparePartDescription${prefix}` as keyof ServiceJob, e.target.value)}
                      className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">REMARK / หมายเหตุ</label>
                    <input
                      type="text"
                      placeholder="e.g. Remark"
                      value={(formData as any)[`sparePartRemark${prefix}`] || ''}
                      onChange={(e) => handleInputChange(`sparePartRemark${prefix}` as keyof ServiceJob, e.target.value)}
                      className="w-full px-2.5 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Engineer Assignment (1-4) */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Engineer 1 (ช่างหลัก)</label>
                <select
                  value={formData.engineerName}
                  onChange={(e) => handleInputChange('engineerName', e.target.value)}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select --</option>
                  {settings.engineers.map((eng) => (
                    <option key={eng} value={eng}>{eng}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Engineer 2</label>
                <select
                  value={formData.engineer2}
                  onChange={(e) => handleInputChange('engineer2', e.target.value)}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select --</option>
                  {settings.engineers.map((eng) => (
                    <option key={eng} value={eng}>{eng}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Engineer 3</label>
                <select
                  value={formData.engineer3}
                  onChange={(e) => handleInputChange('engineer3', e.target.value)}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select --</option>
                  {settings.engineers.map((eng) => (
                    <option key={eng} value={eng}>{eng}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Engineer 4</label>
                <select
                  value={formData.engineer4}
                  onChange={(e) => handleInputChange('engineer4', e.target.value)}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Select --</option>
                  {settings.engineers.map((eng) => (
                    <option key={eng} value={eng}>{eng}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Document Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Document Status</label>
              <select
                value={formData.documentStatus}
                onChange={(e) => handleInputChange('documentStatus', e.target.value)}
                className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Job Sheet">Job Sheet</option>
                <option value="Job Sheet PA Tool">Job Sheet PA Tool</option>
              </select>
            </div>

            {/* Billing Status (PM and CM Paid Repair) */}
            {((formData.jobType === 'PM' && formData.warrantyStatus === 'Contract') || (formData.jobType === 'CM' && formData.warrantyStatus === 'Paid Repair')) && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Billing Status (พัสดุ)</label>
                <select
                  value={formData.billingStatus || '-- Select --'}
                  onChange={(e) => handleInputChange('billingStatus', e.target.value)}
                  className="w-full px-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="-- Select --">-- Select --</option>
                  <option value="ยังไม่ได้วางบิล">ยังไม่ได้วางบิล</option>
                  <option value="วางบิลเรียบร้อยแล้ว">วางบิลเรียบร้อยแล้ว</option>
                </select>
              </div>
            )}

            {/* Financial Revenue & Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">ยอดเงินสุทธิ (฿)</label>
                <div className="relative">
                  <div className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400">฿</div>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={formData.revenue || ''}
                    onChange={(e) => handleInputChange('revenue', Number(e.target.value))}
                    className="w-full pl-6 pr-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">ต้นทุน (฿)</label>
                <div className="relative">
                  <div className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400">฿</div>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={formData.cost || ''}
                    onChange={(e) => handleInputChange('cost', Number(e.target.value))}
                    className="w-full pl-6 pr-2 min-h-[44px] md:min-h-0 py-2 md:py-1.5 text-sm md:text-xs bg-white border border-slate-300 rounded text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER: Buttons */}
        <div className="flex flex-col md:flex-row gap-3 border-t border-slate-200 pt-4 mt-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 md:flex-none px-4 min-h-[44px] md:min-h-0 py-2 md:py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm md:text-xs rounded cursor-pointer transition-colors"
            >
              Reset Form
            </button>
            
            {editingJob && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="flex-1 md:flex-none px-4 min-h-[44px] md:min-h-0 py-2 md:py-1.5 border border-rose-300 hover:bg-rose-50 text-rose-600 font-bold text-sm md:text-xs rounded cursor-pointer transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving || isGeneratingNum}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold min-h-[44px] md:min-h-0 py-2.5 md:py-1.5 px-4 rounded cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-xs"
            id="btn-save-job"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>SAVING TO GOOGLE SHEET...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{editingJob ? "SAVE MODIFIED RECORD" : "SAVE TO GOOGLE SHEET"}</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
