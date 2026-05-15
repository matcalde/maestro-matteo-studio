import { PRESET_CHARACTERS, type Character } from "@/data/characters";
import CharacterCard from "./CharacterCard";

export default function CharacterGallery({ onPick, extra = [] }: { onPick: (c: Character) => void; extra?: Character[] }) {
  const all = [...PRESET_CHARACTERS, ...extra];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {all.map((c) => <CharacterCard key={c.id} c={c} onClick={() => onPick(c)} />)}
    </div>
  );
}
