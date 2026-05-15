import type { AIProvider, Message } from "./providers";

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
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this.buildBody(messages, systemPrompt, true)),
    });
    if (!res.ok || !res.body) throw new Error(`Groq error ${res.status}`);
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
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        this.buildBody([{ role: "user", content: prompt }], systemPrompt, false)
      ),
    });
    if (!res.ok) throw new Error(`Groq error ${res.status}`);
    const json = await res.json();
    return json.choices?.[0]?.message?.content || "";
  }
}
