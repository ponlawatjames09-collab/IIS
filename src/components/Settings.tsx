import React, { useState } from 'react';
import { Database, Activity, Plus, Trash2, CheckCircle2, MessageSquare, AlertCircle, Save, FolderOpen, RefreshCw , User } from 'lucide-react';
import { SystemSettings } from '../types';
import { createSpreadsheet, testSheetsConnection } from '../sheetsService';
import { createDriveFolder } from '../driveService';

interface SettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  accessToken: string;
}

export default function Settings({ settings, onUpdateSettings, accessToken }: SettingsProps) {
  const [spreadsheetInput, setSpreadsheetInput] = useState(settings.spreadsheetId || '');
  const [pmSpreadsheetInput, setPmSpreadsheetInput] = useState(settings.pmSpreadsheetId || '');
  const [cmOnCallSpreadsheetInput, setCmOnCallSpreadsheetInput] = useState(settings.cmOnCallSpreadsheetId || '19c9vJhO4qMdCP1O7rwWP_aUZyTqQrTwnzWWxtH7zDdE');
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

  const saveSpreadsheetId = () => {
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    if (!spreadsheetInput.trim()) {
      setSpreadsheetError("Please enter a valid Google Spreadsheet ID.");
      return;
    }
    onUpdateSettings({
      ...settings,
      spreadsheetId: spreadsheetInput.trim()
    });
    setSpreadsheetSuccess("Google Spreadsheet ID saved successfully!");
  };

  
  const savePmSpreadsheetId = () => {
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    onUpdateSettings({
      ...settings,
      pmSpreadsheetId: pmSpreadsheetInput.trim()
    });
    setSpreadsheetSuccess("PM Spreadsheet ID saved successfully!");
  };

  const saveCmOnCallSpreadsheetId = () => {
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    onUpdateSettings({
      ...settings,
      cmOnCallSpreadsheetId: cmOnCallSpreadsheetInput.trim()
    });
    setSpreadsheetSuccess("CM On Call Spreadsheet ID saved successfully!");
  };

  const handleAutoCreateSpreadsheet = async () => {
    setIsCreatingSpreadsheet(true);
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    try {
      const newId = await createSpreadsheet(accessToken);
      setSpreadsheetInput(newId);
      onUpdateSettings({
        ...settings,
        spreadsheetId: newId
      });
      setSpreadsheetSuccess("Brand new Service Job Hub - 2026 Spreadsheet successfully created in your Google Drive with all 12 monthly sheets! Double check your drive to verify.");
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
    if (!accessToken) {
      setSpreadsheetError("No access token available. Please sign in again.");
      return;
    }
    
    setIsTestingConnection(true);
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    
    try {
      const headerRow = await testSheetsConnection(settings.spreadsheetId, accessToken);
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
    if (!accessToken) {
      setSpreadsheetError("No access token available. Please sign in again.");
      return;
    }
    
    setIsTestingConnection(true);
    setSpreadsheetError(null);
    setSpreadsheetSuccess(null);
    
    try {
      const headerRow = await testSheetsConnection(settings.pmSpreadsheetId, accessToken);
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
      const folderId = await createDriveFolder(accessToken, "Service Job Sheets PDF");
      localStorage.setItem('drive_pdf_folder_id', folderId);
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

  return (
    <div className="w-full space-y-4 font-sans" id="settings-view">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 select-none">
        <div>
          <h1 className="text-base font-bold text-slate-800 tracking-tight">System Connections</h1>
          <p className="text-slate-500 text-xs mt-0.5">Configure your Workspace Spreadsheet connection, PDF document folders, Line alerts, and dropdown data arrays.</p>
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
                <p className="text-[11px] text-red-700 mt-0.5">{spreadsheetError}</p>
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
          
          {/* Card 1: Google Sheet ID config */}
          <div className="bg-white rounded border border-slate-200 p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Google Sheets Connection</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Link an existing spreadsheet or generate a structured template inside your Google Drive.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Google Spreadsheet ID</label>
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 mt-4">Secondary Spreadsheet ID (For PM/CM)</label>
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
