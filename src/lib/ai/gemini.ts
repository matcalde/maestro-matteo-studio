import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, Message } from "./providers";

const TRANSIENT_CODES = [429, 500, 502, 503, 504];

function isTransient(err: any): boolean {
  const msg = String(err?.message || err || "");
  return TRANSIENT_CODES.some((c) => msg.includes(`[${c} `) || msg.includes(`${c} `)) ||
    /overload|high demand|unavailable|temporary/i.test(msg);
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, baseMs = 1500): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (e) {
      lastErr = e;
      if (!isTransient(e) || i === attempts - 1) throw e;
      const wait = baseMs * Math.pow(2, i) + Math.random() * 500;
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

export class GeminiProvider implements AIProvider {
  kind = "gemini" as const;
  name = "Google Gemini";
  isReady: boolean;
  private client: GoogleGenerativeAI | null = null;
  private modelId: string;

  constructor(apiKey: string, model?: string) {
    this.modelId = model || "gemini-2.5-flash";
    this.isReady = !!apiKey;
    if (apiKey) this.client = new GoogleGenerativeAI(apiKey);
  }

  async *chatStream(messages: Message[], systemPrompt: string) {
    if (!this.client) throw new Error("Gemini non configurato");
    const stream = await withRetry(async () => {
      const model = this.client!.getGenerativeModel({
        model: this.modelId,
        systemInstruction: systemPrompt,
      });
      const history = messages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const last = messages[messages.length - 1];
      const chat = model.startChat({ history });
      return chat.sendMessageStream(last.content);
    });
    for await (const chunk of stream.stream) {
      const t = chunk.text();
      if (t) yield t;
    }
  }

  async complete(prompt: string, systemPrompt = "") {
    if (!this.client) throw new Error("Gemini non configurato");
    return withRetry(async () => {
      const model = this.client!.getGenerativeModel({
        model: this.modelId,
        systemInstruction: systemPrompt || undefined,
      });
      const r = await model.generateContent(prompt);
      return r.response.text();
    });
  }
}
