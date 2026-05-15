import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2, RotateCcw, FileDown } from "lucide-react";
import { useSocraticStore } from "@/store/socraticStore";
import { useAiStore } from "@/store/aiStore";
import { SOCRATIC_SYSTEM_PROMPT, SOCRATIC_REPORT_PROMPT } from "@/lib/ai/prompts/socratic";
import HintButtons from "./HintButton";
import ProgressBar from "./ProgressBar";
import { toast } from "@/lib/utils";
import ExportButtons from "@/components/shared/ExportButtons";

export default function SocraticChat() {
  const s = useSocraticStore();
  const provider = useAiStore((x) => x.provider);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const sys = SOCRATIC_SYSTEM_PROMPT({
    sourceText: s.sourceText,
    subject: s.subject,
    schoolLevel: s.schoolLevel,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [s.messages.length, s.messages[s.messages.length - 1]?.content]);

  // Avvio: se non ci sono messaggi, chiedi al tutor di iniziare
  useEffect(() => {
    if (!provider.isReady) return;
    if (s.messages.length > 0) return;
    if (startedRef.current) return;
    startedRef.current = true;
    void send("Inizia la sessione presentando il problema.", { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider.isReady]);

  async function send(content: string, opts: { silent?: boolean; tagged?: string } = {}) {
    if (!provider.isReady) { toast("Configura prima un'AI dall'header"); return; }
    if (busy) return;
    const userMessage = opts.tagged ? `[${opts.tagged}] ${content}` : content;
    if (!opts.silent) s.addMessage({ role: "user", content: userMessage });
    s.addMessage({ role: "assistant", content: "" });
    setBusy(true);
    try {
      const msgsForApi = opts.silent
        ? [{ role: "user" as const, content: userMessage }]
        : useSocraticStore.getState().messages.filter((m) => m.role !== "assistant" || m.content);
      let full = "";
      for await (const chunk of provider.chatStream(msgsForApi, sys)) {
        full += chunk;
        s.appendToLast(chunk);
      }
      // intercetta tag <step_completed/>
      if (full.includes("<step_completed/>")) {
        s.incrementStep();
      }
    } catch (e: any) {
      s.appendToLast(`\n\n⚠️ Errore: ${e?.message || e}`);
      toast("Errore AI: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  const submit = () => {
    const v = input.trim();
    if (!v) return;
    setInput("");
    void send(v);
  };

  const conclude = async () => {
    if (!provider.isReady) return;
    const transcript = s.messages
      .map((m) => `${m.role === "user" ? "Studente" : "Tutor"}: ${m.content.replace(/<step_completed\/>/g, "").trim()}`)
      .join("\n\n");
    setBusy(true);
    setReport("Genero il report…");
    try {
      const out = await provider.complete(SOCRATIC_REPORT_PROMPT(transcript));
      setReport(out);
    } catch (e: any) {
      setReport("Errore: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const restart = () => { s.setSetup({ sourceText: s.sourceText, subject: s.subject, schoolLevel: s.schoolLevel }); setReport(""); };

  return (
    <div className="grid lg:grid-cols-[1fr,320px] gap-4">
      <div className="card p-4 flex flex-col h-[70vh]">
        <div className="mb-3"><ProgressBar steps={s.steps} /></div>
        <div ref={scrollRef} className="flex-1 overflow-auto space-y-3 pr-1">
          {s.messages.filter((m) => m.content && !(m.role === "user" && /^Inizia la sessione/.test(m.content))).map((m, i) => (
            <div key={i} className={`max-w-[85%] rounded-xl p-3 text-sm ${m.role === "user" ? "bubble-user ml-auto" : "bubble-ai"}`}>
              <div className="prose-mm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content.replace(/<step_completed\/>/g, "").trim() || "…"}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          <HintButtons disabled={busy} onHint={(tag) => send("aiuto richiesto", { tagged: tag })} />
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
              rows={2}
              placeholder="Scrivi il tuo tentativo… (Invio per inviare, Shift+Invio per andare a capo)"
              className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm resize-none"
            />
            <button onClick={submit} disabled={busy || !input.trim()} className="btn btn-primary self-stretch">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <aside className="space-y-3">
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Sessione</h3>
          <div className="text-sm text-neutral-500">Materia: <strong>{s.subject}</strong></div>
          <div className="text-sm text-neutral-500">Livello: <strong>{s.schoolLevel}</strong></div>
          <div className="flex gap-2 mt-3">
            <button onClick={restart} className="btn btn-outline text-sm"><RotateCcw className="w-4 h-4" /> Ricomincia</button>
            <button onClick={conclude} disabled={busy} className="btn btn-primary text-sm"><FileDown className="w-4 h-4" /> Concludi sessione</button>
          </div>
        </div>
        {report && (
          <div className="card p-4">
            <h3 className="font-semibold mb-2">Report</h3>
            <div className="prose-mm text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
            </div>
            <div className="mt-3">
              <ExportButtons
                title="Report sessione socratica"
                baseFilename="report-socratico"
                sections={[
                  { title: "Setup", body: `Materia: ${s.subject}\nLivello: ${s.schoolLevel}` },
                  { title: "Report", body: report },
                  { title: "Trascrizione", body: s.messages.map((m) => `${m.role === "user" ? "Studente" : "Tutor"}: ${m.content.replace(/<step_completed\/>/g, "")}`).join("\n\n") },
                ]}
              />
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
