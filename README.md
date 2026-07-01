# TaskFlow — Starter Kit (Modulo 6)

Scheletro **pre-configurato** del monorepo per il Project Work guidato. L'infrastruttura
(dipendenze bloccate, TypeScript, Vitest, Playwright, Biome, CI) è già pronta: in aula
**l'AI genera il codice dell'applicazione**, non i file di setup.

## ⚠️ Prerequisiti — DA FARE PRIMA DELLA SESSIONE (non in aula)

Per non perdere minuti preziosi in download e installazioni, completa questi passi a casa
con una rete veloce:

```bash
# 1. Node 22 LTS (verifica)
node --version            # deve essere >= 22

# 2. Installa tutte le dipendenze dei workspace (api, web, e2e)
npm ci

# 3. Scarica i browser per i test E2E (~poche centinaia di MB)
npx playwright install

# 4. Verifica che tutto parta
npm run build -w api      # deve compilare
npm run test  -w api      # smoke test verde
```

Servono inoltre: un account **Copilot** e/o **Claude** attivo (Pro), e l'estensione
**GitHub CLI** (`gh`) autenticata (`gh auth login`).

## Struttura
- `api/` — Express 5 + TS, store in-memory, Vitest + fast-check (logica **da implementare**)
- `web/` — React 19 + Vite (componenti **da implementare**)
- `e2e/` — Playwright (test **da implementare**)
- `.github/workflows/ci.yml` — pipeline pronta (lint, build, test+coverage)
- `CLAUDE.md` — contesto e comandi per Claude Code

## Comandi rapidi
| Comando | Cosa fa |
| --- | --- |
| `npm run dev:api` | API su http://localhost:3000 |
| `npm run dev:web` | Web su http://localhost:5173 |
| `npm run test -w api` | Test Vitest |
| `npm run test:coverage -w api` | Test + coverage |
| `npm run test:ui -w api` | Vitest UI |
| `npm run lint` | Biome |
| `npm test -w e2e` | Playwright E2E |

Buon project work! 🚀
