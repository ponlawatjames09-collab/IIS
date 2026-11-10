import React, { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Search, 
  Layers, 
  Building2, 
  Activity, 
  ChevronRight, 
  RefreshCw, 
  ShieldCheck, 
  Wrench, 
  Maximize2, 
  Filter, 
  Compass,
  ArrowRight,
  Sparkles,
  Calendar,
  X
} from 'lucide-react';
import { SystemSettings, PMScheduleItem, ServiceJob } from '../types';
import { fetchPMScheduleRecords } from '../sheetsService';
import { 
  THAILAND_REGIONS, 
  THAILAND_HOSPITALS_DATABASE, 
  resolveHospitalLocation, 
  HospitalLocation, 
  RegionInfo 
} from '../data/thailandHospitalData';

interface ThailandHospitalMapViewProps {
  settings: SystemSettings;
  accessToken: string | null;
  jobs?: ServiceJob[];
  onOpenNewJob?: (hospitalName: string, equipment?: string, sn?: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

interface HospitalWithEquipment {
  id: string;
  name: string;
  province: string;
  region: 'Central' | 'North' | 'Northeastern' | 'Eastern' | 'Western' | 'South';
  lat: number;
  lng: number;
  type?: string;
  equipments: Array<{
    sn: string;
    model: string;
    category: 'C-Arm' | 'Ultrasound' | 'Other';
    warrantyType?: string;
    warrantyExpiry?: string;
    iteration?: string;
    pmTimesTotal?: string;
    sheetName?: string;
    source: 'PM' | 'Job' | 'Database';
  }>;
}

export default function ThailandHospitalMapView({
  settings,
  accessToken,
  jobs = [],
  onOpenNewJob,
  onNavigateToTab
}: ThailandHospitalMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [hospitalId: string]: L.Marker }>({});

  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pmRecords, setPmRecords] = useState<PMScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeHospital, setActiveHospital] = useState<HospitalWithEquipment | null>(null);

  // Load PM Schedule records from Google Sheets
  const loadPMData = async () => {
    const targetSpreadsheetId = settings.pmSpreadsheetId || settings.spreadsheetId;
    if (!targetSpreadsheetId || !accessToken) return;

    setIsLoading(true);
    try {
      const records = await fetchPMScheduleRecords(targetSpreadsheetId, accessToken);
      setPmRecords(records);
    } catch (err) {
      console.warn("Could not fetch PM schedule for map:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPMData();
  }, [settings.pmSpreadsheetId, settings.spreadsheetId, accessToken]);

  // Normalize hospital name to group variations (e.g. trailing contract codes in parentheses)
  const normalizeHospitalKey = (raw: string): string => {
    if (!raw) return '';
    return raw
      .replace(/\s*\([\d\s\-#_a-zA-Z./]{4,}\)\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };

  // Aggregate hospitals and their installed equipments from PM records + Jobs + Database
  const hospitalsMap = useMemo(() => {
    const map = new Map<string, HospitalWithEquipment>();

    // 1. Process PM Schedule Records
    pmRecords.forEach(record => {
      if (!record.hospitalName) return;
      const cleanName = record.hospitalName.trim();
      const loc = resolveHospitalLocation(cleanName, record.region);
      
      const key = normalizeHospitalKey(loc.name);
      if (!map.has(key)) {
        map.set(key, {
          id: loc.id,
          name: loc.name,
          province: loc.province,
          region: loc.region,
          lat: loc.lat,
          lng: loc.lng,
          type: loc.type,
          equipments: []
        });
      }

      const hosp = map.get(key)!;
      // Check if equipment already listed by S/N
      const alreadyHasSN = record.sn && hosp.equipments.some(e => e.sn && e.sn === record.sn);
      if (!alreadyHasSN) {
        hosp.equipments.push({
          sn: record.sn || 'N/A',
          model: record.model || 'Unknown Model',
          category: (record.equipmentCategory as any) || 'Other',
          warrantyType: record.warrantyType,
          warrantyExpiry: record.warrantyExpiry,
          iteration: record.iteration,
          pmTimesTotal: record.pmTimesTotal,
          sheetName: record.sheetName,
          source: 'PM'
        });
      }
    });

    // 2. Process Service Jobs from Tracker (add any additional machines)
    jobs.forEach(job => {
      if (!job.hospitalName) return;
      const cleanName = job.hospitalName.trim();
      const loc = resolveHospitalLocation(cleanName);
      const key = normalizeHospitalKey(loc.name);

      if (!map.has(key)) {
        map.set(key, {
          id: loc.id,
          name: loc.name,
          province: loc.province,
          region: loc.region,
          lat: loc.lat,
          lng: loc.lng,
          type: loc.type,
          equipments: []
        });
      }

      const hosp = map.get(key)!;
      if (job.serialNumber && !hosp.equipments.some(e => e.sn === job.serialNumber)) {
        let cat: 'C-Arm' | 'Ultrasound' | 'Other' = 'Other';
        const modelStr = (job.equipmentName || '').toLowerCase();
        if (modelStr.includes('c-arm') || modelStr.includes('bv') || modelStr.includes('zenition') || modelStr.includes('veradius')) {
          cat = 'C-Arm';
        } else if (modelStr.includes('us') || modelStr.includes('affiniti') || modelStr.includes('epiq') || modelStr.includes('clearvue') || modelStr.includes('cx50')) {
          cat = 'Ultrasound';
        }

        hosp.equipments.push({
          sn: job.serialNumber,
          model: job.equipmentName || 'Equipment',
          category: cat,
          warrantyType: job.warrantyStatus,
          source: 'Job'
        });
      }
    });

    // 3. Fallback / Baseline: If no records yet loaded, seed from database
    if (map.size === 0) {
      THAILAND_HOSPITALS_DATABASE.slice(0, 24).forEach(h => {
        const key = normalizeHospitalKey(h.name);
        map.set(key, {
          id: h.id,
          name: h.name,
          province: h.province,
          region: h.region,
          lat: h.lat,
          lng: h.lng,
          type: h.type,
          equipments: [
            {
              sn: `SN-${Math.floor(10000 + Math.random() * 90000)}`,
              model: h.region === 'North' ? 'Zenition 70' : h.region === 'South' ? 'Affiniti 70' : 'BV Endura-9"',
              category: h.region === 'South' ? 'Ultrasound' : 'C-Arm',
              warrantyType: 'Under Warranty',
              source: 'Database'
            }
          ]
        });
      });
    }

    // Ensure every hospital in result has a strictly unique id
    const usedIds = new Set<string>();
    const result: HospitalWithEquipment[] = [];
    
    map.forEach(hosp => {
      let uniqueId = hosp.id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${hosp.id}-${counter++}`;
      }
      usedIds.add(uniqueId);
      hosp.id = uniqueId;
      result.push(hosp);
    });

    return result;
  }, [pmRecords, jobs]);

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    return hospitalsMap.filter(h => {
      // Region filter
      if (selectedRegion !== 'All' && h.region !== selectedRegion) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All') {
        const hasCategory = h.equipments.some(e => e.category === selectedCategory);
        if (!hasCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = h.name.toLowerCase().includes(q);
        const matchesProv = h.province.toLowerCase().includes(q);
        const matchesEquip = h.equipments.some(e => 
          e.model.toLowerCase().includes(q) || 
          e.sn.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesProv && !matchesEquip) return false;
      }

      return true;
    });
  }, [hospitalsMap, selectedRegion, selectedCategory, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    let totalMachines = 0;
    let cArmCount = 0;
    let usCount = 0;
    const regionMachineCounts: Record<string, number> = {
      Central: 0,
      North: 0,
      Northeastern: 0,
      Eastern: 0,
      Western: 0,
      South: 0
    };

    hospitalsMap.forEach(h => {
      h.equipments.forEach(e => {
        totalMachines++;
        if (e.category === 'C-Arm') cArmCount++;
        else if (e.category === 'Ultrasound') usCount++;
        if (regionMachineCounts[h.region] !== undefined) {
          regionMachineCounts[h.region]++;
        }
      });
    });

    return {
      totalHospitals: hospitalsMap.length,
      totalMachines,
      cArmCount,
      usCount,
      filteredHospitalsCount: filteredHospitals.length,
      regionMachineCounts
    };
  }, [hospitalsMap, filteredHospitals]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [13.2, 101.0],
        zoom: 6,
        zoomControl: false,
        attributionControl: false
      });

      // Add clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Add Zoom Control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers on Map when filteredHospitals changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    (Object.values(markersRef.current) as L.Marker[]).forEach(marker => marker.remove());
    markersRef.current = {};

    filteredHospitals.forEach(hosp => {
      const regionInfo = THAILAND_REGIONS[hosp.region] || THAILAND_REGIONS.Central;
      const count = hosp.equipments.length;

      // Custom HTML Pin with count badge
      const pinColor = regionInfo.color;
      const customIcon = L.divIcon({
        className: 'custom-hospital-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;" class="marker-hover-fx">
            <div style="background-color: ${pinColor}; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
              <span style="transform: rotate(45deg); color: white; font-weight: 800; font-size: 11px; font-family: monospace;">${count}</span>
            </div>
            <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 8px; height: 3px; background: rgba(0,0,0,0.25); border-radius: 50%; filter: blur(1px);"></div>
          </div>
        `,
        iconSize: [34, 40],
        iconAnchor: [17, 38],
        popupAnchor: [0, -36]
      });

      const marker = L.marker([hosp.lat, hosp.lng], { icon: customIcon }).addTo(map);

      // Create popup content
      const equipmentsListHtml = hosp.equipments.slice(0, 5).map(eq => `
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding: 4px 0; border-bottom: 1px dashed #e2e8f0;">
          <div>
            <strong style="color: #1e293b;">${eq.model}</strong>
            <div style="color: #64748b; font-size: 9px; font-family: monospace;">S/N: ${eq.sn}</div>
          </div>
          <span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${eq.category === 'C-Arm' ? '#eff6ff' : '#f0fdf4'}; color: ${eq.category === 'C-Arm' ? '#1d4ed8' : '#15803d'};">
            ${eq.category}
          </span>
        </div>
      `).join('');

      const popupContent = `
        <div style="min-width: 230px; max-width: 290px; font-family: system-ui, sans-serif; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${pinColor}15; color: ${pinColor}; border: 1px solid ${pinColor}40;">
              ${regionInfo.nameTh}
            </span>
            <span style="font-size: 10px; color: #64748b;">${hosp.province}</span>
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.3;">
            ${hosp.name}
          </h4>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #475569; margin-bottom: 4px; display: flex; justify-content: space-between;">
              <span>เครื่องที่ติดตั้ง (${count} เครื่อง)</span>
            </div>
            ${equipmentsListHtml}
            ${hosp.equipments.length > 5 ? `<div style="font-size: 9px; color: #64748b; text-align: center; margin-top: 4px;">+ อีก ${hosp.equipments.length - 5} เครื่อง</div>` : ''}
          </div>
          <button id="btn-popup-job-${hosp.id}" style="width: 100%; padding: 6px 10px; background: #2563eb; color: white; border: none; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
            + สร้าง Job ตรวจเช็ค / ซ่อม
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });

      marker.on('popupopen', () => {
        setActiveHospital(hosp);
        const btn = document.getElementById(`btn-popup-job-${hosp.id}`);
        if (btn && onOpenNewJob) {
          btn.onclick = () => {
            const firstEquip = hosp.equipments[0];
            onOpenNewJob(hosp.name, firstEquip?.model, firstEquip?.sn);
          };
        }
      });

      marker.on('click', () => {
        setActiveHospital(hosp);
      });

      markersRef.current[hosp.id] = marker;
    });

    // If specific region is selected, fly to that region
    if (selectedRegion !== 'All' && THAILAND_REGIONS[selectedRegion]) {
      const reg = THAILAND_REGIONS[selectedRegion];
      map.flyTo(reg.center, reg.zoom, { duration: 1.2 });
    }
  }, [filteredHospitals, selectedRegion, onOpenNewJob]);

  // Click hospital item in sidebar -> fly to marker and open popup
  const handleSelectHospital = (hosp: HospitalWithEquipment) => {
    setActiveHospital(hosp);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([hosp.lat, hosp.lng], 13, { duration: 1.2 });
      const marker = markersRef.current[hosp.id];
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 1200);
      }
    }
  };

  // Reset to full Thailand view
  const handleResetView = () => {
    setSelectedRegion('All');
    setSelectedCategory('All');
    setSearchQuery('');
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([13.2, 101.0], 6, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span>Thailand Hospital Equipment Map</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              PM Regional Database
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            แผนที่ระบุพิกัดโรงพยาบาลและตำแหน่งเครื่องมือแพทย์ (C-Arm, Ultrasound) แยกตามภาคที่กำหนดในระบบ PM
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadPMData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold cursor-pointer shadow-3xs transition-colors"
            title="Reload PM Sheets data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isLoading ? 'กำลังโหลด...' : 'ซิงค์ข้อมูล PM'}</span>
          </button>

          <button
            onClick={handleResetView}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
            <span>ภาพรวมทั้งประเทศ</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded p-3 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">โรงพยาบาลที่มีเครื่อง</p>
            <p className="text-xl font-bold font-mono text-slate-800 mt-0.5">{stats.totalHospitals}</p>
            <span className="text-[10px] text-slate-400">แสดงผลอยู่ {stats.filteredHospitalsCount} แห่ง</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-3 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">เครื่องมือแพทย์ทั้งหมด</p>
            <p className="text-xl font-bold font-mono text-slate-800 mt-0.5">{stats.totalMachines}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">ติดตั้งและพร้อมบริการ</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-3 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">เครื่อง C-Arm</p>
            <p className="text-xl font-bold font-mono text-blue-700 mt-0.5">{stats.cArmCount}</p>
            <span className="text-[10px] text-slate-400">BV, Zenition, Veradius</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-3 shadow-3xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">เครื่อง Ultrasound</p>
            <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{stats.usCount}</p>
            <span className="text-[10px] text-slate-400">Affiniti, EPIQ, ClearVue</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* REGIONAL FILTER TABS (Defined by PM) */}
      <div className="bg-white border border-slate-200 rounded p-3 shadow-3xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>เลือกดูตามภาคที่กำหนดใน PM (Regional View):</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            คลิกที่ภาคเพื่อขยายพิกัดและกรองโรงพยาบาล
          </span>
        </div>

        {/* Region Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <button
            onClick={() => setSelectedRegion('All')}
            className={`px-3 py-2 rounded text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center text-center border ${
              selectedRegion === 'All'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span>ทุกภาค</span>
            <span className="text-[10px] font-mono opacity-80 mt-0.5">{stats.totalMachines} เครื่อง</span>
          </button>

          {Object.entries(THAILAND_REGIONS).map(([key, reg]) => {
            const isSelected = selectedRegion === key;
            const count = stats.regionMachineCounts[key] || 0;
            return (
              <button
                key={key}
                onClick={() => setSelectedRegion(key)}
                className={`px-2.5 py-2 rounded text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center text-center border ${
                  isSelected
                    ? 'text-white shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                style={{
                  backgroundColor: isSelected ? reg.color : undefined,
                  borderColor: isSelected ? reg.borderCol : undefined
                }}
              >
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: isSelected ? 'white' : reg.color }}
                  />
                  <span className="truncate">{reg.nameTh.split(' ')[0]}</span>
                </div>
                <span className="text-[10px] font-mono opacity-85 mt-0.5">
                  {count} เครื่อง
                </span>
              </button>
            );
          })}
        </div>

        {/* SEARCH & EQUIPMENT CATEGORY ROW */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-slate-100">
          {/* Search Box */}
          <div className="flex-1 w-full relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโรงพยาบาล, จังหวัด, รุ่นเครื่อง หรือ S/N..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">ประเภท:</span>
            <div className="flex gap-1">
              {[
                { id: 'All', label: 'ทั้งหมด' },
                { id: 'C-Arm', label: 'C-Arm' },
                { id: 'Ultrasound', label: 'Ultrasound' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN MAP & EXPLORER CONTAINER */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col lg:flex-row h-[620px] relative">
        {/* LEAFLET MAP VIEW */}
        <div className="flex-1 h-full relative">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Floating Legend */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 p-2.5 rounded shadow-md text-xs space-y-1.5 max-w-xs pointer-events-auto">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span>สัญลักษณ์สีแยกตามภาค</span>
              <span className="font-mono text-slate-400">PM Spec</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {Object.entries(THAILAND_REGIONS).map(([key, reg]) => (
                <div key={key} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: reg.color }} />
                  <span className="truncate">{reg.nameTh.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Toggle Sidebar Button for small screens */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 left-4 z-10 bg-white border border-slate-300 px-2.5 py-1.5 rounded shadow-sm text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{isSidebarOpen ? 'ซ่อนรายชื่อ รพ.' : 'แสดงรายชื่อ รพ. (' + filteredHospitals.length + ')'}</span>
          </button>
        </div>

        {/* SIDE EXPLORER (HOSPITAL LIST & DETAILS) */}
        {isSidebarOpen && (
          <div className="w-full lg:w-80 h-64 lg:h-full border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 flex flex-col shrink-0 z-10">
            {/* Explorer Header */}
            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>รายชื่อโรงพยาบาล</span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  พบ {filteredHospitals.length} แห่ง ({filteredHospitals.reduce((acc, h) => acc + h.equipments.length, 0)} เครื่อง)
                </p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-400 hover:text-slate-600 lg:hidden cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hospital List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
              {filteredHospitals.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  ไม่พบโรงพยาบาลที่ตรงกับเงื่อนไขการค้นหา
                </div>
              ) : (
                filteredHospitals.map((hosp, index) => {
                  const regInfo = THAILAND_REGIONS[hosp.region] || THAILAND_REGIONS.Central;
                  const isActive = activeHospital?.id === hosp.id;
                  const cArmMachines = hosp.equipments.filter(e => e.category === 'C-Arm').length;
                  const usMachines = hosp.equipments.filter(e => e.category === 'Ultrasound').length;

                  return (
                    <div
                      key={`${hosp.id}-${index}`}
                      onClick={() => handleSelectHospital(hosp)}
                      className={`p-3 transition-colors cursor-pointer hover:bg-blue-50/60 ${
                        isActive ? 'bg-blue-50 border-l-4 border-blue-600' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: regInfo.color }}
                            />
                            <span className="text-[10px] font-bold text-slate-500 truncate">
                              {regInfo.nameTh.split(' ')[0]} • {hosp.province}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 truncate" title={hosp.name}>
                            {hosp.name}
                          </h4>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {hosp.equipments.length} เครื่อง
                        </span>
                      </div>

                      {/* Machine Tags */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {cArmMachines > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            C-Arm ({cArmMachines})
                          </span>
                        )}
                        {usMachines > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            US ({usMachines})
                          </span>
                        )}
                        {hosp.equipments.some(e => e.category === 'Other') && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Other
                          </span>
                        )}
                      </div>

                      {/* Expanded View for Active Hospital */}
                      {isActive && (
                        <div className="mt-2.5 pt-2 border-t border-blue-100 space-y-1.5">
                          <div className="text-[10px] font-bold text-slate-700">รายการเครื่องที่ติดตั้ง:</div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {hosp.equipments.map((eq, i) => (
                              <div key={`${eq.sn || 'eq'}-${i}`} className="text-[10px] bg-white p-1.5 rounded border border-slate-200 flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-slate-800">{eq.model}</div>
                                  <div className="text-[9px] font-mono text-slate-500">S/N: {eq.sn}</div>
                                </div>
                                <span className="text-[9px] font-bold text-blue-600 font-mono">
                                  {eq.warrantyType || 'Regular'}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-1.5 pt-1">
                            {onOpenNewJob && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const eq = hosp.equipments[0];
                                  onOpenNewJob(hosp.name, eq?.model, eq?.sn);
                                }}
                                className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                              >
                                <Wrench className="w-3 h-3" />
                                <span>สร้าง Job</span>
                              </button>
                            )}

                            {onNavigateToTab && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToTab('pm-schedule');
                                }}
                                className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer transition-colors"
                                title="View PM Schedule"
                              >
                                <Calendar className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
