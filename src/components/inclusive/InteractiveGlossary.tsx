import { useState } from "react";
import type { GlossaryTerm } from "@/store/inclusiveStore";
import { X } from "lucide-react";

export default function InteractiveGlossary({ terms }: { terms: GlossaryTerm[] }) {
  const [open, setOpen] = useState<GlossaryTerm | null>(null);
  if (!terms.length) return <div className="text-sm text-neutral-500">Nessun termine generato.</div>;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {terms.map((t, i) => (
          <button key={i} onClick={() => setOpen(t)} className="px-3 py-1.5 rounded-full bg-inclusive/10 hover:bg-inclusive/20 text-inclusive border border-inclusive/30 text-sm">
            <span className="mr-1">{t.icon}</span>{t.term}
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="card p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg"><span className="text-2xl mr-2">{open.icon}</span>{open.term}</h3>
              <button onClick={() => setOpen(null)} className="btn btn-ghost p-2"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm mb-3">{open.definition}</p>
            <div className="text-sm bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg italic">"{open.example}"</div>
          </div>
        </div>
      )}
    </div>
  );
}
