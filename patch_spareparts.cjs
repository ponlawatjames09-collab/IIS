const fs = require('fs');

// 1. Update src/types.ts
let typesCode = fs.readFileSync('src/types.ts', 'utf8');
const oldSpare = 'sparePartRemark?: string;';
const newSpare = `sparePartRemark?: string;
  spareParts2?: string;
  sparePartSerial2?: string;
  sparePartDescription2?: string;
  sparePartRemark2?: string;
  spareParts3?: string;
  sparePartSerial3?: string;
  sparePartDescription3?: string;
  sparePartRemark3?: string;`;
typesCode = typesCode.replace(oldSpare, newSpare);
fs.writeFileSync('src/types.ts', typesCode);

// 2. Update src/sheetsService.ts
let sheetsCode = fs.readFileSync('src/sheetsService.ts', 'utf8');

const oldHeaders = '"Engineer 4"';
const newHeaders = '"Engineer 4", "Spare Parts 2", "Spare Part 2 Serial/12NC", "Spare Part 2 Description", "Spare Part 2 Remark", "Spare Parts 3", "Spare Part 3 Serial/12NC", "Spare Part 3 Description", "Spare Part 3 Remark"';
sheetsCode = sheetsCode.replace(oldHeaders, newHeaders);

// mapRowToJob
const oldMapRowToJob = `    engineer4: row[33] ? String(row[33]) : '',
  };
};`;
const newMapRowToJob = `    engineer4: row[33] ? String(row[33]) : '',
    spareParts2: row[34] ? String(row[34]) : '',
    sparePartSerial2: row[35] ? String(row[35]) : '',
    sparePartDescription2: row[36] ? String(row[36]) : '',
    sparePartRemark2: row[37] ? String(row[37]) : '',
    spareParts3: row[38] ? String(row[38]) : '',
    sparePartSerial3: row[39] ? String(row[39]) : '',
    sparePartDescription3: row[40] ? String(row[40]) : '',
    sparePartRemark3: row[41] ? String(row[41]) : '',
  };
};`;
sheetsCode = sheetsCode.replace(oldMapRowToJob, newMapRowToJob);

// mapJobToRow
const oldMapJobToRow = `    job.engineer4 || ''
  ];
};`;
const newMapJobToRow = `    job.engineer4 || '',
    job.spareParts2 || '',
    job.sparePartSerial2 || '',
    job.sparePartDescription2 || '',
    job.sparePartRemark2 || '',
    job.spareParts3 || '',
    job.sparePartSerial3 || '',
    job.sparePartDescription3 || '',
    job.sparePartRemark3 || ''
  ];
};`;
sheetsCode = sheetsCode.replace(oldMapJobToRow, newMapJobToRow);

// Change !A2:AH to !A2:AP everywhere inside src/sheetsService.ts to accommodate 8 new columns
sheetsCode = sheetsCode.replace(/!A2:AH/g, '!A2:AP');
sheetsCode = sheetsCode.replace(/!A1:AH1/g, '!A1:AP1');
sheetsCode = sheetsCode.replace(/:AH\$\{sheetRowNumber\}/g, ':AP${sheetRowNumber}');

fs.writeFileSync('src/sheetsService.ts', sheetsCode);
