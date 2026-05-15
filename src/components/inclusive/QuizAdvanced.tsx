import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2 } from "lucide-react";
import type { QuizAdvancedP } from "@/store/inclusiveStore";
import { useAiStore } from "@/store/aiStore";
import type { Message } from "@/lib/ai/providers";
import { toast } from "@/lib/utils";

const SYS = (prompt: string, sq: string[]) => `Sei un tutor socratico. Lo studente sta affrontando questo prompt di analisi critica:
"${prompt}"

Hai a disposizione queste domande di approfondimento da usare con calma e nell'ordine più utile:
${sq.map((s, i) => `${i + 1}. ${s}`).join("\n")}

REGOLE:
- NON dare la risposta diretta.
- Ascolta lo studente, riformula brevemente, poi rilancia con UNA domanda alla volta.
- Quando lo studente ha esplorato bene il prompt, ringrazialo e suggeriscigli di scrivere una sintesi finale.
Inizia ponendo la PRIMA domanda di approfondimento più adatta al prompt.`;

export default function QuizAdvanced({ ps }: { ps: QuizAdvancedP[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const provider = useAiStore((s) => s.provider);

  if (!ps.length) return null;

  const enter = async (i: number) => {
    if (!provider.isReady) { toast("Configura un'AI"); return; }
    setIdx(i);
    setMsgs([{ role: "assistant", content: "" }]);
    setBusy(true);
    try {
      let acc = "";
      for await (const chunk of provider.chatStream([{ role: "user", content: "Inizia." }], SYS(ps[i].prompt, ps[i].socraticQuestions))) {
        acc += chunk;
        setMsgs([{ role: "assistant", content: acc }]);
      }
    } catch (e: any) {
      setMsgs([{ role: "assistant", content: "Errore: " + (e?.message || e) }]);
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    if (!input.trim() || idx === null) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMsgs = [...msgs, userMsg, { role: "assistant" as const, content: "" }];
    setMsgs(newMsgs);
    setInput("");
    setBusy(true);
    try {
      let acc = "";
      for await (const chunk of provider.chatStream(newMsgs.slice(0, -1), SYS(ps[idx].prompt, ps[idx].socraticQuestions))) {
        acc += chunk;
        setMsgs((m) => {
          const c = [...m];
          c[c.length - 1] = { role: "assistant", content: acc };
          return c;
        });
      }
    } catch (e: any) {
      toast("Errore: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  if (idx === null) {
    return (
      <div className="space-y-3">
        {ps.map((p, i) => (
          <div key={i} className="card p-4">
            <div className="flex gap-2 items-start mb-2">
              <strong className="text-primary">{i + 1}.</strong>
              <div className="font-medium">{p.prompt}</div>
            </div>
            <button onClick={() => enter(i)} className="btn btn-primary">Inizia analisi guidata</button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="card p-4 flex flex-col h-[60vh]">
      <div className="mb-2 text-sm flex items-center justify-between">
        <div><strong>Prompt:</strong> {ps[idx].prompt}</div>
        <button onClick={() => { setIdx(null); setMsgs([]); }} className="btn btn-ghost text-sm">← Torna ai prompt</button>
      </div>
      <div className="flex-1 overflow-auto space-y-2">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-xl p-3 text-sm ${m.role === "user" ? "bubble-user ml-auto" : "bubble-ai"}`}>
            <div className="prose-mm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || "…"}</ReactMarkdown></div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={2}
          className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm resize-none"
          placeholder="Scrivi la tua analisi…"
        />
        <button onClick={send} disabled={busy || !input.trim()} className="btn btn-primary">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
