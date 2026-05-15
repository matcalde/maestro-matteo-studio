import type { AIProvider, Message } from "./providers";

const TRANSIENT = [429, 500, 502, 503, 504];

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, baseMs = 2000, retryAfterRef?: { value: number }): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (e: any) {
      lastErr = e;
      const code = e?.status || 0;
      const isTransient = TRANSIENT.includes(code) || /overload|rate.?limit|too many|429/i.test(String(e?.message || ""));
      if (!isTransient || i === attempts - 1) throw e;
      const serverHint = retryAfterRef?.value || 0;
      const wait = Math.max(serverHint * 1000, baseMs * Math.pow(2, i)) + Math.random() * 500;
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

export class GroqProvider implements AIProvider {
  kind = "groq" as const;
  name = "Groq (Llama 3.3 70B)";
  isReady: boolean;
  private apiKey: string;
  private modelId: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.modelId = model || "llama-3.3-70b-versatile";
    this.isReady = !!apiKey;
  }

  private buildBody(messages: Message[], systemPrompt: string, stream: boolean) {
    return {
      model: this.modelId,
      stream,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.filter((m) => m.role !== "system"),
      ],
      temperature: 0.7,
    };
  }

  async *chatStream(messages: Message[], systemPrompt: string) {
    const retryAfter = { value: 0 };
    const res = await withRetry(async () => {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(this.buildBody(messages, systemPrompt, true)),
      });
      if (!r.ok) {
        retryAfter.value = parseFloat(r.headers.get("retry-after") || "0");
        const err: any = new Error(`Groq error ${r.status}: ${await r.text().catch(() => "")}`);
        err.status = r.status;
        throw err;
      }
      return r;
    }, 3, 2000, retryAfter);
    if (!res.body) throw new Error("Groq: stream non disponibile");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const payload = t.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {}
      }
    }
  }

  async complete(prompt: string, systemPrompt = "") {
    const retryAfter = { value: 0 };
    return withRetry(async () => {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(this.buildBody([{ role: "user", content: prompt }], systemPrompt, false)),
      });
      if (!r.ok) {
        retryAfter.value = parseFloat(r.headers.get("retry-after") || "0");
        const err: any = new Error(`Groq ${r.status}: ${await r.text().catch(() => "")}`);
        err.status = r.status;
        throw err;
      }
      const json = await r.json();
      return json.choices?.[0]?.message?.content || "";
    }, 3, 2000, retryAfter);
  }
}
