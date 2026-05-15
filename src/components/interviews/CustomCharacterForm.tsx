import { useState } from "react";
import { uid, toast } from "@/lib/utils";
import type { Character } from "@/data/characters";
import FileUploader from "@/components/shared/FileUploader";

const EMOJIS = ["🎭","📚","🔭","💡","🌟","🗿","⚔️","🎼","🎨","🧪","📐","🌍"];
const GRADIENTS = ["from-amber-200 to-orange-400","from-fuchsia-200 to-violet-500","from-emerald-200 to-cyan-500","from-rose-200 to-pink-500","from-yellow-200 to-amber-500","from-indigo-200 to-purple-500"];

export default function CustomCharacterForm({ onCreate }: { onCreate: (c: Character) => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [era, setEra] = useState("");
  const [tone, setTone] = useState("");
  const [identity, setIdentity] = useState("");
  const [emoji, setEmoji] = useState("🎭");
  const [gradient, setGradient] = useState(GRADIENTS[0]);
  const [kb, setKb] = useState("");

  const submit = () => {
    if (!name.trim() || !era.trim() || !tone.trim()) { toast("Compila almeno nome, epoca e tone"); return; }
    onCreate({
      id: uid(), name: name.trim(), role: role.trim() || "personaggio storico",
      era: era.trim(), tone: tone.trim(),
      identity: identity.trim() || `Sono ${name}, ${role}.`,
      emoji, gradient,
      knowledgeBase: kb.trim() || undefined,
    });
  };

  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-semibold">Crea personaggio personalizzato</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Nome</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm" />
        </div>
        <div>
          <label className="text-sm">Ambito / ruolo</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm" />
        </div>
        <div>
          <label className="text-sm">Epoca / contesto</label>
          <input value={era} onChange={(e) => setEra(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm" />
        </div>
        <div>
          <label className="text-sm">Emoji</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {EMOJIS.map((e) => <button key={e} type="button" onClick={() => setEmoji(e)} className={`text-2xl p-1 rounded ${emoji === e ? "bg-primary/20" : ""}`}>{e}</button>)}
          </div>
        </div>
      </div>
      <div>
        <label className="text-sm">Sfondo</label>
        <div className="flex flex-wrap gap-1 mt-1">
          {GRADIENTS.map((g) => <button key={g} type="button" onClick={() => setGradient(g)} className={`w-10 h-6 rounded bg-gradient-to-br ${g} ${gradient === g ? "ring-2 ring-primary" : ""}`} />)}
        </div>
      </div>
      <div>
        <label className="text-sm">Tone of voice</label>
        <input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Es: curioso, ironico, parla per metafore" className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm" />
      </div>
      <div>
        <label className="text-sm">Identità (breve bio in prima persona)</label>
        <textarea value={identity} onChange={(e) => setIdentity(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm" />
      </div>
      <div>
        <label className="text-sm">Knowledge base (opzionale): carica un PDF/DOCX/TXT</label>
        <FileUploader onText={(t) => setKb(t)} label="Carica fonte (opzionale)" />
        {kb && <div className="text-xs text-emerald-600 mt-1">✓ {kb.length} caratteri caricati come fonte</div>}
      </div>
      <button onClick={submit} className="btn btn-primary">Crea e usa</button>
    </div>
  );
}
