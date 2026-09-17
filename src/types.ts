export interface ServiceJob {
  jobNumber: string; // Column A: unique within month (e.g. 010126)
  callDate: string; // Column B: YYYY-MM-DD
  jobStatus: '-- Select --' | 'Done' | 'Inprogress' | 'Sale Support' | 'Cancelled' | 'Pending'; // Column C
  pmCycle: string; // Column D: e.g. 01/2026 (PM only)
  jobType: '-- Select --' | 'PM' | 'CM' | 'IB' | 'FCO' | 'Ortho'; // Column E
  pmTimesTotal?: string; // Column: Times/Total PM
  hospitalName: string; // Column F
  department: string; // Column G
  equipmentName: string; // Column H (Zenition 70, Zenition 50, EPIQ ELITE, Affiniti 50, etc.)
  serialNumber: string; // Column I
  equipmentType: string; // Column J
  problemDescription: string; // Column K
  safetyQ1: 'No' | 'Yes' | 'N/A'; // Column L
  safetyQ2: 'No' | 'Yes' | 'N/A'; // Column M
  customerName: string; // Column N
  customerPhone: string; // Column O
  buildingFloor: string; // Column P
  engineerName: string; // Column Q
  engineer2?: string;
  engineer3?: string;
  engineer4?: string;
  serviceDate: string; // Column R: defaults to Call Date
  warrantyStatus: 'Guarantee' | 'Contract' | 'SaleSupport' | 'Paid Repair' | '-- Select --'; // Column S
  remark: string; // Column T
  documentStatus: string; // Column U: Job, PATool, etc.
  revenue: number; // Column V: Revenue
  cost: number; // Column W: Cost
  product: string; // Column X: Product
  isRepair?: boolean;
  isComplain?: boolean;
  spareParts?: string;
  sparePartSerial?: string;
  sparePartDescription?: string;
  sparePartRemark?: string;
  spareParts2?: string;
  sparePartSerial2?: string;
  sparePartDescription2?: string;
  sparePartRemark2?: string;
  spareParts3?: string;
  sparePartSerial3?: string;
  sparePartDescription3?: string;
  sparePartRemark3?: string;
  billingStatus?: string;
}

export interface LineConfig {
  channelAccessToken: string;
  userId: string;
  notifyToken: string;
  isEnabled: boolean;
}

export interface SystemSettings {
  spreadsheetId: string | null;
  pmSpreadsheetId?: string | null;
  cmOnCallSpreadsheetId?: string | null;
  lineConfig: LineConfig;
  engineers: string[];
  engineerEmails?: Record<string, string>;
  hospitals: string[];
  equipments: string[];
  products: string[];
  pmAssignments?: Record<string, string>;
}

export interface CMStatusRecord {
  hospital: string;
  namecontract: string;
  phonecontract: string;
  equipment: string;
  problem: string;
  image: string; // url
  status?: string;
  warranty?: string;
  reportDate?: string;
  engineer?: string;
  serialNumber?: string;
  ibDate?: string;
  expiryDate?: string;
  rowIndex?: number;
}

export interface PMScheduleItem {
  sheetName: string;
  hospitalName: string;
  sn: string;
  model: string;
  iteration: string;
  pmTimesTotal?: string; // The text found in the month cell, e.g. "1", "2", "IB"
  warrantyType: string;
  paymentCondition: string; // Remark column
  warrantyPeriod?: string;
  warrantyExpiry?: string;
  month: string; // e.g. "Jan", "Feb"
  year: string; // e.g. "2026"
  equipmentCategory?: "C-Arm" | "Ultrasound" | "Other";
  region?: string;
}


export interface DispatchRecord {
  id: string;
  date: string;
  engineer: string;
  taskTitle: string;
  location: string;
  remark: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  rowIndex?: number;
}
