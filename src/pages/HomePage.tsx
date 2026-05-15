import { Link } from "react-router-dom";
import { Shield, Sparkles, KeyRound, Wand2, Download, HardDrive, Zap } from "lucide-react";
import { useAiStore } from "@/store/aiStore";

const tools = [
  { to: "/socratico", emoji: "🦉", color: "bg-socratic/10 text-socratic border-socratic/30", title: "Tutor Socratico", desc: "L'AI guida lo studente alla scoperta autonoma, senza mai dare la risposta diretta. Suggerimenti progressivi e report finale." },
  { to: "/interviste", emoji: "🎭", color: "bg-interviews/10 text-interviews border-interviews/30", title: "Interviste Impossibili", desc: "Conversa con Galileo, Ada Lovelace, Marie Curie e altri — o crea il tuo personaggio. Con voce ad alta voce." },
  { to: "/inclusivai", emoji: "♿", color: "bg-inclusive/10 text-inclusive border-inclusive/30", title: "InclusivAI", desc: "Testo semplificato per BES/DSA, glossario interattivo, 3 test a difficoltà crescente. Esporta tutto in ZIP." },
];

const faqs = [
  { q: "L'app costa qualcosa?", a: "No. È gratis sia per chi la usa sia per me che la mantengo. Niente account, niente tracking, niente pubblicità." },
  { q: "Perché devo configurare un'AI?", a: "Perché l'app non ha un server: l'intelligenza artificiale gira o nel tuo browser (WebLLM, zero chiavi) oppure nel tuo account Google/Groq gratuito. In entrambi i casi non passa nulla da me — così rimane gratis per tutti." },
  { q: "Qual è il modo più semplice?", a: "WebLLM: clicca \"Scarica modello\" nel pulsante AI in alto, aspetta il download (~1.5 GB, una volta sola), e da quel momento usi tutto senza chiavi né internet. Funziona su Chrome/Edge aggiornati." },
  { q: "Come ottengo una chiave Gemini gratis?", a: "Vai su aistudio.google.com/apikey, accedi con Google, clicca \"Create API key\". Incollala nel pulsante AI dell'app. Hai 1500 richieste gratis al giorno." },
  { q: "Le mie chiavi e i miei testi sono al sicuro?", a: "Sì. Restano tutte nel tuo browser (localStorage). Niente database, niente proxy. Le chiamate AI partono direttamente dal tuo browser verso Google/Groq, oppure non partono affatto se usi WebLLM." },
  { q: "Posso usarlo a scuola?", a: "Sì, è pensato per questo. Nessun account per gli studenti, nessuna pubblicità, niente raccolta dati. Per la classe consiglio Gemini sul tablet del docente, o WebLLM su un laptop scolastico." },
];

export default function HomePage({ onOpenAi }: { onOpenAi: () => void }) {
  const isReady = useAiStore((s) => s.provider.isReady);
  const kind = useAiStore((s) => s.kind);

  return (
    <div className="max-w-app mx-auto px-4 py-8 space-y-12">
      <section className="text-center space-y-4 pt-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Tre strumenti AI per una <span className="text-primary">didattica viva</span>
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Zero registrazione · Zero costi · Zero tracking. L'AI potenzia il pensiero — non lo sostituisce.
        </p>
        <div className="inline-flex items-center gap-2 text-sm rounded-full px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <Shield className="w-4 h-4 text-emerald-600" />
          I tuoi materiali e le tue chiavi API restano nel tuo browser.
        </div>
      </section>

      {/* PRIMO STEP: scelta AI */}
      {!isReady && (
        <section className="card border-2 border-primary/40 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Prima cosa: attiva l'AI (1 click o 2 minuti)</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Maestro Matteo Studio è gratuito e <strong>non ha un server</strong>. Per usarlo serve un'AI che giri da qualche parte: o nel <strong>tuo</strong> browser, o nel <strong>tuo</strong> account gratuito Google/Groq. Scegli il percorso che preferisci:
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <button onClick={onOpenAi} className="card p-4 text-left hover:shadow-md hover:border-inclusive transition border-2 border-transparent">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-5 h-5 text-inclusive" />
                <h3 className="font-bold">Offline nel browser</h3>
                <span className="text-[10px] bg-inclusive/20 text-inclusive px-1.5 rounded">PIÙ FACILE</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Clicca, scarica una volta (~1.5 GB), poi funziona anche senza internet. Zero chiavi, zero account.</p>
            </button>

            <button onClick={onOpenAi} className="card p-4 text-left hover:shadow-md hover:border-primary transition border-2 border-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Gemini gratuita</h3>
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded">CONSIGLIATO</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Crea una chiave gratuita Google in 2 min. 1500 richieste/giorno gratis. Qualità più alta.</p>
            </button>

            <button onClick={onOpenAi} className="card p-4 text-left hover:shadow-md hover:border-secondary transition border-2 border-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-secondary" />
                <h3 className="font-bold">Groq velocissima</h3>
                <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 rounded">RAPIDA</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Chiave gratuita in 2 min. Llama 3.3 70B, risposte fulminee.</p>
            </button>
          </div>

          <button onClick={onOpenAi} className="btn btn-primary w-full sm:w-auto">
            <KeyRound className="w-4 h-4" /> Configura ora (porta paziente 60s)
          </button>
        </section>
      )}

      {isReady && (
        <section className="text-center">
          <div className="inline-flex items-center gap-2 text-sm rounded-full px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
            ✓ AI attiva ({kind === "gemini" ? "Google Gemini" : kind === "groq" ? "Groq" : "WebLLM offline"}). Scegli uno strumento qui sotto.
          </div>
        </section>
      )}

      <section className="grid md:grid-cols-3 gap-4">
        {tools.map((t) => (
          <Link key={t.to} to={t.to} className="card p-6 hover:shadow-md transition flex flex-col gap-3">
            <div className={`w-12 h-12 rounded-xl border-2 ${t.color} flex items-center justify-center text-2xl`}>{t.emoji}</div>
            <h3 className="text-xl font-bold">{t.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 flex-1">{t.desc}</p>
            <span className="text-primary font-medium text-sm">Apri →</span>
          </Link>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Come funziona</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="card p-4 text-center"><KeyRound className="w-8 h-8 mx-auto text-primary mb-2" /><h3 className="font-semibold">1. Attiva l'AI</h3><p className="text-sm text-neutral-500">Una scelta una volta sola: WebLLM (offline), Gemini o Groq.</p></div>
          <div className="card p-4 text-center"><Wand2 className="w-8 h-8 mx-auto text-secondary mb-2" /><h3 className="font-semibold">2. Scegli uno strumento</h3><p className="text-sm text-neutral-500">Socratico, Interviste o InclusivAI.</p></div>
          <div className="card p-4 text-center"><Download className="w-8 h-8 mx-auto text-inclusive mb-2" /><h3 className="font-semibold">3. Lavora e scarica</h3><p className="text-sm text-neutral-500">PDF, Word, ZIP. Tutto è tuo.</p></div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Domande frequenti</h2>
        <div className="space-y-2 max-w-3xl mx-auto">
          {faqs.map((f, i) => (
            <details key={i} className="card p-4">
              <summary className="font-semibold cursor-pointer flex gap-2 items-center"><Sparkles className="w-4 h-4 text-primary" /> {f.q}</summary>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
