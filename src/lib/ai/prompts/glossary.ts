export const GLOSSARY_PROMPT = (text: string) => `Analizza il testo seguente e identifica fino a 10 termini complessi o tecnici che uno studente con difficoltà di lettura potrebbe non conoscere.

Per ogni termine fornisci:
- term: la parola
- definition: definizione semplice in massimo 20 parole
- example: una frase di esempio che usa la parola in contesto quotidiano
- icon: una singola emoji rappresentativa

Rispondi SOLO con un JSON valido in questo formato esatto, senza markdown, senza backtick, senza preamboli:
{"terms":[{"term":"...","definition":"...","example":"...","icon":"..."}]}

TESTO:
${text}`;
