import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import {
  FileSpreadsheet,
  Users,
  Wrench,
  CalendarDays,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  RefreshCw,
  Filter,
  Building2,
  Package,
  Award,
  Layers,
  ChevronRight,
  Search
} from 'lucide-react';
import { ServiceJob, SystemSettings, CMStatusRecord, PMScheduleItem } from '../types';
import {
  fetchCMStatusRecords,
  fetchCMOnCallRecords,
  fetchPMScheduleRecords,
  fetchQuotations,
  QuotationRecord,
  MONTHS
} from '../sheetsService';

interface ServiceReportDashboardProps {
  jobs: ServiceJob[];
  yearlyJobs?: ServiceJob[];
  settings: SystemSettings;
  activeMonthYear: string;
  accessToken?: string | null;
  onMonthChange?: (month: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

const MONTH_ABBR_MAP: Record<string, { short: string; num: string; labelTh: string }> = {
  JAN: { short: 'Jan', num: '01', labelTh: 'มกราคม' },
  FEB: { short: 'Feb', num: '02', labelTh: 'กุมภาพันธ์' },
  MAR: { short: 'Mar', num: '03', labelTh: 'มีนาคม' },
  APR: { short: 'Apr', num: '04', labelTh: 'เมษายน' },
  MAY: { short: 'May', num: '05', labelTh: 'พฤษภาคม' },
  JUN: { short: 'Jun', num: '06', labelTh: 'มิถุนายน' },
  JUL: { short: 'Jul', num: '07', labelTh: 'กรกฎาคม' },
  AUG: { short: 'Aug', num: '08', labelTh: 'สิงหาคม' },
  SEP: { short: 'Sep', num: '09', labelTh: 'กันยายน' },
  OCT: { short: 'Oct', num: '10', labelTh: 'ตุลาคม' },
  NOV: { short: 'Nov', num: '11', labelTh: 'พฤศจิกายน' },
  DEC: { short: 'Dec', num: '12', labelTh: 'ธันวาคม' }
};

export default function ServiceReportDashboard({
  jobs: currentJobs,
  yearlyJobs = [],
  settings,
  activeMonthYear,
  accessToken,
  onMonthChange,
  onNavigateToTab
}: ServiceReportDashboardProps) {
  const [cmStatusList, setCmStatusList] = useState<CMStatusRecord[]>([]);
  const [cmOnCallList, setCmOnCallList] = useState<CMStatusRecord[]>([]);
  const [pmScheduleList, setPmScheduleList] = useState<PMScheduleItem[]>([]);
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters
  const [selectedEngineer, setSelectedEngineer] = useState<string>('All');
  const [activeReportSection, setActiveReportSection] = useState<'all' | 'engineer' | 'pm' | 'cm' | 'billing' | 'quotation'>('all');
  const [cmBoardSourceFilter, setCmBoardSourceFilter] = useState<'All' | 'CMStatus' | 'CMOnCall'>('All');
  const [selectedQuotationMonth, setSelectedQuotationMonth] = useState<string>('ALL');
  const [selectedQuotationType, setSelectedQuotationType] = useState<'CM' | 'ALL' | 'PM'>('CM');

  const loadAllReportData = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const mainSheetId = settings.spreadsheetId;
      const pmSheetId = settings.pmSpreadsheetId || settings.spreadsheetId;
      const onCallSheetId = settings.cmOnCallSpreadsheetId || '19c9vJhO4qMdCP1O7rwWP_aUZyTqQrTwnzWWxtH7zDdE';

      const promises: Promise<any>[] = [];

      if (pmSheetId) {
        promises.push(
          fetchCMStatusRecords(pmSheetId, accessToken)
            .then(res => setCmStatusList(res))
            .catch(() => setCmStatusList([]))
        );
        promises.push(
          fetchPMScheduleRecords(pmSheetId, accessToken)
            .then(res => setPmScheduleList(res))
            .catch(() => setPmScheduleList([]))
        );
      }

      if (onCallSheetId) {
        promises.push(
          fetchCMOnCallRecords(onCallSheetId, accessToken)
            .then(res => setCmOnCallList(res))
            .catch(() => setCmOnCallList([]))
        );
      }

      if (mainSheetId) {
        promises.push(
          fetchQuotations(mainSheetId, accessToken)
            .then(res => setQuotations(res))
            .catch(() => setQuotations([]))
        );
      }

      await Promise.all(promises);
    } catch (e) {
      console.error('Error loading report dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllReportData();
  }, [settings.spreadsheetId, settings.pmSpreadsheetId, settings.cmOnCallSpreadsheetId, accessToken]);

  // Parse active period info
  const periodInfo = useMemo(() => {
    if (activeMonthYear.startsWith('YEARLY')) {
      const year = activeMonthYear.replace('YEARLY', '') || '2026';
      return {
        isYearly: true,
        monthAbbr: 'ALL',
        monthShort: 'All',
        monthNum: 'All',
        year,
        label: `ประจำปี ${year} (ทั้งปี)`
      };
    }
    const monthAbbr = activeMonthYear.slice(0, 3).toUpperCase();
    const year = activeMonthYear.slice(3) || '2026';
    const meta = MONTH_ABBR_MAP[monthAbbr] || { short: 'Jan', num: '01', labelTh: monthAbbr };
    return {
      isYearly: false,
      monthAbbr,
      monthShort: meta.short,
      monthNum: meta.num,
      year,
      label: `เดือน${meta.labelTh} ${year} (${activeMonthYear})`
    };
  }, [activeMonthYear]);

  // Robust date parser that extracts { monthNum: '01'..'12', year: '2026', monthKey: 'AUG2026' }
  const parseFlexibleDate = (dateStr?: string, fallbackText?: string): { monthNum: string; year: string; monthKey: string; labelTh: string; timestamp: number } | null => {
    const raw = String(dateStr || '').trim();
    const monthNumToAbbr: Record<number, { abbr: string; labelTh: string }> = {
      1: { abbr: 'JAN', labelTh: 'ม.ค.' },
      2: { abbr: 'FEB', labelTh: 'ก.พ.' },
      3: { abbr: 'MAR', labelTh: 'มี.ค.' },
      4: { abbr: 'APR', labelTh: 'เม.ย.' },
      5: { abbr: 'MAY', labelTh: 'พ.ค.' },
      6: { abbr: 'JUN', labelTh: 'มิ.ย.' },
      7: { abbr: 'JUL', labelTh: 'ก.ค.' },
      8: { abbr: 'AUG', labelTh: 'ส.ค.' },
      9: { abbr: 'SEP', labelTh: 'ก.ย.' },
      10: { abbr: 'OCT', labelTh: 'ต.ค.' },
      11: { abbr: 'NOV', labelTh: 'พ.ย.' },
      12: { abbr: 'DEC', labelTh: 'ธ.ค.' }
    };

    const normalizeYear = (yRaw: number): number => {
      if (yRaw > 2400) return yRaw - 543; // Convert Thai Buddhist year (พ.ศ.) to A.D.
      if (yRaw < 100) {
        if (yRaw >= 60) return (yRaw + 2500) - 543; // e.g., 69 -> 2569 -> 2026
        return 2000 + yRaw;
      }
      return yRaw;
    };

    const buildResult = (d: number, m: number, yRaw: number) => {
      if (m < 1 || m > 12) return null;
      const y = normalizeYear(yRaw);
      const meta = monthNumToAbbr[m];
      if (!meta) return null;
      const monthNum = String(m).padStart(2, '0');
      const dt = new Date(y, m - 1, Math.min(Math.max(d, 1), 28));
      return {
        monthNum,
        year: String(y),
        monthKey: `${meta.abbr}${y}`,
        labelTh: `${meta.labelTh} ${y}`,
        timestamp: dt.getTime()
      };
    };

    if (raw) {
      // 1. YYYY-MM-DD or YYYY/MM/DD
      const isoMatch = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
      if (isoMatch) {
        const res = buildResult(parseInt(isoMatch[3], 10), parseInt(isoMatch[2], 10), parseInt(isoMatch[1], 10));
        if (res) return res;
      }

      // 2. DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
      const dmyMatch = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
      if (dmyMatch) {
        const p0 = parseInt(dmyMatch[1], 10);
        const p1 = parseInt(dmyMatch[2], 10);
        const p2 = parseInt(dmyMatch[3], 10);
        if (p0 > 12) {
          const res = buildResult(p0, p1, p2);
          if (res) return res;
        } else if (p1 > 12) {
          const res = buildResult(p1, p0, p2);
          if (res) return res;
        } else {
          // Standard in Thailand is DD/MM/YYYY
          const res = buildResult(p0, p1, p2);
          if (res) return res;
        }
      }

      // 3. MM/YYYY or MM-YYYY
      const myMatch = raw.match(/^(\d{1,2})[-/.](\d{4})$/);
      if (myMatch) {
        const res = buildResult(1, parseInt(myMatch[1], 10), parseInt(myMatch[2], 10));
        if (res) return res;
      }

      // 4. Thai month names or English month names inside string
      const thaiMonths: Array<{ keys: string[]; m: number }> = [
        { keys: ['มกราคม', 'ม.ค.', 'มค', 'january', 'jan'], m: 1 },
        { keys: ['กุมภาพันธ์', 'ก.พ.', 'กพ', 'february', 'feb'], m: 2 },
        { keys: ['มีนาคม', 'มี.ค.', 'มีค', 'march', 'mar'], m: 3 },
        { keys: ['เมษายน', 'เม.ย.', 'เมย', 'april', 'apr'], m: 4 },
        { keys: ['พฤษภาคม', 'พ.ค.', 'พค', 'may'], m: 5 },
        { keys: ['มิถุนายน', 'มิ.ย.', 'มิย', 'june', 'jun'], m: 6 },
        { keys: ['กรกฎาคม', 'ก.ค.', 'กค', 'july', 'jul'], m: 7 },
        { keys: ['สิงหาคม', 'ส.ค.', 'สค', 'august', 'aug'], m: 8 },
        { keys: ['กันยายน', 'ก.ย.', 'กย', 'september', 'sep'], m: 9 },
        { keys: ['ตุลาคม', 'ต.ค.', 'ตค', 'october', 'oct'], m: 10 },
        { keys: ['พฤศจิกายน', 'พ.ย.', 'พย', 'november', 'nov'], m: 11 },
        { keys: ['ธันวาคม', 'ธ.ค.', 'ธค', 'december', 'dec'], m: 12 }
      ];
      const lower = raw.toLowerCase();
      for (const tm of thaiMonths) {
        if (tm.keys.some(k => lower.includes(k))) {
          const yearMatch = raw.match(/(\d{4})/) || raw.match(/(\d{2})$/);
          const dayMatch = raw.match(/^(\d{1,2})/);
          const yVal = yearMatch ? parseInt(yearMatch[1], 10) : 2026;
          const dVal = dayMatch ? parseInt(dayMatch[1], 10) : 1;
          const res = buildResult(dVal, tm.m, yVal);
          if (res) return res;
        }
      }
    }

    // 5. Fallback: try extracting YYMM or YYYYMM from quotationNumber or fileName
    if (fallbackText) {
      const qMatch = fallbackText.match(/20(2\d)[-_]?([01]\d)/);
      if (qMatch) {
        const res = buildResult(1, parseInt(qMatch[2], 10), parseInt(`20${qMatch[1]}`, 10));
        if (res) return res;
      }
    }

    return null;
  };

  // Helper to check if a date string belongs to the selected period
  const isDateInSelectedPeriod = (dateStr?: string): boolean => {
    if (!dateStr) return periodInfo.isYearly;
    const parsed = parseFlexibleDate(dateStr);
    if (parsed) {
      if (periodInfo.isYearly) {
        return parsed.year === periodInfo.year;
      }
      return parsed.year === periodInfo.year && parsed.monthNum === periodInfo.monthNum;
    }

    const s = String(dateStr).trim();
    if (!s) return periodInfo.isYearly;
    if (periodInfo.isYearly) {
      return s.includes(periodInfo.year) || s.includes(periodInfo.year.slice(2));
    }
    return false;
  };

  // Normalize jobs list for the active period and engineer filter
  const baseJobs = useMemo(() => {
    const source = periodInfo.isYearly && yearlyJobs.length > 0 ? yearlyJobs : currentJobs;
    return source.map(j => {
      const rawType = String(j.jobType || '').toUpperCase().trim();
      const normalizedType = rawType.includes('PM') ? 'PM' : rawType.includes('CM') ? 'CM' : (j.jobType || 'Other');
      return {
        ...j,
        normalizedType
      };
    });
  }, [currentJobs, yearlyJobs, periodInfo.isYearly]);

  const filteredJobs = useMemo(() => {
    if (selectedEngineer === 'All') return baseJobs;
    return baseJobs.filter(j => {
      const engineers = [j.engineerName, j.engineer2, j.engineer3, j.engineer4]
        .filter(Boolean)
        .map(e => String(e).trim());
      return engineers.includes(selectedEngineer);
    });
  }, [baseJobs, selectedEngineer]);

  // Helper to extract engineers from a job
  const getJobEngineers = (job: ServiceJob): string[] => {
    const list = [job.engineerName, job.engineer2, job.engineer3, job.engineer4]
      .filter(e => e && e !== '-- Select --' && String(e).trim() !== '')
      .map(e => String(e).trim());
    return list.length > 0 ? Array.from(new Set(list)) : ['Unassigned'];
  };

  // ============================================================================
  // 1. สรุปงาน PM ของเดือน & ช่างแต่ละคนทำไปกี่งาน
  // ============================================================================
  const pmReport = useMemo(() => {
    // Scheduled PMs from PM Schedule sheet for the selected period
    const scheduledPMs = pmScheduleList.filter(item => {
      const yearMatch = !item.year || item.year.includes(periodInfo.year);
      if (!yearMatch) return false;
      if (periodInfo.isYearly) return true;
      return (item.month || '').toLowerCase() === periodInfo.monthShort.toLowerCase();
    });

    // Opened PM jobs in Job Tracker for the selected period
    const pmJobs = filteredJobs.filter(j => j.normalizedType === 'PM');
    const donePmJobs = pmJobs.filter(j => (j.jobStatus || '').toLowerCase() === 'done');
    const inProgressPmJobs = pmJobs.filter(j => (j.jobStatus || '').toLowerCase() === 'inprogress');
    const pendingPmJobs = pmJobs.filter(j => (j.jobStatus || '').toLowerCase() === 'pending');

    // Calculate total baseline: if PM schedule is available and no single engineer filter, show both Plan vs Logged
    const totalPlannedFromSchedule = scheduledPMs.length;
    const totalOpenedPMJobs = pmJobs.length;
    const totalTargetPM = totalOpenedPMJobs > 0 ? totalOpenedPMJobs : totalPlannedFromSchedule;

    const completionRateByJob = totalOpenedPMJobs > 0
      ? Number(((donePmJobs.length / totalOpenedPMJobs) * 100).toFixed(1))
      : 0;

    const completionRateAgainstPlan = totalPlannedFromSchedule > 0
      ? Number(((donePmJobs.length / totalPlannedFromSchedule) * 100).toFixed(1))
      : completionRateByJob;

    // Breakdown by equipment category (C-Arm vs Ultrasound)
    let cArmTotal = 0;
    let cArmDone = 0;
    let usTotal = 0;
    let usDone = 0;

    pmJobs.forEach(j => {
      const prod = (j.product || '').toUpperCase();
      const eq = (j.equipmentName || '').toLowerCase();
      const isCArm = prod.includes('C-ARM') || ['bv', 'zenition', 'veradius', 'pulsera', 'endura'].some(k => eq.includes(k));
      const isDone = (j.jobStatus || '').toLowerCase() === 'done';
      if (isCArm) {
        cArmTotal++;
        if (isDone) cArmDone++;
      } else {
        usTotal++;
        if (isDone) usDone++;
      }
    });

    // Breakdown by Engineer for PM Jobs
    const byEngineerMap: Record<string, { name: string; totalPM: number; donePM: number; inProgressPM: number; pendingPM: number; cArm: number; us: number }> = {};

    pmJobs.forEach(job => {
      const engs = getJobEngineers(job);
      const isDone = (job.jobStatus || '').toLowerCase() === 'done';
      const isInProg = (job.jobStatus || '').toLowerCase() === 'inprogress';
      const isPend = (job.jobStatus || '').toLowerCase() === 'pending';
      const prod = (job.product || '').toUpperCase();
      const eq = (job.equipmentName || '').toLowerCase();
      const isCArm = prod.includes('C-ARM') || ['bv', 'zenition', 'veradius', 'pulsera', 'endura'].some(k => eq.includes(k));

      engs.forEach(eng => {
        if (selectedEngineer !== 'All' && eng !== selectedEngineer) return;
        if (!byEngineerMap[eng]) {
          byEngineerMap[eng] = { name: eng, totalPM: 0, donePM: 0, inProgressPM: 0, pendingPM: 0, cArm: 0, us: 0 };
        }
        byEngineerMap[eng].totalPM += 1;
        if (isDone) byEngineerMap[eng].donePM += 1;
        else if (isInProg) byEngineerMap[eng].inProgressPM += 1;
        else if (isPend) byEngineerMap[eng].pendingPM += 1;

        if (isCArm) byEngineerMap[eng].cArm += 1;
        else byEngineerMap[eng].us += 1;
      });
    });

    const engineerPmRanking = Object.values(byEngineerMap)
      .map(e => ({
        ...e,
        percentDone: e.totalPM > 0 ? Number(((e.donePM / e.totalPM) * 100).toFixed(1)) : 0,
        shareOfTeamDone: donePmJobs.length > 0 ? Number(((e.donePM / donePmJobs.length) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.donePM - a.donePM || b.totalPM - a.totalPM);

    return {
      totalPlannedFromSchedule,
      totalOpenedPMJobs,
      totalTargetPM,
      doneCount: donePmJobs.length,
      inProgressCount: inProgressPmJobs.length,
      pendingCount: pendingPmJobs.length,
      remainingFromSchedule: Math.max(0, totalPlannedFromSchedule - donePmJobs.length),
      completionRateByJob,
      completionRateAgainstPlan,
      cArm: { total: cArmTotal, done: cArmDone },
      us: { total: usTotal, done: usDone },
      engineerPmRanking
    };
  }, [pmScheduleList, filteredJobs, periodInfo, selectedEngineer]);

  // ============================================================================
  // 2. สรุปงานเกี่ยวกับ CM แจ้งซ่อม (ทั้งที่เปิด Job Number และใน CM Status Board)
  // ============================================================================
  const cmReport = useMemo(() => {
    // 2A. CM Jobs with Job Number in Tracker
    const cmJobs = filteredJobs.filter(j => j.normalizedType === 'CM');
    const cmJobsDone = cmJobs.filter(j => (j.jobStatus || '').toLowerCase() === 'done').length;
    const cmJobsInProgress = cmJobs.filter(j => (j.jobStatus || '').toLowerCase() === 'inprogress').length;
    const cmJobsPending = cmJobs.filter(j => (j.jobStatus || '').toLowerCase() === 'pending').length;
    const cmJobsSaleSupport = cmJobs.filter(j => (j.jobStatus || '').toLowerCase() === 'sale support').length;
    const cmJobsCancelled = cmJobs.filter(j => (j.jobStatus || '').toLowerCase() === 'cancelled').length;

    // 2B. CM Status Board + CM On Call Records
    const combinedBoardRaw = [
      ...(cmBoardSourceFilter === 'CMOnCall' ? [] : cmStatusList.map(r => ({ ...r, boardSource: 'CM Status Board' }))),
      ...(cmBoardSourceFilter === 'CMStatus' ? [] : cmOnCallList.map(r => ({ ...r, boardSource: 'CM On Call' })))
    ];

    const filteredBoardRecords = combinedBoardRaw.filter(r => {
      if (selectedEngineer !== 'All' && (r.engineer || '').trim() !== selectedEngineer) {
        return false;
      }
      // If reportDate is present, check if it matches period; if user wants current board status, include records matching period or active
      if (r.reportDate && !periodInfo.isYearly) {
        return isDateInSelectedPeriod(r.reportDate);
      }
      return true;
    });

    // If period filtering yields 0 on CM board because reportDate wasn't set or is from previous month still open,
    // also provide "All Board Tickets" metrics so user never misses anything
    const activeBoardSource = filteredBoardRecords.length > 0 ? filteredBoardRecords : combinedBoardRaw.filter(r =>
      selectedEngineer === 'All' ? true : (r.engineer || '').trim() === selectedEngineer
    );
    const isUsingAllTimeBoardFallback = filteredBoardRecords.length === 0 && activeBoardSource.length > 0;

    // Standardize CM Board Statuses requested by user:
    // - Repair request
    // - Pending
    // - In Progress Checking (In progress)
    // - Waiting for Claim spare parts (waiting for claim)
    // - Waiting for replacement parts (waiting for replacement)
    // - Submit a price offer (submit a price)
    // - Submit the invoice (submit the invoice)
    // - Closed
    const canonicalStatuses = [
      { key: 'Repair request', label: 'Repair Request (แจ้งซ่อมใหม่)', color: 'bg-rose-50 text-rose-700 border-rose-200', barColor: '#f43f5e' },
      { key: 'Pending', label: 'Pending (รอดำเนินการ)', color: 'bg-amber-50 text-amber-700 border-amber-200', barColor: '#f59e0b' },
      { key: 'In Progress Checking', label: 'In Progress Checking (กำลังเข้าตรวจเช็ค)', color: 'bg-blue-50 text-blue-700 border-blue-200', barColor: '#3b82f6' },
      { key: 'Waiting for Claim spare parts', label: 'Waiting for Claim (รอเคลมอะไหล่)', color: 'bg-purple-50 text-purple-700 border-purple-200', barColor: '#8b5cf6' },
      { key: 'Waiting for replacement parts', label: 'Waiting for Replacement (รอเปลี่ยนอะไหล่)', color: 'bg-orange-50 text-orange-700 border-orange-200', barColor: '#f97316' },
      { key: 'Submit a price offer', label: 'Submit a Price Offer (เสนอราคา)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', barColor: '#6366f1' },
      { key: 'Submit the invoice', label: 'Submit the Invoice (ส่งวางบิล/แจ้งหนี้)', color: 'bg-teal-50 text-teal-700 border-teal-200', barColor: '#14b8a6' },
      { key: 'Closed', label: 'Closed (ปิดงานเรียบร้อย)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', barColor: '#10b981' }
    ];

    const statusCounts: Record<string, number> = {};
    canonicalStatuses.forEach(s => { statusCounts[s.key] = 0; });

    activeBoardSource.forEach(r => {
      const raw = (r.status || 'Repair request').trim();
      const low = raw.toLowerCase();
      if (low.includes('repair') || low.includes('repire')) statusCounts['Repair request'] += 1;
      else if (low === 'pending') statusCounts['Pending'] += 1;
      else if (low.includes('in progress') || low.includes('inprogress') || low.includes('checking')) statusCounts['In Progress Checking'] += 1;
      else if (low.includes('claim')) statusCounts['Waiting for Claim spare parts'] += 1;
      else if (low.includes('replacement') || low.includes('parts')) statusCounts['Waiting for replacement parts'] += 1;
      else if (low.includes('price') || low.includes('offer') || low.includes('quote')) statusCounts['Submit a price offer'] += 1;
      else if (low.includes('invoice') || low.includes('bill')) statusCounts['Submit the invoice'] += 1;
      else if (low.includes('close') || low.includes('done')) statusCounts['Closed'] += 1;
      else {
        statusCounts[raw] = (statusCounts[raw] || 0) + 1;
      }
    });

    const boardStatusBreakdown = canonicalStatuses.map(st => ({
      ...st,
      count: statusCounts[st.key] || 0,
      percentage: activeBoardSource.length > 0 ? Number((((statusCounts[st.key] || 0) / activeBoardSource.length) * 100).toFixed(1)) : 0
    }));

    return {
      totalLoggedCMJobs: cmJobs.length,
      cmJobsDone,
      cmJobsInProgress,
      cmJobsPending,
      cmJobsSaleSupport,
      cmJobsCancelled,
      totalBoardTickets: activeBoardSource.length,
      cmStatusCount: cmStatusList.length,
      cmOnCallCount: cmOnCallList.length,
      isUsingAllTimeBoardFallback,
      boardStatusBreakdown,
      recentBoardRecords: activeBoardSource.slice(0, 15)
    };
  }, [filteredJobs, cmStatusList, cmOnCallList, cmBoardSourceFilter, selectedEngineer, periodInfo]);

  // ============================================================================
  // 3. สรุปภาพรวมงานที่มีการวางบิลทั้งหมด (Billing Overview)
  // ============================================================================
  const billingReport = useMemo(() => {
    const billedJobs = filteredJobs.filter(j => (j.billingStatus || '').trim() === 'วางบิลเรียบร้อยแล้ว');
    const unbilledJobs = filteredJobs.filter(j => (j.billingStatus || '').trim() === 'ยังไม่ได้วางบิล');

    // Also detect Paid Repair / Revenue > 0 jobs that haven't set billingStatus yet
    const paidOrRevenueNoStatus = filteredJobs.filter(j => {
      const bs = (j.billingStatus || '').trim();
      if (bs === 'วางบิลเรียบร้อยแล้ว' || bs === 'ยังไม่ได้วางบิล') return false;
      return (j.revenue && j.revenue > 0) || j.warrantyStatus === 'Paid Repair';
    });

    const totalBillableJobsCount = billedJobs.length + unbilledJobs.length;
    const billedAmount = billedJobs.reduce((sum, j) => sum + (j.revenue || 0), 0);
    const unbilledAmount = unbilledJobs.reduce((sum, j) => sum + (j.revenue || 0), 0);
    const totalBillableAmount = billedAmount + unbilledAmount;

    const billedRateByCount = totalBillableJobsCount > 0
      ? Number(((billedJobs.length / totalBillableJobsCount) * 100).toFixed(1))
      : 0;

    // Group by Hospital
    const byHospitalMap: Record<string, { hospital: string; totalCount: number; billedCount: number; unbilledCount: number; billedAmount: number; unbilledAmount: number }> = {};

    [...billedJobs, ...unbilledJobs].forEach(job => {
      const h = job.hospitalName || 'ไม่ระบุโรงพยาบาล';
      if (!byHospitalMap[h]) {
        byHospitalMap[h] = { hospital: h, totalCount: 0, billedCount: 0, unbilledCount: 0, billedAmount: 0, unbilledAmount: 0 };
      }
      byHospitalMap[h].totalCount += 1;
      if ((job.billingStatus || '').trim() === 'วางบิลเรียบร้อยแล้ว') {
        byHospitalMap[h].billedCount += 1;
        byHospitalMap[h].billedAmount += (job.revenue || 0);
      } else {
        byHospitalMap[h].unbilledCount += 1;
        byHospitalMap[h].unbilledAmount += (job.revenue || 0);
      }
    });

    const hospitalBillingList = Object.values(byHospitalMap).sort(
      (a, b) => (b.unbilledAmount + b.billedAmount) - (a.unbilledAmount + a.billedAmount) || b.totalCount - a.totalCount
    );

    return {
      totalBillableJobsCount,
      billedCount: billedJobs.length,
      unbilledCount: unbilledJobs.length,
      unassignedPaidCount: paidOrRevenueNoStatus.length,
      billedAmount,
      unbilledAmount,
      totalBillableAmount,
      billedRateByCount,
      hospitalBillingList,
      billedJobs,
      unbilledJobs
    };
  }, [filteredJobs]);

  // ============================================================================
  // 4. สรุปงานซ่อม CM ที่เสนอราคา (CM Quotation Summary with Monthly Filter)
  // ============================================================================
  const quotationReport = useMemo(() => {
    // Enrich all quotations with parsed monthKey & normalized jobType
    const enrichedQuotations = quotations.map(q => {
      const parsed = parseFlexibleDate(q.date, `${q.quotationNumber || ''} ${q.fileName || ''}`);
      const rawType = (q.jobType || 'CM').trim().toUpperCase();
      const normType: 'CM' | 'PM' | 'Other' = rawType.includes('CM')
        ? 'CM'
        : rawType.includes('PM')
        ? 'PM'
        : 'CM';
      return {
        ...q,
        normalizedJobType: normType,
        monthKey: parsed ? parsed.monthKey : 'UNKNOWN',
        monthLabelTh: parsed ? parsed.labelTh : 'ไม่ระบุเดือน',
        monthNum: parsed ? parsed.monthNum : '99',
        yearStr: parsed ? parsed.year : '2026',
        timestamp: parsed ? parsed.timestamp : 0
      };
    }).sort((a, b) => b.timestamp - a.timestamp || b.rowIndex - a.rowIndex);

    // Group monthly summary across all 12 months + any other months found in data
    const monthlyBreakdownMap: Record<string, {
      monthKey: string;
      labelTh: string;
      cmCount: number;
      cmAmount: number;
      pmCount: number;
      pmAmount: number;
      totalCount: number;
      totalAmount: number;
    }> = {};

    // Initialize standard 2026 months in order so user can filter any month
    MONTHS.forEach(mKey => {
      const abbr = mKey.slice(0, 3);
      const yr = mKey.slice(3);
      const meta = MONTH_ABBR_MAP[abbr];
      monthlyBreakdownMap[mKey] = {
        monthKey: mKey,
        labelTh: meta ? `${meta.labelTh} ${yr}` : mKey,
        cmCount: 0,
        cmAmount: 0,
        pmCount: 0,
        pmAmount: 0,
        totalCount: 0,
        totalAmount: 0
      };
    });

    enrichedQuotations.forEach(q => {
      const key = q.monthKey;
      if (!monthlyBreakdownMap[key]) {
        monthlyBreakdownMap[key] = {
          monthKey: key,
          labelTh: q.monthLabelTh,
          cmCount: 0,
          cmAmount: 0,
          pmCount: 0,
          pmAmount: 0,
          totalCount: 0,
          totalAmount: 0
        };
      }
      const bucket = monthlyBreakdownMap[key];
      bucket.totalCount += 1;
      bucket.totalAmount += (q.totalAmount || 0);
      if (q.normalizedJobType === 'CM') {
        bucket.cmCount += 1;
        bucket.cmAmount += (q.totalAmount || 0);
      } else {
        bucket.pmCount += 1;
        bucket.pmAmount += (q.totalAmount || 0);
      }
    });

    const monthlySummaries = Object.values(monthlyBreakdownMap);
    const monthsWithData = monthlySummaries.filter(m => m.totalCount > 0);

    // Filter quotations according to selectedQuotationMonth
    // - 'ALL': show all months
    // - 'SYNC': sync with top header activeMonthYear
    // - Specific monthKey (e.g. 'AUG2026', 'SEP2026', 'OCT2026'): filter that month
    const effectiveMonthFilter = selectedQuotationMonth === 'SYNC'
      ? (periodInfo.isYearly ? 'ALL' : activeMonthYear)
      : selectedQuotationMonth;

    const monthFilteredQuotations = effectiveMonthFilter === 'ALL'
      ? enrichedQuotations
      : enrichedQuotations.filter(q => q.monthKey === effectiveMonthFilter);

    const cmQuotations = monthFilteredQuotations.filter(q => q.normalizedJobType === 'CM');
    const pmQuotations = monthFilteredQuotations.filter(q => q.normalizedJobType === 'PM');

    const displayedQuotationsList = selectedQuotationType === 'CM'
      ? cmQuotations
      : selectedQuotationType === 'PM'
      ? pmQuotations
      : monthFilteredQuotations;

    const totalCMQuotedAmount = cmQuotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
    const weightedCMExpectedAmount = cmQuotations.reduce((sum, q) => sum + ((q.totalAmount || 0) * ((q.winRate || 0) / 100)), 0);
    const totalAllQuotedAmount = monthFilteredQuotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    const cmBoardPriceOfferCount = cmReport.boardStatusBreakdown.find(s => s.key === 'Submit a price offer')?.count || 0;
    const cmTrackerPaidRepairJobs = filteredJobs.filter(j => j.normalizedType === 'CM' && (j.warrantyStatus === 'Paid Repair' || (j.revenue || 0) > 0));
    const cmTrackerPaidRepairRevenue = cmTrackerPaidRepairJobs.reduce((sum, j) => sum + (j.revenue || 0), 0);

    return {
      effectiveMonthFilter,
      cmQuoteCount: cmQuotations.length,
      totalCMQuotedAmount,
      weightedCMExpectedAmount,
      pmQuoteCount: pmQuotations.length,
      totalAllQuotesCount: monthFilteredQuotations.length,
      totalAllQuotedAmount,
      cmBoardPriceOfferCount,
      cmTrackerPaidRepairCount: cmTrackerPaidRepairJobs.length,
      cmTrackerPaidRepairRevenue,
      cmQuotationsList: displayedQuotationsList,
      monthlySummaries,
      monthsWithData
    };
  }, [quotations, selectedQuotationMonth, selectedQuotationType, activeMonthYear, periodInfo, cmReport, filteredJobs]);

  // ============================================================================
  // 5. สรุปผลงานช่างแต่ละคนแบบละเอียด (Engineer Individual Performance Matrix)
  // ============================================================================
  const engineerPerformanceMatrix = useMemo(() => {
    const matrix: Record<string, {
      name: string;
      totalJobs: number;
      pmTotal: number;
      pmDone: number;
      cmTotal: number;
      cmDone: number;
      otherTotal: number;
      doneTotal: number;
      inProgressTotal: number;
      pendingTotal: number;
      activeCMBoardTickets: number;
      billedCount: number;
      unbilledCount: number;
      revenueGenerated: number;
      totalServiceHours: number;
      durationJobCount: number;
      sameDayJobs: number;
      responseTrackedJobs: number;
    }> = {};

    // Seed known engineers from settings
    (settings.engineers || []).forEach(eng => {
      if (selectedEngineer !== 'All' && eng !== selectedEngineer) return;
      matrix[eng] = {
        name: eng,
        totalJobs: 0,
        pmTotal: 0,
        pmDone: 0,
        cmTotal: 0,
        cmDone: 0,
        otherTotal: 0,
        doneTotal: 0,
        inProgressTotal: 0,
        pendingTotal: 0,
        activeCMBoardTickets: 0,
        billedCount: 0,
        unbilledCount: 0,
        revenueGenerated: 0,
        totalServiceHours: 0,
        durationJobCount: 0,
        sameDayJobs: 0,
        responseTrackedJobs: 0
      };
    });

    filteredJobs.forEach(job => {
      const engs = getJobEngineers(job);
      const isDone = (job.jobStatus || '').toLowerCase() === 'done';
      const isInProg = (job.jobStatus || '').toLowerCase() === 'inprogress';
      const isPend = (job.jobStatus || '').toLowerCase() === 'pending';

      // Calculate process duration hours if logged
      let jobHours = 0;
      if (job.processTimeStart && job.processTimeStop) {
        const [h1, m1] = job.processTimeStart.split(':').map(Number);
        const [h2, m2] = job.processTimeStop.split(':').map(Number);
        if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
          let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
          if (mins < 0) mins += 24 * 60;
          if (mins > 0 && mins < 1440) {
            jobHours = mins / 60;
          }
        }
      }

      const isSameDay = job.callDate && job.serviceDate && job.callDate.trim() === job.serviceDate.trim();

      engs.forEach(eng => {
        if (selectedEngineer !== 'All' && eng !== selectedEngineer) return;
        if (!matrix[eng]) {
          matrix[eng] = {
            name: eng,
            totalJobs: 0,
            pmTotal: 0,
            pmDone: 0,
            cmTotal: 0,
            cmDone: 0,
            otherTotal: 0,
            doneTotal: 0,
            inProgressTotal: 0,
            pendingTotal: 0,
            activeCMBoardTickets: 0,
            billedCount: 0,
            unbilledCount: 0,
            revenueGenerated: 0,
            totalServiceHours: 0,
            durationJobCount: 0,
            sameDayJobs: 0,
            responseTrackedJobs: 0
          };
        }

        const item = matrix[eng];
        item.totalJobs += 1;

        if (job.normalizedType === 'PM') {
          item.pmTotal += 1;
          if (isDone) item.pmDone += 1;
        } else if (job.normalizedType === 'CM') {
          item.cmTotal += 1;
          if (isDone) item.cmDone += 1;
        } else {
          item.otherTotal += 1;
        }

        if (isDone) item.doneTotal += 1;
        else if (isInProg) item.inProgressTotal += 1;
        else if (isPend) item.pendingTotal += 1;

        if (job.billingStatus === 'วางบิลเรียบร้อยแล้ว') item.billedCount += 1;
        else if (job.billingStatus === 'ยังไม่ได้วางบิล') item.unbilledCount += 1;

        item.revenueGenerated += (job.revenue || 0);

        if (jobHours > 0) {
          item.totalServiceHours += jobHours;
          item.durationJobCount += 1;
        }

        if (job.callDate && job.serviceDate) {
          item.responseTrackedJobs += 1;
          if (isSameDay) item.sameDayJobs += 1;
        }
      });
    });

    // Add active CM Status Board tickets per engineer
    [...cmStatusList, ...cmOnCallList].forEach(rec => {
      if ((rec.status || 'Repair request') === 'Closed') return;
      const eng = (rec.engineer || '').trim();
      if (!eng) return;
      if (selectedEngineer !== 'All' && eng !== selectedEngineer) return;
      if (matrix[eng]) {
        matrix[eng].activeCMBoardTickets += 1;
      }
    });

    return Object.values(matrix)
      .filter(e => e.totalJobs > 0 || e.activeCMBoardTickets > 0 || selectedEngineer === e.name)
      .map(e => ({
        ...e,
        completionRate: e.totalJobs > 0 ? Number(((e.doneTotal / e.totalJobs) * 100).toFixed(1)) : 0,
        pmCompletionRate: e.pmTotal > 0 ? Number(((e.pmDone / e.pmTotal) * 100).toFixed(1)) : 0,
        avgHoursPerJob: e.durationJobCount > 0 ? Number((e.totalServiceHours / e.durationJobCount).toFixed(1)) : 0,
        sameDayPercent: e.responseTrackedJobs > 0 ? Math.round((e.sameDayJobs / e.responseTrackedJobs) * 100) : 0
      }))
      .sort((a, b) => b.totalJobs - a.totalJobs || b.doneTotal - a.doneTotal);
  }, [filteredJobs, settings.engineers, cmStatusList, cmOnCallList, selectedEngineer]);

  // ============================================================================
  // 6. ข้อมูลวิเคราะห์เพิ่มเติม (Executive Insights & Recommendations)
  // ============================================================================
  const additionalInsights = useMemo(() => {
    // Warranty Breakdown of CM Jobs
    const warrantyMap: Record<string, number> = {
      'Guarantee (ในประกัน)': 0,
      'Contract (ในสัญญา)': 0,
      'Paid Repair (ซ่อมมีค่าใช้จ่าย)': 0,
      'SaleSupport / อื่นๆ': 0
    };

    const cmJobs = filteredJobs.filter(j => j.normalizedType === 'CM');
    cmJobs.forEach(j => {
      if (j.warrantyStatus === 'Guarantee') warrantyMap['Guarantee (ในประกัน)'] += 1;
      else if (j.warrantyStatus === 'Contract') warrantyMap['Contract (ในสัญญา)'] += 1;
      else if (j.warrantyStatus === 'Paid Repair') warrantyMap['Paid Repair (ซ่อมมีค่าใช้จ่าย)'] += 1;
      else warrantyMap['SaleSupport / อื่นๆ'] += 1;
    });

    // Repeat Repair Detector (Same Serial Number > 1 CM job)
    const snCountMap: Record<string, { sn: string; hospital: string; model: string; count: number; problems: string[] }> = {};
    cmJobs.forEach(j => {
      const sn = (j.serialNumber || '').trim();
      if (!sn || sn === '-' || sn.toLowerCase() === 'n/a') return;
      if (!snCountMap[sn]) {
        snCountMap[sn] = { sn, hospital: j.hospitalName, model: j.equipmentName, count: 0, problems: [] };
      }
      snCountMap[sn].count += 1;
      if (j.problemDescription) snCountMap[sn].problems.push(j.problemDescription);
    });

    const repeatRepairs = Object.values(snCountMap)
      .filter(item => item.count > 1)
      .sort((a, b) => b.count - a.count);

    // Spare parts utilization
    const jobsWithParts = filteredJobs.filter(j => j.spareParts || j.spareParts2 || j.spareParts3);

    return {
      warrantyBreakdown: Object.entries(warrantyMap).map(([name, count]) => ({ name, count })),
      repeatRepairs,
      jobsWithPartsCount: jobsWithParts.length
    };
  }, [filteredJobs]);

  // Export Comprehensive Multi-Sheet Excel Report
  const handleExportFullReport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Engineer Performance Summary
    const engData = engineerPerformanceMatrix.map((e, idx) => ({
      'ลำดับ': idx + 1,
      'ชื่อช่าง (Engineer)': e.name,
      'งานทั้งหมด (Total Jobs)': e.totalJobs,
      'งาน PM ทั้งหมด': e.pmTotal,
      'งาน PM เสร็จสิ้น (Done)': e.pmDone,
      '% PM สำเร็จ': `${e.pmCompletionRate}%`,
      'งาน CM เปิด Job': e.cmTotal,
      'งาน CM เสร็จสิ้น (Done)': e.cmDone,
      'งานค้างใน CM Board': e.activeCMBoardTickets,
      'งานเสร็จรวม (Total Done)': e.doneTotal,
      'กำลังดำเนินการ (In Progress)': e.inProgressTotal,
      'รอดำเนินการ (Pending)': e.pendingTotal,
      '% ความสำเร็จรวม': `${e.completionRate}%`,
      'วางบิลแล้ว (งาน)': e.billedCount,
      'ยังไม่วางบิล (งาน)': e.unbilledCount,
      'ยอดรายได้รวม (บาท)': e.revenueGenerated
    }));
    const wsEng = XLSX.utils.json_to_sheet(engData);
    XLSX.utils.book_append_sheet(wb, wsEng, '1_สรุปผลงานช่าง');

    // Sheet 2: PM Summary by Engineer
    const pmData = pmReport.engineerPmRanking.map((e, idx) => ({
      'ลำดับ': idx + 1,
      'ชื่อช่าง': e.name,
      'จำนวนงาน PM ที่รับผิดชอบ': e.totalPM,
      'ทำเสร็จแล้ว (Done)': e.donePM,
      'กำลังทำ (In Progress)': e.inProgressPM,
      'รอดำเนินการ (Pending)': e.pendingPM,
      'เครื่อง C-Arm': e.cArm,
      'เครื่อง Ultrasound': e.us,
      'คิดเป็น % ที่ทำเสร็จ': `${e.percentDone}%`,
      'สัดส่วนเทียบทีม (%)': `${e.shareOfTeamDone}%`
    }));
    const wsPM = XLSX.utils.json_to_sheet(pmData);
    XLSX.utils.book_append_sheet(wb, wsPM, '2_สรุปงาน_PM');

    // Sheet 3: CM Status Breakdown
    const cmStatusSheetData = cmReport.boardStatusBreakdown.map(st => ({
      'สถานะ (CM Status Board)': st.label,
      'จำนวนงาน (งาน)': st.count,
      'สัดส่วน (%)': `${st.percentage}%`
    }));
    const wsCM = XLSX.utils.json_to_sheet(cmStatusSheetData);
    XLSX.utils.book_append_sheet(wb, wsCM, '3_สรุปสถานะ_CM');

    // Sheet 4: Billing Summary
    const billingData = billingReport.hospitalBillingList.map((h, idx) => ({
      'ลำดับ': idx + 1,
      'โรงพยาบาล': h.hospital,
      'งานที่ต้องวางบิลรวม': h.totalCount,
      'วางบิลเรียบร้อยแล้ว (งาน)': h.billedCount,
      'ยอดวางบิลแล้ว (บาท)': h.billedAmount,
      'ยังไม่ได้วางบิล (งาน)': h.unbilledCount,
      'ยอดค้างวางบิล (บาท)': h.unbilledAmount,
      'ยอดรวมทั้งหมด (บาท)': h.billedAmount + h.unbilledAmount
    }));
    const wsBilling = XLSX.utils.json_to_sheet(billingData);
    XLSX.utils.book_append_sheet(wb, wsBilling, '4_สรุปการวางบิล');

    // Sheet 5: CM Quotations
    const quoteData = quotationReport.cmQuotationsList.map((q, idx) => ({
      'ลำดับ': idx + 1,
      'วันที่': q.date,
      'เลขที่ใบเสนอราคา': q.quotationNumber,
      'ลูกค้า / โรงพยาบาล': q.customerName || '-',
      'ชื่องาน / รายละเอียด': q.jobName || q.description,
      'ประเภทงาน': q.jobType,
      'ยอดเสนอราคา (บาท)': q.totalAmount,
      'โอกาสได้งาน (%)': `${q.winRate}%`
    }));
    const wsQuote = XLSX.utils.json_to_sheet(quoteData);
    XLSX.utils.book_append_sheet(wb, wsQuote, '5_สรุปใบเสนอราคา_CM');

    const dateStamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Service_Summary_Report_${activeMonthYear}_${dateStamp}.xlsx`);
  };

  const formatTHB = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="space-y-6 pb-10 font-sans pr-3 md:pr-4" id="service-report-dashboard">
      {/* TOP HEADER & FILTER BAR */}
      <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight">
                รายงานสรุปผลการปฏิบัติงานช่าง และสรุปงานบริการ (CM / PM / วางบิล / เสนอราคา)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                ข้อมูลสรุปประจำงวด: <span className="text-blue-300 font-semibold">{periodInfo.label}</span>
                <span className="mx-2">·</span>
                <span>ช่างที่เลือก: <strong className="text-white">{selectedEngineer === 'All' ? 'ช่างทุกคน (All Engineers)' : selectedEngineer}</strong></span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector */}
          {onMonthChange && (
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400 font-medium">งวดเดือน:</span>
              <select
                value={activeMonthYear}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent text-white text-xs font-bold font-mono focus:outline-none cursor-pointer"
              >
                <option value="YEARLY2026" className="bg-slate-900 text-white">ทั้งปี 2026 (YEARLY)</option>
                {MONTHS.map(m => (
                  <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>
                ))}
              </select>
            </div>
          )}

          {/* Engineer Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 font-medium">กรองตามช่าง:</span>
            <select
              value={selectedEngineer}
              onChange={(e) => setSelectedEngineer(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer max-w-[160px]"
            >
              <option value="All" className="bg-slate-900 text-white">ช่างทุกคน (All)</option>
              {(settings.engineers || []).map(eng => (
                <option key={eng} value={eng} className="bg-slate-900 text-white">{eng}</option>
              ))}
            </select>
          </div>

          <button
            onClick={loadAllReportData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            title="รีเฟรชข้อมูลจากทุกชีต"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            <span>รีเฟรช</span>
          </button>

          <button
            onClick={handleExportFullReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export รายงาน Excel (ครบทุกหัวข้อ)</span>
          </button>
        </div>
      </div>

      {/* SECTION NAVIGATION TABS (Interactive Segmented Filter) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-lg border border-slate-300/80 w-fit">
        {[
          { id: 'all', label: 'ดูรายงานทั้งหมด (All Sections)' },
          { id: 'pm', label: '1. สรุปงาน PM & รายช่าง' },
          { id: 'cm', label: '2. สรุปงานซ่อม CM & สถานะ' },
          { id: 'billing', label: '3. สรุปการวางบิล (Billing)' },
          { id: 'quotation', label: '4. สรุปเสนอราคา CM (Quotation)' },
          { id: 'engineer', label: '5. ตารางผลงานช่างรายบุคคล (CM/PM)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReportSection(tab.id as any)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeReportSection === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* EXECUTIVE 4-PILLAR OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: PM Summary */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold uppercase tracking-wider text-blue-700">1. สรุปงาน PM ประจำงวด</span>
              <CalendarDays className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-slate-900">
                {pmReport.doneCount} / {pmReport.totalOpenedPMJobs}
              </span>
              <span className="text-xs text-slate-500 font-medium">งาน (เสร็จ / เปิดงาน)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              แผนตาราง PM ในเดือนนี้: <strong className="font-mono text-slate-700">{pmReport.totalPlannedFromSchedule}</strong> เครื่อง
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-600 font-medium">อัตราทำเสร็จ (Completion)</span>
              <span className="font-mono font-bold text-blue-700">{pmReport.completionRateByJob}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, pmReport.completionRateByJob)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: CM Summary */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold uppercase tracking-wider text-orange-700">2. สรุปงานแจ้งซ่อม CM</span>
              <Wrench className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <div>
                <span className="text-3xl font-black font-mono text-slate-900">{cmReport.totalLoggedCMJobs}</span>
                <span className="text-xs text-slate-500 ml-1">เปิด Job</span>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="text-2xl font-black font-mono text-orange-600">{cmReport.totalBoardTickets}</span>
                <span className="text-xs text-slate-500 ml-1">ใน CM Board</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ปิดงาน Job แล้ว <strong className="font-mono text-emerald-700">{cmReport.cmJobsDone}</strong> งาน · กำลังซ่อม <strong className="font-mono text-amber-700">{cmReport.cmJobsInProgress + cmReport.cmJobsPending}</strong> งาน
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>รอเคลม/รออะไหล่ในบอร์ด:</span>
            <strong className="font-mono text-slate-900">
              {(cmReport.boardStatusBreakdown.find(s => s.key === 'Waiting for Claim spare parts')?.count || 0) +
                (cmReport.boardStatusBreakdown.find(s => s.key === 'Waiting for replacement parts')?.count || 0)}{' '}
              งาน
            </strong>
          </div>
        </div>

        {/* Card 3: Billing Summary */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold uppercase tracking-wider text-emerald-700">3. สรุปงานวางบิลทั้งหมด</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-slate-900">{billingReport.totalBillableJobsCount}</span>
              <span className="text-xs text-slate-500 font-medium">งานที่มีสถานะวางบิล</span>
            </div>
            <div className="flex items-center gap-3 text-xs mt-1.5">
              <span className="text-emerald-700 font-semibold">
                วางบิลแล้ว: <strong className="font-mono">{billingReport.billedCount}</strong>
              </span>
              <span>·</span>
              <span className="text-amber-700 font-semibold">
                ยังไม่วางบิล: <strong className="font-mono">{billingReport.unbilledCount}</strong>
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">ยอดรวม (วางแล้ว / ค้าง):</span>
            <span className="font-mono font-bold text-slate-800">
              {formatTHB(billingReport.billedAmount)} / <span className="text-amber-600">{formatTHB(billingReport.unbilledAmount)}</span>
            </span>
          </div>
        </div>

        {/* Card 4: CM Quotation Summary */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold uppercase tracking-wider text-indigo-700">4. งานซ่อม CM ที่เสนอราคา</span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-mono text-indigo-700">{quotationReport.cmQuoteCount}</span>
              <span className="text-xs text-slate-500 font-medium">ใบเสนอราคา CM</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              สถานะ Submit a price ในบอร์ด: <strong className="font-mono text-slate-800">{quotationReport.cmBoardPriceOfferCount}</strong> งาน
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">ยอดรวมเสนอราคา CM:</span>
            <span className="text-sm font-black font-mono text-indigo-700">
              {formatTHB(quotationReport.totalCMQuotedAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SECTION 1: สรุปงาน PM ของเดือน และผลงาน PM ของช่างแต่ละคน
      ===================================================================== */}
      {(activeReportSection === 'all' || activeReportSection === 'pm') && (
        <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                01. รายงานสรุปงานบำรุงรักษาเชิงป้องกัน (PM Summary & Engineer Breakdown)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                สรุปจำนวนงาน PM ทั้งหมดในงวด จำนวนที่เข้าทำเสร็จแล้ว คิดเป็นเปอร์เซ็นต์ และจำนวนงาน PM ที่ช่างแต่ละคนเข้าทำ
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              งวดข้อมูล: {periodInfo.label}
            </div>
          </div>

          {/* PM Overview Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500 font-medium">แผน PM ตามตาราง</p>
              <p className="text-2xl font-black font-mono text-slate-800 mt-1">{pmReport.totalPlannedFromSchedule}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">เครื่องใน PM Schedule</p>
            </div>
            <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-semibold">งาน PM ที่เปิด Job</p>
              <p className="text-2xl font-black font-mono text-blue-800 mt-1">{pmReport.totalOpenedPMJobs}</p>
              <p className="text-[11px] text-blue-600/80 mt-0.5">เปิดเลข Job Number แล้ว</p>
            </div>
            <div className="p-4 bg-emerald-50/70 rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-700 font-semibold">เข้าทำเสร็จแล้ว (Done)</p>
              <p className="text-2xl font-black font-mono text-emerald-700 mt-1">{pmReport.doneCount}</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">กำลังทำ {pmReport.inProgressCount} · รอ {pmReport.pendingCount}</p>
            </div>
            <div className="p-4 bg-indigo-50/70 rounded-lg border border-indigo-200">
              <p className="text-xs text-indigo-700 font-semibold">% ทำเสร็จ (เทียบงานเปิด)</p>
              <p className="text-2xl font-black font-mono text-indigo-700 mt-1">{pmReport.completionRateByJob}%</p>
              <p className="text-[11px] text-indigo-600 mt-0.5">เทียบแผนตาราง: {pmReport.completionRateAgainstPlan}%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 font-medium">PM เครื่อง C-Arm</p>
              <p className="text-2xl font-black font-mono text-slate-800 mt-1">
                {pmReport.cArm.done} <span className="text-sm font-normal text-slate-400">/ {pmReport.cArm.total}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">เสร็จแล้ว / ทั้งหมด</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 font-medium">PM เครื่อง Ultrasound</p>
              <p className="text-2xl font-black font-mono text-slate-800 mt-1">
                {pmReport.us.done} <span className="text-sm font-normal text-slate-400">/ {pmReport.us.total}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">เสร็จแล้ว / ทั้งหมด</p>
            </div>
          </div>

          {/* PM Engineer Table & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Engineer PM Breakdown Table */}
            <div className="lg:col-span-7 overflow-x-auto border border-slate-200 rounded-lg">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ตารางสรุปจำนวนงาน PM แยกตามช่างผู้เข้าปฏิบัติงาน
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  รวม {pmReport.engineerPmRanking.length} ท่าน
                </span>
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-semibold">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">ชื่อช่าง (Engineer)</th>
                    <th className="py-2.5 px-3 text-right">งาน PM ทั้งหมด</th>
                    <th className="py-2.5 px-3 text-right">ทำเสร็จ (Done)</th>
                    <th className="py-2.5 px-3 text-right">ค้าง/กำลังทำ</th>
                    <th className="py-2.5 px-3 text-right">C-Arm / US</th>
                    <th className="py-2.5 px-3 text-right">% สำเร็จ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pmReport.engineerPmRanking.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        ไม่มีรายการงาน PM ในงวดที่เลือก
                      </td>
                    </tr>
                  ) : (
                    pmReport.engineerPmRanking.map((eng, i) => (
                      <tr key={eng.name} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{i + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{eng.name}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">{eng.totalPM}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">{eng.donePM}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-600">{eng.inProgressPM + eng.pendingPM}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {eng.cArm} / {eng.us}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min(100, eng.percentDone)}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-800 w-11 text-right">{eng.percentDone}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PM Bar Chart by Engineer */}
            <div className="lg:col-span-5 border border-slate-200 rounded-lg p-4 flex flex-col justify-between bg-slate-50/40">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  กราฟเปรียบเทียบจำนวนงาน PM รายช่าง
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">เปรียบเทียบงาน PM ที่ทำเสร็จแล้ว (Done) กับงานที่รับผิดชอบทั้งหมด</p>
              </div>
              <div className="h-64 w-full">
                {pmReport.engineerPmRanking.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={pmReport.engineerPmRanking.slice(0, 10)}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                      <XAxis type="number" fontSize={10} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(v) => (v.length > 16 ? v.slice(0, 16) + '…' : v)}
                      />
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="donePM" name="ทำเสร็จแล้ว (Done)" fill="#10b981" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="totalPM" name="งาน PM ทั้งหมด" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    ไม่มีข้อมูลงาน PM สำหรับแสดงกราฟ
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          SECTION 2: สรุปงานเกี่ยวกับ CM แจ้งซ่อม (Job Number & CM Status Board)
      ===================================================================== */}
      {(activeReportSection === 'all' || activeReportSection === 'cm') && (
        <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                02. รายงานสรุปงานซ่อมฉุกเฉิน CM (ทั้งที่เปิด Job Number และแจ้งซ่อมใน CM Status Board)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                แยกตามแหล่งที่มาของงานซ่อม และแจกแจงสถานะงานในบอร์ด (Repair Request, In Progress, Waiting for Claim, Waiting for Replacement, Submit a Price, Submit the Invoice, Closed)
              </p>
            </div>

            {/* Source filter for CM Status Board */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 shrink-0">
              {[
                { id: 'All', label: 'รวมทุกบอร์ด CM' },
                { id: 'CMStatus', label: `CM Status (${cmReport.cmStatusCount})` },
                { id: 'CMOnCall', label: `CM On Call (${cmReport.cmOnCallCount})` }
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setCmBoardSourceFilter(btn.id as any)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    cmBoardSourceFilter === btn.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Part 2A & 2B Comparison Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: CM Jobs with Job Number in Tracker */}
            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    ส่วนที่ 1: งานซ่อม CM ที่เปิดเลข Job Number แล้ว
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 mt-0.5">บันทึกในระบบ Active Job Tracker ({periodInfo.label})</h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black font-mono text-slate-900">{cmReport.totalLoggedCMJobs}</span>
                  <span className="block text-[11px] text-slate-500">งานที่เปิด Job</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-white rounded border border-slate-200">
                  <p className="text-[11px] text-slate-500">ซ่อมเสร็จ (Done)</p>
                  <p className="text-xl font-black font-mono text-emerald-600 mt-0.5">{cmReport.cmJobsDone}</p>
                </div>
                <div className="p-3 bg-white rounded border border-slate-200">
                  <p className="text-[11px] text-slate-500">กำลังทำ (Inprogress)</p>
                  <p className="text-xl font-black font-mono text-blue-600 mt-0.5">{cmReport.cmJobsInProgress}</p>
                </div>
                <div className="p-3 bg-white rounded border border-slate-200">
                  <p className="text-[11px] text-slate-500">รอดำเนินการ (Pending)</p>
                  <p className="text-xl font-black font-mono text-amber-600 mt-0.5">{cmReport.cmJobsPending}</p>
                </div>
                <div className="p-3 bg-white rounded border border-slate-200">
                  <p className="text-[11px] text-slate-500">Sale Support / อื่นๆ</p>
                  <p className="text-xl font-black font-mono text-slate-700 mt-0.5">
                    {cmReport.cmJobsSaleSupport + cmReport.cmJobsCancelled}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: CM Status Board Summary */}
            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                    ส่วนที่ 2: งานแจ้งซ่อมในหน้า CM Status Board
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                    รายการแจ้งซ่อมและติดตามสถานะอะไหล่/ใบเสนอราคา
                    {cmReport.isUsingAllTimeBoardFallback && (
                      <span className="ml-2 text-[11px] font-normal text-slate-500">(แสดงงานสะสมทั้งหมดในบอร์ด)</span>
                    )}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black font-mono text-orange-600">{cmReport.totalBoardTickets}</span>
                  <span className="block text-[11px] text-slate-500">รายการแจ้งซ่อม</span>
                </div>
              </div>

              {/* Stacked Progress Bar of Statuses */}
              {cmReport.totalBoardTickets > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="h-3 w-full bg-slate-200 rounded-full flex overflow-hidden">
                    {cmReport.boardStatusBreakdown.map(st =>
                      st.count > 0 ? (
                        <div
                          key={st.key}
                          style={{ width: `${st.percentage}%`, backgroundColor: st.barColor }}
                          title={`${st.label}: ${st.count} งาน (${st.percentage}%)`}
                          className="h-full transition-all duration-300"
                        />
                      ) : null
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>
                      กำลังดำเนินการในบอร์ด:{' '}
                      <strong className="font-mono text-slate-900">
                        {cmReport.totalBoardTickets - (cmReport.boardStatusBreakdown.find(s => s.key === 'Closed')?.count || 0)}
                      </strong>{' '}
                      งาน
                    </span>
                    <span>
                      ปิดงานแล้ว (Closed):{' '}
                      <strong className="font-mono text-emerald-700">
                        {cmReport.boardStatusBreakdown.find(s => s.key === 'Closed')?.count || 0}
                      </strong>{' '}
                      งาน
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Status Breakdown Cards (8 Exact Statuses) */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              สรุปจำนวนงานแจ้งซ่อมแยกตามสถานะใน CM Status Board
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {cmReport.boardStatusBreakdown.map(st => (
                <div
                  key={st.key}
                  className={`p-4 rounded-lg border flex flex-col justify-between ${st.color}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold leading-snug">{st.label}</span>
                    <span className="text-xs font-mono opacity-75">{st.percentage}%</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-current/10">
                    <span className="text-2xl font-black font-mono">{st.count}</span>
                    <span className="text-xs font-medium">งาน</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          SECTION 3: สรุปภาพรวมงานที่มีการวางบิลทั้งหมด (Billing Overview)
      ===================================================================== */}
      {(activeReportSection === 'all' || activeReportSection === 'billing') && (
        <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                03. รายงานสรุปภาพรวมงานที่มีการวางบิลทั้งหมด (Billing Status Summary)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                สรุปจำนวนงานที่ต้องวางบิลทั้งหมด งานที่วางบิลเรียบร้อยแล้ว และงานที่ยังไม่ได้วางบิล พร้อมยอดเงินแยกตามโรงพยาบาล
              </p>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('billing')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>ไปที่หน้าจัดการวางบิล (Billing Summary)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 3 Main Billing KPI Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">งานที่มีการวางบิลทั้งหมด</p>
              <div className="flex items-baseline justify-between mt-2">
                <div>
                  <span className="text-3xl font-black font-mono text-slate-900">{billingReport.totalBillableJobsCount}</span>
                  <span className="text-xs text-slate-500 ml-1.5">งาน</span>
                </div>
                <span className="text-base font-bold font-mono text-slate-800">
                  {formatTHB(billingReport.totalBillableAmount)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                คิดเป็นอัตราการวางบิลสำเร็จ <strong className="font-mono text-slate-800">{billingReport.billedRateByCount}%</strong> ของจำนวนงาน
              </p>
            </div>

            <div className="p-5 rounded-lg border border-emerald-200 bg-emerald-50/50">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">วางบิลเรียบร้อยแล้ว (Billed)</p>
              <div className="flex items-baseline justify-between mt-2">
                <div>
                  <span className="text-3xl font-black font-mono text-emerald-700">{billingReport.billedCount}</span>
                  <span className="text-xs text-emerald-700 ml-1.5">งาน</span>
                </div>
                <span className="text-base font-bold font-mono text-emerald-700">
                  {formatTHB(billingReport.billedAmount)}
                </span>
              </div>
              <p className="text-xs text-emerald-700/80 mt-2">
                สถานะในระบบ: &ldquo;วางบิลเรียบร้อยแล้ว&rdquo;
              </p>
            </div>

            <div className="p-5 rounded-lg border border-amber-200 bg-amber-50/50">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">ยังไม่ได้วางบิล (Pending Billing)</p>
              <div className="flex items-baseline justify-between mt-2">
                <div>
                  <span className="text-3xl font-black font-mono text-amber-700">{billingReport.unbilledCount}</span>
                  <span className="text-xs text-amber-700 ml-1.5">งาน</span>
                </div>
                <span className="text-base font-bold font-mono text-amber-700">
                  {formatTHB(billingReport.unbilledAmount)}
                </span>
              </div>
              <p className="text-xs text-amber-700/80 mt-2">
                สถานะในระบบ: &ldquo;ยังไม่ได้วางบิล&rdquo;
              </p>
            </div>
          </div>

          {/* Hospital Billing Breakdown Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                ตารางสรุปสถานะการวางบิลแยกตามโรงพยาบาล
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {billingReport.hospitalBillingList.length} โรงพยาบาล
              </span>
            </div>
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">#</th>
                    <th className="py-2.5 px-4">โรงพยาบาล (Hospital)</th>
                    <th className="py-2.5 px-4 text-right">งานทั้งหมด</th>
                    <th className="py-2.5 px-4 text-right text-emerald-700">วางบิลแล้ว (งาน)</th>
                    <th className="py-2.5 px-4 text-right text-emerald-700">ยอดวางบิลแล้ว</th>
                    <th className="py-2.5 px-4 text-right text-amber-700">ยังไม่วางบิล (งาน)</th>
                    <th className="py-2.5 px-4 text-right text-amber-700">ยอดค้างวางบิล</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {billingReport.hospitalBillingList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        ยังไม่มีรายการที่ระบุสถานะการวางบิลในงวดนี้
                      </td>
                    </tr>
                  ) : (
                    billingReport.hospitalBillingList.map((item, idx) => (
                      <tr key={item.hospital} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{item.hospital}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold">{item.totalCount}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">{item.billedCount}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-emerald-700">{formatTHB(item.billedAmount)}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-600">{item.unbilledCount}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-700">{formatTHB(item.unbilledAmount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          SECTION 4: สรุปงานซ่อม CM ที่เสนอราคา (CM Quotation Summary)
      ===================================================================== */}
      {(activeReportSection === 'all' || activeReportSection === 'quotation') && (
        <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                04. รายงานสรุปงานซ่อม CM ที่มีการเสนอราคา (CM Quotations & Monthly Filter)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                สามารถเลือกกรองใบเสนอราคาเป็นรายเดือน หรือดูภาพรวมทุกเดือน พร้อมสรุปจำนวนงานและยอดรวมเสนอราคาในแต่ละเดือน
              </p>
            </div>

            {/* Dedicated Month & JobType Filter Controls for Quotations */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded-md px-3 py-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-700">เลือกเดือนใบเสนอราคา:</span>
                <select
                  value={selectedQuotationMonth}
                  onChange={(e) => setSelectedQuotationMonth(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-bold text-indigo-900 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">ทุกเดือนทั้งหมด (All Months - {quotations.length} ใบ)</option>
                  <option value="SYNC">ตามงวดเดือนด้านบน ({activeMonthYear})</option>
                  {quotationReport.monthlySummaries.map(m => (
                    <option key={m.monthKey} value={m.monthKey}>
                      {m.monthKey} — {m.labelTh} (CM {m.cmCount} ใบ / รวม {m.totalCount} ใบ)
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Job Type (CM / PM / All) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
                {[
                  { id: 'CM', label: `เฉพาะ CM (${quotationReport.cmQuoteCount})` },
                  { id: 'PM', label: `เฉพาะ PM (${quotationReport.pmQuoteCount})` },
                  { id: 'ALL', label: `ทุกประเภท (${quotationReport.totalAllQuotesCount})` }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedQuotationType(t.id as any)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                      selectedQuotationType === t.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('quotation-dashboard')}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer px-2 py-1"
                >
                  <span>จัดการใบเสนอราคา</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Month Selector Buttons (Shows all months that have quotations + ability to switch with 1 click) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                คลิกเลือกดูสรุปใบเสนอราคาแยกตามเดือน (Monthly Quick Filter)
              </span>
              {selectedQuotationMonth !== 'ALL' && (
                <button
                  onClick={() => setSelectedQuotationMonth('ALL')}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  แสดงทุกเดือนทั้งหมด
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              <button
                onClick={() => setSelectedQuotationMonth('ALL')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  quotationReport.effectiveMonthFilter === 'ALL'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="text-[11px] font-bold uppercase opacity-80">รวมทุกเดือน (All)</div>
                <div className="text-lg font-black font-mono mt-0.5">
                  {quotations.filter(q => (q.jobType || 'CM').toUpperCase().includes('CM')).length} ใบ CM
                </div>
                <div className="text-[11px] font-mono opacity-90 truncate">
                  {formatTHB(
                    quotations
                      .filter(q => (q.jobType || 'CM').toUpperCase().includes('CM'))
                      .reduce((s, q) => s + (q.totalAmount || 0), 0)
                  )}
                </div>
              </button>

              {quotationReport.monthlySummaries
                .filter(m => m.totalCount > 0 || m.monthKey === activeMonthYear || m.monthKey === quotationReport.effectiveMonthFilter)
                .map(m => {
                  const isSelected = quotationReport.effectiveMonthFilter === m.monthKey;
                  return (
                    <button
                      key={m.monthKey}
                      onClick={() => setSelectedQuotationMonth(m.monthKey)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span>{m.labelTh}</span>
                        <span className="font-mono opacity-75">{m.monthKey}</span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-black font-mono">CM: {m.cmCount}</span>
                        {m.pmCount > 0 && (
                          <span className={`text-[11px] font-mono ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                            (PM: {m.pmCount})
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] font-mono font-semibold mt-0.5 truncate ${isSelected ? 'text-white' : 'text-indigo-700'}`}>
                        {formatTHB(m.cmAmount)}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50/50">
              <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
                จำนวนใบเสนอราคาซ่อม CM ({quotationReport.effectiveMonthFilter === 'ALL' ? 'ทุกเดือน' : quotationReport.effectiveMonthFilter})
              </p>
              <p className="text-3xl font-black font-mono text-indigo-700 mt-1">{quotationReport.cmQuoteCount}</p>
              <p className="text-xs text-indigo-600/80 mt-1">
                จากใบเสนอราคาในช่วงที่เลือก {quotationReport.totalAllQuotesCount} ใบ (PM {quotationReport.pmQuoteCount} ใบ)
              </p>
            </div>

            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">ยอดรวมเสนอราคา CM</p>
              <p className="text-2xl font-black font-mono text-emerald-700 mt-1">
                {formatTHB(quotationReport.totalCMQuotedAmount)}
              </p>
              <p className="text-xs text-emerald-700/80 mt-1">
                คาดการณ์ตาม Win Prob: <strong>{formatTHB(quotationReport.weightedCMExpectedAmount)}</strong>
              </p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">งานสถานะ Submit a Price Offer</p>
              <p className="text-3xl font-black font-mono text-slate-800 mt-1">{quotationReport.cmBoardPriceOfferCount}</p>
              <p className="text-xs text-slate-500 mt-1">รายการที่อยู่ในขั้นตอนเสนอราคาใน CM Board</p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">งานซ่อม Paid Repair ที่เปิด Job</p>
              <p className="text-2xl font-black font-mono text-slate-800 mt-1">
                {quotationReport.cmTrackerPaidRepairCount} <span className="text-xs font-normal text-slate-500">งาน</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ยอด Revenue ใน Job: <strong className="font-mono text-slate-700">{formatTHB(quotationReport.cmTrackerPaidRepairRevenue)}</strong>
              </p>
            </div>
          </div>

          {/* CM Quotations Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                รายการใบเสนอราคา ({selectedQuotationType === 'ALL' ? 'ทุกประเภท CM & PM' : `เฉพาะงาน ${selectedQuotationType}`}) —{' '}
                <span className="text-indigo-700">
                  {quotationReport.effectiveMonthFilter === 'ALL' ? 'แสดงทุกเดือน' : `งวดเดือน ${quotationReport.effectiveMonthFilter}`}
                </span>
              </h3>
              <span className="text-xs font-mono text-slate-600 font-bold">
                แสดง {quotationReport.cmQuotationsList.length} รายการ · ยอดรวม{' '}
                {formatTHB(quotationReport.cmQuotationsList.reduce((s, q) => s + (q.totalAmount || 0), 0))}
              </span>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">เดือน</th>
                    <th className="py-2.5 px-4">วันที่ใบเสนอราคา</th>
                    <th className="py-2.5 px-4">เลขที่ใบเสนอราคา</th>
                    <th className="py-2.5 px-4">ประเภท</th>
                    <th className="py-2.5 px-4">โรงพยาบาล / ลูกค้า</th>
                    <th className="py-2.5 px-4">รายละเอียดงานซ่อม</th>
                    <th className="py-2.5 px-4 text-right">โอกาสได้งาน (Win Rate)</th>
                    <th className="py-2.5 px-4 text-right">ยอดเสนอราคา (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotationReport.cmQuotationsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        ไม่พบรายการใบเสนอราคาในเดือนที่เลือก ({quotationReport.effectiveMonthFilter}) — สามารถกดปุ่ม &ldquo;รวมทุกเดือน (All)&rdquo; ด้านบนเพื่อดูรายการทั้งหมดได้
                      </td>
                    </tr>
                  ) : (
                    quotationReport.cmQuotationsList.map((q: any, idx: number) => (
                      <tr key={q.id || idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                          {q.monthLabelTh || q.monthKey}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">{q.date || '-'}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">{q.quotationNumber || '-'}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{q.normalizedJobType || q.jobType}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{q.customerName || '-'}</td>
                        <td className="py-2.5 px-4 text-slate-600 max-w-md truncate" title={q.jobName || q.description}>
                          {q.jobName || q.description || '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-700">{q.winRate || 0}%</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatTHB(q.totalAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          SECTION 5: ตารางสรุปการทำงานของช่างแต่ละคนแยกตามประเภทงาน (CM / PM Matrix)
      ===================================================================== */}
      {(activeReportSection === 'all' || activeReportSection === 'engineer') && (
        <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                05. ตารางสรุปผลการปฏิบัติงานของช่างแต่ละคน แยกตามประเภทงาน (Engineer CM & PM Matrix)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                เปรียบเทียบปริมาณงานทั้งหมด งาน PM (เสร็จ/ทั้งหมด) งานซ่อม CM (เสร็จ/ทั้งหมด) งานค้างในบอร์ด อัตราเข้างานไวภายในวันเดียว และยอดรายได้
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              แสดงข้อมูลช่าง {engineerPerformanceMatrix.length} ท่าน
            </span>
          </div>

          {/* Stacked Bar Chart comparing PM vs CM per Engineer */}
          {engineerPerformanceMatrix.length > 0 && (
            <div className="h-72 w-full bg-slate-50/50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                กราฟสัดส่วนงาน PM และงานซ่อม CM ของช่างแต่ละคน
              </h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={engineerPerformanceMatrix} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="pmDone" stackId="pm" name="PM เสร็จแล้ว" fill="#2563eb" />
                  <Bar dataKey="cmDone" stackId="cm" name="CM เสร็จแล้ว" fill="#f97316" />
                  <Bar dataKey="inProgressTotal" stackId="active" name="กำลังดำเนินการ (In Progress)" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Full Engineer Matrix Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">ชื่อช่าง (Engineer)</th>
                    <th className="py-3 px-3 text-right">งานรวม</th>
                    <th className="py-3 px-3 text-right bg-blue-50/60 text-blue-800">PM (เสร็จ/รวม)</th>
                    <th className="py-3 px-3 text-right bg-blue-50/60 text-blue-800">% PM</th>
                    <th className="py-3 px-3 text-right bg-orange-50/60 text-orange-800">CM (เสร็จ/รวม)</th>
                    <th className="py-3 px-3 text-right bg-orange-50/60 text-orange-800">ค้างใน CM Board</th>
                    <th className="py-3 px-3 text-right">เสร็จรวม (Done)</th>
                    <th className="py-3 px-3 text-right">% สำเร็จรวม</th>
                    <th className="py-3 px-3 text-right">Same-Day SLA</th>
                    <th className="py-3 px-3 text-right">วางบิล (แล้ว/ค้าง)</th>
                    <th className="py-3 px-3 text-right">ยอดรายได้ (Revenue)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {engineerPerformanceMatrix.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400">
                        ไม่พบข้อมูลการทำงานของช่างในงวดที่เลือก
                      </td>
                    </tr>
                  ) : (
                    engineerPerformanceMatrix.map((eng, idx) => (
                      <tr key={eng.name} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">{eng.name}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">{eng.totalJobs}</td>
                        <td className="py-2.5 px-3 text-right font-mono bg-blue-50/30">
                          <strong className="text-blue-700">{eng.pmDone}</strong> / {eng.pmTotal}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700 bg-blue-50/30">
                          {eng.pmCompletionRate}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono bg-orange-50/30">
                          <strong className="text-orange-700">{eng.cmDone}</strong> / {eng.cmTotal}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 bg-orange-50/30">
                          {eng.activeCMBoardTickets}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">{eng.doneTotal}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">{eng.completionRate}%</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {eng.responseTrackedJobs > 0 ? `${eng.sameDayPercent}%` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          <span className="text-emerald-700 font-bold">{eng.billedCount}</span>
                          <span className="text-slate-400"> / </span>
                          <span className="text-amber-600 font-bold">{eng.unbilledCount}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatTHB(eng.revenueGenerated)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          SECTION 6: ข้อเสนอแนะและรายงานวิเคราะห์เชิงลึกเพิ่มเติม (Value-Added Insights)
      ===================================================================== */}
      {activeReportSection === 'all' && (
        <section className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              06. รายงานวิเคราะห์เชิงลึกและข้อเสนอแนะเพิ่มเติมสำหรับผู้บริหาร (Executive Operational Insights)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              วิเคราะห์สิทธิ์การรับประกันของงานซ่อม CM, การแจ้งเตือนเครื่องที่เสียซ้ำ (Repeat Repair Alert) และการใช้อะไหล่
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Insight 1: CM Warranty Breakdown */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. สัดส่วนงานซ่อม CM แยกตามสิทธิ์ประกัน (Warranty Type)
              </h3>
              <div className="space-y-2">
                {additionalInsights.warrantyBreakdown.map(w => (
                  <div key={w.name} className="flex items-center justify-between p-2.5 bg-white rounded border border-slate-200 text-xs">
                    <span className="font-medium text-slate-700">{w.name}</span>
                    <span className="font-mono font-bold text-slate-900">{w.count} งาน</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                งานซ่อมใช้อะไหล่ทั้งหมดในงวดนี้: <strong className="font-mono text-slate-800">{additionalInsights.jobsWithPartsCount}</strong> งาน
              </p>
            </div>

            {/* Insight 2: Repeat Breakdown S/N Alert */}
            <div className="lg:col-span-2 p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. เครื่องที่มีการแจ้งซ่อมซ้ำในงวด (Repeat CM Repair Alert by Serial Number)
                </h3>
                <span className="text-xs font-mono text-rose-600 font-bold">
                  พบ {additionalInsights.repeatRepairs.length} เครื่องที่เปิดซ่อมมากกว่า 1 ครั้ง
                </span>
              </div>

              {additionalInsights.repeatRepairs.length === 0 ? (
                <div className="p-6 bg-white rounded border border-slate-200 text-center text-xs text-emerald-700 font-medium">
                  ไม่พบเครื่องที่มีการแจ้งซ่อมซ้ำ (Serial Number เดียวกัน) ในงวดนี้ — อัตราการซ่อมจบในครั้งเดียว (First-Time Fix Rate) อยู่ในเกณฑ์ดีเยี่ยม
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded border border-slate-200 max-h-48">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Serial Number</th>
                        <th className="py-2 px-3">รุ่นเครื่อง (Model)</th>
                        <th className="py-2 px-3">โรงพยาบาล</th>
                        <th className="py-2 px-3 text-right">จำนวนครั้งที่ซ่อม</th>
                        <th className="py-2 px-3">อาการเสียที่พบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {additionalInsights.repeatRepairs.map(item => (
                        <tr key={item.sn} className="hover:bg-rose-50/40">
                          <td className="py-2 px-3 font-mono font-bold text-rose-700">{item.sn}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{item.model}</td>
                          <td className="py-2 px-3 text-slate-700">{item.hospital}</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-rose-600">{item.count} ครั้ง</td>
                          <td className="py-2 px-3 text-slate-500 max-w-xs truncate" title={item.problems.join(' | ')}>
                            {item.problems.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
