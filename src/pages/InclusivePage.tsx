import { useState } from "react";
import JSZip from "jszip";
import { useInclusiveStore } from "@/store/inclusiveStore";
import { useAiStore } from "@/store/aiStore";
import { SIMPLIFY_PROMPT } from "@/lib/ai/prompts/simplify";
import { GLOSSARY_PROMPT } from "@/lib/ai/prompts/glossary";
import { QUIZ_BASIC_PROMPT, QUIZ_INTERMEDIATE_PROMPT, QUIZ_ADVANCED_PROMPT } from "@/lib/ai/prompts/quizzes";
import FileUploader from "@/components/shared/FileUploader";
import PrivacyBanner from "@/components/shared/PrivacyBanner";
import SimplifiedReader from "@/components/inclusive/SimplifiedReader";
import InteractiveGlossary from "@/components/inclusive/InteractiveGlossary";
import QuizBasic from "@/components/inclusive/QuizBasic";
import QuizIntermediate from "@/components/inclusive/QuizIntermediate";
import QuizAdvanced from "@/components/inclusive/QuizAdvanced";
import { Loader2, Wand2, Package, RotateCcw } from "lucide-react";
import { safeParseJson, toast, downloadBlob } from "@/lib/utils";
import { exportPdf } from "@/lib/exporters/pdfExporter";
import { exportDocx } from "@/lib/exporters/wordExporter";

const LEVELS = ["scuola primaria", "scuola secondaria di primo grado", "scuola secondaria di secondo grado", "italiano L2"];

export default function InclusivePage() {
  const s = useInclusiveStore();
  const provider = useAiStore((x) => x.provider);
  const [busyStep, setBusyStep] = useState<string>("");
  const [draft, setDraft] = useState(s.sourceText);

  const generateAll = async () => {
    if (!provider.isReady) { toast("Configura un'AI"); return; }
    if (!draft.trim()) { toast("Inserisci un testo"); return; }
    s.setSource(draft.trim());
    s.reset();
    s.setSource(draft.trim());

    try {
      setBusyStep("Semplificazione…");
      const simp = await provider.complete(SIMPLIFY_PROMPT(draft, s.targetLevel));
      s.setSimplified(simp);

      setBusyStep("Glossario…");
      const gloRaw = await provider.complete(GLOSSARY_PROMPT(draft));
      const glo = safeParseJson<{ terms: any[] }>(gloRaw);
      if (glo?.terms) s.setGlossary(glo.terms);

      setBusyStep("Quiz base…");
      const qbRaw = await provider.complete(QUIZ_BASIC_PROMPT(draft));
      const qb = safeParseJson<{ questions: any[] }>(qbRaw);
      if (qb?.questions) s.setQuizBasic(qb.questions);

      setBusyStep("Quiz intermedio…");
      const qiRaw = await provider.complete(QUIZ_INTERMEDIATE_PROMPT(draft));
      const qi = safeParseJson<{ questions: any[] }>(qiRaw);
      if (qi?.questions) s.setQuizIntermediate(qi.questions);

      setBusyStep("Quiz avanzato…");
      const qaRaw = await provider.complete(QUIZ_ADVANCED_PROMPT(draft));
      const qa = safeParseJson<{ prompts: any[] }>(qaRaw);
      if (qa?.prompts) s.setQuizAdvanced(qa.prompts);

      toast("✓ Materiali pronti");
    } catch (e: any) {
      toast("Errore: " + (e?.message || e));
    } finally {
      setBusyStep("");
    }
  };

  const exportZip = async () => {
    const zip = new JSZip();
    const t = "Materiale InclusivAI";

    zip.file("01_testo_semplificato.pdf", await exportPdf({ title: "Testo semplificato", sections: [{ body: s.simplified }] }));
    zip.file("01_testo_semplificato.docx", await exportDocx({ title: "Testo semplificato", sections: [{ body: s.simplified }] }));

    const gloBody = s.glossary.map((g) => `${g.icon} ${g.term}\n  ${g.definition}\n  Es.: ${g.example}`).join("\n\n");
    zip.file("02_glossario.pdf", await exportPdf({ title: "Glossario", sections: [{ body: gloBody }] }));

    const qbBody = s.quizBasic.map((q, i) => `${i + 1}. ${q.q}\n${q.options.map((o, j) => `   ${String.fromCharCode(65 + j)}) ${o}`).join("\n")}`).join("\n\n");
    zip.file("03_test_base.pdf", await exportPdf({ title: "Test base — Scelta multipla", sections: [{ body: qbBody }] }));

    const qiBody = s.quizIntermediate.map((q, i) => `${i + 1}. ${q.q}`).join("\n\n");
    zip.file("04_test_intermedio.pdf", await exportPdf({ title: "Test intermedio — Domande aperte", sections: [{ body: qiBody }] }));

    const qaBody = s.quizAdvanced.map((p, i) => `${i + 1}. ${p.prompt}`).join("\n\n");
    zip.file("05_test_avanzato.pdf", await exportPdf({ title: "Test avanzato — Analisi critica", sections: [{ body: qaBody }] }));

    const guideBody = [
      "## Soluzioni test base",
      s.quizBasic.map((q, i) => `${i + 1}. Risposta: ${String.fromCharCode(65 + q.correct)} — ${q.options[q.correct]}\n   Spiegazione: ${q.explanation}`).join("\n\n"),
      "",
      "## Griglia valutazione test intermedio",
      s.quizIntermediate.map((q, i) => `${i + 1}. ${q.q}\n   Risposta esemplare: ${q.exemplar}\n   Criteri: ${q.criteria.join("; ")}`).join("\n\n"),
      "",
      "## Domande socratiche test avanzato",
      s.quizAdvanced.map((p, i) => `${i + 1}. ${p.prompt}\n   Domande di approfondimento:\n   - ${p.socraticQuestions.join("\n   - ")}`).join("\n\n"),
    ].join("\n");
    zip.file("00_guida_docente.pdf", await exportPdf({ title: "Guida per il docente", sections: [{ body: guideBody }] }));

    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "pacchetto-inclusivai.zip");
    toast("ZIP scaricato");
  };

  const hasAny = s.simplified || s.glossary.length || s.quizBasic.length;

  return (
    <div className="max-w-app mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">♿</span>
        <div>
          <h1 className="text-2xl font-bold">InclusivAI</h1>
          <p className="text-sm text-neutral-500">Materiali semplificati per BES/DSA + 3 test a difficoltà crescente.</p>
        </div>
      </div>
      <PrivacyBanner />

      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">1. Carica un testo</h2>
        <FileUploader onText={(t) => setDraft(t)} />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={8}
          placeholder="…oppure incolla qui un articolo o un brano"
          className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm"
        />
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm">Livello:</label>
          <select value={s.targetLevel} onChange={(e) => s.setLevel(e.target.value)} className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm">
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={generateAll} disabled={!!busyStep} className="btn btn-primary">
            {busyStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {busyStep || "Genera materiali inclusivi"}
          </button>
          {hasAny && (
            <button onClick={() => s.reset()} className="btn btn-outline"><RotateCcw className="w-4 h-4" /> Reset</button>
          )}
        </div>
      </div>

      {s.simplified && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold flex items-center gap-2">📖 Testo semplificato</h2>
          <SimplifiedReader text={s.simplified} />
        </section>
      )}

      {s.glossary.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold flex items-center gap-2">📚 Glossario interattivo</h2>
          <InteractiveGlossary terms={s.glossary} />
        </section>
      )}

      {s.quizBasic.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold flex items-center gap-2">🟢 Test base — Scelta multipla</h2>
          <QuizBasic qs={s.quizBasic} />
        </section>
      )}

      {s.quizIntermediate.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold flex items-center gap-2">🟡 Test intermedio — Domande aperte</h2>
          <QuizIntermediate qs={s.quizIntermediate} />
        </section>
      )}

      {s.quizAdvanced.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold flex items-center gap-2">🔴 Test avanzato — Analisi critica</h2>
          <QuizAdvanced ps={s.quizAdvanced} />
        </section>
      )}

      {hasAny && (
        <section className="card p-4">
          <h2 className="text-xl font-bold mb-2">📥 Esportazione</h2>
          <button onClick={exportZip} className="btn btn-primary"><Package className="w-4 h-4" /> Scarica pacchetto completo (ZIP)</button>
        </section>
      )}
    </div>
  );
}
