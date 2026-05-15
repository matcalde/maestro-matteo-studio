export default function ProgressBar({ steps }: { steps: number }) {
  const goal = 8; // DECISION: 8 step come traguardo morbido
  const pct = Math.min(100, (steps / goal) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded">
        <div className="h-2 bg-socratic rounded transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-neutral-500 whitespace-nowrap">{steps} passaggi</span>
    </div>
  );
}
