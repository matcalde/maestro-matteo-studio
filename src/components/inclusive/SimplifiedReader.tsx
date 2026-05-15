import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Type, Minus, Plus, Sun, Moon, Coffee, Play, Pause, Square, Highlighter, Info, Sparkles, Download, Loader2 } from "lucide-react";
import { createTTS, listItalianVoices, waitForVoices } from "@/lib/tts";
import { speakNeural, type NeuralSpeakHandle, OPENAI_VOICES, OPENAI_MODELS } from "@/lib/neuralTts";
import { useTtsStore } from "@/store/ttsStore";
import { toast } from "@/lib/utils";

type Bg = "white" | "cream" | "dark";

export default function SimplifiedReader({ text }: { text: string }) {
  const [font, setFont] = useState<"sans" | "read" | "dys">("read");
  const [size, setSize] = useState(18);
  const [lh, setLh] = useState<"tight" | "normal" | "loose">("normal");
  const [tracking, setTracking] = useState<"normal" | "wide">("normal");
  const [bg, setBg] = useState<Bg>("white");
  const [highlight, setHighlight] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [wordIdx, setWordIdx] = useState<number>(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>(() => localStorage.getItem("mm_tts_voice") || "");
  const ttsRef = useRef<ReturnType<typeof createTTS> | null>(null);
  const neuralRef = useRef<NeuralSpeakHandle | null>(null);
  const tts = useTtsStore();

  useEffect(() => {
    waitForVoices().then(() => {
      const v = listItalianVoices();
      setVoices(v);
      if (!voiceURI && v[0]) setVoiceURI(v[0].voiceURI);
    });
  }, []);

  useEffect(() => {
    if (voiceURI) localStorage.setItem("mm_tts_voice", voiceURI);
  }, [voiceURI]);

  const bestQuality = voices[0];
  const isLowQuality = bestQuality && /espeak|festival/i.test(bestQuality.name);
  const isEdge = /Edg\//.test(navigator.userAgent);

  const plain = useMemo(() => text.replace(/\*\*|__|\*|_|#+|`/g, ""), [text]);

  const bgClass =
    bg === "white" ? "bg-white text-neutral-900" :
    bg === "cream" ? "bg-amber-50 text-neutral-900" :
    "bg-neutral-900 text-amber-50";

  const lhClass = lh === "tight" ? "leading-snug" : lh === "loose" ? "leading-loose" : "leading-relaxed";
  const trClass = tracking === "wide" ? "tracking-wide" : "";
  const fontClass = font === "sans" ? "" : font === "dys" ? "font-dys" : "font-read";

  const onWord = (charIdx: number) => {
    // approx: indice parola = posizione carattere
    const upto = plain.slice(0, charIdx);
    const wIdx = upto.split(/\s+/).length - 1;
    setWordIdx(wIdx);
  };

  const start = async () => {
    ttsRef.current?.stop();
    neuralRef.current?.stop();
    if (tts.engine === "neural") {
      if (!tts.openaiKey) {
        toast("Configura prima chiave OpenAI per la voce neurale");
        return;
      }
      setPlaying(true); setPaused(false);
      try {
        neuralRef.current = await speakNeural(plain, {
          voice: tts.neuralVoice,
          model: tts.neuralModel,
          instructions: tts.neuralInstructions,
          onEnd: () => { setPlaying(false); setPaused(false); },
        });
      } catch (e: any) {
        toast("Errore OpenAI TTS: " + (e?.message || e));
        setPlaying(false); setPaused(false);
      }
    } else {
      const handle = createTTS(plain, { rate, voiceURI, onWord: (i) => onWord(i), onEnd: () => { setPlaying(false); setPaused(false); setWordIdx(-1); } });
      ttsRef.current = handle;
      handle.start();
      setPlaying(true); setPaused(false);
    }
  };
  const togglePause = () => {
    if (tts.engine === "neural") {
      if (!neuralRef.current) return;
      if (paused) { neuralRef.current.resume(); setPaused(false); }
      else { neuralRef.current.pause(); setPaused(true); }
    } else {
      if (!ttsRef.current) return;
      if (paused) { ttsRef.current.resume(); setPaused(false); }
      else { ttsRef.current.pause(); setPaused(true); }
    }
  };
  const stop = () => {
    ttsRef.current?.stop();
    neuralRef.current?.stop();
    setPlaying(false); setPaused(false); setWordIdx(-1);
  };

  useEffect(() => () => { ttsRef.current?.stop(); neuralRef.current?.stop(); }, []);

  // render con highlight per parole se attivo
  const renderHighlighted = () => {
    const words = plain.split(/(\s+)/);
    let wi = -1;
    return words.map((w, i) => {
      const isWord = !/^\s+$/.test(w);
      if (isWord) wi++;
      const active = highlight && wi === wordIdx && isWord;
      return <span key={i} className={active ? "word-hl" : ""}>{w}</span>;
    });
  };

  return (
    <div className="space-y-3">
      <div className="card p-3 flex flex-wrap gap-2 items-center text-sm">
        <span className="text-neutral-500 mr-2">Font:</span>
        <button onClick={() => setFont("sans")} className={`btn btn-outline ${font === "sans" ? "ring-2 ring-primary" : ""}`}><Type className="w-3 h-3" /> Sistema</button>
        <button onClick={() => setFont("read")} className={`btn btn-outline ${font === "read" ? "ring-2 ring-primary" : ""}`}>Atkinson</button>
        <button onClick={() => setFont("dys")} className={`btn btn-outline ${font === "dys" ? "ring-2 ring-primary" : ""}`}>OpenDyslexic</button>

        <span className="text-neutral-500 ml-3">Testo:</span>
        <button onClick={() => setSize(Math.max(14, size - 2))} className="btn btn-outline"><Minus className="w-3 h-3" /></button>
        <span className="w-6 text-center">{size}</span>
        <button onClick={() => setSize(Math.min(32, size + 2))} className="btn btn-outline"><Plus className="w-3 h-3" /></button>

        <span className="text-neutral-500 ml-3">Interlinea:</span>
        <select value={lh} onChange={(e) => setLh(e.target.value as any)} className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent">
          <option value="tight">stretta</option><option value="normal">normale</option><option value="loose">ampia</option>
        </select>

        <span className="text-neutral-500 ml-3">Spaziatura:</span>
        <select value={tracking} onChange={(e) => setTracking(e.target.value as any)} className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent">
          <option value="normal">normale</option><option value="wide">espansa</option>
        </select>

        <span className="text-neutral-500 ml-3">Sfondo:</span>
        <button onClick={() => setBg("white")} className={`btn btn-outline ${bg === "white" ? "ring-2 ring-primary" : ""}`}><Sun className="w-3 h-3" /></button>
        <button onClick={() => setBg("cream")} className={`btn btn-outline ${bg === "cream" ? "ring-2 ring-primary" : ""}`}><Coffee className="w-3 h-3" /></button>
        <button onClick={() => setBg("dark")} className={`btn btn-outline ${bg === "dark" ? "ring-2 ring-primary" : ""}`}><Moon className="w-3 h-3" /></button>
      </div>

      <div className="card p-3 space-y-2 text-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-neutral-500">Motore voce:</span>
          <button onClick={() => tts.setEngine("system")} className={`btn btn-outline ${tts.engine === "system" ? "ring-2 ring-primary" : ""}`}>Sistema (gratis)</button>
          <button onClick={() => tts.setEngine("neural")} className={`btn btn-outline ${tts.engine === "neural" ? "ring-2 ring-primary" : ""}`}>
            <Sparkles className="w-4 h-4 text-primary" /> OpenAI TTS (premium)
          </button>
        </div>

        {tts.engine === "neural" && !tts.openaiKey && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2 text-xs">
            <div><strong>Voce neurale OpenAI</strong> — le stesse di openai.fm. Qualità eccezionale, italiano nativo, voci umane.</div>
            <div className="text-neutral-600 dark:text-neutral-400">
              ⚠️ A pagamento (a carico tuo, BYOK). Costo basso: ~<strong>$0.001 per 1000 caratteri</strong> con <code>gpt-4o-mini-tts</code>.
              Ottieni chiave su <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-primary underline">platform.openai.com/api-keys</a> (serve metodo pagamento OpenAI).
            </div>
            <input
              type="password"
              placeholder="sk-…"
              onChange={(e) => tts.setOpenaiKey(e.target.value.trim())}
              className="w-full px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono text-xs"
            />
          </div>
        )}

        {tts.engine === "neural" && tts.openaiKey && (
          <div className="space-y-2 text-xs">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-neutral-500">Voce:</span>
              <select value={tts.neuralVoice} onChange={(e) => tts.setNeuralVoice(e.target.value)} className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs">
                {OPENAI_VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
              <span className="text-neutral-500 ml-2">Modello:</span>
              <select value={tts.neuralModel} onChange={(e) => tts.setNeuralModel(e.target.value)} className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs">
                {OPENAI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            {tts.neuralModel === "gpt-4o-mini-tts" && (
              <div>
                <label className="text-neutral-500">Istruzioni stile (solo gpt-4o-mini-tts):</label>
                <textarea
                  value={tts.neuralInstructions}
                  onChange={(e) => tts.setNeuralInstructions(e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs"
                />
              </div>
            )}
            <details>
              <summary className="cursor-pointer text-neutral-500">Cambia chiave OpenAI</summary>
              <input
                type="password"
                value={tts.openaiKey}
                onChange={(e) => tts.setOpenaiKey(e.target.value.trim())}
                className="mt-1 w-full px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono text-xs"
              />
            </details>
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center">
          {!playing ? (
            <button onClick={start} className="btn btn-primary"><Play className="w-4 h-4" /> Leggi ad alta voce</button>
          ) : (
            <>
              <button onClick={togglePause} className="btn btn-outline">{paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />} {paused ? "Riprendi" : "Pausa"}</button>
              <button onClick={stop} className="btn btn-outline"><Square className="w-4 h-4" /> Stop</button>
            </>
          )}
          {tts.engine === "system" && (
            <>
              <span className="text-neutral-500 ml-2">Velocità:</span>
              <input type="range" min={0.6} max={1.6} step={0.1} value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} />
              <span className="w-10 text-center">{rate.toFixed(1)}x</span>
              <button onClick={() => setHighlight(!highlight)} className={`btn btn-outline ml-3 ${highlight ? "ring-2 ring-primary" : ""}`}><Highlighter className="w-4 h-4" /> Evidenzia lettura</button>
            </>
          )}
        </div>
        {tts.engine === "system" && (<>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-neutral-500">Voce:</span>
          <select
            value={voiceURI}
            onChange={(e) => setVoiceURI(e.target.value)}
            className="flex-1 min-w-[200px] max-w-md px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs"
          >
            {voices.length === 0 && <option>Caricamento voci…</option>}
            {voices.map((v) => {
              const isPremium = /neural|online|premium|enhanced|natural/i.test(v.name);
              const isPoor = /espeak|festival/i.test(v.name);
              return (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {isPremium ? "⭐ " : ""}{v.name} ({v.lang}){isPoor ? " — bassa qualità" : ""}
                </option>
              );
            })}
          </select>
        </div>
        {!isEdge && isLowQuality && (
          <div className="text-xs flex gap-2 items-start bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2 rounded-lg">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              Voci di sistema di bassa qualità rilevate. Per voci italiane molto più naturali (Elsa, Isabella, Giuseppe, Diego),
              apri quest'app in <strong>Microsoft Edge</strong>: ha voci "Neural" gratuite incluse. Su Windows/Mac va benissimo, anche senza account.
            </div>
          </div>
        )}
        {!isEdge && !isLowQuality && voices.length > 0 && !/neural|online/i.test(voices[0]?.name || "") && (
          <div className="text-xs text-neutral-500">
            💡 In <strong>Microsoft Edge</strong> trovi anche voci italiane neurali (Elsa, Isabella, Diego…) di qualità ancora superiore. Oppure scegli "Neurale" qui sopra: gira offline e funziona ovunque.
          </div>
        )}
        </>)}
      </div>

      <div className={`rounded-xl p-6 read-mode ${fontClass} ${lhClass} ${trClass} ${bgClass}`} style={{ fontSize: size }}>
        {highlight && playing ? (
          <div>{renderHighlighted()}</div>
        ) : (
          <div className="prose-mm" style={{ fontSize: size }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
