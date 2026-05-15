import { create } from "zustand";
import { createProvider, type AIProvider, type ProviderKind } from "@/lib/ai/providers";

interface AiState {
  kind: ProviderKind;
  geminiKey: string;
  groqKey: string;
  geminiModel: string;
  groqModel: string;
  webllmModel: string;
  webllmProgress: number;
  webllmStatus: string;
  provider: AIProvider;
  hydrate: () => void;
  setKind: (k: ProviderKind) => void;
  setKey: (k: "gemini" | "groq", value: string) => void;
  setModel: (k: "gemini" | "groq" | "webllm", value: string) => void;
  rebuild: () => void;
  loadWebLLM: () => Promise<void>;
  clearAll: () => void;
  isReady: () => boolean;
}

const LS = {
  kind: "mm_provider_kind",
  gk: "mm_gemini_key",
  qk: "mm_groq_key",
  gm: "mm_gemini_model",
  qm: "mm_groq_model",
  wm: "mm_webllm_model",
};

export const useAiStore = create<AiState>((set, get) => ({
  kind: "none",
  geminiKey: "",
  groqKey: "",
  geminiModel: "gemini-2.5-flash",
  groqModel: "llama-3.3-70b-versatile",
  webllmModel: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
  webllmProgress: 0,
  webllmStatus: "",
  provider: createProvider("none", {}),
  hydrate: () => {
    const kind = (localStorage.getItem(LS.kind) as ProviderKind) || "none";
    const geminiKey = localStorage.getItem(LS.gk) || "";
    const groqKey = localStorage.getItem(LS.qk) || "";
    let geminiModel = localStorage.getItem(LS.gm) || "gemini-2.5-flash";
    // Migrazione: modelli deprecati/non supportati
    if (geminiModel === "gemini-2.0-flash-exp" || geminiModel === "gemini-pro") {
      geminiModel = "gemini-2.5-flash";
      localStorage.setItem(LS.gm, geminiModel);
    }
    const groqModel = localStorage.getItem(LS.qm) || "llama-3.3-70b-versatile";
    const webllmModel = localStorage.getItem(LS.wm) || "Llama-3.2-3B-Instruct-q4f16_1-MLC";
    set({ kind, geminiKey, groqKey, geminiModel, groqModel, webllmModel });
    get().rebuild();
  },
  setKind: (k) => {
    localStorage.setItem(LS.kind, k);
    set({ kind: k });
    get().rebuild();
  },
  setKey: (k, value) => {
    if (k === "gemini") {
      localStorage.setItem(LS.gk, value);
      set({ geminiKey: value });
    } else {
      localStorage.setItem(LS.qk, value);
      set({ groqKey: value });
    }
    get().rebuild();
  },
  setModel: (k, value) => {
    if (k === "gemini") { localStorage.setItem(LS.gm, value); set({ geminiModel: value }); }
    else if (k === "groq") { localStorage.setItem(LS.qm, value); set({ groqModel: value }); }
    else { localStorage.setItem(LS.wm, value); set({ webllmModel: value }); }
    get().rebuild();
  },
  rebuild: () => {
    const s = get();
    const opts =
      s.kind === "gemini" ? { apiKey: s.geminiKey, model: s.geminiModel } :
      s.kind === "groq" ? { apiKey: s.groqKey, model: s.groqModel } :
      s.kind === "webllm" ? { model: s.webllmModel } :
      {};
    const provider = createProvider(s.kind, opts);
    set({ provider });
  },
  loadWebLLM: async () => {
    const s = get();
    if (s.kind !== "webllm") {
      get().setKind("webllm");
    }
    const provider = get().provider as any;
    if (provider?.load) {
      await provider.load((p: { progress: number; text: string }) => {
        set({ webllmProgress: p.progress, webllmStatus: p.text });
      });
      set({ webllmProgress: 1, webllmStatus: "Modello pronto" });
      get().rebuild();
    }
  },
  clearAll: () => {
    Object.values(LS).forEach((k) => localStorage.removeItem(k));
    // pulisco anche dati strumenti
    Object.keys(localStorage).filter((k) => k.startsWith("mm_")).forEach((k) => localStorage.removeItem(k));
    set({
      kind: "none", geminiKey: "", groqKey: "",
      geminiModel: "gemini-2.5-flash", groqModel: "llama-3.3-70b-versatile",
      webllmModel: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
      provider: createProvider("none", {}),
    });
  },
  isReady: () => get().provider.isReady,
}));
