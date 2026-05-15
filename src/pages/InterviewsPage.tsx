import { useState } from "react";
import { useInterviewsStore } from "@/store/interviewsStore";
import { useAiStore } from "@/store/aiStore";
import CharacterGallery from "@/components/interviews/CharacterGallery";
import CustomCharacterForm from "@/components/interviews/CustomCharacterForm";
import InterviewChat from "@/components/interviews/InterviewChat";
import PrivacyBanner from "@/components/shared/PrivacyBanner";
import type { Character } from "@/data/characters";
import { Plus } from "lucide-react";
import { toast } from "@/lib/utils";

export default function InterviewsPage() {
  const s = useInterviewsStore();
  const aiReady = useAiStore((x) => x.provider.isReady);
  const [customs, setCustoms] = useState<Character[]>([]);
  const [showCustom, setShowCustom] = useState(false);

  const pick = (c: Character) => {
    if (!aiReady) { toast("Configura prima un'AI dall'header"); return; }
    s.setActive(c, c.knowledgeBase || "");
  };

  return (
    <div className="max-w-app mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎭</span>
        <div>
          <h1 className="text-2xl font-bold">Interviste Impossibili</h1>
          <p className="text-sm text-neutral-500">Conversa con un personaggio storico o crea il tuo.</p>
        </div>
      </div>
      <PrivacyBanner />

      {s.active ? (
        <InterviewChat />
      ) : (
        <>
          <div className="flex justify-end">
            <button onClick={() => setShowCustom(!showCustom)} className="btn btn-outline"><Plus className="w-4 h-4" /> Personaggio personalizzato</button>
          </div>
          {showCustom && <CustomCharacterForm onCreate={(c) => { setCustoms([...customs, c]); pick(c); setShowCustom(false); }} />}
          <CharacterGallery onPick={pick} extra={customs} />
        </>
      )}
    </div>
  );
}
