export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const escapeCell = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

export function exportToXlsx(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const tableRows = rows
    .map((r) => `<tr>${r.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`)
    .join("");

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    </head>
    <body>
      <table border="1">
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  downloadBlob(blob, filename.endsWith(".xlsx") || filename.endsWith(".xls") ? filename : `${filename}.xlsx`);
}

export function exportToPdf(filename: string, title: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const tableRows = rows
    .map(
      (r) =>
        `<tr>${r
          .map(
            (c) =>
              `<td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${c ?? ""}</td>`
          )
          .join("")}</tr>`
    )
    .join("");

  const headerCells = headers
    .map(
      (h) =>
        `<th style="padding: 10px 12px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase;">${h}</th>`
    )
    .join("");

  const printable = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #0f172a; }
          h1 { font-size: 20px; margin: 0 0 4px 0; color: #0f172a; }
          .meta { font-size: 11px; color: #64748b; margin-bottom: 20px; font-family: monospace; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">Exported: ${new Date().toLocaleString()} &bull; Expiry Rescue Network Enterprise Platform</div>
        <table>
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(printable);
    printWindow.document.close();
  } else {
    const blob = new Blob([printable], { type: "text/html" });
    downloadBlob(blob, filename.endsWith(".html") ? filename : `${filename}.html`);
  }
}
