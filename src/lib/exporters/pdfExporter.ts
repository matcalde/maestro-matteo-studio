import jsPDF from "jspdf";

interface Section { title?: string; body: string; }

export async function exportPdf(opts: { title: string; sections: Section[]; filename?: string }): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const usableW = pageW - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  const titleLines = doc.splitTextToSize(opts.title, usableW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 24 + 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generato con Maestro Matteo Studio · ${new Date().toLocaleString("it-IT")}`, margin, y);
  doc.setTextColor(0);
  y += 24;

  for (const sec of opts.sections) {
    if (sec.title) {
      if (y > pageH - margin - 40) { doc.addPage(); y = margin; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      const lines = doc.splitTextToSize(sec.title, usableW);
      doc.text(lines, margin, y);
      y += lines.length * 18 + 4;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const paragraphs = sec.body.split(/\n+/);
    for (const p of paragraphs) {
      const lines = doc.splitTextToSize(p, usableW);
      for (const line of lines) {
        if (y > pageH - margin) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += 16;
      }
      y += 4;
    }
    y += 8;
  }

  return doc.output("blob");
}
