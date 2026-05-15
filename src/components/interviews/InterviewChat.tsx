import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2, Volume2, VolumeX, BookOpen, X, FileDown } from "lucide-react";
import { useInterviewsStore } from "@/store/interviewsStore";
import { useAiStore } from "@/store/aiStore";
import { CHARACTER_SYSTEM_PROMPT } from "@/lib/ai/prompts/characters";
import { createTTS, listItalianVoices, waitForVoices } from "@/lib/tts";
import { speakNeural, type NeuralSpeakHandle } from "@/lib/neuralTts";
import { useTtsStore } from "@/store/ttsStore";
import { toast } from "@/lib/utils";
import ExportButtons from "@/components/shared/ExportButtons";

export default function InterviewChat() {
  const s = useInterviewsStore();
  const provider = useAiStore((x) => x.provider);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const ttsRef = useRef<ReturnType<typeof createTTS> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>(() => localStorage.getItem("mm_tts_voice") || "");

  useEffect(() => {
    waitForVoices().then(() => {
      const vs = listItalianVoices();
      setVoices(vs);
      if (!voiceURI && vs[0]) setVoiceURI(vs[0].voiceURI);
    });
  }, []);

  useEffect(() => { if (voiceURI) localStorage.setItem("mm_tts_voice", voiceURI); }, [voiceURI]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [s.messages.length, s.messages[s.messages.length - 1]?.content]);

  useEffect(() => {
    if (!provider.isReady) return;
    if (!s.active) return;
    if (s.messages.length > 0) return;
    if (startedRef.current === s.active.id) return;
    startedRef.current = s.active.id;
    void send("Presentati e chiedi cosa vuole sapere lo studente.", { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider.isReady, s.active?.id]);

  if (!s.active) return null;
  const sys = CHARACTER_SYSTEM_PROMPT(s.active, s.knowledgeBase);

  async function send(content: string, opts: { silent?: boolean } = {}) {
    if (!provider.isReady) { toast("Configura prima un'AI dall'header"); return; }
    if (busy) return;
    if (!opts.silent) s.addMessage({ role: "user", content });
    s.addMessage({ role: "assistant", content: "" });
    setBusy(true);
    try {
      const msgs = opts.silent
        ? [{ role: "user" as const, content }]
        : useInterviewsStore.getState().messages.filter((m) => m.role !== "assistant" || m.content);
      for await (const chunk of provider.chatStream(msgs, sys)) {
        s.appendToLast(chunk);
      }
    } catch (e: any) {
      s.appendToLast(`\n\n⚠️ Errore: ${e?.message || e}`);
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

  const neuralRef = useRef<NeuralSpeakHandle | null>(null);
  const tts = useTtsStore();

  const speak = async (text: string, idx: number) => {
    ttsRef.current?.stop();
    neuralRef.current?.stop();
    if (speakingIdx === idx) { setSpeakingIdx(null); return; }
    if (tts.engine === "neural") {
      if (!tts.openaiKey) {
        toast("Configura chiave OpenAI nelle impostazioni voce (InclusivAI o crea da menu)");
        return;
      }
      setSpeakingIdx(idx);
      try {
        neuralRef.current = await speakNeural(text, {
          voice: tts.neuralVoice,
          model: tts.neuralModel,
          instructions: tts.neuralInstructions,
          onEnd: () => setSpeakingIdx(null),
        });
      } catch (e: any) {
        toast("Errore OpenAI TTS: " + (e?.message || e));
        setSpeakingIdx(null);
      }
    } else {
      const handle = createTTS(text, { lang: "it-IT", voiceURI, onEnd: () => setSpeakingIdx(null) });
      ttsRef.current = handle;
      handle.start();
      setSpeakingIdx(idx);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr,360px] gap-4">
      <div className="card overflow-hidden flex flex-col h-[75vh]">
        <div className={`bg-gradient-to-br ${s.active.gradient} p-4 flex items-center gap-3`}>
          <span className="text-4xl">{s.active.emoji}</span>
          <div>
            <div className="font-bold text-lg">{s.active.name}</div>
            <div className="text-xs opacity-80">{s.active.era}</div>
          </div>
          <div className="flex-1" />
          <button onClick={() => setDiaryOpen(true)} className="btn btn-ghost bg-white/40 dark:bg-black/40"><BookOpen className="w-4 h-4" /> Diario</button>
          <button onClick={() => s.reset()} className="btn btn-ghost bg-white/40 dark:bg-black/40"><X className="w-4 h-4" /></button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-3">
          {s.messages.filter((m, i) => m.content && !(i === 0 && m.role === "user" && /^Presentati/.test(m.content))).map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl p-3 text-sm ${m.role === "user" ? "bubble-user" : "bubble-ai"}`}>
                <div className="prose-mm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || "…"}</ReactMarkdown>
                </div>
                {m.role === "assistant" && m.content && (
                  <button onClick={() => speak(m.content, i)} className="mt-1 text-xs opacity-70 hover:opacity-100 inline-flex items-center gap-1">
                    {speakingIdx === i ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    {speakingIdx === i ? "Stop" : "Ascolta"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            rows={2}
            placeholder={`Fai una domanda a ${s.active.name}…`}
            className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm resize-none"
          />
          <button onClick={submit} disabled={busy || !input.trim()} className="btn btn-primary self-stretch">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <aside className="space-y-3">
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Identità</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{s.active.identity}</p>
          <div className="text-xs mt-2 text-neutral-500"><strong>Tone:</strong> {s.active.tone}</div>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-2">📓 Diario dell'intervista</h3>
          <textarea
            value={s.diary}
            onChange={(e) => s.setDiary(e.target.value)}
            rows={8}
            placeholder="Annota qui le cose che vuoi ricordare…"
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm"
          />
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-2"><FileDown className="inline w-4 h-4" /> Esporta intervista</h3>
          <ExportButtons
            title={`Intervista con ${s.active.name}`}
            baseFilename={`intervista-${s.active.id}`}
            sections={[
              { title: "Personaggio", body: `${s.active.name} — ${s.active.era}\n${s.active.role}` },
              { title: "Conversazione", body: s.messages.map((m) => `${m.role === "user" ? "Studente" : s.active!.name}: ${m.content}`).join("\n\n") },
              { title: "Diario", body: s.diary || "(vuoto)" },
            ]}
          />
        </div>
      </aside>

      {diaryOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setDiaryOpen(false)}>
          <div className="card p-4 w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">📓 Diario</h3>
              <button onClick={() => setDiaryOpen(false)} className="btn btn-ghost p-2"><X className="w-4 h-4" /></button>
            </div>
            <textarea
              value={s.diary}
              onChange={(e) => s.setDiary(e.target.value)}
              rows={14}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
