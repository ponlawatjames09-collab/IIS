import React, { useState, useEffect } from 'react';
import { Database, Activity, Plus, Trash2, CheckCircle2, MessageSquare, AlertCircle, Save, FolderOpen, RefreshCw, User, Link2, Copy, Check, KeyRound, Code2, LogIn, LogOut } from 'lucide-react';
import { SystemSettings } from '../types';
import { createSpreadsheet, testSheetsConnection } from '../sheetsService';
import { createDriveFolder } from '../driveService';
import { GOOGLE_APPS_SCRIPT_CODE } from '../gasBridgeTemplate';
import { BRIDGE_TOKEN_SENTINEL, pingGoogleBridge, setGoogleBridgeConfig } from '../googleBridgeClient';

export interface BridgeStatusInfo {
  configured: boolean;
  mode: 'gas' | 'service_account' | 'none';
  gasWebAppUrl?: string;
  hasServiceAccount?: boolean;
  serviceAccountEmail?: string | null;
}

interface SettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  accessToken: string | null;
  bridgeStatus?: BridgeStatusInfo;
  onBridgeStatusChange?: (status: BridgeStatusInfo) => void;
  isOAuthSignedIn?: boolean;
  onGoogleSignIn?: () => Promise<void>;
  onGoogleSignOut?: () => Promise<void>;
}

export default function Settings({
  settings,
  onUpdateSettings,
  accessToken,
  bridgeStatus,
  onBridgeStatusChange,
  isOAuthSignedIn,
  onGoogleSignIn,
  onGoogleSignOut
}: SettingsProps) {
  const effectiveToken = accessToken || BRIDGE_TOKEN_SENTINEL;

  const [spreadsheetInput, setSpreadsheetInput] = useState(settings.spreadsheetId || '');
  const [pmSpreadsheetInput, setPmSpreadsheetInput] = useState(settings.pmSpreadsheetId || '');
  const [cmOnCallSpreadsheetInput, setCmOnCallSpreadsheetInput] = useState(settings.cmOnCallSpreadsheetId || '19c9vJhO4qMdCP1O7rwWP_aUZyTqQrTwnzWWxtH7zDdE');

  // No-Login Bridge states
  const [bridgeTab, setBridgeTab] = useState<'gas' | 'service_account'>(
    bridgeStatus?.mode === 'gas' ? 'gas' : 'service_account'
  );
  const [gasUrlInput, setGasUrlInput] = useState(settings.gasWebAppUrl || bridgeStatus?.gasWebAppUrl || '');
  const [serviceAccountInput, setServiceAccountInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSaEmail, setCopiedSaEmail] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [isSavingBridge, setIsSavingBridge] = useState(false);
  const [isTestingBridge, setIsTestingBridge] = useState(false);

  const [isCreatingSpreadsheet, setIsCreatingSpreadsheet] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [spreadsheetError, setSpreadsheetError] = useState<string | null>(null);
  const [spreadsheetSuccess, setSpreadsheetSuccess] = useState<string | null>(null);

  // Lists management states
  const [newEngineer, setNewEngineer] = useState('');
  const [newEngineerEmail, setNewEngineerEmail] = useState('');
  const [newHospital, setNewHospital] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [newProduct, setNewProduct] = useState('');

  // Line config states
  const [lineNotifyToken, setLineNotifyToken] = useState(settings.lineConfig.notifyToken);
  const [lineIsEnabled, setLineIsEnabled] = useState(settings.lineConfig.isEnabled);

  useEffect(() => {
    setSpreadsheetInput(settings.spreadsheetId || '');
  }, [settings.spreadsheetId]);

  useEffect(() => {
    setPmSpreadsheetInput(settings.pmSpreadsheetId || '');
  }, [settings.pmSpreadsheetId]);

  useEffect(() => {
    if (settings.cmOnCallSpreadsheetId) {
      setCmOnCallSpreadsheetInput(settings.cmOnCallSpreadsheetId);
    }
  }, [settings.cmOnCallSpreadsheetId]);

  useEffect(() => {
    if (bridgeStatus?.mode === 'service_account') {
      setGasUrlInput('');
      setBridgeTab('service_account');
    } else {
      const url = settings.gasWebAppUrl || bridgeStatus?.gasWebAppUrl || '';
      if (url) {
        setGasUrlInput(url);
        setBridgeTab('gas');
      }
    }
  }, [settings.gasWebAppUrl, bridgeStatus?.gasWebAppUrl, bridgeStatus?.mode]);

  const syncServerBridgeConfig = async (payload: Record<string, any>) => {
    const res = await fetch('/api/bridge/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save server bridge configuration');
    }
    setGoogleBridgeConfig({
      gasWebAppUrl: data.gasWebAppUrl || null,
      serverConfigured: Boolean(data.configured),
      preferBridge: true
    });
    if (onBridgeStatusChange) {
      onBridgeStatusChange({
        configured: Boolean(data.configured),
        mode: data.mode || 'none',
        gasWebAppUrl: data.gasWebAppUrl || '',
        hasServiceAccount: Boolean(data.hasServiceAccount),
        serviceAccountEmail: data.serviceAccountEmail || null
      });
    }
    return data;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      setShowCodePreview(true);
    }
  };

  const handleSaveGasUrl = async () => {
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    const trimmed = gasUrlInput.trim();
    if (trimmed && !trimmed.startsWith('https://script.google.com/')) {
      setSpreadsheetError('Web App URL ควรขึ้นต้นด้วย https://script.google.com/macros/s/.../exec');
      return;
    }

    setIsSavingBridge(true);
    try {
      const serverData = await syncServerBridgeConfig({
        gasWebAppUrl: trimmed,
        spreadsheetId: spreadsheetInput.trim(),
        pmSpreadsheetId: pmSpreadsheetInput.trim(),
        cmOnCallSpreadsheetId: cmOnCallSpreadsheetInput.trim()
      });
      onUpdateSettings({
        ...settings,
        gasWebAppUrl: trimmed || null
      });
      if (trimmed) {
        await pingGoogleBridge(trimmed);
        setSpreadsheetSuccess('เชื่อมต่อ Google Apps Script Bridge สำเร็จ! ทุกเครื่องสามารถใช้งานได้ทันทีโดยไม่ต้อง Login Google');
      } else {
        setSpreadsheetSuccess(
          serverData.hasServiceAccount
            ? 'ล้าง Apps Script URL แล้ว (ระบบสลับไปใช้ Service Account อัตโนมัติ)'
            : 'ล้าง Apps Script URL เรียบร้อยแล้ว'
        );
      }
    } catch (err: any) {
      setSpreadsheetError(`บันทึกหรือทดสอบ Bridge ไม่สำเร็จ: ${err.message || err}`);
    } finally {
      setIsSavingBridge(false);
    }
  };

  const handleTestBridge = async () => {
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    setIsTestingBridge(true);
    try {
      const targetUrl = gasUrlInput.trim() || undefined;
      const result = await pingGoogleBridge(targetUrl);
      setSpreadsheetSuccess(`Bridge ทำงานปกติ: ${result?.message || 'Connected'}`);
    } catch (err: any) {
      setSpreadsheetError(`ทดสอบ Bridge ไม่สำเร็จ: ${err.message || err}`);
    } finally {
      setIsTestingBridge(false);
    }
  };

  const handleSaveServiceAccount = async () => {
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    if (!serviceAccountInput.trim()) {
      setSpreadsheetError('กรุณาวาง JSON Key ของ Google Service Account');
      return;
    }
    setIsSavingBridge(true);
    try {
      const data = await syncServerBridgeConfig({
        gasWebAppUrl: '',
        serviceAccountJson: serviceAccountInput.trim(),
        spreadsheetId: spreadsheetInput.trim(),
        pmSpreadsheetId: pmSpreadsheetInput.trim(),
        cmOnCallSpreadsheetId: cmOnCallSpreadsheetInput.trim()
      });
      setGasUrlInput('');
      onUpdateSettings({
        ...settings,
        gasWebAppUrl: null
      });
      setServiceAccountInput('');
      setSpreadsheetSuccess(`บันทึก Service Account (${data.serviceAccountEmail}) และเปิดใช้งานถาวรสำเร็จ!`);
    } catch (err: any) {
      setSpreadsheetError(`บันทึก Service Account ไม่สำเร็จ: ${err.message || err}`);
    } finally {
      setIsSavingBridge(false);
    }
  };

  const handleClearServiceAccount = async () => {
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    setIsSavingBridge(true);
    try {
      await syncServerBridgeConfig({ clearServiceAccount: true });
      setSpreadsheetSuccess('ลบ Service Account ออกจากเซิร์ฟเวอร์เรียบร้อยแล้ว');
    } catch (err: any) {
      setSpreadsheetError(`ลบ Service Account ไม่สำเร็จ: ${err.message || err}`);
    } finally {
      setIsSavingBridge(false);
    }
  };

  const saveSpreadsheetId = async () => {
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    if (!spreadsheetInput.trim()) {
      setSpreadsheetError("Please enter a valid Google Spreadsheet ID.");
      return;
    }
    const cleanId = spreadsheetInput.trim();
    onUpdateSettings({
      ...settings,
      spreadsheetId: cleanId
    });
    try {
      await syncServerBridgeConfig({ spreadsheetId: cleanId });
    } catch {}
    setSpreadsheetSuccess("Google Spreadsheet ID saved and synced across devices!");
  };

  const savePmSpreadsheetId = async () => {
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    const cleanId = pmSpreadsheetInput.trim();
    onUpdateSettings({
      ...settings,
      pmSpreadsheetId: cleanId
    });
    try {
      await syncServerBridgeConfig({ pmSpreadsheetId: cleanId });
    } catch {}
    setSpreadsheetSuccess("PM Spreadsheet ID saved and synced!");
  };

  const saveCmOnCallSpreadsheetId = async () => {
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    const cleanId = cmOnCallSpreadsheetInput.trim();
    onUpdateSettings({
      ...settings,
      cmOnCallSpreadsheetId: cleanId
    });
    try {
      await syncServerBridgeConfig({ cmOnCallSpreadsheetId: cleanId });
    } catch {}
    setSpreadsheetSuccess("CM On Call Spreadsheet ID saved and synced!");
  };

  const handleAutoCreateSpreadsheet = async () => {
    setIsCreatingSpreadsheet(true);
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    try {
      const newId = await createSpreadsheet(effectiveToken);
      setSpreadsheetInput(newId);
      onUpdateSettings({
        ...settings,
        spreadsheetId: newId
      });
      try {
        await syncServerBridgeConfig({ spreadsheetId: newId });
      } catch {}
      setSpreadsheetSuccess("Brand new Service Job Hub - 2026 Spreadsheet successfully created in Google Drive with all 12 monthly sheets!");
    } catch (err: any) {
      setSpreadsheetError(`Failed to create spreadsheet: ${err.message || err}`);
    } finally {
      setIsCreatingSpreadsheet(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.spreadsheetId) {
      setSpreadsheetError("No Spreadsheet ID configured. Please set one first.");
      return;
    }

    setIsTestingConnection(true);
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);

    try {
      const headerRow = await testSheetsConnection(settings.spreadsheetId, effectiveToken);
      const headerStr = headerRow.length > 0 ? headerRow.join(', ') : 'Empty Header';
      setSpreadsheetSuccess(`Connection successful! Header row: [${headerStr}]`);
    } catch (err: any) {
      setSpreadsheetError(`Connection failed: ${err.message || err}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleTestPmConnection = async () => {
    if (!settings.pmSpreadsheetId) {
      setSpreadsheetError("No PM Spreadsheet ID configured.");
      return;
    }

    setIsTestingConnection(true);
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);

    try {
      const headerRow = await testSheetsConnection(settings.pmSpreadsheetId, effectiveToken);
      const headerStr = headerRow.length > 0 ? headerRow.join(', ') : 'Empty Header';
      setSpreadsheetSuccess(`PM Connection successful! Header row: [${headerStr}]`);
    } catch (err: any) {
      setSpreadsheetError(`PM Connection failed: ${err.message || err}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleCreateDriveFolder = async () => {
    setIsCreatingFolder(true);
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    try {
      const folderId = await createDriveFolder(effectiveToken, "Service Job Sheets PDF");
      localStorage.setItem('drive_pdf_folder_id', folderId);
      onUpdateSettings({
        ...settings,
        drivePdfFolderId: folderId
      });
      try {
        await syncServerBridgeConfig({ drivePdfFolderId: folderId });
      } catch {}
      setSpreadsheetSuccess(`Successfully created Google Drive folder 'Service Job Sheets PDF' (ID: ${folderId}) to store all client job PDFs!`);
    } catch (err: any) {
      setSpreadsheetError(`Failed to create Drive folder: ${err.message || err}`);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleSaveLineConfig = () => {
    onUpdateSettings({
      ...settings,
      lineConfig: {
        ...settings.lineConfig,
        notifyToken: lineNotifyToken.trim(),
        isEnabled: lineIsEnabled
      }
    });
    setSpreadsheetSuccess("Line OA Integration settings updated successfully!");
  };

  
  const handleAddEngineer = () => {
    if (!newEngineer.trim()) return;
    const name = newEngineer.trim();
    const email = newEngineerEmail.trim();
    const list = settings.engineers || [];
    
    if (!list.includes(name)) {
      list.push(name);
    }
    
    const newEmails = { ...(settings.engineerEmails || {}) };
    if (email) {
      newEmails[name] = email;
    }
    
    onUpdateSettings({
      ...settings,
      engineers: list,
      engineerEmails: newEmails
    });
    
    setNewEngineer('');
    setNewEngineerEmail('');
  };

  const addListItem = (type: 'engineers' | 'hospitals' | 'equipments' | 'products', value: string, setter: (val: string) => void) => {
    if (!value.trim()) return;
    const list = settings[type] || [];
    if (list.includes(value.trim())) return;
    onUpdateSettings({
      ...settings,
      [type]: [...list, value.trim()]
    });
    setter('');
  };

  const removeListItem = (type: 'engineers' | 'hospitals' | 'equipments' | 'products', item: string) => {
    const list = settings[type] || [];
    onUpdateSettings({
      ...settings,
      [type]: list.filter(x => x !== item)
    });
  };

  const isBridgeActive = Boolean(bridgeStatus?.configured || settings.gasWebAppUrl);

  return (
    <div className="w-full space-y-4 font-sans" id="settings-view">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5 select-none">
        <div>
          <h1 className="text-base font-bold text-slate-800 tracking-tight">System Connections</h1>
          <p className="text-slate-500 text-xs mt-0.5">เชื่อมต่อ Google Sheets & Drive แบบ Real-time โดยไม่ต้อง Login Google (Apps Script Bridge / Service Account)</p>
        </div>
        <div className="flex items-center gap-2">
          {bridgeStatus?.mode === 'gas' || settings.gasWebAppUrl ? (
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Apps Script Bridge Active (No Login)
            </span>
          ) : bridgeStatus?.mode === 'service_account' ? (
            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Service Account Active (No Login)
            </span>
          ) : isOAuthSignedIn ? (
            <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded text-[11px] font-bold">
              Google OAuth Session
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[11px] font-bold">
              รอตั้งค่า Bridge Connection
            </span>
          )}
        </div>
      </div>

      {/* Notifications banner */}
      {(spreadsheetError || spreadsheetSuccess) && (
        <div className="animate-in fade-in duration-200">
          {spreadsheetError && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 p-3 rounded shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <span className="font-bold text-xs">System Alert</span>
                <p className="text-[11px] text-red-700 mt-0.5 whitespace-pre-wrap">{spreadsheetError}</p>
              </div>
            </div>
          )}
          {spreadsheetSuccess && (
            <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded shadow-2xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-bold text-xs">Connection Secured</span>
                <p className="text-[11px] text-emerald-700 mt-0.5">{spreadsheetSuccess}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left column: Connections */}
        <div className="lg:col-span-2 space-y-4">

          {/* Card 0: No-Login Google Bridge Setup */}
          <div className="bg-white rounded border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-xs text-slate-800 uppercase tracking-wider">No-Login Google Sheets Bridge (แนวทางที่ 1)</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">เชื่อมต่อไฟล์ Google Sheets เดิมแบบ Real-time จากทุกเครื่องโดยตัดหน้า Google Login ออกทั้งหมด</p>
                </div>
              </div>

              <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setBridgeTab('gas')}
                  className={`px-2.5 py-1 rounded cursor-pointer transition-all ${bridgeTab === 'gas' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Apps Script Bridge (แนะนำ)
                </button>
                <button
                  type="button"
                  onClick={() => setBridgeTab('service_account')}
                  className={`px-2.5 py-1 rounded cursor-pointer transition-all ${bridgeTab === 'service_account' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Service Account
                </button>
              </div>
            </div>

            {bridgeTab === 'gas' ? (
              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>ขั้นตอนตั้งค่าครั้งเดียว (ใช้งานได้ทุกเครื่องตลอดไป):</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowCodePreview(!showCodePreview)}
                        className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>{showCodePreview ? 'ซ่อนโค้ด' : 'ดูโค้ด'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'คัดลอก Code.gs แล้ว!' : 'คัดลอก Code.gs'}</span>
                      </button>
                    </div>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
                    <li>เปิดไฟล์ Google Sheet ของคุณ แล้วกดเมนู <strong>Extensions (ส่วนขยาย) &gt; Apps Script</strong> หรือไปที่ <code className="bg-white px-1 py-0.5 rounded border border-slate-200">script.google.com</code></li>
                    <li>ลบโค้ดเดิมออกทั้งหมด แล้วกด <strong>คัดลอก Code.gs</strong> ด้านบนไปวางแทนที่ จากนั้นกด Save (Ctrl+S)</li>
                    <li>กด <strong>Deploy &gt; New deployment &gt; Select type: Web app</strong> ตั้งค่า <strong>Execute as: Me</strong> และ <strong>Who has access: Anyone</strong> แล้วกด Deploy และอนุญาตสิทธิ์ Google ครั้งแรก</li>
                    <li>คัดลอก <strong>Web app URL</strong> (<code className="bg-white px-1 py-0.5 rounded border border-slate-200">https://script.google.com/macros/s/.../exec</code>) มาวางในช่องด้านล่างแล้วกดบันทึก</li>
                  </ol>
                </div>

                {showCodePreview && (
                  <pre className="bg-slate-950 text-emerald-300 text-[10px] font-mono p-3 rounded max-h-56 overflow-auto border border-slate-800">
                    {GOOGLE_APPS_SCRIPT_CODE}
                  </pre>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Google Apps Script Web App URL</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={gasUrlInput}
                      onChange={(e) => setGasUrlInput(e.target.value)}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 placeholder-slate-400 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleSaveGasUrl}
                      disabled={isSavingBridge}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 md:py-1.5 rounded font-bold text-xs shadow-sm transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isSavingBridge ? 'กำลังบันทึก...' : 'Save & Test Bridge'}
                    </button>
                    <button
                      type="button"
                      onClick={handleTestBridge}
                      disabled={isTestingBridge || (!gasUrlInput.trim() && !isBridgeActive)}
                      className="border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 md:py-1.5 rounded font-bold text-xs cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isTestingBridge ? 'Testing...' : 'Ping Bridge'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {bridgeStatus?.hasServiceAccount && bridgeStatus.serviceAccountEmail && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded p-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs">
                      <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Service Account พร้อมใช้งาน:</span>
                      </div>
                      <p className="font-mono text-[11px] text-indigo-700 mt-0.5 break-all">{bridgeStatus.serviceAccountEmail}</p>
                      <p className="text-[10px] text-indigo-600 mt-1">* อย่าลืมกด Share (สิทธิ์ Editor) บน Google Sheet และ Drive Folder ให้กับ Email นี้</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(bridgeStatus.serviceAccountEmail || '');
                          setCopiedSaEmail(true);
                          setTimeout(() => setCopiedSaEmail(false), 2000);
                        }}
                        className="px-2.5 py-1 bg-white border border-indigo-300 text-indigo-700 rounded text-[11px] font-bold cursor-pointer"
                      >
                        {copiedSaEmail ? 'Copied!' : 'Copy Email'}
                      </button>
                      <button
                        type="button"
                        onClick={handleClearServiceAccount}
                        disabled={isSavingBridge}
                        className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[11px] font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    วาง Service Account Credentials JSON (จาก Google Cloud IAM)
                  </label>
                  <textarea
                    rows={4}
                    value={serviceAccountInput}
                    onChange={(e) => setServiceAccountInput(e.target.value)}
                    placeholder='{"type": "service_account", "project_id": "...", "client_email": "...@....iam.gserviceaccount.com", "private_key": "-----BEGIN PRIVATE KEY-----..."}'
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 placeholder-slate-400 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleSaveServiceAccount}
                      disabled={isSavingBridge}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded font-bold text-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSavingBridge ? 'กำลังบันทึก...' : 'Save Service Account JSON'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Legacy OAuth row */}
            {(onGoogleSignIn || onGoogleSignOut) && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-500">
                  ตัวเลือกเสริม: {isOAuthSignedIn ? 'เชื่อมต่อ Google Account ส่วนตัวอยู่ด้วย' : 'ใช้งานแบบ No-Login Bridge (ไม่ต้องเข้าสู่ระบบ Google)'}
                </span>
                {isOAuthSignedIn ? (
                  <button
                    type="button"
                    onClick={() => onGoogleSignOut && onGoogleSignOut()}
                    className="px-2.5 py-1 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign out Google Account</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onGoogleSignIn && onGoogleSignIn()}
                    className="px-2.5 py-1 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Sign in with Google (Optional)</span>
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Card 1: Google Sheet ID config */}
          <div className="bg-white rounded border border-slate-200 p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Google Sheets Connection</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">ระบุ Spreadsheet ID ของไฟล์เดิม ระบบจะบันทึกให้ทุกเครื่องใช้งานร่วมกันแบบ Real-time</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Primary Google Spreadsheet ID (Service Jobs & Quotations)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={spreadsheetInput}
                    onChange={(e) => setSpreadsheetInput(e.target.value)}
                    placeholder="Enter Google Sheet ID (extracted from Sheets URL)"
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    onClick={saveSpreadsheetId}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 md:px-3 md:py-1.5 rounded font-bold text-sm md:text-xs min-h-[44px] md:min-h-0 shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    Save ID
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 mt-3">Secondary Spreadsheet ID (For PM Schedule / CM Status Board)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pmSpreadsheetInput}
                    onChange={(e) => setPmSpreadsheetInput(e.target.value)}
                    placeholder="Enter Google Sheet ID (Optional)"
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    onClick={savePmSpreadsheetId}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 md:px-3 md:py-1.5 rounded font-bold text-sm md:text-xs min-h-[44px] md:min-h-0 shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    Save ID
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 mt-3">CM On Call Spreadsheet ID (DATABASE TARGET USER)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cmOnCallSpreadsheetInput}
                    onChange={(e) => setCmOnCallSpreadsheetInput(e.target.value)}
                    placeholder="CM On Call Sheet ID"
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    onClick={saveCmOnCallSpreadsheetId}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 md:px-3 md:py-1.5 rounded font-bold text-sm md:text-xs min-h-[44px] md:min-h-0 shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    Save ID
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-2 bg-white text-[9px] font-mono text-slate-400 uppercase tracking-wider">Or</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAutoCreateSpreadsheet}
                  disabled={isCreatingSpreadsheet}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700 px-3 py-2 rounded font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isCreatingSpreadsheet ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Sheets & Tabs...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      <span>Auto-Create 12-Month Spreadsheet</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCreateDriveFolder}
                  disabled={isCreatingFolder}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 px-3 py-2 rounded font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isCreatingFolder ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Drive Folder...</span>
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Create PDF Save Folder</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 px-3 py-2 rounded font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-3.5 h-3.5" />
                      <span>Test Primary</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleTestPmConnection}
                  disabled={isTestingConnection || !settings.pmSpreadsheetId}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 px-3 py-2 rounded font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Test PM/CM</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-mono mt-1">
                * Spreadsheet ID is found inside the URL of your Google sheet: spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit.
              </p>
            </div>
          </div>

          {/* Card 2: Line Notify OA Integration config */}
          <div className="bg-white rounded border border-slate-200 p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Line Notification Integration</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Configure Push alerts via Line Notify (Group/Personal) or Line OA Messaging API.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
                <div>
                  <span className="font-bold text-xs text-slate-800">Enable Push Notifications</span>
                  <p className="text-[10px] text-slate-400">Real-time alerts and simulation console active.</p>
                </div>
                <input
                  type="checkbox"
                  checked={lineIsEnabled}
                  onChange={(e) => setLineIsEnabled(e.target.checked)}
                  className="w-8 h-4 bg-slate-200 rounded-full appearance-none cursor-pointer relative checked:bg-emerald-500 before:content-[''] before:absolute before:w-3 before:h-3 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-all checked:before:translate-x-4 shadow-inner border border-slate-300"
                />
              </div>

              {/* LINE Notify */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Line Notify Token (For Groups / Personal)</label>
                <input
                  type="password"
                  value={lineNotifyToken}
                  onChange={(e) => setLineNotifyToken(e.target.value)}
                  placeholder="Enter Line Notify Token"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="relative flex items-center justify-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-2 bg-white text-[9px] font-mono text-slate-400 uppercase tracking-wider">AND / OR</span>
              </div>

              {/* LINE OA */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Line OA Messaging API (For Official Accounts)</label>
                <input
                  type="password"
                  value={settings.lineConfig.channelAccessToken || ''}
                  onChange={(e) => onUpdateSettings({ ...settings, lineConfig: { ...settings.lineConfig, channelAccessToken: e.target.value } })}
                  placeholder="Channel Access Token (Long-lived)"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
                <input
                  type="text"
                  value={settings.lineConfig.userId || ''}
                  onChange={(e) => onUpdateSettings({ ...settings, lineConfig: { ...settings.lineConfig, userId: e.target.value } })}
                  placeholder="Target User ID (e.g. U123456...)"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <button
                onClick={handleSaveLineConfig}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Save Line Config
              </button>

              <p className="text-[10px] text-slate-500 leading-relaxed bg-amber-50/50 border border-amber-200 p-2.5 rounded">
                💡 <strong>How it works:</strong> You can use either <strong>Line Notify</strong> (easy for groups) or <strong>Line OA</strong> (for official bot pushing to specific user). When a job is saved or updated, our backend will push alerts to the configured channels.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Dropdowns list management */}
        <div className="space-y-4">
          <div className="bg-white rounded border border-slate-200 p-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Engineer Dropdown Data</h3>
            <div className="space-y-2">
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Engineer Name"
                  value={newEngineer}
                  onChange={(e) => setNewEngineer(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                />
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder="Email for Google Chat (Optional)"
                    value={newEngineerEmail}
                    onChange={(e) => setNewEngineerEmail(e.target.value)}
                    className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                  />
                  <button
                    onClick={handleAddEngineer}
                    className="bg-slate-900 hover:bg-slate-800 text-white p-1 rounded cursor-pointer shrink-0 flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {settings.engineers.map((item) => (
                  <div key={item} className="flex flex-col bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-100 text-xs text-slate-700 group">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold truncate max-w-[180px]">{item}</span>
                      <button
                        onClick={() => removeListItem('engineers', item)}
                        className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {settings.engineerEmails?.[item] && (
                      <span className="text-[10px] text-slate-500 truncate">{settings.engineerEmails[item]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded border border-slate-200 p-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Hospitals Dropdown Data</h3>
            <div className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add Hospital Name"
                  value={newHospital}
                  onChange={(e) => setNewHospital(e.target.value)}
                  className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                />
                <button
                  onClick={() => addListItem('hospitals', newHospital, setNewHospital)}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-1 rounded cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {settings.hospitals.map((item) => (
                  <div key={item} className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-100 text-xs text-slate-700">
                    <span className="truncate max-w-[180px]">{item}</span>
                    <button
                      onClick={() => removeListItem('hospitals', item)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded border border-slate-200 p-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Equipment Dropdown Data</h3>
            <div className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add Equipment Name"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                />
                <button
                  onClick={() => addListItem('equipments', newEquipment, setNewEquipment)}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-1 rounded cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {settings.equipments.map((item) => (
                  <div key={item} className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-100 text-xs text-slate-700">
                    <span className="truncate max-w-[180px]">{item}</span>
                    <button
                      onClick={() => removeListItem('equipments', item)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded border border-slate-200 p-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Products Dropdown Data</h3>
            <div className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add Product Name"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800"
                />
                <button
                  onClick={() => addListItem('products', newProduct, setNewProduct)}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-1 rounded cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {settings.products?.map((item) => (
                  <div key={item} className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded border border-slate-100 text-xs text-slate-700">
                    <span className="truncate max-w-[180px]">{item}</span>
                    <button
                      onClick={() => removeListItem('products', item)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
