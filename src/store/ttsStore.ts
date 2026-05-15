import { create } from "zustand";
import { getOpenAIKey, setOpenAIKey, isNeuralReady } from "@/lib/neuralTts";

type Engine = "system" | "neural";

interface TtsState {
  engine: Engine;
  neuralVoice: string;
  neuralModel: string;
  neuralInstructions: string;
  openaiKey: string;
  setEngine: (e: Engine) => void;
  setNeuralVoice: (v: string) => void;
  setNeuralModel: (m: string) => void;
  setNeuralInstructions: (i: string) => void;
  setOpenaiKey: (k: string) => void;
  isReady: () => boolean;
}

export const useTtsStore = create<TtsState>((set, get) => ({
  engine: (localStorage.getItem("mm_tts_engine") as Engine) || "system",
  neuralVoice: localStorage.getItem("mm_tts_neural_voice") || "coral",
  neuralModel: localStorage.getItem("mm_tts_neural_model") || "gpt-4o-mini-tts",
  neuralInstructions: localStorage.getItem("mm_tts_neural_instructions") || "Parla in italiano in modo chiaro, naturale e accogliente, come una maestra che legge a voce alta agli studenti.",
  openaiKey: getOpenAIKey(),
  setEngine: (e) => { localStorage.setItem("mm_tts_engine", e); set({ engine: e }); },
  setNeuralVoice: (v) => { localStorage.setItem("mm_tts_neural_voice", v); set({ neuralVoice: v }); },
  setNeuralModel: (m) => { localStorage.setItem("mm_tts_neural_model", m); set({ neuralModel: m }); },
  setNeuralInstructions: (i) => { localStorage.setItem("mm_tts_neural_instructions", i); set({ neuralInstructions: i }); },
  setOpenaiKey: (k) => { setOpenAIKey(k); set({ openaiKey: k }); },
  isReady: () => isNeuralReady(),
}));
