export const QUIZ_BASIC_PROMPT = (text: string) => `Genera 5 domande a scelta multipla sul testo. Ogni domanda ha 4 opzioni, una sola corretta. Per ogni domanda fornisci anche 3 suggerimenti progressivi (dal più sottile al più esplicito) e la spiegazione della risposta corretta.

Rispondi SOLO con JSON valido, senza markdown, senza backtick:
{"questions":[{"q":"...","options":["a","b","c","d"],"correct":0,"hints":["...","...","..."],"explanation":"..."}]}

TESTO:
${text}`;

export const QUIZ_INTERMEDIATE_PROMPT = (text: string) => `Genera 4 domande aperte di comprensione e rielaborazione sul testo. Le domande devono richiedere risposte di 2-4 frasi. Per ogni domanda fornisci una "risposta esemplare" e i "criteri di valutazione" formativa (3-4 punti chiave da cercare nella risposta dello studente).

Rispondi SOLO con JSON valido, senza markdown:
{"questions":[{"q":"...","exemplar":"...","criteria":["...","...","..."]}]}

TESTO:
${text}`;

export const QUIZ_ADVANCED_PROMPT = (text: string) => `Genera 3 prompt di analisi critica sul testo. Devono richiedere collegamenti, valutazioni personali, riflessioni metacognitive. Per ognuno fornisci 4 "domande socratiche di approfondimento" che il tutor userà per guidare lo studente.

Rispondi SOLO con JSON valido, senza markdown:
{"prompts":[{"prompt":"...","socraticQuestions":["...","...","...","..."]}]}

TESTO:
${text}`;

export const INTERMEDIATE_FEEDBACK_PROMPT = (q: string, exemplar: string, criteria: string[], answer: string) =>
`Domanda: ${q}
Risposta attesa (esemplare): ${exemplar}
Criteri di valutazione formativa: ${criteria.join("; ")}
Risposta dello studente: ${answer}

Genera un feedback formativo in italiano (max 150 parole) in markdown:
- **Cosa funziona** (punti chiave colti)
- **Cosa migliorare** (lacune specifiche, senza dare la risposta)
- **Una domanda per riformulare** (per stimolare un secondo tentativo)
NON dare un voto numerico.`;
