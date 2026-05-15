// Web Speech API wrapper con scelta voce italiana (ordinate per qualità).

export interface TTSHandle {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (r: number) => void;
}

// Heuristica qualità: voci "Neural", "Online", "Premium", "Enhanced" sono nettamente migliori
function voiceQualityScore(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  let s = 0;
  // Google preferito (qualità migliore lato Chrome/Android)
  if (n.includes("google")) s += 150;
  if (n.includes("neural")) s += 100;
  if (n.includes("online")) s += 50;
  if (n.includes("premium")) s += 40;
  if (n.includes("enhanced")) s += 30;
  if (n.includes("natural")) s += 25;
  if (n.includes("multilingual")) s += 10;
  // Voci Microsoft Edge online (Elsa, Isabella, Giuseppe, Diego, ecc.)
  if (n.includes("elsa") || n.includes("isabella") || n.includes("giuseppe") || n.includes("diego") || n.includes("benigno") || n.includes("calimero") || n.includes("cataldo") || n.includes("fabiola") || n.includes("imelda") || n.includes("irma") || n.includes("lisandro") || n.includes("palmira") || n.includes("pierina") || n.includes("rinaldo")) s += 30;
  // Penalizza voci eSpeak (qualità infima)
  if (n.includes("espeak")) s -= 50;
  return s;
}

export function listItalianVoices(): SpeechSynthesisVoice[] {
  const all = speechSynthesis.getVoices();
  const it = all.filter((v) => v.lang?.toLowerCase().startsWith("it"));
  return it.sort((a, b) => voiceQualityScore(b) - voiceQualityScore(a));
}

export function getBestItalianVoice(preferredURI?: string): SpeechSynthesisVoice | undefined {
  const voices = listItalianVoices();
  if (preferredURI) {
    const found = voices.find((v) => v.voiceURI === preferredURI);
    if (found) return found;
  }
  return voices[0];
}

let voicesReadyPromise: Promise<void> | null = null;
export function waitForVoices(): Promise<void> {
  if (voicesReadyPromise) return voicesReadyPromise;
  voicesReadyPromise = new Promise((resolve) => {
    if (speechSynthesis.getVoices().length > 0) return resolve();
    const handler = () => {
      if (speechSynthesis.getVoices().length > 0) {
        speechSynthesis.removeEventListener("voiceschanged", handler);
        resolve();
      }
    };
    speechSynthesis.addEventListener("voiceschanged", handler);
    // fallback timeout
    setTimeout(() => resolve(), 1500);
  });
  return voicesReadyPromise;
}

export function createTTS(text: string, opts: { lang?: string; rate?: number; voiceURI?: string; onWord?: (i: number, l: number) => void; onEnd?: () => void } = {}): TTSHandle {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = opts.lang || "it-IT";
  u.rate = opts.rate ?? 1;
  u.pitch = 1;

  const v = getBestItalianVoice(opts.voiceURI);
  if (v) u.voice = v;

  u.onboundary = (ev: SpeechSynthesisEvent) => {
    if (ev.name === "word" || (ev as any).name === undefined) {
      opts.onWord?.(ev.charIndex, (ev as any).charLength || 0);
    }
  };
  u.onend = () => opts.onEnd?.();

  return {
    start: () => { speechSynthesis.cancel(); speechSynthesis.speak(u); },
    pause: () => speechSynthesis.pause(),
    resume: () => speechSynthesis.resume(),
    stop: () => speechSynthesis.cancel(),
    setRate: (r) => { u.rate = r; },
  };
}
