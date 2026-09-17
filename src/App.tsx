import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Activity, LayoutDashboard, FileSpreadsheet, ClipboardList, Settings as SettingsIcon, LogOut, Database, AlertCircle, Sparkles, RefreshCw, ChevronDown, CheckCircle2, CalendarDays, FormInput, ListTodo, Wrench, PhoneCall, DollarSign , FileText, TrendingUp} from 'lucide-react';
import { initAuth, googleSignIn, handleSignOut, getAccessToken } from './firebase';
import { ServiceJob, SystemSettings, CMStatusRecord } from './types';
import { fetchMonthlyJobs, fetchYearlyJobs, appendJobToSheet, updateJobInSheet, generateNextJobNumber, MONTHS } from './sheetsService';

// Import our modular components
import Dashboard from './components/Dashboard';
import JobForm from './components/JobForm';
import JobTracker from './components/JobTracker';
import BillingSummary from './components/BillingSummary';
import Settings from './components/Settings';
import JobPDFModal from './components/JobPDFModal';
import CMStatusView from './components/CMStatusView';
import CMOnCallServiceView from './components/CMOnCallServiceView';
import QuotationReader from './components/QuotationReader';
import QuotationDashboard from './components/QuotationDashboard';
import PMScheduleView from './components/PMScheduleView';
import DispatchCalendarView from './components/DispatchCalendarView';
import PMServiceTab from './components/PMServiceTab';

const logoUrl = '/logo.svg';


const DEFAULT_SETTINGS: SystemSettings = {
  spreadsheetId: null,
  pmSpreadsheetId: null,
  cmOnCallSpreadsheetId: '19c9vJhO4qMdCP1O7rwWP_aUZyTqQrTwnzWWxtH7zDdE',
  lineConfig: {
    channelAccessToken: '',
    userId: '',
    notifyToken: '',
    isEnabled: true
  },
  engineerEmails: {},
  pmAssignments: {},
  engineers: [
    "รวิ สวัสดี",
    "พลวัฒน์ โพธิ์ผลัด",
    "ศราวุฒิ ศรีเรือง",
    "ปริญญา บุญแก้วอมร",
    "ณกัญจน์ กลมทุกสิ่ง",
    "สวัสดิพงษ์ เมฆเคลื่อน",
    "วรวุฒิ หมู่โสภณ",
    "อับดุลอารีฟ อาแว",
    "กรกฎ แก้วมุงคุณ",
    "ภาณุวัฒน์ วงษ์ศิริ",
    "จตุรวิทย์ ต้นสวรรค์",
    "รัชพล จัทรศุข"
  ],

  hospitals: [
    "Chulalongkorn Memorial Hospital", 
    "Siriraj Hospital", 
    "Ramathibodi Hospital", 
    "Bumrungrad International Hospital", 
    "Bangkok Hospital",
    "Rajavithi Hospital"
  ],
  equipments: [
    "BV Vectra-9\"",
    "BV Endura-9\"",
    "BV Endura-12\"",
    "BV Pulsera-9\"",
    "BV Pulsera-12\"",
    "Veradius Neo",
    "Veradius Unity",
    "Zenition 50-9\"",
    "Zenition 50-12\"",
    "Zenition 10",
    "Zenition 30",
    "Zenition 70",
    "Zenition 90",
    "Affiniti30",
    "Affiniti50",
    "Affiniti70",
    "Affiniti CVx",
    "Lumify",
    "HD5",
    "CX50",
    "ClearVue",
    "3300",
    "EPIQ Elite",
    "5100",
    "5300",
    "5500",
  ],
  products: ["C-ARM", "US", "X-RAY General"]
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // App tab navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'tracker' | 'billing' | 'settings' | 'cm-status' | 'cm-oncall' | 'pm-schedule' | 'quotation-reader' | 'quotation-dashboard' | 'dispatch-calendar' | 'pm-service'>('dashboard');

  // Loaded jobs database
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [yearlyJobs, setYearlyJobs] = useState<ServiceJob[]>([]);
  const [isFetchingJobs, setIsFetchingJobs] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Selected Active month/tab
  const [activeMonthYear, setActiveMonthYear] = useState<string>(() => {
    const d = new Date();
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = d.getFullYear();
    return `${month}${year}`;
  });

  // Editing parameters
  const [editingJob, setEditingJob] = useState<ServiceJob | null>(null);
  const [prefillPMData, setPrefillPMData] = useState<Partial<ServiceJob> | undefined>(undefined);
  const [editingJobIndex, setEditingJobIndex] = useState<number | null>(null);

  // PDF render sheet parameters
  const [pdfJob, setPdfJob] = useState<ServiceJob | null>(null);

  // LINE OA/Notify mock & real triggers stream
  const [lineNotificationLog, setLineNotificationLog] = useState<Array<{ timestamp: string; jobNo: string; message: string; type: string }>>([]);

  // Local settings
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('service_hub_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mergedEngineers = Array.from(new Set([...(DEFAULT_SETTINGS.engineers || []), ...(parsed.engineers || [])]));
        const mergedHospitals = Array.from(new Set([...(DEFAULT_SETTINGS.hospitals || []), ...(parsed.hospitals || [])]));
        const mergedEquipments = Array.from(new Set([...(DEFAULT_SETTINGS.equipments || []), ...(parsed.equipments || [])]));
        const mergedProducts = Array.from(new Set([...(DEFAULT_SETTINGS.products || []), ...(parsed.products || [])]));
        const mergedEmails = { ...(DEFAULT_SETTINGS.engineerEmails || {}), ...(parsed.engineerEmails || {}) };
        const mergedAssignments = { ...(DEFAULT_SETTINGS.pmAssignments || {}), ...(parsed.pmAssignments || {}) };
        return { 
          ...DEFAULT_SETTINGS, 
          ...parsed,
          engineers: mergedEngineers,
          hospitals: mergedHospitals,
          equipments: mergedEquipments,
          products: mergedProducts,
          engineerEmails: mergedEmails,
          pmAssignments: mergedAssignments
        };
      } catch (err) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });


  const handleOpenPMJob = (hospitalName: string, model: string, sn: string, pmCycle: string, iteration: string, totalPMs?: string, product?: string) => {
    setEditingJob(null);
    setEditingJobIndex(null);
    setPrefillPMData({
      hospitalName,
      equipmentName: model,
      serialNumber: sn,
      jobType: 'PM',
      pmCycle: pmCycle,
      equipmentType: 'เครื่อง',
      pmTimesTotal: totalPMs ? `${iteration}/${totalPMs}` : iteration,
      product: product || '-- Select --',
    });
    setActiveTab('form');
  };

  // Persist settings whenever updated
  const handleUpdateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    localStorage.setItem('service_hub_settings', JSON.stringify(newSettings));
  };

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setAccessToken(token);
        setNeedsAuth(false);
        setIsInitializing(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
        setIsInitializing(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch jobs when Month or Spreadsheet ID or Token changes
  useEffect(() => {
    if (user && accessToken && settings.spreadsheetId) {
      loadJobs();
    } else {
      setJobs([]);
    }
  }, [activeMonthYear, settings.spreadsheetId, accessToken]);

  useEffect(() => {
    if (user && accessToken && settings.spreadsheetId) {
      loadYearlyJobs();
    } else {
      setYearlyJobs([]);
    }
  }, [settings.spreadsheetId, accessToken]);

  const loadYearlyJobs = async () => {
    if (!accessToken || !settings.spreadsheetId) return;
    try {
      const fetched = await fetchYearlyJobs(settings.spreadsheetId, accessToken);
      setYearlyJobs(fetched);
    } catch (err: any) {
      if (!(err.message && err.message.includes('401'))) {
        console.error("Failed to load yearly jobs", err);
      }
      if (err.message && err.message.includes("403")) {
        setFetchError("Failed to fetch Google Sheets (403 Forbidden). This usually happens because the Google Sheets API is not enabled in your Google Cloud project, or the spreadsheet is not shared with your account.\n\nPlease go to Google Cloud Console, select your Firebase project, and Enable the Google Sheets API.");
      }
      if (err.message && err.message.includes('401')) {
        handleLogout();
        setAuthError('Session expired. Please sign in again.');
      }
    }
  };

  const loadJobs = async () => {
    if (!accessToken || !settings.spreadsheetId) return;
    setIsFetchingJobs(true);
    setFetchError(null);
    try {
      let fetched: ServiceJob[] = [];
      if (activeMonthYear === 'YEARLY2026') {
        fetched = await fetchYearlyJobs(settings.spreadsheetId, accessToken);
      } else {
        fetched = await fetchMonthlyJobs(settings.spreadsheetId, activeMonthYear, accessToken);
      }
      setJobs(fetched);
    } catch (err: any) {
      if (err.message && err.message.includes('401')) {
        handleLogout();
        setAuthError('Session expired. Please sign in again.');
      } else {
        if (err.message && err.message.includes("403")) { setFetchError("Failed to fetch Google Sheets (403 Forbidden). This usually happens because the Google Sheets API is not enabled in your Google Cloud project, or the spreadsheet is not shared with your account.\n\nPlease go to Google Cloud Console, select your Firebase project, and Enable the Google Sheets API."); } else { setFetchError(`Could not retrieve records from tab ${activeMonthYear}. Verify that tab exists inside your Linked Spreadsheet.`); }
      }
    } finally {
      setIsFetchingJobs(false);
    }
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || (err.message && err.message.includes('auth/cancelled-popup-request'))) {
        setAuthError('Sign-in popup was cancelled. If you are viewing this inside the editor preview, please click the "Open in new tab" icon (top right) to sign in successfully, as popups may be blocked in the preview window.');
      } else if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('auth/unauthorized-domain'))) {
        setAuthError(`This app domain (${window.location.hostname}) is not authorized for Firebase Auth. Please add it to "Authorized domains" in your Firebase Console > Authentication > Settings.`);
      } else {
        setAuthError(err.message || 'Login failed.');
      }
    }
  };

  const handleLogout = async () => {
    await handleSignOut();
    setUser(null);
    setAccessToken(null);
    setNeedsAuth(true);
  };

  // Calculate next sequential Job ID
  const handleCalculateJobNumber = async (dateStr: string): Promise<string> => {
    if (!accessToken || !settings.spreadsheetId) {
      throw new Error("Spreadsheet not connected.");
    }
    return await generateNextJobNumber(settings.spreadsheetId, dateStr, accessToken, jobs);
  };

  // Trigger simulated Line notifications with a beautiful notification body
  const triggerLineNotification = (job: ServiceJob, customText?: string) => {
    if (!settings.lineConfig.isEnabled) return;

    const timestamp = new Date().toLocaleTimeString();
    const actionText = customText ? customText : `Service Dispatched!`;
    
    const textMessage = 
      `🚨 ${actionText.toUpperCase()}\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `• Job No: ${job.jobNumber}\n` +
      `• Hospital: ${job.hospitalName}\n` +
      `• Device: ${job.equipmentName} (${job.serialNumber || 'N/A'})\n` +
      `• Category: ${job.equipmentType || 'N/A'}\n` +
      `• Type: ${job.jobType}\n` +
      `• Engineer: ${job.engineerName}\n` +
      `• Contact: ${job.customerName || 'N/A'} (${job.customerPhone ? (String(job.customerPhone).startsWith('0') || String(job.customerPhone).startsWith('+') ? String(job.customerPhone) : '0' + String(job.customerPhone)) : 'N/A'})\n` +
      `• Diagnosis: ${job.problemDescription || 'Normal Maintenance'}\n` +
      `• Status: ${job.jobStatus.toUpperCase()}`;

    // Add to simulated push logs on UI smartphone
    setLineNotificationLog(prev => [
      {
        timestamp,
        jobNo: job.jobNumber,
        message: textMessage,
        type: job.jobStatus
      },
      ...prev
    ]);

    // Real Notify/OA push call via our Express Backend to bypass CORS
    if (settings.lineConfig.notifyToken || (settings.lineConfig.channelAccessToken && settings.lineConfig.userId)) {
      fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: textMessage,
          notifyToken: settings.lineConfig.notifyToken,
          channelAccessToken: settings.lineConfig.channelAccessToken,
          userId: settings.lineConfig.userId
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.errors && data.errors.length > 0) {
          alert("แจ้งเตือน LINE ไม่สำเร็จ:\n" + data.errors.join("\n") + "\n\nหากคุณใช้ LINE OA แบบฟรี อาจจะส่งข้อความครบ 200 ข้อความต่อเดือนแล้วครับ");
        }
      })
      .catch(err => {
        console.error("Backend LINE API call failed:", err);
      });
    }
  };

  const triggerCMLineNotification = (record: CMStatusRecord, isEdit: boolean) => {
    if (!settings.lineConfig.isEnabled) return;

    const timestamp = new Date().toLocaleTimeString();
    const actionText = isEdit ? `Update CM Status` : `New CM Report`;
    
    const textMessage = 
      `🛠️ ${actionText.toUpperCase()}\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `• Hospital: ${record.hospital || 'N/A'}\n` +
      `• Equipment: ${record.equipment || 'N/A'} (${record.serialNumber || 'N/A'})\n` +
      `• Engineer: ${record.engineer || 'N/A'}\n` +
      `• Contact: ${record.namecontract || 'N/A'} (${record.phonecontract ? (String(record.phonecontract).startsWith('0') || String(record.phonecontract).startsWith('+') ? String(record.phonecontract) : '0' + String(record.phonecontract)) : 'N/A'})\n` +
      `• Problem: ${record.problem || 'N/A'}\n` +
      `• Status: ${(record.status || 'Repair request').toUpperCase()}`;

    // Add to simulated push logs on UI smartphone
    setLineNotificationLog(prev => [
      {
        timestamp,
        jobNo: 'CM',
        message: textMessage,
        type: record.status || 'Repair request'
      },
      ...prev
    ]);

    // Real Notify/OA push call via our Express Backend to bypass CORS
    if (settings.lineConfig.notifyToken || (settings.lineConfig.channelAccessToken && settings.lineConfig.userId)) {
      fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: textMessage,
          notifyToken: settings.lineConfig.notifyToken,
          channelAccessToken: settings.lineConfig.channelAccessToken,
          userId: settings.lineConfig.userId
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.errors && data.errors.length > 0) {
          alert("แจ้งเตือน LINE ไม่สำเร็จ:\n" + data.errors.join("\n") + "\n\nหากคุณใช้ LINE OA แบบฟรี อาจจะส่งข้อความครบ 200 ข้อความต่อเดือนแล้วครับ");
        }
      })
      .catch(err => {
        console.error("Backend LINE API call failed:", err);
      });
    }
  };

  // Save or Update Job Callback
  const handleSaveJob = async (job: ServiceJob): Promise<ServiceJob> => {
    if (!accessToken || !settings.spreadsheetId) {
      throw new Error("Google Spreadsheet not connected. Establish database first.");
    }

    if (editingJob && editingJobIndex !== null) {
      try {
        // In-place Update in Google Sheets
        const originalMonth = MONTHS.find(m => m.substring(0, 3) === editingJob.jobNumber.substring(2, 4).toUpperCase()) || activeMonthYear;
        
        await updateJobInSheet(settings.spreadsheetId, activeMonthYear, editingJobIndex, job, accessToken);
        
        // Update local state
        setJobs(prev => {
          const copy = [...prev];
          copy[editingJobIndex] = job;
          return copy;
        });
        setYearlyJobs(prev => {
          const index = prev.findIndex(j => j.jobNumber === job.jobNumber);
          if (index !== -1) {
            const copy = [...prev];
            copy[index] = job;
            return copy;
          }
          return prev;
        });

        triggerLineNotification(job, `Job status edited: #${job.jobNumber}`);
        setEditingJob(null);
        setEditingJobIndex(null);
        setActiveTab('tracker');
        return job;
      } catch (err: any) {
        if (err.message && err.message.includes('401')) {
          handleLogout();
          setAuthError('Session expired. Please sign in again.');
        }
        console.error('Update job error:', err);
        throw err;
      }
    } else {
      try {
        // Calculate freshest job number at the moment of saving to Google Sheets
        const freshJobNumber = await generateNextJobNumber(settings.spreadsheetId, job.callDate, accessToken, jobs);
        const jobWithFreshNumber = { ...job, jobNumber: freshJobNumber };

        // Append New job in Google Sheets
        await appendJobToSheet(settings.spreadsheetId, jobWithFreshNumber, accessToken);
        
        // Prepend or Append locally
        setJobs(prev => [...prev, jobWithFreshNumber]);
        setYearlyJobs(prev => [...prev, jobWithFreshNumber]);
        
        // Trigger smartphone Line notification
        triggerLineNotification(jobWithFreshNumber, `Job logs created: #${jobWithFreshNumber.jobNumber}`);
        setActiveTab('tracker');
        return jobWithFreshNumber;
      } catch (err: any) {
        if (err.message && err.message.includes('401')) {
          handleLogout();
          setAuthError('Session expired. Please sign in again.');
        }
        console.error('Save new job error:', err);
        throw err;
      }
    }
  };

  // Quick edit status change callback from Tracker Table
  const handleQuickUpdateStatus = async (index: number, newStatus: ServiceJob['jobStatus']) => {
    if (!accessToken || !settings.spreadsheetId) return;

    try {
      const targetJob = jobs[index];
      const updatedJob = { ...targetJob, jobStatus: newStatus };
      
      await updateJobInSheet(settings.spreadsheetId, activeMonthYear, index, updatedJob, accessToken);
      
      setJobs(prev => {
        const copy = [...prev];
        copy[index] = updatedJob;
        return copy;
      });
      setYearlyJobs(prev => {
        const yIndex = prev.findIndex(j => j.jobNumber === updatedJob.jobNumber);
        if (yIndex !== -1) {
          const copy = [...prev];
          copy[yIndex] = updatedJob;
          return copy;
        }
        return prev;
      });

      // Notify line about status update
      triggerLineNotification(updatedJob, `Status updated: ${newStatus}`);
    } catch (err: any) {
      if (err.message && err.message.includes('401')) {
        handleLogout();
        setAuthError('Session expired. Please sign in again.');
      } else {
        console.error("Failed to quick update status:", err);
        alert("Failed to modify job status. Verify internet connection and Sheet ID.");
      }
    }
  };

  const startEditJob = (job: ServiceJob, index: number) => {
    setEditingJob(job);
    setEditingJobIndex(index);
    setActiveTab('form');
  };

  const cancelEdit = () => {
    setEditingJob(null);
    setEditingJobIndex(null);
    setActiveTab('tracker');
  };

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 text-slate-100 font-sans">
        <div className="max-w-md w-full bg-slate-800/80 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center">
          <Database className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">IIS Call Service</h1>
          <p className="text-slate-400 text-sm mb-6">
            Sign in with your Google Account to synchronize data with Google Sheets.
          </p>
          
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left">
            <h3 className="text-blue-400 font-bold text-sm mb-1">📱 Mobile Users</h3>
            <p className="text-xs text-slate-300">
              If you are on a mobile phone or the login popup is blocked, please ensure you open this app in a <strong>New Tab</strong> before logging in.
            </p>
          </div>

          <button
            onClick={() => handleLogin()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/50"
          >
            <div className="bg-white p-1 rounded-full">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="app-shell" className="h-screen bg-slate-950 flex font-sans overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 leading-tight">IIS Service</h1>
            <p className="text-[10px] text-slate-400 font-mono">Operations Portal</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 scrollbar-none space-y-1">
          <nav className="space-y-1">
            <div className="px-3 pb-2 pt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Main</div>
            
            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('dashboard'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard Overview</span>
            </button>
            
            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setPrefillPMData(undefined); setActiveTab('form'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'form' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FormInput className="w-4 h-4 shrink-0" />
              <span>New Job Entry</span>
            </button>
            
            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('tracker'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tracker' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-4 h-4 shrink-0" />
              <span>Active Job Tracker</span>
            </button>

            <div className="px-3 pb-2 pt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Service</div>
            
            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('cm-status'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'cm-status' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-4 h-4 shrink-0" />
              <span>CM Status Board</span>
            </button>
            
            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('cm-oncall'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'cm-oncall' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>CM On Call</span>
            </button>

            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('pm-schedule'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'pm-schedule' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>PM Schedule</span>
            </button>

            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('pm-service'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'pm-service' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>PM Service Tasks</span>
            </button>

            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('dispatch-calendar'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dispatch-calendar' 
                  ? 'bg-indigo-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>Dispatch / Assign</span>
            </button>

            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('billing'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'billing' 
                  ? 'bg-emerald-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>Billing Summary</span>
            </button>

            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('quotation-reader'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'quotation-reader' 
                  ? 'bg-indigo-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Quotation Reader</span>
            </button>
            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('quotation-dashboard'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'quotation-dashboard' 
                  ? 'bg-indigo-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Quotation Dashboard</span>
            </button>

            <div className="px-3 pb-2 pt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">System</div>
              <button
                onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('settings'); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'settings' 
                    ? 'bg-blue-600 text-white shadow-sm font-bold' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                id="tab-settings"
              >
                <SettingsIcon className="w-4 h-4 shrink-0" />
                <span>System Connections</span>
              </button>
            </nav>
          </div>

          {/* SIDEBAR FOOTER ACTION */}
          <div className="border-t border-slate-800 pt-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </aside>

        {/* SCROLLABLE MAIN CANVAS */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
          
          {/* Connection Notice Banner */}
          {!settings.spreadsheetId && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-800 text-xs font-medium flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Spreadsheet not linked.</strong> Connect a spreadsheet to read and persist real-time records.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('settings')}
                className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
              >
                Connect Database
              </button>
            </div>
          )}

          {/* Quick Tab Header / Actions Bar */}
          {settings.spreadsheetId && (
            <div className="bg-white border-b border-slate-200 px-4 py-1.5 flex items-center justify-between text-slate-500 text-xs shrink-0 select-none">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 uppercase text-[10px]">Database Target:</span>
                <select
                  value={activeMonthYear}
                  onChange={(e) => setActiveMonthYear(e.target.value)}
                  className="bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 font-bold text-xs py-0.5 px-1.5 rounded cursor-pointer transition-all focus:outline-none"
                >
                  <option value="YEARLY2026">Overview (2026)</option>
                  {MONTHS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                {isFetchingJobs ? (
                  <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[11px] font-bold">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Syncing Sheet...</span>
                  </div>
                ) : (
                  <button
                    onClick={loadJobs}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer transition-colors"
                    title="Reload current month spreadsheet records"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reload Sheets</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {fetchError && (
            <div className="mx-4 mt-3 p-2.5 bg-red-50 border border-red-200 rounded text-xs flex items-start gap-2.5 shrink-0">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-800">Spreadsheet Range Error</span>
                <p className="text-slate-600 mt-0.5">{fetchError}</p>
              </div>
            </div>
          )}

          {/* CONTENT COMPARTMENT */}
          <div className="flex-1 overflow-y-auto pl-3 pt-3 pb-3 md:pl-4 md:pt-4 md:pb-4 pr-0 w-full">
            
            {activeTab === 'dashboard' && (
              <Dashboard 
                jobs={jobs}
                yearlyJobs={yearlyJobs}
                settings={settings}
                accessToken={accessToken}
                activeMonthYear={activeMonthYear}
                onMonthChange={setActiveMonthYear}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'form' && (
              <JobForm
                settings={settings}
                onSaveJob={handleSaveJob}
                onCalculateJobNumber={handleCalculateJobNumber}
                editingJob={editingJob}
                onCancelEdit={cancelEdit}
                prefillData={prefillPMData}
              />
            )}

            {activeTab === 'tracker' && (
              <JobTracker
                jobs={jobs}
                settings={settings}
                accessToken={accessToken}
                onEditJob={startEditJob}
                onUpdateStatus={handleQuickUpdateStatus}
                onTriggerPDF={(job) => setPdfJob(job)}
                isUpdatingStatus={isFetchingJobs}
              />
            )}

            {activeTab === 'cm-status' && (
              <CMStatusView
                settings={settings}
                accessToken={accessToken}
                onNotifyLine={triggerCMLineNotification}
                onOpenCMJob={(hospitalName, equipment, serialNumber, problem) => {
                  setEditingJob(null);
                  setEditingJobIndex(null);
                  setPrefillPMData({
                    hospitalName,
                    equipmentName: equipment,
                    serialNumber: serialNumber,
                    problemDescription: problem,
                    jobType: 'CM'
                  });
                  setActiveTab('form');
                }}
              />
            )}

            {activeTab === 'cm-oncall' && (
              <CMOnCallServiceView
                settings={settings}
                accessToken={accessToken}
                onNotifyLine={triggerCMLineNotification}
                onOpenCMJob={(hospitalName, equipment, serialNumber, problem) => {
                  setEditingJob(null);
                  setEditingJobIndex(null);
                  setPrefillPMData({
                    hospitalName,
                    equipmentName: equipment,
                    serialNumber: serialNumber,
                    problemDescription: problem,
                    jobType: 'CM'
                  });
                  setActiveTab('form');
                }}
              />
            )}


            {activeTab === 'pm-schedule' && (
              <PMScheduleView
                settings={settings}
                accessToken={accessToken}
                yearlyJobs={jobs}
                onOpenPMJob={handleOpenPMJob}
              />
            )}

            {activeTab === 'billing' && (
              <BillingSummary jobs={jobs} />
            )}
            {activeTab === 'quotation-reader' && (
              <QuotationReader 
                settings={settings}
                accessToken={accessToken}
              />
            )}
                      
            {activeTab === 'pm-service' && (
              <PMServiceTab
                settings={settings}
                accessToken={accessToken}
                onUpdateSettings={(newSettings) => {
                  setSettings(newSettings);
                  localStorage.setItem('service_hub_settings', JSON.stringify(newSettings));
                }}
                onOpenPMJob={handleOpenPMJob}
              />
            )}

            {activeTab === 'dispatch-calendar' && (
            <DispatchCalendarView 
              settings={settings}
              accessToken={accessToken}
            />
          )}

          {activeTab === 'quotation-dashboard' && (
              <QuotationDashboard 
                settings={settings}
                accessToken={accessToken}
              />
            )}


            {activeTab === 'settings' && (
              <Settings
                settings={settings}
                accessToken={accessToken}
                onUpdateSettings={handleUpdateSettings}
                
              />
            )}

          </div>

        {/* SYSTEM HARD-DENSITY ENTERPRISE FOOTER */}
      <footer className="hidden md:flex h-8 bg-slate-200 border-t border-slate-300 items-center justify-between px-4 text-[10px] font-semibold text-slate-500 font-mono shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span>System Ready • Latency: 24ms • Google API: Authorized</span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span>Active Tab: {activeTab.toUpperCase()}</span>
          <span>•</span>
          <span>Buffer: OK</span>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden flex h-[60px] bg-slate-900 border-t border-slate-800 text-slate-400 text-[10px] shrink-0 justify-around items-center pb-0 z-50">
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('dashboard'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'dashboard' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setPrefillPMData(undefined); setActiveTab('form'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'form' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <FileSpreadsheet className="w-5 h-5" />
          <span>Log Job</span>
        </button>
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('tracker'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'tracker' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <ClipboardList className="w-5 h-5" />
          <span>Tracker</span>
        </button>
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('cm-status'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'cm-status' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <Activity className="w-5 h-5" />
          <span>CM Status</span>
        </button>
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('cm-oncall'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'cm-oncall' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <Activity className="w-5 h-5" />
          <span>CM On Call</span>
        </button>
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('pm-schedule'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'pm-schedule' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <CalendarDays className="w-5 h-5" />
          <span>PM</span>
        </button>
        
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('pm-service'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'pm-service' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <ClipboardList className="w-5 h-5" />
          <span>PM Tasks</span>
        </button>

        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('quotation-reader'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'quotation-reader' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <FileText className="w-5 h-5" />
          <span>Quotation</span>
        </button>
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('settings'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'settings' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <SettingsIcon className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-1 w-full h-full text-rose-500 hover:text-rose-400">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      </main>

      {/* PDF MODAL WORKSPACE OVERLAY */}
      {pdfJob && accessToken && (
        <JobPDFModal
          job={pdfJob}
          onClose={() => setPdfJob(null)}
          accessToken={accessToken}
        />
      )}

    </div>
  );
}
