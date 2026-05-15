# 🎓 Maestro Matteo Studio

Tre strumenti AI didattici **gratuiti, senza registrazione, privacy-first**.

🦉 **Tutor Socratico** — l'AI guida lo studente senza dare risposte
🎭 **Interviste Impossibili** — chatbot che impersona personaggi storici
♿ **InclusivAI** — testi semplificati per BES/DSA + 3 test a difficoltà crescente

---

## Filosofia

- **Zero backend, zero database, zero serverless**: web app statica su Vercel.
- **Zero costi AI a carico del maintainer**: tu porti la tua chiave gratuita (Gemini / Groq), oppure usi WebLLM offline.
- **Privacy assoluta**: chiavi e dati vivono SOLO nel browser (`localStorage`). Niente tracking, niente analytics.
- **Niente registrazione**: apri il link, configuri un'AI, lavori, scarichi.

---

## Per chi prova l'app — 3 percorsi

Al primo accesso l'app apre automaticamente un dialog di benvenuto con tre card. Scegli quella più comoda:

### 🟢 Percorso 1 — Offline (più facile, zero registrazioni)
- Click → **"Scarica modello e attiva AI"**
- Download di ~1.5 GB (5–10 min su buona connessione)
- Da quel momento l'app funziona **completamente offline**, senza chiavi e senza account
- Serve **Chrome 113+** o **Edge 113+** con WebGPU (la maggior parte dei PC moderni)

### 🔵 Percorso 2 — Gemini gratis (consigliato per qualità)
- 2 minuti di setup:
  1. Vai su <https://aistudio.google.com/apikey>
  2. Login con Google → **"Create API key"**
  3. Copia la chiave `AIza…` e incollala nel dialog
- 1500 richieste gratuite al giorno

### 🟣 Percorso 3 — Groq gratis (velocissimo)
- 2 minuti di setup:
  1. Vai su <https://console.groq.com/keys>
  2. Registrati gratis → **"Create API Key"**
  3. Copia la chiave `gsk_…` e incollala nel dialog
- Llama 3.3 70B, risposte fulminee

**Dopo aver scelto un percorso**: badge verde in alto, puoi usare i 3 strumenti dal menu. Cambiare provider in qualsiasi momento dal pulsante **AI** in header.

## Perché serve scegliere

Maestro Matteo Studio non ha un server. L'AI **deve** girare da qualche parte: o nel tuo computer (WebLLM) o nel tuo account cloud gratuito (Gemini/Groq). Non c'è e non ci sarà mai una chiave del maintainer condivisa — sarebbe ingestibile in termini di costi.

---

## Come ottenere una chiave gratuita di Gemini

1. Vai su **<https://aistudio.google.com/apikey>**
2. Accedi col tuo account Google
3. Clicca **"Create API key"** → scegli un progetto (o "Create API key in new project")
4. Copia la chiave (inizia con `AIza…`)
5. In Maestro Matteo Studio: clicca **AI** in alto → tab **Google Gemini** → incolla la chiave → **Salva e usa**

La chiave resta nel tuo browser. Non passa MAI da un server di Maestro Matteo Studio.

---

## Stack tecnico

| Cosa | Tecnologia |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| State | Zustand |
| AI cloud | `@google/generative-ai`, Groq REST API |
| AI locale | `@mlc-ai/web-llm` (WebGPU) |
| TTS | Web Speech API (nativa) |
| PDF parsing | `pdfjs-dist` |
| DOCX parsing | `mammoth` |
| Export PDF | `jsPDF` |
| Export Word | `docx` |
| Export ZIP | `JSZip` |
| Icone | `lucide-react` |

---

## Sviluppo locale

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build di produzione in dist/
npm run preview  # serve la build localmente
```

---

## Deploy su Vercel (zero config)

### Da GitHub (consigliato)

1. Pubblica la repo su GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial release Maestro Matteo Studio v1.0"
   gh repo create maestro-matteo-studio --public --source=. --remote=origin --push
   ```
   (in alternativa: crea repo su github.com e fai `git remote add origin … && git push -u origin main`)

2. Vai su **<https://vercel.com/new>**
3. Importa la repo. Vercel rileva Vite automaticamente.
4. Clicca **Deploy**. Dopo ~1 minuto avrai un URL `*.vercel.app`.

### Sottodominio personalizzato `studio.maestromatteo.it`

1. In Vercel: **Project → Settings → Domains → Add**
2. Inserisci `studio.maestromatteo.it`
3. Vercel ti mostra un record CNAME (`cname.vercel-dns.com`). Aggiungilo dal pannello DNS del tuo registrar:
   - **Type**: CNAME
   - **Name**: `studio`
   - **Value**: `cname.vercel-dns.com`
4. Attendi ~5 minuti per propagazione + emissione certificato HTTPS.

---

## Privacy in dettaglio

- Nessuna chiamata di rete tranne:
  - Caricamento iniziale dell'app dal CDN Vercel (HTML/JS/CSS)
  - Fonts Google (Inter, Atkinson Hyperlegible) e font OpenDyslexic via jsDelivr
  - Le chiamate AI **dirette** verso `generativelanguage.googleapis.com` (Gemini) o `api.groq.com` (Groq), partendo dal tuo browser
  - PDF.js worker via jsDelivr (per parsare i PDF caricati)
- Nessun cookie. Solo `localStorage` per le preferenze (chiavi API, tema, modello scelto).
- Pulsante **"Cancella tutto"** nel dialog AI rimuove ogni dato salvato.

---

## Licenza

[MIT](./LICENSE) — Matteo (Maestro Matteo) · IC Foligno 5
