function parseDateString(dateStr) {
  if (!dateStr) return new Date(0); // far past
  // try standard YYYY-MM-DD
  let dt = new Date(dateStr);
  if (!isNaN(dt.getTime())) return dt;

  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = dateStr.split(/[\/-]/);
  if (parts.length >= 3) {
    let d = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10) - 1;
    let y = parseInt(parts[2], 10);
    if (y < 100) y += 2000;
    dt = new Date(y, m, d);
    if (!isNaN(dt.getTime())) return dt;
  }
  return new Date(0);
}
console.log(parseDateString("19/08/2026"));
console.log(parseDateString("2026-08-19"));
