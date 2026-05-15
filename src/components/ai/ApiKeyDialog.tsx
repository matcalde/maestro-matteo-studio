import { useState, useEffect } from "react";
import { useAiStore } from "@/store/aiStore";
import { X, Eye, EyeOff, ExternalLink, CheckCircle2, Loader2, Download, Trash2, Sparkles, KeyRound, HardDrive, ArrowLeft, Zap } from "lucide-react";
import { toast } from "@/lib/utils";

type View = "welcome" | "gemini" | "groq" | "webllm";

export default function ApiKeyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useAiStore();
  const [view, setView] = useState<View>("welcome");
  const [show, setShow] = useState(false);
  const [gemini, setGemini] = useState(s.geminiKey);
  const [groq, setGroq] = useState(s.groqKey);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setGemini(s.geminiKey);
    setGroq(s.groqKey);
    if (open) setView(s.kind === "none" ? "welcome" : (s.kind as View));
  }, [open, s.geminiKey, s.groqKey, s.kind]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const save = (kind: "gemini" | "groq") => {
    if (kind === "gemini") s.setKey("gemini", gemini.trim());
    else s.setKey("groq", groq.trim());
    s.setKind(kind);
    toast(`✓ ${kind === "gemini" ? "Gemini" : "Groq"} attivo`);
    onClose();
  };

  const test = async (kind: "gemini" | "groq") => {
    if (kind === "gemini") s.setKey("gemini", gemini.trim());
    else s.setKey("groq", groq.trim());
    s.setKind(kind);
    setTimeout(async () => {
      setTesting(true);
      try {
        const out = await useAiStore.getState().provider.complete("Rispondi solo con la parola: OK", "Sei un assistente.");
        if (out && out.toLowerCase().includes("ok")) toast("✓ Connessione OK");
        else toast("Risposta: " + out.slice(0, 60));
      } catch (e: any) {
        toast("Errore: " + (e?.message || e));
      } finally {
        setTesting(false);
      }
    }, 100);
  };

  const startWebLLM = async () => {
    try {
      toast("Avvio download modello… potrebbe richiedere qualche minuto");
      await s.loadWebLLM();
      toast("✓ Modello pronto, ora puoi usare l'app offline");
    } catch (e: any) {
      toast("Errore WebLLM: " + (e?.message || e));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-3xl flex flex-col overflow-hidden" style={{ maxHeight: "calc(100dvh - 2rem)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold">
            {view === "welcome" ? "👋 Benvenuto! Scegli come usare l'AI" : "Configura intelligenza artificiale"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium"
          >
            <X className="w-4 h-4" /> Chiudi
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
        {view === "welcome" && (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
              Maestro Matteo Studio è <strong>completamente gratuito</strong>. Non guadagno nulla e non pago nulla:
              l'AI gira o nel <strong>tuo</strong> account cloud (chiave gratuita Google/Groq) o direttamente nel <strong>tuo</strong> browser.
              <br />
              🔒 Niente passa dai miei server. Scegli il percorso più comodo:
            </p>

            <div className="grid md:grid-cols-3 gap-3">
              {/* WebLLM card */}
              <button onClick={() => setView("webllm")} className="card p-5 text-left hover:shadow-md hover:border-inclusive transition border-2 border-transparent">
                <div className="w-12 h-12 rounded-xl bg-inclusive/10 text-inclusive flex items-center justify-center mb-3">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">Offline nel browser</h3>
                  <span className="text-[10px] bg-inclusive/20 text-inclusive px-1.5 rounded">ZERO CHIAVI</span>
                </div>
                <p className="text-xs text-neutral-500 mb-2"><strong>Più facile in assoluto.</strong></p>
                <ul className="text-xs space-y-1 text-neutral-600 dark:text-neutral-400">
                  <li>✓ Nessuna registrazione, nessuna chiave</li>
                  <li>✓ Privacy totale, gira sul tuo PC</li>
                  <li>⚠️ Scarica ~1.5 GB la prima volta</li>
                  <li>⚠️ Serve Chrome/Edge recente</li>
                </ul>
                <div className="mt-3 text-xs text-inclusive font-semibold">Scegli questa →</div>
              </button>

              {/* Gemini card */}
              <button onClick={() => setView("gemini")} className="card p-5 text-left hover:shadow-md hover:border-primary transition border-2 border-transparent">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">Google Gemini</h3>
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded">CONSIGLIATO</span>
                </div>
                <p className="text-xs text-neutral-500 mb-2"><strong>Migliore qualità.</strong></p>
                <ul className="text-xs space-y-1 text-neutral-600 dark:text-neutral-400">
                  <li>✓ Gratuito (1500 richieste/giorno)</li>
                  <li>✓ Veloce, qualità alta</li>
                  <li>⚠️ ~2 min di setup (account Google)</li>
                </ul>
                <div className="mt-3 text-xs text-primary font-semibold">Crea chiave gratis →</div>
              </button>

              {/* Groq card */}
              <button onClick={() => setView("groq")} className="card p-5 text-left hover:shadow-md hover:border-secondary transition border-2 border-transparent">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">Groq</h3>
                  <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 rounded">VELOCE</span>
                </div>
                <p className="text-xs text-neutral-500 mb-2"><strong>Risposte rapidissime.</strong></p>
                <ul className="text-xs space-y-1 text-neutral-600 dark:text-neutral-400">
                  <li>✓ Gratuito, Llama 3.3 70B</li>
                  <li>✓ Velocità impressionante</li>
                  <li>⚠️ ~2 min di setup</li>
                </ul>
                <div className="mt-3 text-xs text-secondary font-semibold">Crea chiave gratis →</div>
              </button>
            </div>

            <div className="mt-5 text-xs text-neutral-500 text-center">
              Potrai cambiare provider in qualsiasi momento dal pulsante <KeyRound className="inline w-3 h-3" /> AI in alto.
            </div>
          </>
        )}

        {view !== "welcome" && (
          <button onClick={() => setView("welcome")} className="btn btn-ghost text-sm mb-3"><ArrowLeft className="w-4 h-4" /> Cambia metodo</button>
        )}

        {view === "gemini" && (
          <div className="space-y-3">
            <div className="rounded-xl bg-primary/5 border border-primary/30 p-4 text-sm space-y-2">
              <strong>Come ottenere la chiave gratuita Google Gemini (2 minuti)</strong>
              <ol className="list-decimal pl-5 space-y-1 text-xs">
                <li>Apri <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-primary underline inline-flex items-center gap-1">aistudio.google.com/apikey <ExternalLink className="w-3 h-3" /></a></li>
                <li>Accedi con il tuo account Google</li>
                <li>Clicca <strong>"Create API key"</strong> → poi <strong>"Create API key in new project"</strong></li>
                <li>Copia la chiave (inizia con <code className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded">AIza…</code>)</li>
                <li>Incollala qui sotto</li>
              </ol>
              <div className="text-xs text-neutral-500">La chiave resta nel tuo browser. Non passa dai miei server.</div>
            </div>
            <label className="text-sm font-medium">La tua API key Gemini</label>
            <div className="flex gap-2">
              <input
                type={show ? "text" : "password"}
                value={gemini}
                onChange={(e) => setGemini(e.target.value)}
                placeholder="AIza…"
                className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono text-sm"
              />
              <button onClick={() => setShow(!show)} className="btn btn-ghost">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-sm">
              <span className="text-neutral-500">Modello:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  { id: "gemini-2.5-flash", q: "200/g" },
                  { id: "gemini-2.0-flash", q: "200/g" },
                  { id: "gemini-2.0-flash-lite", q: "200/g, 30/min" },
                  { id: "gemini-2.5-flash-lite", q: "⚠️ 20/g" },
                ].map((m) => (
                  <button key={m.id} type="button" onClick={() => s.setModel("gemini", m.id)}
                    className={`px-2 py-1 text-xs rounded-lg border ${s.geminiModel === m.id ? "border-primary bg-primary/10 text-primary" : "border-neutral-300 dark:border-neutral-700"}`}>
                    {m.id} <span className="opacity-60">({m.q})</span>
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                Se uno è sovraccarico ("503 high demand"), prova un altro. Lite = più veloce, quota più alta.
              </div>
              <input
                value={s.geminiModel}
                onChange={(e) => s.setModel("gemini", e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono text-xs"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => save("gemini")} disabled={!gemini.trim()} className="btn btn-primary"><CheckCircle2 className="w-4 h-4" /> Salva e usa</button>
              <button onClick={() => test("gemini")} disabled={testing || !gemini.trim()} className="btn btn-outline">
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Test
              </button>
            </div>
          </div>
        )}

        {view === "groq" && (
          <div className="space-y-3">
            <div className="rounded-xl bg-secondary/5 border border-secondary/30 p-4 text-sm space-y-2">
              <strong>Come ottenere la chiave gratuita Groq (2 minuti)</strong>
              <ol className="list-decimal pl-5 space-y-1 text-xs">
                <li>Apri <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-secondary underline inline-flex items-center gap-1">console.groq.com/keys <ExternalLink className="w-3 h-3" /></a></li>
                <li>Registrati gratis (email o Google/GitHub)</li>
                <li>Clicca <strong>"Create API Key"</strong></li>
                <li>Copia la chiave (inizia con <code className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded">gsk_…</code>)</li>
                <li>Incollala qui sotto</li>
              </ol>
            </div>
            <label className="text-sm font-medium">La tua API key Groq</label>
            <div className="flex gap-2">
              <input
                type={show ? "text" : "password"}
                value={groq}
                onChange={(e) => setGroq(e.target.value)}
                placeholder="gsk_…"
                className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono text-sm"
              />
              <button onClick={() => setShow(!show)} className="btn btn-ghost">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer text-neutral-500">Avanzato: modello</summary>
              <input
                value={s.groqModel}
                onChange={(e) => s.setModel("groq", e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono text-xs"
              />
            </details>
            <div className="flex gap-2 pt-2">
              <button onClick={() => save("groq")} disabled={!groq.trim()} className="btn btn-primary"><CheckCircle2 className="w-4 h-4" /> Salva e usa</button>
              <button onClick={() => test("groq")} disabled={testing || !groq.trim()} className="btn btn-outline">
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Test
              </button>
            </div>
          </div>
        )}

        {view === "webllm" && (
          <div className="space-y-3">
            <div className="rounded-xl bg-inclusive/5 border border-inclusive/30 p-4 text-sm space-y-2">
              <strong>AI offline nel tuo browser — il modo più semplice</strong>
              <p className="text-xs">
                Clicca il pulsante qui sotto. L'app scarica un modello AI (circa <strong>1.5 GB</strong>) e da quel momento funziona <strong>tutto offline</strong>, senza chiavi e senza internet. Il modello resta nella cache del browser, scaricalo una volta sola.
              </p>
              <ul className="text-xs space-y-1 text-neutral-600 dark:text-neutral-400">
                <li>✅ Nessuna registrazione</li>
                <li>✅ Privacy totale: nessun dato esce dal tuo computer</li>
                <li>⚠️ Serve <strong>Chrome 113+</strong> o <strong>Edge 113+</strong> con WebGPU (la maggior parte dei PC degli ultimi 3 anni)</li>
                <li>⚠️ Funziona anche su Mac M1/M2/M3. Su mobile è sconsigliato.</li>
              </ul>
            </div>

            {s.webllmProgress === 0 && (
              <button onClick={startWebLLM} className="btn btn-primary w-full py-3 text-base">
                <Download className="w-5 h-5" /> Scarica modello e attiva AI (~1.5 GB)
              </button>
            )}

            {s.webllmProgress > 0 && s.webllmProgress < 1 && (
              <div className="card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm font-semibold">Download in corso… {(s.webllmProgress * 100).toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded">
                  <div className="h-3 bg-inclusive rounded transition-all" style={{ width: `${s.webllmProgress * 100}%` }} />
                </div>
                <div className="text-xs text-neutral-500">{s.webllmStatus}</div>
                <div className="text-xs text-neutral-500">Puoi continuare a usare il browser, ma non chiudere questa scheda.</div>
              </div>
            )}

            {s.webllmProgress >= 1 && (
              <div className="card p-4 flex items-center gap-3 border-inclusive/40">
                <CheckCircle2 className="w-6 h-6 text-inclusive" />
                <div>
                  <div className="font-semibold">Modello pronto!</div>
                  <div className="text-xs text-neutral-500">Ora puoi usare tutti gli strumenti dell'app, anche offline.</div>
                </div>
                <div className="flex-1" />
                <button onClick={onClose} className="btn btn-primary">Inizia</button>
              </div>
            )}

            <details className="text-xs">
              <summary className="cursor-pointer text-neutral-500">Avanzato: cambia modello</summary>
              <input
                value={s.webllmModel}
                onChange={(e) => s.setModel("webllm", e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono text-xs"
              />
              <div className="mt-1 text-neutral-500">Default: <code>Llama-3.2-3B-Instruct-q4f16_1-MLC</code> (3 GB di RAM richiesta)</div>
            </details>
          </div>
        )}

        </div>

        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap justify-between gap-2 items-center">
          <button
            onClick={() => { if (confirm("Cancello chiavi e dati salvati di Maestro Matteo Studio. Procedere?")) { s.clearAll(); toast("Tutto cancellato"); onClose(); } }}
            className="btn btn-ghost text-red-600 text-xs">
            <Trash2 className="w-4 h-4" /> Cancella tutto
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-neutral-500 hidden sm:inline">
              <kbd className="px-1 border border-neutral-300 dark:border-neutral-700 rounded">Esc</kbd> per chiudere
            </span>
            <button onClick={onClose} className="btn btn-primary">
              <X className="w-4 h-4" /> Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
