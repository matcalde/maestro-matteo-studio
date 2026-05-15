import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function toast(msg: string) {
  // DECISION: toast minimale via DOM, evito dipendenza extra
  const el = document.createElement("div");
  el.textContent = msg;
  el.className =
    "fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-neutral-900 text-white px-4 py-2 rounded-xl shadow-lg text-sm";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function stripJsonFences(s: string): string {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/, "")
    .trim();
}

export function safeParseJson<T = any>(s: string): T | null {
  try {
    return JSON.parse(stripJsonFences(s));
  } catch {
    // try to find first { ... } block
    const m = s.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch { return null; }
    }
    return null;
  }
}
