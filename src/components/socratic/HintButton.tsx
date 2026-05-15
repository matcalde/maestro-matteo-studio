import { Lightbulb, Search, LifeBuoy, BarChart3 } from "lucide-react";

interface Props {
  onHint: (tag: "HINT_LIGHT" | "HINT_MEDIUM" | "STUCK" | "CHECKPOINT") => void;
  disabled?: boolean;
}

export default function HintButtons({ onHint, disabled }: Props) {
  const btn = "btn btn-outline text-sm";
  return (
    <div className="flex flex-wrap gap-2">
      <button disabled={disabled} className={btn} onClick={() => onHint("HINT_LIGHT")}><Lightbulb className="w-4 h-4 text-socratic" /> Suggerimento leggero</button>
      <button disabled={disabled} className={btn} onClick={() => onHint("HINT_MEDIUM")}><Search className="w-4 h-4" /> Suggerimento medio</button>
      <button disabled={disabled} className={btn} onClick={() => onHint("STUCK")}><LifeBuoy className="w-4 h-4 text-red-500" /> Sono bloccato</button>
      <button disabled={disabled} className={btn} onClick={() => onHint("CHECKPOINT")}><BarChart3 className="w-4 h-4" /> A che punto sono?</button>
    </div>
  );
}
