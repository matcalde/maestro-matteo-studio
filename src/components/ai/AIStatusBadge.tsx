import { useAiStore } from "@/store/aiStore";

export default function AIStatusBadge() {
  const kind = useAiStore((s) => s.kind);
  const provider = useAiStore((s) => s.provider);
  const progress = useAiStore((s) => s.webllmProgress);

  if (kind === "none" || !provider.isReady) {
    return <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">AI da configurare</span>;
  }
  if (kind === "webllm" && progress < 1) {
    return <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">Caricamento {(progress * 100).toFixed(0)}%</span>;
  }
  return <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">{provider.name} ✓</span>;
}
