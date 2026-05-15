import { create } from "zustand";
import type { Message } from "@/lib/ai/providers";

interface SocraticState {
  sourceText: string;
  subject: string;
  schoolLevel: string;
  steps: number;
  messages: Message[];
  setSetup: (s: { sourceText: string; subject: string; schoolLevel: string }) => void;
  addMessage: (m: Message) => void;
  appendToLast: (chunk: string) => void;
  incrementStep: () => void;
  reset: () => void;
}

export const useSocraticStore = create<SocraticState>((set) => ({
  sourceText: "",
  subject: "matematica",
  schoolLevel: "secondaria primo grado",
  steps: 0,
  messages: [],
  setSetup: (s) => set({ ...s, messages: [], steps: 0 }),
  addMessage: (m) => set((st) => ({ messages: [...st.messages, m] })),
  appendToLast: (chunk) => set((st) => {
    const msgs = [...st.messages];
    if (msgs.length === 0) return st;
    const last = msgs[msgs.length - 1];
    msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
    return { messages: msgs };
  }),
  incrementStep: () => set((st) => ({ steps: st.steps + 1 })),
  reset: () => set({ sourceText: "", messages: [], steps: 0 }),
}));
