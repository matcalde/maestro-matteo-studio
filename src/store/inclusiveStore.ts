import { create } from "zustand";

export interface GlossaryTerm { term: string; definition: string; example: string; icon: string; }
export interface QuizBasicQ { q: string; options: string[]; correct: number; hints: string[]; explanation: string; }
export interface QuizIntermediateQ { q: string; exemplar: string; criteria: string[]; }
export interface QuizAdvancedP { prompt: string; socraticQuestions: string[]; }

interface InclusiveState {
  sourceText: string;
  targetLevel: string;
  simplified: string;
  glossary: GlossaryTerm[];
  quizBasic: QuizBasicQ[];
  quizIntermediate: QuizIntermediateQ[];
  quizAdvanced: QuizAdvancedP[];
  setSource: (t: string) => void;
  setLevel: (l: string) => void;
  setSimplified: (s: string) => void;
  setGlossary: (g: GlossaryTerm[]) => void;
  setQuizBasic: (q: QuizBasicQ[]) => void;
  setQuizIntermediate: (q: QuizIntermediateQ[]) => void;
  setQuizAdvanced: (q: QuizAdvancedP[]) => void;
  reset: () => void;
}

export const useInclusiveStore = create<InclusiveState>((set) => ({
  sourceText: "",
  targetLevel: "scuola secondaria di primo grado",
  simplified: "",
  glossary: [],
  quizBasic: [],
  quizIntermediate: [],
  quizAdvanced: [],
  setSource: (t) => set({ sourceText: t }),
  setLevel: (l) => set({ targetLevel: l }),
  setSimplified: (s) => set({ simplified: s }),
  setGlossary: (g) => set({ glossary: g }),
  setQuizBasic: (q) => set({ quizBasic: q }),
  setQuizIntermediate: (q) => set({ quizIntermediate: q }),
  setQuizAdvanced: (q) => set({ quizAdvanced: q }),
  reset: () => set({
    sourceText: "", simplified: "", glossary: [],
    quizBasic: [], quizIntermediate: [], quizAdvanced: [],
  }),
}));
