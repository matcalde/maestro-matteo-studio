import { create } from "zustand";
import type { Message } from "@/lib/ai/providers";
import type { Character } from "@/data/characters";

interface InterviewsState {
  active: Character | null;
  knowledgeBase: string;
  messages: Message[];
  diary: string;
  setActive: (c: Character | null, kb?: string) => void;
  addMessage: (m: Message) => void;
  appendToLast: (chunk: string) => void;
  setDiary: (d: string) => void;
  reset: () => void;
}

export const useInterviewsStore = create<InterviewsState>((set) => ({
  active: null,
  knowledgeBase: "",
  messages: [],
  diary: "",
  setActive: (c, kb = "") => set({ active: c, knowledgeBase: kb, messages: [], diary: "" }),
  addMessage: (m) => set((st) => ({ messages: [...st.messages, m] })),
  appendToLast: (chunk) => set((st) => {
    const msgs = [...st.messages];
    if (msgs.length === 0) return st;
    const last = msgs[msgs.length - 1];
    msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
    return { messages: msgs };
  }),
  setDiary: (d) => set({ diary: d }),
  reset: () => set({ active: null, messages: [], diary: "", knowledgeBase: "" }),
}));
