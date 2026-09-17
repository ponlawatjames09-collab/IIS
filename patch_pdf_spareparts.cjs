const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

// replace the PDF generator logic
const oldPdfGenerator = `      if (job.spareParts || job.sparePartSerial || job.sparePartDescription || job.sparePartRemark) {
        doc.setFont('helvetica', 'bold');
        doc.text("Spare Parts Information (ข้อมูลอะไหล่):", 12, symptomY + 35);
        doc.setFont('helvetica', 'normal');
        
        const spInfo = [];
        if (job.spareParts) spInfo.push(\`Part: \${job.spareParts}\`);
        if (job.sparePartSerial) spInfo.push(\`S/N (12NC): \${job.sparePartSerial}\`);
        if (job.sparePartDescription) spInfo.push(\`Desc: \${job.sparePartDescription}\`);
        if (job.sparePartRemark) spInfo.push(\`Remark: \${job.sparePartRemark}\`);
        
        doc.text(doc.splitTextToSize(spInfo.join('  |  '), 185), 12, symptomY + 40);
      }`;

const newPdfGenerator = `      const sparePartsData = [
        { name: job.spareParts, serial: job.sparePartSerial, desc: job.sparePartDescription, remark: job.sparePartRemark },
        { name: job.spareParts2, serial: job.sparePartSerial2, desc: job.sparePartDescription2, remark: job.sparePartRemark2 },
        { name: job.spareParts3, serial: job.sparePartSerial3, desc: job.sparePartDescription3, remark: job.sparePartRemark3 }
      ].filter(sp => sp.name || sp.serial || sp.desc || sp.remark);

      if (sparePartsData.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text("Spare Parts Information (ข้อมูลอะไหล่):", 12, symptomY + 35);
        doc.setFont('helvetica', 'normal');
        
        let spY = symptomY + 40;
        sparePartsData.forEach((sp, idx) => {
          const spInfo = [];
          if (sp.name) spInfo.push(\`Part: \${sp.name}\`);
          if (sp.serial) spInfo.push(\`S/N: \${sp.serial}\`);
          if (sp.desc) spInfo.push(\`Desc: \${sp.desc}\`);
          if (sp.remark) spInfo.push(\`Remark: \${sp.remark}\`);
          
          doc.text(doc.splitTextToSize(\`\${idx + 1}. \` + spInfo.join('  |  '), 185), 12, spY);
          spY += Math.ceil((spInfo.join('  |  ').length / 100)) * 5;
        });
      }`;

code = code.replace(oldPdfGenerator, newPdfGenerator);

// replace the HTML preview UI
const oldHTMLUI = `                {(job.spareParts || job.sparePartSerial || job.sparePartDescription || job.sparePartRemark) && (
                  <div className="text-slate-600 mt-2">
                    <strong>Spare Parts Information (ข้อมูลอะไหล่):</strong>
                    <div className="bg-slate-50 p-1.5 border border-slate-200 rounded text-slate-700 mt-0.5 grid grid-cols-2 gap-2 text-[9px] md:text-[10px]">
                      {job.spareParts && <div><span className="font-semibold">Part:</span> {job.spareParts}</div>}
                      {job.sparePartSerial && <div><span className="font-semibold">S/N (12NC):</span> {job.sparePartSerial}</div>}
                      {job.sparePartDescription && <div className="col-span-2"><span className="font-semibold">Desc:</span> {job.sparePartDescription}</div>}
                      {job.sparePartRemark && <div className="col-span-2"><span className="font-semibold">Remark:</span> {job.sparePartRemark}</div>}
                    </div>
                  </div>
                )}`;

const newHTMLUI = `                {([
                  { name: job.spareParts, serial: job.sparePartSerial, desc: job.sparePartDescription, remark: job.sparePartRemark },
                  { name: job.spareParts2, serial: job.sparePartSerial2, desc: job.sparePartDescription2, remark: job.sparePartRemark2 },
                  { name: job.spareParts3, serial: job.sparePartSerial3, desc: job.sparePartDescription3, remark: job.sparePartRemark3 }
                ].filter(sp => sp.name || sp.serial || sp.desc || sp.remark).length > 0) && (
                  <div className="text-slate-600 mt-2">
                    <strong>Spare Parts Information (ข้อมูลอะไหล่):</strong>
                    <div className="bg-slate-50 border border-slate-200 rounded mt-0.5 divide-y divide-slate-200">
                      {[
                        { name: job.spareParts, serial: job.sparePartSerial, desc: job.sparePartDescription, remark: job.sparePartRemark },
                        { name: job.spareParts2, serial: job.sparePartSerial2, desc: job.sparePartDescription2, remark: job.sparePartRemark2 },
                        { name: job.spareParts3, serial: job.sparePartSerial3, desc: job.sparePartDescription3, remark: job.sparePartRemark3 }
                      ].filter(sp => sp.name || sp.serial || sp.desc || sp.remark).map((sp, idx) => (
                        <div key={idx} className="p-1.5 grid grid-cols-2 gap-2 text-[9px] md:text-[10px] text-slate-700">
                          {sp.name && <div><span className="font-semibold">Part:</span> {sp.name}</div>}
                          {sp.serial && <div><span className="font-semibold">S/N:</span> {sp.serial}</div>}
                          {sp.desc && <div className="col-span-2"><span className="font-semibold">Desc:</span> {sp.desc}</div>}
                          {sp.remark && <div className="col-span-2"><span className="font-semibold">Remark:</span> {sp.remark}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}`;

code = code.replace(oldHTMLUI, newHTMLUI);

fs.writeFileSync('src/components/JobPDFModal.tsx', code);
