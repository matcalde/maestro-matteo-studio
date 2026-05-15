export const SIMPLIFY_PROMPT = (text: string, targetLevel: string) => `Sei un esperto di didattica inclusiva e linguaggio facilitato. Riscrivi il testo seguente per studenti con difficoltà di lettura (BES, DSA, italiano L2).

REGOLE:
- Frasi brevi (max 15-18 parole)
- Una sola informazione per frase
- Soggetto sempre esplicito
- Verbi al presente indicativo quando possibile
- Vocaboli del lessico base (lista De Mauro VdB se necessario)
- Evita subordinate complesse
- Mantieni il significato originale, NON riassumere
- Usa elenchi puntati quando aiutano la comprensione
- Aggiungi sottotitoli per sezioni lunghe
- Livello target: ${targetLevel}

REGOLE LINGUISTICHE TASSATIVE:
- Italiano corretto e naturale, concordanze sempre rispettate.
- Se rivolgi domande o istruzioni al lettore, usa il "tu" con verbi in 2ª persona singolare (es: "leggi", "rispondi", "prova a immaginare").
- Mai forme di cortesia "Lei".

TESTO ORIGINALE:
${text}

Rispondi solo con il testo semplificato in markdown, senza preamboli.`;
