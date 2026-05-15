import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

interface Section { title?: string; body: string; }

export async function exportDocx(opts: { title: string; sections: Section[] }): Promise<Blob> {
  const children: Paragraph[] = [];

  children.push(new Paragraph({
    text: opts.title,
    heading: HeadingLevel.TITLE,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: `Generato con Maestro Matteo Studio · ${new Date().toLocaleString("it-IT")}`, italics: true, color: "888888", size: 18 })],
  }));

  for (const sec of opts.sections) {
    if (sec.title) {
      children.push(new Paragraph({ text: sec.title, heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 80 } }));
    }
    const paragraphs = sec.body.split(/\n+/);
    for (const p of paragraphs) {
      if (!p.trim()) continue;
      children.push(new Paragraph({ children: [new TextRun({ text: p, size: 22 })] }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return await Packer.toBlob(doc);
}
