export type Role = "user" | "assistant" | "system";
export interface Message {
  role: Role;
  content: string;
}

export type ProviderKind = "gemini" | "groq" | "webllm" | "none";

export interface AIProvider {
  kind: ProviderKind;
  name: string;
  isReady: boolean;
  chatStream(messages: Message[], systemPrompt: string): AsyncGenerator<string, void, void>;
  complete(prompt: string, systemPrompt?: string): Promise<string>;
}

import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";
import { WebLLMProvider } from "./webllm";

export function createProvider(kind: ProviderKind, opts: { apiKey?: string; model?: string }): AIProvider {
  if (kind === "gemini") return new GeminiProvider(opts.apiKey || "", opts.model);
  if (kind === "groq") return new GroqProvider(opts.apiKey || "", opts.model);
  if (kind === "webllm") return new WebLLMProvider(opts.model);
  return {
    kind: "none",
    name: "Nessun provider",
    isReady: false,
    async *chatStream() { yield ""; },
    async complete() { return ""; },
  };
}
