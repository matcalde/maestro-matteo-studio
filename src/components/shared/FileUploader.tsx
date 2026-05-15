import { useRef, useState } from "react";
import { Upload, Loader2, FileText } from "lucide-react";
import { extractText } from "@/lib/parsers/textExtractor";
import { toast } from "@/lib/utils";

export default function FileUploader({ onText, label = "Carica PDF / DOCX / TXT" }: { onText: (text: string, filename: string) => void; label?: string; }) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);

  const handle = async (file: File) => {
    setLoading(true);
    try {
      const text = await extractText(file);
      if (!text.trim()) throw new Error("File vuoto o non leggibile");
      onText(text, file.name);
      toast("✓ Testo estratto");
    } catch (e: any) {
      toast("Errore: " + (e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handle(f);
      }}
      onClick={() => ref.current?.click()}
      className={`cursor-pointer card p-6 border-2 border-dashed flex flex-col items-center gap-2 transition ${drag ? "border-primary bg-primary/5" : "border-neutral-300 dark:border-neutral-700"}`}
    >
      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 text-primary" />}
      <div className="font-medium">{label}</div>
      <div className="text-xs text-neutral-500">Trascina qui un file o clicca per scegliere</div>
      <input
        ref={ref}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
        }}
      />
      <FileText className="w-4 h-4 text-neutral-400" />
    </div>
  );
}
