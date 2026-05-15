export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 prose-mm">
      <h1 className="text-3xl font-bold mb-4">About</h1>
      <p>
        Ciao, sono <strong>Matteo</strong> — per i bambini, le famiglie e i colleghi <strong>"Maestro Matteo"</strong>.
        Insegno alla scuola primaria dell'Istituto Comprensivo Foligno 5 e mi occupo di
        formazione su digitale e intelligenza artificiale nella didattica.
      </p>

      <h2 className="text-xl font-bold mt-6">Perché questi strumenti</h2>
      <p>
        Volevo tre cose che, messe insieme, fossero rare:
      </p>
      <ul>
        <li><strong>Libertà</strong>: niente account, niente login, niente lock-in.</li>
        <li><strong>Gratuità</strong>: zero costi per chi usa, zero costi per chi mantiene.</li>
        <li><strong>Sperimentazione</strong>: ogni docente o studente deve poter provare l'AI senza paura, sul proprio dispositivo.</li>
      </ul>

      <h2 className="text-xl font-bold mt-6">La filosofia</h2>
      <p>
        L'AI in classe ha un ruolo solo: <strong>potenziare il pensiero, non sostituirlo</strong>.
        Per questo il Tutor Socratico <em>non dà</em> mai la risposta. Per questo le Interviste Impossibili sono dialoghi, non monologhi.
        Per questo InclusivAI non si limita a semplificare: propone test che fanno pensare a livelli diversi.
      </p>

      <h2 className="text-xl font-bold mt-6">Privacy, davvero</h2>
      <p>
        Maestro Matteo Studio è una <strong>web app statica</strong>. Non ci sono server miei tra te e l'AI:
        le tue chiavi API sono in <code>localStorage</code>, le tue chat sono in memoria, e tutte le chiamate
        partono <em>direttamente</em> dal tuo browser verso Google o Groq.
        Quando scegli WebLLM, neanche quelle: il modello gira sulla tua scheda video.
      </p>
      <p>
        Il codice è open source. Apri DevTools e controlla la sezione Network: nessuna chiamata a maestromatteo.it durante l'uso.
      </p>

      <h2 className="text-xl font-bold mt-6">Dove trovarmi</h2>
      <ul>
        <li><a href="https://maestromatteo.it" target="_blank" rel="noreferrer" className="text-primary underline">maestromatteo.it</a> — sito personale</li>
      </ul>
    </div>
  );
}
