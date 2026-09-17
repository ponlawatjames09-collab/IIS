import { ServiceJob } from './types';

const HEADERS = [
  "Job Number", "Call Date", "Job Status", "PM Cycle", "Job Type", 
  "Hospital Name", "Department", "Equipment Name", "Serial Number", "Equipment Type", 
  "Problem Description", "Safety Q1", "Safety Q2", "Customer Name", "Customer Phone", 
  "Building Floor", "Engineer Name", "Service Date", "Warranty Status", "Remark", 
  "Document Status", "Revenue", "Cost", "Product", "Is Repair", "Is Complain", "Spare Parts", "Spare Part Serial/12NC", "Spare Part Description", "Spare Part Remark", "Billing Status", "Engineer 2", "Engineer 3", "Engineer 4", "Spare Parts 2", "Spare Part 2 Serial/12NC", "Spare Part 2 Description", "Spare Part 2 Remark", "Spare Parts 3", "Spare Part 3 Serial/12NC", "Spare Part 3 Description", "Spare Part 3 Remark"
];

export const MONTHS = [
  "JAN2026", "FEB2026", "MAR2026", "APR2026", "MAY2026", "JUN2026",
  "JUL2026", "AUG2026", "SEP2026", "OCT2026", "NOV2026", "DEC2026"
];

export const mapRowToJob = (row: any[]): ServiceJob => {
  const rawJobType = row[4] ? String(row[4]) : '-- Select --';
  let jobType = rawJobType;
  let pmTimesTotal = '';

  if (rawJobType.startsWith('PM ')) {
    jobType = 'PM';
    pmTimesTotal = rawJobType.substring(3).trim();
  }

  return {
    jobNumber: row[0] ? String(row[0]) : '',
    callDate: row[1] ? String(row[1]) : '',
    jobStatus: (row[2] || '-- Select --') as any,
    pmCycle: row[3] ? String(row[3]) : '',
    jobType: jobType as any,
    pmTimesTotal: pmTimesTotal,
    hospitalName: row[5] ? String(row[5]) : '',
    department: row[6] ? String(row[6]) : '',
    equipmentName: row[7] ? String(row[7]) : '',
    serialNumber: row[8] ? String(row[8]) : '',
    equipmentType: row[9] ? String(row[9]) : '',
    problemDescription: row[10] ? String(row[10]) : '',
    safetyQ1: (row[11] || 'N/A') as any,
    safetyQ2: (row[12] || 'N/A') as any,
    customerName: row[13] ? String(row[13]) : '',
    customerPhone: row[14] ? String(row[14]) : '',
    buildingFloor: row[15] ? String(row[15]) : '',
    engineerName: row[16] ? String(row[16]) : '',
    serviceDate: row[17] ? String(row[17]) : '',
    warrantyStatus: (row[18] || 'Guarantee') as any,
    remark: row[19] ? String(row[19]) : '',
    documentStatus: row[20] ? String(row[20]) : '',
    revenue: row[21] ? Number(row[21]) || 0 : 0,
    cost: row[22] ? Number(row[22]) || 0 : 0,
    product: row[23] ? String(row[23]) : '',
    isRepair: String(row[24]).toUpperCase() === 'TRUE',
    isComplain: String(row[25]).toUpperCase() === 'TRUE',
    spareParts: row[26] ? String(row[26]) : '',
    sparePartSerial: row[27] ? String(row[27]) : '',
    sparePartDescription: row[28] ? String(row[28]) : '',
    sparePartRemark: row[29] ? String(row[29]) : '',
    billingStatus: row[30] ? String(row[30]) : '',
    engineer2: row[31] ? String(row[31]) : '',
    engineer3: row[32] ? String(row[32]) : '',
    engineer4: row[33] ? String(row[33]) : '',
    spareParts2: row[34] ? String(row[34]) : '',
    sparePartSerial2: row[35] ? String(row[35]) : '',
    sparePartDescription2: row[36] ? String(row[36]) : '',
    sparePartRemark2: row[37] ? String(row[37]) : '',
    spareParts3: row[38] ? String(row[38]) : '',
    sparePartSerial3: row[39] ? String(row[39]) : '',
    sparePartDescription3: row[40] ? String(row[40]) : '',
    sparePartRemark3: row[41] ? String(row[41]) : '',
  };
};

export const mapJobToRow = (job: ServiceJob): any[] => {
  const jobTypeStr = (job.jobType === 'PM' && job.pmTimesTotal) 
    ? `PM ${job.pmTimesTotal}` 
    : job.jobType;

  return [
    job.jobNumber,
    job.callDate,
    job.jobStatus,
    job.pmCycle,
    jobTypeStr,
    job.hospitalName,
    job.department,
    job.equipmentName,
    job.serialNumber,
    job.equipmentType,
    job.problemDescription,
    job.safetyQ1,
    job.safetyQ2,
    job.customerName,
    job.customerPhone,
    job.buildingFloor,
    job.engineerName,
    job.serviceDate,
    job.warrantyStatus,
    job.remark,
    job.documentStatus,
    job.revenue,
    job.cost,
    job.product,
    job.isRepair ? 'TRUE' : 'FALSE',
    job.isComplain ? 'TRUE' : 'FALSE',
    job.spareParts,
    job.sparePartSerial,
    job.sparePartDescription,
    job.sparePartRemark,
    job.billingStatus || '',
    job.engineer2 || '',
    job.engineer3 || '',
    job.engineer4 || '',
    job.spareParts2 || '',
    job.sparePartSerial2 || '',
    job.sparePartDescription2 || '',
    job.sparePartRemark2 || '',
    job.spareParts3 || '',
    job.sparePartSerial3 || '',
    job.sparePartDescription3 || '',
    job.sparePartRemark3 || ''
  ];
};

/**
 * Creates a brand new Spreadsheet in the user's Google Drive with monthly tabs and standard headers.
 */
export const createSpreadsheet = async (accessToken: string): Promise<string> => {
  try {
    // 1. Create spreadsheet with 12 sheets
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: "Service Job Hub - 2026"
        },
        sheets: MONTHS.map(month => ({
          properties: {
            title: month
          }
        }))
      })
    });

    if (!createRes.ok) {
      const errTxt = await createRes.text();
      throw new Error(`Failed to create spreadsheet: ${errTxt}`);
    }

    const createdSheet = await createRes.json();
    const spreadsheetId = createdSheet.spreadsheetId;

    // 2. Initialize headers for each of the 12 tabs
    const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'RAW',
        data: MONTHS.map(month => ({
          range: `${month}!A1:AP1`,
          values: [HEADERS]
        }))
      })
    });

    if (!batchRes.ok) {
      const errTxt = await batchRes.text();
      throw new Error(`Failed to set spreadsheet headers: ${errTxt}`);
    }

    return spreadsheetId;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Fetches all jobs for all months in the year using batchGet.
 */
export const testSheetsConnection = async (
  spreadsheetId: string,
  accessToken: string
): Promise<string[]> => {
  try {
    const range = encodeURIComponent('A1:Z1');
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!res.ok) {
      let errMsg = `Code: ${res.status}`; try { const errJson = await res.json(); if (errJson.error && errJson.error.message) { errMsg += ` - ${errJson.error.message}`; } } catch (e) { } throw new Error(`Failed to test Sheets connection. ${errMsg}. If you get 403, please make sure the Google Sheets API is enabled for this project and you have access to the sheet.`);
    }
    const data = await res.json();
    return data.values && data.values[0] ? data.values[0] : [];
  } catch (error) {
    
    throw error;
  }
};

export const fetchYearlyJobs = async (
  spreadsheetId: string,
  accessToken: string
): Promise<ServiceJob[]> => {
  try {
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!metaRes.ok) {
      let errMsg = `Code: ${metaRes.status}`; try { const errJson = await metaRes.json(); if (errJson.error && errJson.error.message) { errMsg += ` - ${errJson.error.message}`; } } catch (e) { } throw new Error(`Failed to fetch spreadsheet metadata. ${errMsg}. If you get 403, please make sure the Google Sheets API is enabled for this project and you have access to the sheet.`);
    }
    const metaData = await metaRes.json();
    const existingSheetTitles = metaData.sheets.map((s: any) => s.properties.title);

    const validMonths = MONTHS.filter(m => existingSheetTitles.includes(m));
    if (validMonths.length === 0) return [];

    const ranges = validMonths.map(m => `${m}!A2:AP`).join('&ranges=');
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch values from Google Sheet ranges. Code: ${res.status}`);
    }

    const data = await res.json();
    if (!data.valueRanges) {
      return [];
    }

    const allJobs: ServiceJob[] = [];
    data.valueRanges.forEach((rangeObj: any) => {
      if (rangeObj.values && rangeObj.values.length > 0) {
        allJobs.push(...rangeObj.values.map(mapRowToJob));
      }
    });

    return allJobs;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches all jobs for a specific month sheet.
 */
export const fetchMonthlyJobs = async (
  spreadsheetId: string, 
  monthYear: string, // e.g. "JAN2026"
  accessToken: string
): Promise<ServiceJob[]> => {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${monthYear}!A2:AP`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (res.status === 404 || res.status === 400) {
      // Tab might not exist or be empty yet, return empty list
      return [];
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch values from Google Sheet range. Code: ${res.status}`);
    }

    const data = await res.json();
    if (!data.values || data.values.length === 0) {
      return [];
    }

    return data.values.map(mapRowToJob);
  } catch (error) {
    throw error;
  }
};

/**
 * Appends a new service job to the correct month's sheet.
 */
export const appendJobToSheet = async (
  spreadsheetId: string,
  job: ServiceJob,
  accessToken: string
): Promise<void> => {
  const monthYear = getMonthYearFromDate(job.callDate);
  const rowValues = mapJobToRow(job);

  let res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${monthYear}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });

  if (!res.ok && (res.status === 400 || res.status === 404)) {
    // Attempt to create the tab
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: monthYear } } }]
      })
    });
    
    // Attempt to write headers
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${monthYear}!A1:AP1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [HEADERS]
      })
    });

    // Retry appending row
    res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${monthYear}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [rowValues]
      })
    });
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to save job log to Google Sheets: ${errText}`);
  }
};

/**
 * Updates an existing job row in the correct month's sheet.
 */
export const updateJobInSheet = async (
  spreadsheetId: string,
  originalMonthYear: string,
  rowIdx: number, // 0-indexed index in the retrieved list (row number in sheet is rowIdx + 2)
  job: ServiceJob,
  accessToken: string
): Promise<void> => {
  const currentMonthYear = getMonthYearFromDate(job.callDate);
  
  if (originalMonthYear !== currentMonthYear) {
    // If the month changed, we must delete from original sheet and append to new sheet!
    // Since Google Sheets doesn't have a direct "delete row" API easily, we can clear the values of the row first,
    // or we can append to the new sheet and mark the old one as "Cancelled" / clear it.
    // For safety, let's append to the new sheet and clear the original row.
    await appendJobToSheet(spreadsheetId, job, accessToken);
    await clearRowInSheet(spreadsheetId, originalMonthYear, rowIdx, accessToken);
  } else {
    // Month didn't change, perform in-place update
    const sheetRowNumber = rowIdx + 2;
    const rowValues = mapJobToRow(job);
    const range = `${currentMonthYear}!A${sheetRowNumber}:AP${sheetRowNumber}`;

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [rowValues]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to update job: ${errText}`);
    }
  }
};

/**
 * Clears/cancels a row in the sheet
 */
export const clearRowInSheet = async (
  spreadsheetId: string,
  monthYear: string,
  rowIdx: number,
  accessToken: string
): Promise<void> => {
  const sheetRowNumber = rowIdx + 2;
  const range = `${monthYear}!A${sheetRowNumber}:AP${sheetRowNumber}`;
  
  // Instead of completely clearing (which leaves blank lines in the middle), we can mark the row status as "Cancelled" 
  // or clear its values. Clearing is safer for standard REST range clearing.
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`Failed to clear row: ${errTxt}`);
  }
};

/**
 * Helper to extract the sequence number from any Job Number format.
 */
export const extractSequenceNumber = (jNum: string): number => {
  if (!jNum) return 0;
  const clean = String(jNum).trim();
  if (clean === '') return 0;

  // 1. If it's a simple number (e.g. "1", "42", "100")
  if (/^\d+$/.test(clean)) {
    const val = parseInt(clean, 10);
    // If it's 5 or more digits, it's likely [seq][MM][YY] format (e.g. "010726")
    if (clean.length >= 5) {
      const seqStr = clean.substring(0, clean.length - 4);
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq)) return seq;
    }
    return val;
  }

  // 2. If it has prefixes/suffixes like "PM-01", "JOB-102", "CM26-003"
  // Try to find the last group of digits
  const matches = clean.match(/(\d+)(?:\D*)$/);
  if (matches && matches[1]) {
    const num = parseInt(matches[1], 10);
    if (!isNaN(num)) return num;
  }

  // 3. Fallback: find any number in the string
  const anyMatch = clean.match(/\d+/);
  if (anyMatch) {
    const num = parseInt(anyMatch[0], 10);
    if (!isNaN(num)) return num;
  }

  return 0;
};

/**
 * Generates the next sequential Job Number for a given Call Date.
 * Format: [seq][MM][YY] e.g. 010126 (01 is work sequence, 01 is month, 26 is year)
 */
export const generateNextJobNumber = async (
  spreadsheetId: string,
  callDate: string,
  accessToken: string,
  localJobs?: ServiceJob[]
): Promise<string> => {
  let monthNumStr = '01';
  let yearStr = '26';
  
  if (callDate && callDate.includes('-')) {
    const parts = callDate.split('-');
    if (parts.length === 3) {
      monthNumStr = parts[1].padStart(2, '0');
      yearStr = parts[0].substring(2);
    }
  } else {
    const dateObj = new Date(callDate || Date.now());
    monthNumStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    yearStr = String(dateObj.getFullYear()).substring(2);
  }

  const monthYear = getMonthYearFromDate(callDate); // "JAN2026"

  // 1. Fetch latest from spreadsheet
  const existingJobs = await fetchMonthlyJobs(spreadsheetId, monthYear, accessToken);
  
  // 2. Combine spreadsheet jobs with local unsaved state jobs to avoid race condition/propagation latency
  const allJobs = [...existingJobs];
  if (localJobs && localJobs.length > 0) {
    localJobs.forEach(localJob => {
      const localMonthYear = getMonthYearFromDate(localJob.callDate);
      if (localMonthYear === monthYear) {
        // Only append if it's not already in the sheet (by checking jobNumber)
        const alreadyInSheet = existingJobs.some(ej => ej.jobNumber === localJob.jobNumber);
        if (!alreadyInSheet && localJob.jobNumber) {
          allJobs.push(localJob);
        }
      }
    });
  }
  
  let maxSeq = 0;
  allJobs.forEach(job => {
    const seq = extractSequenceNumber(job.jobNumber);
    if (seq > maxSeq) {
      maxSeq = seq;
    }
  });

  const nextSeq = maxSeq + 1;
  const nextSeqStr = String(nextSeq).padStart(2, '0');
  
  return `${nextSeqStr}${monthNumStr}${yearStr}`;
};

/**
 * Helper to convert date "YYYY-MM-DD" to monthly sheet tab name e.g. "JAN2026"
 */
export const getMonthYearFromDate = (dateStr: string): string => {
  if (!dateStr) return "JAN2026";
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1; // 0-indexed
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      if (!isNaN(monthIdx) && monthIdx >= 0 && monthIdx < 12) {
        return `${months[monthIdx]}${year}`;
      }
    }
  }
  const date = new Date(dateStr);
  const monthIdx = date.getMonth();
  const year = date.getFullYear();
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${months[monthIdx]}${year}`;
};

/**
 * Fetches CMStatus records from CMStatus sheet.
 */
export const fetchCMStatusRecords = async (
  spreadsheetId: string,
  accessToken: string
): Promise<import('./types').CMStatusRecord[]> => {
  try {
    const range = encodeURIComponent("'DATABASE TARGET'!A2:K");
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!res.ok) {
      if (res.status === 400 || res.status === 404) {
        let errStr = '';
        try { const j = await res.json(); errStr = JSON.stringify(j); } catch(e){}
        let tabs = [];
        try { tabs = await fetchSpreadsheetTabs(spreadsheetId, accessToken); } catch(e) {}
        throw new Error("Tab 'DATABASE TARGET USER' not found. Available tabs in this sheet are: " + tabs.join(", ") + ". Details: " + errStr);
      }
      let errMsg = `Code: ${res.status}`; try { const errJson = await res.json(); if (errJson.error && errJson.error.message) { errMsg += ` - ${errJson.error.message}`; } } catch (e) { } throw new Error(`Failed to fetch CMStatus records. ${errMsg}. If you get 403, please make sure the Google Sheets API is enabled for this project and you have access to the sheet.`);
    }
    const data = await res.json();
    if (!data.values || data.values.length === 0) {
      return [];
    }
    return data.values.map((row: any[], index: number) => ({
      hospital: row[0] ? String(row[0]) : '',
      namecontract: row[1] ? String(row[1]) : '',
      phonecontract: row[2] ? String(row[2]) : '',
      equipment: row[3] ? String(row[3]) : '',
      problem: row[4] ? String(row[4]) : '',
      image: row[5] ? String(row[5]) : '',
      status: row[6] ? String(row[6]) : 'Pending',
      warranty: row[7] ? String(row[7]) : '',
      reportDate: row[8] ? String(row[8]) : '',
      engineer: row[9] ? String(row[9]) : '',
      serialNumber: row[10] ? String(row[10]) : '',
      ibDate: row[11] ? String(row[11]) : '',
      expiryDate: row[12] ? String(row[12]) : '',
      rowIndex: index + 2,
    }));
  } catch (error) {
    
    throw error;
  }
};

/**
 * Appends a CMStatus record to CMStatus sheet.
 */
export const appendCMStatusRecord = async (
  spreadsheetId: string,
  accessToken: string,
  record: import('./types').CMStatusRecord
): Promise<void> => {
  try {
    const values = [
      [
        record.hospital,
        record.namecontract,
        record.phonecontract,
        record.equipment,
        record.problem,
        record.image,
        record.status || 'Repair request',
        record.warranty || '',
        record.reportDate || '',
        record.engineer || '',
        record.serialNumber || ''
      ]
    ];
    
    const range = encodeURIComponent("'DATABASE TARGET'!A1");
    let res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    });
    
    if (!res.ok) {
      if (res.status === 400) {
        // Sheet might not exist. Try creating it.
        const createSheetRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [{ addSheet: { properties: { title: 'DATABASE TARGET' } } }]
          })
        });
        
        if (createSheetRes.ok) {
          // Setup headers
          const headerRange = encodeURIComponent("'DATABASE TARGET'!A1:K1");
          await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${headerRange}?valueInputOption=USER_ENTERED`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              values: [["Hospital", "Contact Name", "Contact Phone", "Equipment", "Problem", "Image URL", "Status", "Warranty", "Report Date", "Engineer", "Serial Number"]]
            })
          });

          // Retry append
          res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values })
          });
        }
      }
      
      if (!res.ok) {
        throw new Error(`Failed to append CMStatus record. Code: ${res.status}`);
      }
    }
  } catch (error) {
    console.error("appendCMStatusRecord error:", error);
    throw error;
  }
};
export const updateCMStatusRecord = async (
  spreadsheetId: string,
  accessToken: string,
  rowIndex: number,
  record: import("./types").CMStatusRecord
): Promise<void> => {
  try {
    const values = [
      [
        record.hospital,
        record.namecontract,
        record.phonecontract,
        record.equipment,
        record.problem,
        record.image,
        record.status || "Repair request",
        record.warranty || "",
        record.reportDate || "",
        record.engineer || "",
        record.serialNumber || ""
      ]
    ];
    const range = encodeURIComponent(`'DATABASE TARGET'!A${rowIndex}:K${rowIndex}`);
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values })
    });
    if (!res.ok) {
      throw new Error(`Failed to update CMStatus record. Code: ${res.status}`);
    }
  } catch (error) {
    console.error("updateCMStatusRecord error:", error);
    throw error;
  }
};

export const fetchPMScheduleRecords = async (
  spreadsheetId: string,
  accessToken: string
): Promise<import('./types').PMScheduleItem[]> => {
  const sheets = [
    "PM All",
    "IIS All PM C-Arm",
    "IIS All PM Ultrasound",
    "PM Contract C-Arm",
    "PM Contract Ultrasound"
  ];
  
  const allRecords: import('./types').PMScheduleItem[] = [];

  for (const sheet of sheets) {
    try {
      const range = encodeURIComponent(`'${sheet}'!A1:ZZ`);
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!res.ok) {
        console.warn(`Skipping sheet ${sheet}. Status: ${res.status}`);
        continue;
      }
      const data = await res.json();
      const rows = data.values || [];
      if (rows.length < 3) continue;

      let monthRowIndex = -1;
      let monthStartCol = -1;
      
      let hospitalCol = -1;
      let snCol = -1;
      let modelCol = -1;
      let warrantyCol = -1;
      let paymentCol = -1;
      let warrantyPeriodCol = -1;
      let warrantyExpiryCol = -1;
      let timesTotalCol = -1;
      let regionCol = -1;
      
      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const row = rows[r];
        if (!row) continue;
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || '').trim().toLowerCase();
          
          if (val === 'jan' || val === 'january') {
            const nextVal = String(row[c+1] || '').trim().toLowerCase();
            if (nextVal === 'feb' || nextVal === 'february') {
              if (monthRowIndex === -1) {
                monthRowIndex = r;
                monthStartCol = c;
              }
            }
          }
          
          if (val.includes('hospital') && hospitalCol === -1 && r < 5) hospitalCol = c;
          if ((val.includes('s/n') || val === 'sn' || val.includes('serial')) && snCol === -1 && r < 5) snCol = c;
          if ((val === 'model' || val === 'system') && modelCol === -1 && r < 5) modelCol = c;
          if ((val.includes('warranty') || val.includes('contract')) && warrantyCol === -1 && r < 5) warrantyCol = c;
                    if ((val.includes('payment') || val.includes('remark') || val === 'type') && paymentCol === -1 && r < 5) paymentCol = c;
          if ((val.includes('ระยะเวลา') || val.includes('period')) && warrantyPeriodCol === -1 && r < 5) warrantyPeriodCol = c;
                    if ((val.includes('หมดประกัน') || val.includes('expire') || val.includes('expiry')) && warrantyExpiryCol === -1 && r < 5) warrantyExpiryCol = c;
          if ((val === 'size' || val.includes('times') || val.includes('total') || val.includes('ครั้ง')) && timesTotalCol === -1 && r < 5) timesTotalCol = c;
          if ((val.includes('ภาค') || val === 'region') && regionCol === -1 && r < 5) regionCol = c;
        }
      }

      if (hospitalCol === -1) hospitalCol = 0;
      if (snCol === -1) snCol = 1;
      if (modelCol === -1) modelCol = 2;
      if (warrantyCol === -1) warrantyCol = 7;
            if (paymentCol === -1) paymentCol = 8;
      if (warrantyPeriodCol === -1) warrantyPeriodCol = 5;
            if (warrantyExpiryCol === -1) warrantyExpiryCol = 6;
      if (timesTotalCol === -1) timesTotalCol = 3;

      if (monthRowIndex === -1) {
        monthRowIndex = 2;
        monthStartCol = 9;
      }

      const yearRowIndex = Math.max(0, monthRowIndex - 1);
      const yearRow = rows[yearRowIndex] || [];
      const monthRow = rows[monthRowIndex] || [];
      
      let currentYear = "";
      const colYearMap: Record<number, string> = {};
      for (let col = monthStartCol; col < monthRow.length; col++) {
        if (yearRow && yearRow[col]) {
          const text = String(yearRow[col]);
          const yearMatch = text.match(/20\d\d|25\d\d/);
          if (yearMatch) currentYear = yearMatch[0];
        }
        if (!currentYear && monthRow[col]) {
           const text = String(monthRow[col]);
           const yearMatch = text.match(/20\d\d|25\d\d/);
           if (yearMatch) currentYear = yearMatch[0];
        }
        colYearMap[col] = currentYear;
      }
      
      for (let i = monthRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const hospitalName = row[hospitalCol] ? String(row[hospitalCol]) : '';
        if (!hospitalName || hospitalName.trim().toLowerCase() === "hospital name") continue;
        
        const sn = row[snCol] ? String(row[snCol]) : '';
        const model = row[modelCol] ? String(row[modelCol]) : '';
        let region = regionCol !== -1 && row[regionCol] ? String(row[regionCol]) : '';
        
        // Ensure standard formatting
        const normRegion = region.toLowerCase().trim();
        if (normRegion.includes('central')) region = 'Central';
        else if (normRegion.includes('north') && !normRegion.includes('east')) region = 'North';
        else if (normRegion.includes('south')) region = 'South';
        else if (normRegion.includes('east') && !normRegion.includes('north')) region = 'Eastern';
        else if (normRegion.includes('west')) region = 'Western';
        else if (normRegion.includes('northeast')) region = 'Northeastern';

        const warrantyType = row[warrantyCol] ? String(row[warrantyCol]) : '';
                const paymentCondition = row[paymentCol] ? String(row[paymentCol]) : '';
                const warrantyPeriod = row[warrantyPeriodCol] ? String(row[warrantyPeriodCol]) : '';
        const warrantyExpiry = row[warrantyExpiryCol] ? String(row[warrantyExpiryCol]) : '';
                // Find the last numeric value in the month columns to represent pmTimesTotal
        let pmTimesTotal = "";
        for (let c = row.length - 1; c >= monthStartCol; c--) {
          const val = String(row[c] || '').trim();
          if (val && !isNaN(Number(val))) {
            pmTimesTotal = val;
            break;
          }
        }
        
        for (let col = monthStartCol; col < row.length; col++) {
          const iteration = row[col] ? String(row[col]).trim() : '';
          if (iteration) {
            let year = colYearMap[col] || '';
            const rawMonth = monthRow[col] ? String(monthRow[col]).trim() : '';
            if (rawMonth.length >= 3) {
              let month = rawMonth.substring(0,3);
              month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
              
              if (!year) year = new Date().getFullYear().toString();
              
              let equipmentCategory: "C-Arm" | "Ultrasound" | "Other" = "Other";
              if (sheet.includes('C-Arm')) equipmentCategory = "C-Arm";
              else if (sheet.includes('Ultrasound')) equipmentCategory = "Ultrasound";
              else {
                const cArmModels = ['bv', 'zenition', 'veradius', 'c-arm', 'pulsera', 'endura'];
                const modelLower = model.toLowerCase();
                if (cArmModels.some(m => modelLower.includes(m))) {
                  equipmentCategory = "C-Arm";
                } else if (modelLower) {
                  equipmentCategory = "Ultrasound";
                }
              }

              allRecords.push({
                sheetName: sheet,
                hospitalName,
                sn,
                model,
                                iteration,
                pmTimesTotal,
                                warrantyType,
                region,
                paymentCondition,
                warrantyPeriod,
                warrantyExpiry,
                month,
                year,
                equipmentCategory
              });
            }
          }
        }
      }
    } catch (error) {
      
    }
  }
  return allRecords;
};


/**
 * Fetches CMOnCall records from DATABASE TARGET USER sheet.
 */
export const fetchCMOnCallRecords = async (
  spreadsheetId: string,
  accessToken: string
): Promise<import('./types').CMStatusRecord[]> => {
  try {
    const range = encodeURIComponent("'DATABASE TARGET USER'!A2:M");
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!res.ok) {
      if (res.status === 400 || res.status === 404) {
        let errStr = '';
        try { const j = await res.json(); errStr = JSON.stringify(j); } catch(e){}
        let tabs = [];
        try { tabs = await fetchSpreadsheetTabs(spreadsheetId, accessToken); } catch(e) {}
        throw new Error("Tab 'DATABASE TARGET USER' not found. Available tabs in this sheet are: " + tabs.join(", ") + ". Details: " + errStr);
      }
      let errMsg = `Code: ${res.status}`; try { const errJson = await res.json(); if (errJson.error && errJson.error.message) { errMsg += ` - ${errJson.error.message}`; } } catch (e) { } throw new Error(`Failed to fetch CMOnCall records. ${errMsg}`);
    }
    const data = await res.json();
    if (!data.values || data.values.length === 0) {
      return [];
    }
    return data.values.map((row: any[], index: number) => ({
      hospital: row[0] ? String(row[0]) : '',
      namecontract: row[1] ? String(row[1]) : '',
      phonecontract: row[2] ? String(row[2]) : '',
      equipment: row[3] ? String(row[3]) : '',
      problem: row[4] ? String(row[4]) : '',
      image: row[5] ? String(row[5]) : '',
      status: row[6] ? String(row[6]) : 'Pending',
      warranty: row[7] ? String(row[7]) : '',
      reportDate: row[8] ? String(row[8]) : '',
      engineer: row[9] ? String(row[9]) : '',
      serialNumber: row[10] ? String(row[10]) : '',
      ibDate: row[11] ? String(row[11]) : '',
      expiryDate: row[12] ? String(row[12]) : '',
      rowIndex: index + 2,
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Appends a CMOnCall record to DATABASE TARGET USER sheet.
 */
export const appendCMOnCallRecord = async (
  spreadsheetId: string,
  accessToken: string,
  record: import('./types').CMStatusRecord
): Promise<void> => {
  try {
    const values = [
      [
        record.hospital,
        record.namecontract,
        record.phonecontract,
        record.equipment,
        record.problem,
        record.image,
        record.status || 'Repair request',
        record.warranty,
        record.reportDate,
        record.engineer,
        record.serialNumber,
        record.ibDate || '',
        record.expiryDate || ''
      ]
    ];
    
    const range = encodeURIComponent("'DATABASE TARGET USER'!A1");
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    });
    
    if (!res.ok) {
      if (res.status === 400 || res.status === 404) {
          console.warn("Target tab might not exist. Attempting to create it.");
      }
      throw new Error(`Failed to append CMOnCall record. Code: ${res.status}`);
    }
  } catch (error) {
    console.error("appendCMOnCallRecord error:", error);
    throw error;
  }
};

/**
 * Updates an existing CMOnCall record.
 */
export const updateCMOnCallRecord = async (
  spreadsheetId: string,
  accessToken: string,
  rowIndex: number,
  record: import("./types").CMStatusRecord
): Promise<void> => {
  try {
    const values = [
      [
        record.hospital,
        record.namecontract,
        record.phonecontract,
        record.equipment,
        record.problem,
        record.image,
        record.status,
        record.warranty,
        record.reportDate,
        record.engineer,
        record.serialNumber,
        record.ibDate || '',
        record.expiryDate || ''
      ]
    ];
    const range = encodeURIComponent(`'DATABASE TARGET USER'!A${rowIndex}:M${rowIndex}`);
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update CMOnCall record. Code: ${res.status}`);
    }
  } catch (error) {
    console.error("updateCMOnCallRecord error:", error);
    throw error;
  }
};


export const fetchSpreadsheetTabs = async (spreadsheetId: string, accessToken: string): Promise<string[]> => {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error(`Failed to fetch spreadsheet metadata. Code: ${res.status}`);
    const data = await res.json();
    return data.sheets.map((s: any) => s.properties.title);
  } catch (error) {
    console.error("fetchSpreadsheetTabs error:", error);
    return [];
  }
};


/**
 * Appends a quotation to the "Quotations" sheet.
 */
export const appendQuotation = async (
  spreadsheetId: string,
  data: any,
  accessToken: string
): Promise<void> => {
  const sheetName = 'Quotations';
  
  // First, check if the "Quotations" sheet exists
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (metaRes.ok) {
    const metaData = await metaRes.json();
    const existingSheetTitles = metaData.sheets.map((s: any) => s.properties.title);
    
    // If not, create it with headers
    if (!existingSheetTitles.includes(sheetName)) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName
                }
              }
            }
          ]
        })
      });

      // Add headers
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:J1?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [["ชื่อไฟล์", "วันที่", "เลขที่", "ชื่องาน", "รายละเอียด", "จำนวนเงินรวมทั้งสิ้น", "ประเภทงาน", "โอกาสได้งาน (%)", "ID", "ชื่อลูกค้า"]]
        })
      });
    }
  }

  // Append data
  const rowValues = [
    data.fileName || '',
    data.date || '',
    data.quotationNumber || '',
    data.jobName || '',
    data.description || '',
    data.totalAmount || '',
    data.jobType || '',
    data.winRate || '',
    data.id || new Date().getTime().toString(),
    data.customerName || ''
  ];

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });

  if (!res.ok) {
    throw new Error('Failed to save quotation to Google Sheets');
  }
};


export interface QuotationRecord {
  fileName: string;
  date: string;
  quotationNumber: string;
  jobName: string;
  description: string;
  totalAmount: number;
  jobType: string;
  winRate: number;
  id: string;
  rowIndex: number;
  customerName?: string;
}

export const fetchQuotations = async (
  spreadsheetId: string,
  accessToken: string
): Promise<QuotationRecord[]> => {
  const sheetName = 'Quotations';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A2:J1000`;
  
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    if (res.status === 400) return []; // Sheet might not exist yet
    throw new Error('Failed to fetch quotations');
  }

  const data = await res.json();
  const rows = data.values || [];
  
  return rows.map((row: any[], index: number) => ({
    fileName: row[0] || '',
    date: row[1] || '',
    quotationNumber: row[2] || '',
    jobName: row[3] || '',
    description: row[4] || '',
    totalAmount: row[5] ? parseFloat(row[5].replace(/[^0-9.-]+/g,"")) || 0 : 0,
    jobType: row[6] || 'PM',
    winRate: row[7] ? parseInt(row[7]) || 0 : 0,
    id: row[8] || '',
    customerName: row[9] || '',
    rowIndex: index + 2 // A2 is row 2
  }));
};

export const updateQuotationWinRate = async (
  spreadsheetId: string,
  rowIndex: number,
  winRate: number,
  jobType: string,
  accessToken: string
): Promise<void> => {
  const sheetName = 'Quotations';
  const range = `${sheetName}!G${rowIndex}:H${rowIndex}`;
  
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [[jobType, winRate]]
    })
  });

  if (!res.ok) {
    throw new Error('Failed to update quotation data');
  }
};

// ---------------- Dispatch Schedule ---------------- //
export const fetchDispatchRecords = async (spreadsheetId: string, accessToken: string): Promise<import('./types').DispatchRecord[]> => {
  const sheetName = 'DispatchSchedule';
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A2:G`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!res.ok) {
      console.warn('Could not fetch Dispatch records, status:', res.status);
      return [];
    }
    
    const data = await res.json();
    if (!data.values) return [];
    
    return data.values.map((row: any[], index: number) => ({
      id: row[0] || '',
      date: row[1] || '',
      engineer: row[2] || '',
      taskTitle: row[3] || '',
      location: row[4] || '',
      remark: row[5] || '',
      status: row[6] || 'Pending',
      rowIndex: index + 2
    })).filter((r: any) => r.id !== '');
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const appendDispatchRecord = async (spreadsheetId: string, accessToken: string, record: import('./types').DispatchRecord): Promise<void> => {
  const sheetName = 'DispatchSchedule';
  
  // Ensure tab exists
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (metaRes.ok) {
    const metaData = await metaRes.json();
    const existingSheetTitles = metaData.sheets.map((s: any) => s.properties.title);
    if (!existingSheetTitles.includes(sheetName)) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{ addSheet: { properties: { title: sheetName } } }]
        })
      });
      // Headers
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:G1?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [['ID', 'Date', 'Engineer', 'Task', 'Location', 'Remark', 'Status']] })
      });
    }
  }

  const values = [[record.id, record.date, record.engineer, record.taskTitle, record.location, record.remark, record.status]];
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  });
};


export const deleteDispatchRecord = async (spreadsheetId: string, accessToken: string, rowIndex: number): Promise<void> => {
  const sheetName = 'DispatchSchedule';
  const range = `${sheetName}!A${rowIndex}:G${rowIndex}`;
  const values = [['', '', '', '', '', '', '']];
  
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  });
};

export const updateDispatchRecord = async (spreadsheetId: string, accessToken: string, record: import('./types').DispatchRecord): Promise<void> => {
  if (!record.rowIndex) return;
  const sheetName = 'DispatchSchedule';
  const range = `${sheetName}!A${record.rowIndex}:G${record.rowIndex}`;
  const values = [[record.id, record.date, record.engineer, record.taskTitle, record.location, record.remark, record.status]];
  
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  });
};


// ==========================================
// PM ASSIGNMENTS
// ==========================================

export const fetchPMAssignmentsFromSheet = async (spreadsheetId: string, accessToken: string): Promise<Record<string, string>> => {
  const sheetName = 'PM_Assignments';
  
  // 1. Check if sheet exists
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const metaData = await metaRes.json();
  
  if (metaData.error) {
    throw new Error(metaData.error.message);
  }
  
  const hasSheet = metaData.sheets.some((s: any) => s.properties.title === sheetName);
  
  // If not exists, create it
  if (!hasSheet) {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          addSheet: { properties: { title: sheetName } }
        }]
      })
    });
    
    // Add headers
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:C1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [["RecordKey", "EngineerName", "UpdatedAt"]]
      })
    });
    
    return {};
  }
  
  // 2. Fetch data
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A2:C`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  
  const rows = data.values || [];
  const assignments: Record<string, string> = {};
  
  // Process rows: latest row for a recordKey takes precedence if duplicates exist
  rows.forEach((row: any[]) => {
    const key = row[0];
    const engineer = row[1];
    if (key && engineer !== undefined) {
      if (engineer === '') {
        delete assignments[key];
      } else {
        assignments[key] = engineer;
      }
    }
  });
  
  return assignments;
};

export const updatePMAssignmentsInSheet = async (spreadsheetId: string, accessToken: string, recordKey: string, engineerName: string): Promise<void> => {
  const sheetName = 'PM_Assignments';
  
  // Ensure sheet exists before appending (optimistically assume it exists most of the time, 
  // if fetchPMAssignmentsFromSheet was called earlier, it exists)
  
  const timestamp = new Date().toISOString();
  
  // We simply append a new row. The fetch function processes them in order, so the latest prevails.
  // Alternatively, we could find and update, but append is much faster and simpler.
  
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [[recordKey, engineerName, timestamp]]
    })
  });
};
