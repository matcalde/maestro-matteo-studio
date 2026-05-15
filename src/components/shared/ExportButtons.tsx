import { FileDown, FileText } from "lucide-react";
import { exportPdf } from "@/lib/exporters/pdfExporter";
import { exportDocx } from "@/lib/exporters/wordExporter";
import { downloadBlob, toast } from "@/lib/utils";

interface Section { title?: string; body: string; }

export default function ExportButtons({ title, sections, baseFilename }: { title: string; sections: Section[]; baseFilename: string }) {
  const doPdf = async () => {
    const blob = await exportPdf({ title, sections });
    downloadBlob(blob, `${baseFilename}.pdf`);
    toast("PDF scaricato");
  };
  const doDocx = async () => {
    const blob = await exportDocx({ title, sections });
    downloadBlob(blob, `${baseFilename}.docx`);
    toast("Word scaricato");
  };
  return (
    <div className="flex gap-2">
      <button onClick={doPdf} className="btn btn-outline"><FileDown className="w-4 h-4" /> PDF</button>
      <button onClick={doDocx} className="btn btn-outline"><FileText className="w-4 h-4" /> Word</button>
    </div>
  );
}
