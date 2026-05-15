import type { AIProvider, Message } from "./providers";

// DECISION: lazy-import @mlc-ai/web-llm so the chunk loads only quando l'utente sceglie WebLLM.
type MLCEngine = any;

let cachedEngine: MLCEngine | null = null;
let cachedModelId: string | null = null;

export class WebLLMProvider implements AIProvider {
  kind = "webllm" as const;
  name = "WebLLM (offline)";
  isReady = false;
  private modelId: string;
  engine: MLCEngine | null = null;

  constructor(model?: string) {
    this.modelId = model || "Llama-3.2-3B-Instruct-q4f16_1-MLC";
    if (cachedEngine && cachedModelId === this.modelId) {
      this.engine = cachedEngine;
      this.isReady = true;
    }
  }

  async load(onProgress?: (p: { progress: number; text: string }) => void) {
    if (this.engine) return;
    const mod = await import("@mlc-ai/web-llm");
    const engine = await mod.CreateMLCEngine(this.modelId, {
      initProgressCallback: (r: any) => {
        onProgress?.({ progress: r.progress ?? 0, text: r.text ?? "" });
      },
    });
    this.engine = engine;
    cachedEngine = engine;
    cachedModelId = this.modelId;
    this.isReady = true;
  }

  private toMsgs(messages: Message[], systemPrompt: string) {
    return [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role !== "system"),
    ];
  }

  async *chatStream(messages: Message[], systemPrompt: string) {
    if (!this.engine) throw new Error("WebLLM non caricato");
    const stream = await this.engine.chat.completions.create({
      messages: this.toMsgs(messages, systemPrompt),
      stream: true,
      temperature: 0.7,
    });
    for await (const chunk of stream) {
      const t = chunk.choices?.[0]?.delta?.content;
      if (t) yield t;
    }
  }

  async complete(prompt: string, systemPrompt = "") {
    if (!this.engine) throw new Error("WebLLM non caricato");
    const r = await this.engine.chat.completions.create({
      messages: this.toMsgs([{ role: "user", content: prompt }], systemPrompt),
      stream: false,
      temperature: 0.7,
    });
    return r.choices?.[0]?.message?.content || "";
  }
}
