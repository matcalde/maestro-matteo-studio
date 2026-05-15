import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, RotateCcw } from "lucide-react";
import type { QuizIntermediateQ } from "@/store/inclusiveStore";
import { useAiStore } from "@/store/aiStore";
import { INTERMEDIATE_FEEDBACK_PROMPT } from "@/lib/ai/prompts/quizzes";
import { toast } from "@/lib/utils";

export default function QuizIntermediate({ qs }: { qs: QuizIntermediateQ[] }) {
  const provider = useAiStore((s) => s.provider);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<Record<number, boolean>>({});

  if (!qs.length) return null;

  const evaluate = async (i: number) => {
    if (!provider.isReady) { toast("Configura un'AI"); return; }
    const a = (answers[i] || "").trim();
    if (!a) { toast("Scrivi una risposta"); return; }
    setBusy({ ...busy, [i]: true });
    setFeedbacks({ ...feedbacks, [i]: "" });
    try {
      const q = qs[i];
      const out = await provider.complete(INTERMEDIATE_FEEDBACK_PROMPT(q.q, q.exemplar, q.criteria, a));
      setFeedbacks({ ...feedbacks, [i]: out });
    } catch (e: any) {
      setFeedbacks({ ...feedbacks, [i]: "Errore: " + (e?.message || e) });
    } finally {
      setBusy({ ...busy, [i]: false });
    }
  };

  return (
    <div className="space-y-4">
      {qs.map((q, i) => (
        <div key={i} className="card p-4 space-y-2">
          <div className="flex gap-2"><strong className="text-primary">{i + 1}.</strong><div className="font-medium">{q.q}</div></div>
          <textarea
            value={answers[i] || ""}
            onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
            rows={4}
            placeholder="Scrivi qui la tua risposta (2-4 frasi)…"
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm"
          />
          <div className="flex gap-2">
            <button onClick={() => evaluate(i)} disabled={busy[i]} className="btn btn-primary">
              {busy[i] ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Ricevi feedback
            </button>
            {feedbacks[i] && (
              <button onClick={() => { setFeedbacks({ ...feedbacks, [i]: "" }); }} className="btn btn-outline">
                <RotateCcw className="w-4 h-4" /> Riformula e riprova
              </button>
            )}
          </div>
          {feedbacks[i] && (
            <div className="prose-mm text-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedbacks[i]}</ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
