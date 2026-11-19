import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Activity, LayoutDashboard, Users, UserCheck, FileSpreadsheet, ClipboardList, Settings as SettingsIcon, LogOut, Database, AlertCircle, Sparkles, RefreshCw, ChevronDown, CheckCircle2, CalendarDays, FormInput, ListTodo, Wrench, PhoneCall, DollarSign, FileText, TrendingUp, MapPin, Link2 } from 'lucide-react';
import { initAuth, googleSignIn, handleSignOut, getAccessToken } from './firebase';
import { ServiceJob, SystemSettings, CMStatusRecord } from './types';
import { fetchMonthlyJobs, fetchYearlyJobs, appendJobToSheet, updateJobInSheet, generateNextJobNumber, MONTHS } from './sheetsService';
import { BRIDGE_TOKEN_SENTINEL, isBridgeToken, setGoogleBridgeConfig } from './googleBridgeClient';

// Import our modular components
import Dashboard from './components/Dashboard';
import JobForm from './components/JobForm';
import JobTracker from './components/JobTracker';
import BillingSummary from './components/BillingSummary';
import Settings, { BridgeStatusInfo } from './components/Settings';
import JobPDFModal from './components/JobPDFModal';
import CMStatusView from './components/CMStatusView';
import CMOnCallServiceView from './components/CMOnCallServiceView';
import QuotationReader from './components/QuotationReader';
import QuotationDashboard from './components/QuotationDashboard';
import PMScheduleView from './components/PMScheduleView';
import DispatchCalendarView from './components/DispatchCalendarView';
import TodayDashboard from './components/TodayDashboard';
import PMServiceTab from './components/PMServiceTab';
import EngineerAvailabilityView from './components/EngineerAvailabilityView';
import ThailandHospitalMapView from './components/ThailandHospitalMapView';
import ServiceReportDashboard from './components/ServiceReportDashboard';

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
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatusInfo>({
    configured: false,
    mode: 'none',
    gasWebAppUrl: '',
    hasServiceAccount: false,
    serviceAccountEmail: null
  });

  // App tab navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'service-report' | 'today-operations' | 'engineer-availability' | 'form' | 'tracker' | 'billing' | 'settings' | 'cm-status' | 'cm-oncall' | 'pm-schedule' | 'quotation-reader' | 'quotation-dashboard' | 'dispatch-calendar' | 'pm-service' | 'hospital-map'>('dashboard');

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
        const mergedEngineers = Array.from(new Set([...(DEFAULT_SETTINGS.engineers || []), ...(parsed.engineers || [])]))
          .filter(e => e !== 'เจมส์' && e.toLowerCase() !== 'james');
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
    setGoogleBridgeConfig({
      gasWebAppUrl: newSettings.gasWebAppUrl || bridgeStatus.gasWebAppUrl || null,
      serverConfigured: Boolean(bridgeStatus.configured || newSettings.gasWebAppUrl),
      preferBridge: true
    });
  };

  // Load shared No-Login Bridge configuration from server & keep optional Firebase OAuth synced
  useEffect(() => {
    let isMounted = true;

    const loadServerBridgeConfig = async () => {
      try {
        const res = await fetch('/api/bridge/config');
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        const serverStatus: BridgeStatusInfo = {
          configured: Boolean(data.configured),
          mode: data.mode || 'none',
          gasWebAppUrl: data.gasWebAppUrl || '',
          hasServiceAccount: Boolean(data.hasServiceAccount),
          serviceAccountEmail: data.serviceAccountEmail || null
        };
        setBridgeStatus(serverStatus);

        if (data.drivePdfFolderId && !localStorage.getItem('drive_pdf_folder_id')) {
          localStorage.setItem('drive_pdf_folder_id', data.drivePdfFolderId);
        }

        setSettings(prev => {
          const merged: SystemSettings = {
            ...prev,
            gasWebAppUrl: data.gasWebAppUrl || prev.gasWebAppUrl || null,
            spreadsheetId: data.spreadsheetId || prev.spreadsheetId || null,
            pmSpreadsheetId: data.pmSpreadsheetId || prev.pmSpreadsheetId || null,
            cmOnCallSpreadsheetId: data.cmOnCallSpreadsheetId || prev.cmOnCallSpreadsheetId || DEFAULT_SETTINGS.cmOnCallSpreadsheetId,
            drivePdfFolderId: data.drivePdfFolderId || prev.drivePdfFolderId || null
          };
          localStorage.setItem('service_hub_settings', JSON.stringify(merged));
          setGoogleBridgeConfig({
            gasWebAppUrl: merged.gasWebAppUrl || null,
            serverConfigured: Boolean(serverStatus.configured || merged.gasWebAppUrl),
            preferBridge: true
          });
          return merged;
        });
      } catch (err) {
        console.warn('Could not load server bridge config:', err);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    loadServerBridgeConfig();

    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Keep Google Bridge client synchronized with local settings
  useEffect(() => {
    setGoogleBridgeConfig({
      gasWebAppUrl: settings.gasWebAppUrl || bridgeStatus.gasWebAppUrl || null,
      serverConfigured: Boolean(bridgeStatus.configured || settings.gasWebAppUrl),
      preferBridge: true
    });
  }, [settings.gasWebAppUrl, bridgeStatus.configured, bridgeStatus.gasWebAppUrl]);

  const isBridgeReady = Boolean(bridgeStatus.configured || settings.gasWebAppUrl);
  const effectiveToken: string | null = accessToken || (isBridgeReady ? BRIDGE_TOKEN_SENTINEL : null);

  // Fetch jobs when Month or Spreadsheet ID or Bridge/Token changes
  useEffect(() => {
    if (effectiveToken && settings.spreadsheetId) {
      loadJobs();
    } else {
      setJobs([]);
    }
  }, [activeMonthYear, settings.spreadsheetId, effectiveToken]);

  useEffect(() => {
    if (effectiveToken && settings.spreadsheetId) {
      loadYearlyJobs();
    } else {
      setYearlyJobs([]);
    }
  }, [settings.spreadsheetId, effectiveToken]);

  const loadYearlyJobs = async () => {
    if (!effectiveToken || !settings.spreadsheetId) return;
    try {
      const fetched = await fetchYearlyJobs(settings.spreadsheetId, effectiveToken);
      setYearlyJobs(fetched);
    } catch (err: any) {
      const msg = err?.message || '';
      if (!msg.includes('401')) {
        console.error("Failed to load yearly jobs", err);
      }
      if (msg.includes("403")) {
        setFetchError(msg);
      }
      if (msg.includes('401') && !isBridgeToken(effectiveToken)) {
        handleLogout();
        setAuthError('Session expired. Please sign in again.');
      }
    }
  };

  const loadJobs = async () => {
    if (!effectiveToken || !settings.spreadsheetId) return;
    setIsFetchingJobs(true);
    setFetchError(null);
    try {
      let fetched: ServiceJob[] = [];
      if (activeMonthYear === 'YEARLY2026') {
        fetched = await fetchYearlyJobs(settings.spreadsheetId, effectiveToken);
      } else {
        fetched = await fetchMonthlyJobs(settings.spreadsheetId, activeMonthYear, effectiveToken);
      }
      setJobs(fetched);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('401') && !isBridgeToken(effectiveToken)) {
        handleLogout();
        setAuthError('Session expired. Please sign in again.');
      } else {
        setFetchError(msg || `Could not retrieve records from tab ${activeMonthYear}. Verify that tab exists inside your Linked Spreadsheet.`);
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
      }
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || (err.message && err.message.includes('auth/cancelled-popup-request'))) {
        setAuthError('Sign-in popup was cancelled.');
      } else if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('auth/unauthorized-domain'))) {
        setAuthError(`This app domain (${window.location.hostname}) is not authorized for Firebase Auth.`);
      } else {
        setAuthError(err.message || 'Login failed.');
      }
    }
  };

  const handleLogout = async () => {
    await handleSignOut();
    setUser(null);
    setAccessToken(null);
  };

  // Calculate next sequential Job ID
  const handleCalculateJobNumber = async (dateStr: string): Promise<string> => {
    if (!effectiveToken || !settings.spreadsheetId) {
      throw new Error("Spreadsheet or Bridge not connected.");
    }
    return await generateNextJobNumber(settings.spreadsheetId, dateStr, effectiveToken, jobs);
  };

  // Trigger Telegram (embedded) + LINE OA notifications
  const triggerLineNotification = (job: ServiceJob, customText?: string) => {
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

    // Add to push logs
    setLineNotificationLog(prev => [
      {
        timestamp,
        jobNo: job.jobNumber,
        message: textMessage,
        type: job.jobStatus
      },
      ...prev
    ]);

    // Always call /api/notify so embedded Telegram notification is sent on every device without extra config,
    // plus LINE OA / LINE Notify if enabled and configured
    const lineEnabled = settings.lineConfig?.isEnabled !== false;
    fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: textMessage,
        notifyToken: lineEnabled ? settings.lineConfig?.notifyToken : '',
        channelAccessToken: lineEnabled ? settings.lineConfig?.channelAccessToken : '',
        userId: lineEnabled ? settings.lineConfig?.userId : ''
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.errors && data.errors.length > 0 && !data.telegramSuccess) {
        console.warn("Notification warnings:", data.errors);
      }
    })
    .catch(err => {
      console.error("Backend Notification API call failed:", err);
    });
  };

  const triggerCMLineNotification = (record: CMStatusRecord, isEdit: boolean) => {
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

    // Add to push logs
    setLineNotificationLog(prev => [
      {
        timestamp,
        jobNo: 'CM',
        message: textMessage,
        type: record.status || 'Repair request'
      },
      ...prev
    ]);

    // Always call /api/notify so embedded Telegram notification is sent on every device without extra config
    const lineEnabled = settings.lineConfig?.isEnabled !== false;
    fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: textMessage,
        notifyToken: lineEnabled ? settings.lineConfig?.notifyToken : '',
        channelAccessToken: lineEnabled ? settings.lineConfig?.channelAccessToken : '',
        userId: lineEnabled ? settings.lineConfig?.userId : ''
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.errors && data.errors.length > 0 && !data.telegramSuccess) {
        console.warn("Notification warnings:", data.errors);
      }
    })
    .catch(err => {
      console.error("Backend Notification API call failed:", err);
    });
  };

  // Save or Update Job Callback
  const handleSaveJob = async (job: ServiceJob): Promise<ServiceJob> => {
    if (!effectiveToken || !settings.spreadsheetId) {
      throw new Error("Google Spreadsheet or Bridge not connected. Configure System Connections first.");
    }

    if (editingJob && editingJobIndex !== null) {
      try {
        await updateJobInSheet(settings.spreadsheetId, activeMonthYear, editingJobIndex, job, effectiveToken);

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
        if (err.message && err.message.includes('401') && !isBridgeToken(effectiveToken)) {
          handleLogout();
          setAuthError('Session expired. Please sign in again.');
        }
        console.error('Update job error:', err);
        throw err;
      }
    } else {
      try {
        const freshJobNumber = await generateNextJobNumber(settings.spreadsheetId, job.callDate, effectiveToken, jobs);
        const jobWithFreshNumber = { ...job, jobNumber: freshJobNumber };

        await appendJobToSheet(settings.spreadsheetId, jobWithFreshNumber, effectiveToken);

        setJobs(prev => [...prev, jobWithFreshNumber]);
        setYearlyJobs(prev => [...prev, jobWithFreshNumber]);

        triggerLineNotification(jobWithFreshNumber, `Job logs created: #${jobWithFreshNumber.jobNumber}`);
        setActiveTab('tracker');
        return jobWithFreshNumber;
      } catch (err: any) {
        if (err.message && err.message.includes('401') && !isBridgeToken(effectiveToken)) {
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
    if (!effectiveToken || !settings.spreadsheetId) return;

    try {
      const targetJob = jobs[index];
      const updatedJob = { ...targetJob, jobStatus: newStatus };

      await updateJobInSheet(settings.spreadsheetId, activeMonthYear, index, updatedJob, effectiveToken);

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

      triggerLineNotification(updatedJob, `Status updated: ${newStatus}`);
    } catch (err: any) {
      if (err.message && err.message.includes('401') && !isBridgeToken(effectiveToken)) {
        handleLogout();
        setAuthError('Session expired. Please sign in again.');
      } else {
        console.error("Failed to quick update status:", err);
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
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('service-report'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'service-report' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Service Report (สรุปงานช่าง)</span>
            </button>
            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('today-operations'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'today-operations' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Today's Operations</span>
            </button>

            <button
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('engineer-availability'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'engineer-availability' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Engineer Availability</span>
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
              onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('hospital-map'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'hospital-map' 
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Hospital Map (แผนที่เครื่อง)</span>
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
          <div className="border-t border-slate-800 p-3">
            {accessToken ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Google</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('settings')}
                className="w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 shrink-0" />
                  <span>{isBridgeReady ? 'No-Login Bridge On' : 'Setup Sheet Bridge'}</span>
                </span>
                <span className={`w-2 h-2 rounded-full ${isBridgeReady ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              </button>
            )}
          </div>
        </aside>

        {/* SCROLLABLE MAIN CANVAS */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
          
          {/* Connection Notice Banner */}
          {(!effectiveToken || !settings.spreadsheetId) && !isInitializing && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-800 text-xs font-medium flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {!effectiveToken ? (
                    <><strong>รอตั้งค่าการเชื่อมต่อ Google Sheets (No-Login Bridge):</strong> วาง Google Apps Script Web App URL หรือ Service Account เพื่อให้ทุกเครื่องใช้งานได้ทันทีโดยไม่ต้อง Login</>
                  ) : (
                    <><strong>Spreadsheet not linked.</strong> Connect a spreadsheet ID to read and persist real-time records.</>
                  )}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('settings')}
                className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors shrink-0"
              >
                {!effectiveToken ? 'Setup Bridge' : 'Connect Database'}
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
                accessToken={effectiveToken}
                activeMonthYear={activeMonthYear}
                onMonthChange={setActiveMonthYear}
                onNavigateToTab={setActiveTab}
              />
            )}
            {activeTab === 'service-report' && (
              <ServiceReportDashboard
                jobs={jobs}
                yearlyJobs={yearlyJobs}
                settings={settings}
                accessToken={effectiveToken}
                activeMonthYear={activeMonthYear}
                onMonthChange={setActiveMonthYear}
                onNavigateToTab={setActiveTab}
              />
            )}
            {activeTab === 'today-operations' && (
              <TodayDashboard 
                settings={settings}
                accessToken={effectiveToken}
              />
            )}

            {activeTab === 'engineer-availability' && (
              <EngineerAvailabilityView
                settings={settings}
                accessToken={effectiveToken}
                jobs={jobs}
                yearlyJobs={yearlyJobs}
                onNavigateToTab={setActiveTab}
                onOpenFormWithEngineer={(engName) => {
                  setEditingJob(null);
                  setEditingJobIndex(null);
                  setPrefillPMData({
                    engineerName: engName
                  } as any);
                  setActiveTab('form');
                }}
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
                accessToken={effectiveToken}
                onEditJob={startEditJob}
                onUpdateStatus={handleQuickUpdateStatus}
                onTriggerPDF={(job) => setPdfJob(job)}
                isUpdatingStatus={isFetchingJobs}
              />
            )}

            {activeTab === 'cm-status' && (
              <CMStatusView
                settings={settings}
                accessToken={effectiveToken}
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
                onTriggerPDF={(job) => setPdfJob(job)}
              />
            )}

            {activeTab === 'cm-oncall' && (
              <CMOnCallServiceView
                settings={settings}
                accessToken={effectiveToken}
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
                onTriggerPDF={(job) => setPdfJob(job)}
              />
            )}


            {activeTab === 'pm-schedule' && (
              <PMScheduleView
                settings={settings}
                accessToken={effectiveToken}
                yearlyJobs={jobs}
                onOpenPMJob={handleOpenPMJob}
                onNavigateToMap={() => setActiveTab('hospital-map')}
              />
            )}

            {activeTab === 'billing' && (
              <BillingSummary jobs={jobs} />
            )}
            {activeTab === 'quotation-reader' && (
              <QuotationReader 
                settings={settings}
                accessToken={effectiveToken}
              />
            )}
                      
            {activeTab === 'pm-service' && (
              <PMServiceTab
                settings={settings}
                accessToken={effectiveToken}
                onUpdateSettings={handleUpdateSettings}
                onOpenPMJob={handleOpenPMJob}
              />
            )}

            {activeTab === 'dispatch-calendar' && (
            <DispatchCalendarView 
              settings={settings}
              accessToken={effectiveToken}
            />
          )}

          {activeTab === 'hospital-map' && (
            <ThailandHospitalMapView
              settings={settings}
              accessToken={effectiveToken}
              jobs={jobs}
              onOpenNewJob={(hospitalName, equipment, sn) => {
                setEditingJob(null);
                setEditingJobIndex(null);
                setPrefillPMData({
                  hospitalName,
                  equipmentName: equipment,
                  serialNumber: sn,
                  jobType: 'PM'
                });
                setActiveTab('form');
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'quotation-dashboard' && (
              <QuotationDashboard 
                settings={settings}
                accessToken={effectiveToken}
              />
            )}


            {activeTab === 'settings' && (
              <Settings
                settings={settings}
                accessToken={effectiveToken}
                onUpdateSettings={handleUpdateSettings}
                bridgeStatus={bridgeStatus}
                onBridgeStatusChange={setBridgeStatus}
                isOAuthSignedIn={Boolean(accessToken)}
                onGoogleSignIn={handleLogin}
                onGoogleSignOut={handleLogout}
              />
            )}

          </div>

        {/* SYSTEM HARD-DENSITY ENTERPRISE FOOTER */}
      <footer className="hidden md:flex h-8 bg-slate-200 border-t border-slate-300 items-center justify-between px-4 text-[10px] font-semibold text-slate-500 font-mono shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className={`flex h-2 w-2 rounded-full ${effectiveToken ? 'bg-green-500' : 'bg-amber-500'}`}></span>
          <span>
            System Ready • Auth:{' '}
            {accessToken
              ? 'Google OAuth'
              : bridgeStatus.mode === 'service_account'
              ? 'No-Login Service Account'
              : isBridgeReady
              ? 'No-Login Apps Script Bridge'
              : 'Bridge Setup Required'}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span>Active Tab: {activeTab.toUpperCase()}</span>
          <span>•</span>
          <span>Real-time Sync</span>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden flex h-[60px] bg-slate-900 border-t border-slate-800 text-slate-400 text-[10px] shrink-0 justify-around items-center pb-0 z-50">
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('dashboard'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'dashboard' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('service-report'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'service-report' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <span>Report</span>
        </button>
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('today-operations'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'today-operations' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <Users className="w-5 h-5" />
          <span>Today</span>
        </button>
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('engineer-availability'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'engineer-availability' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <UserCheck className="w-5 h-5" />
          <span>Duty</span>
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

        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('hospital-map'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'hospital-map' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <MapPin className="w-5 h-5 text-rose-400" />
          <span>Map</span>
        </button>

        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('quotation-reader'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'quotation-reader' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <FileText className="w-5 h-5" />
          <span>Quotation</span>
        </button>
        <button onClick={() => { setEditingJob(null); setEditingJobIndex(null); setActiveTab('settings'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full ${activeTab === 'settings' ? 'text-blue-500 font-bold' : 'hover:text-slate-200'}`}>
          <SettingsIcon className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>

      </main>

      {/* PDF MODAL WORKSPACE OVERLAY */}
      {pdfJob && effectiveToken && (
        <JobPDFModal
          job={pdfJob}
          onClose={() => setPdfJob(null)}
          accessToken={effectiveToken}
        />
      )}

    </div>
  );
}
