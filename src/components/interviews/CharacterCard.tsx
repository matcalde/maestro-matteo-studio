import type { Character } from "@/data/characters";

export default function CharacterCard({ c, onClick }: { c: Character; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card overflow-hidden text-left hover:shadow-md transition group"
    >
      <div className={`h-24 bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
        <span className="text-5xl drop-shadow-sm group-hover:scale-110 transition">{c.emoji}</span>
      </div>
      <div className="p-3">
        <div className="font-semibold">{c.name}</div>
        <div className="text-xs text-neutral-500">{c.era}</div>
        <div className="text-xs mt-1 line-clamp-2">{c.role}</div>
      </div>
    </button>
  );
}
