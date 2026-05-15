// Neural TTS via OpenAI API — stesso motore di openai.fm.
// DECISION: BYOK (chiave OpenAI utente). Costi a carico utente (~$0.001 / 1k caratteri con gpt-4o-mini-tts).
// Voci multilingue, italiano nativo eccellente. Audio MP3 via fetch standard.

export interface NeuralLoadProgress { progress: number; status: string; file?: string; }
export interface NeuralSpeakHandle { stop: () => void; pause: () => void; resume: () => void; }

export const OPENAI_VOICES = [
  { id: "alloy", label: "Alloy (neutra)" },
  { id: "ash", label: "Ash (maschile, calda)" },
  { id: "ballad", label: "Ballad (espressiva)" },
  { id: "coral", label: "Coral (femminile, calda)" },
  { id: "echo", label: "Echo (maschile, chiara)" },
  { id: "fable", label: "Fable (narrativa)" },
  { id: "nova", label: "Nova (femminile, brillante)" },
  { id: "onyx", label: "Onyx (maschile, profonda)" },
  { id: "sage", label: "Sage (calma)" },
  { id: "shimmer", label: "Shimmer (femminile, dolce)" },
  { id: "verse", label: "Verse (espressiva)" },
];

export const OPENAI_MODELS = [
  { id: "gpt-4o-mini-tts", label: "gpt-4o-mini-tts (economico, $0.60/1M token)" },
  { id: "tts-1", label: "tts-1 (veloce, $15/1M char)" },
  { id: "tts-1-hd", label: "tts-1-hd (alta qualità, $30/1M char)" },
];

const KEY_LS = "mm_openai_key";

export function getOpenAIKey(): string { return localStorage.getItem(KEY_LS) || ""; }
export function setOpenAIKey(k: string) { localStorage.setItem(KEY_LS, k); }
export function isNeuralReady(): boolean { return !!getOpenAIKey(); }

let currentAudio: HTMLAudioElement | null = null;
let stopFlag = false;

interface SpeakOpts {
  voice?: string;
  model?: string;
  instructions?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export async function speakNeural(text: string, opts: SpeakOpts = {}): Promise<NeuralSpeakHandle> {
  const key = getOpenAIKey();
  if (!key) throw new Error("Chiave OpenAI non configurata");

  stopFlag = false;
  const voice = opts.voice || "coral";
  const model = opts.model || "gpt-4o-mini-tts";
  const chunks = chunkText(text, 3000); // OpenAI accetta fino a 4096 char per chiamata
  let started = false;

  (async () => {
    for (const c of chunks) {
      if (stopFlag) break;
      try {
        const body: any = { model, voice, input: c, response_format: "mp3" };
        if (opts.instructions && model === "gpt-4o-mini-tts") body.instructions = opts.instructions;
        const res = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`OpenAI ${res.status}: ${errText.slice(0, 200)}`);
        }
        if (stopFlag) break;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = new Audio(url);
        currentAudio = a;
        if (!started) { started = true; opts.onStart?.(); }
        await new Promise<void>((resolve) => {
          a.onended = () => { URL.revokeObjectURL(url); resolve(); };
          a.onerror = () => { URL.revokeObjectURL(url); resolve(); };
          a.play().catch(() => resolve());
        });
      } catch (e) {
        console.error("OpenAI TTS error:", e);
        throw e;
      }
    }
    opts.onEnd?.();
  })().catch((e) => {
    opts.onEnd?.();
    throw e;
  });

  return {
    stop: () => { stopFlag = true; if (currentAudio) { currentAudio.pause(); currentAudio = null; } opts.onEnd?.(); },
    pause: () => { currentAudio?.pause(); },
    resume: () => { currentAudio?.play(); },
  };
}

export async function testOpenAITTS(key: string): Promise<boolean> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice: "coral", input: "Test." }),
  });
  return res.ok;
}

function chunkText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const sentences = text.split(/(?<=[.!?])\s+/);
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).trim().length > maxLen && buf) {
      out.push(buf.trim());
      buf = s;
    } else {
      buf = buf ? buf + " " + s : s;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}
