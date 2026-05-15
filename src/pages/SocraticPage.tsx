import { useState } from "react";
import { useSocraticStore } from "@/store/socraticStore";
import { useAiStore } from "@/store/aiStore";
import FileUploader from "@/components/shared/FileUploader";
import PrivacyBanner from "@/components/shared/PrivacyBanner";
import SocraticChat from "@/components/socratic/SocraticChat";
import { toast } from "@/lib/utils";

const SUBJECTS = ["matematica", "italiano", "scienze", "storia", "geografia", "lingue", "arte", "musica", "altro"];
const LEVELS = ["scuola primaria", "scuola secondaria primo grado", "scuola secondaria secondo grado"];

export default function SocraticPage() {
  const s = useSocraticStore();
  const aiReady = useAiStore((x) => x.provider.isReady);
  const [draftText, setDraftText] = useState("");
  const [subject, setSubject] = useState(s.subject);
  const [level, setLevel] = useState(s.schoolLevel);

  const started = s.sourceText && s.messages.length >= 0 && (s.messages.length > 0 || s.sourceText.length > 0);

  const start = () => {
    if (!aiReady) { toast("Configura prima un'AI dall'header"); return; }
    if (!draftText.trim()) { toast("Inserisci o carica un testo"); return; }
    s.setSetup({ sourceText: draftText.trim(), subject, schoolLevel: level });
  };

  return (
    <div className="max-w-app mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🦉</span>
        <div>
          <h1 className="text-2xl font-bold">Tutor Socratico</h1>
          <p className="text-sm text-neutral-500">L'AI guida lo studente alla scoperta, senza mai dare la risposta diretta.</p>
        </div>
      </div>
      <PrivacyBanner />

      {!started || !s.sourceText ? (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-4 space-y-3">
            <h2 className="font-semibold">1. Materia e livello</h2>
            <label className="text-sm font-medium">Materia</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent">
              {SUBJECTS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <label className="text-sm font-medium">Livello</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent">
              {LEVELS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div className="card p-4 space-y-3">
            <h2 className="font-semibold">2. Contenuto di lavoro</h2>
            <FileUploader onText={(t) => setDraftText(t)} />
            <div className="text-xs text-neutral-500">…oppure incolla qui sotto:</div>
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={8}
              placeholder="Problema, brano, esercizio, traccia, equazione…"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm"
            />
            <button onClick={start} className="btn btn-primary w-full">Avvia sessione socratica</button>
          </div>
        </div>
      ) : (
        <SocraticChat />
      )}
    </div>
  );
}
