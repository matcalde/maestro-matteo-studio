import { useState } from "react";
import { Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import type { QuizBasicQ } from "@/store/inclusiveStore";

export default function QuizBasic({ qs }: { qs: QuizBasicQ[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [hintLevel, setHintLevel] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!qs.length) return null;
  const correctCount = Object.entries(answers).filter(([i, v]) => qs[+i].correct === v).length;

  return (
    <div className="space-y-4">
      {qs.map((q, i) => {
        const chosen = answers[i];
        const hLvl = hintLevel[i] ?? 0;
        return (
          <div key={i} className="card p-4">
            <div className="flex items-start gap-2 mb-2">
              <strong className="text-primary">{i + 1}.</strong>
              <div className="flex-1 font-medium">{q.q}</div>
              <button
                disabled={hLvl >= 3}
                onClick={() => setHintLevel({ ...hintLevel, [i]: Math.min(3, hLvl + 1) })}
                className="btn btn-ghost text-xs">
                <Lightbulb className="w-4 h-4 text-socratic" /> Aiuto ({hLvl}/3)
              </button>
            </div>
            {hLvl > 0 && (
              <div className="text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2 rounded-lg mb-2">
                💡 {q.hints[hLvl - 1]}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-2">
              {q.options.map((op, j) => {
                const isChosen = chosen === j;
                const isCorrect = q.correct === j;
                const cls = submitted
                  ? isCorrect ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400"
                  : isChosen ? "bg-red-100 dark:bg-red-900/30 border-red-400"
                  : "border-neutral-300 dark:border-neutral-700"
                  : isChosen ? "border-primary bg-primary/10" : "border-neutral-300 dark:border-neutral-700";
                return (
                  <button key={j} disabled={submitted}
                    onClick={() => setAnswers({ ...answers, [i]: j })}
                    className={`text-left p-3 rounded-lg border-2 text-sm ${cls}`}>
                    <span className="font-mono mr-2">{String.fromCharCode(65 + j)}.</span>{op}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="mt-2 text-sm flex gap-2 items-start">
                {q.correct === chosen ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-600 mt-0.5" />}
                <div><strong>Spiegazione:</strong> {q.explanation}</div>
              </div>
            )}
          </div>
        );
      })}
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < qs.length}
          className="btn btn-primary">
          Verifica risposte
        </button>
      ) : (
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{correctCount}/{qs.length}</div>
          <div className="text-sm text-neutral-500 mt-1">
            {correctCount === qs.length ? "🎉 Perfetto! Hai capito tutto." :
             correctCount >= qs.length * 0.6 ? "💪 Bel lavoro, sei sulla buona strada!" :
             "📚 Rileggi il testo semplificato e riprova: ce la fai!"}
          </div>
          <button onClick={() => { setAnswers({}); setHintLevel({}); setSubmitted(false); }} className="btn btn-outline mt-3">Riprova</button>
        </div>
      )}
    </div>
  );
}
