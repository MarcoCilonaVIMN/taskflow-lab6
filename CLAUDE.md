# TaskFlow — Contesto per Claude Code

Mini app di **task management** in monorepo TypeScript. Questo file è la memoria di
progetto: leggilo prima di generare codice per allinearti a struttura, convenzioni e
comandi esatti.

## Stack
- **api/** — Node + Express 5 + TypeScript (CommonJS), store in-memory, Vitest + fast-check
- **web/** — React 19 + Vite + TypeScript (SWC)
- **e2e/** — Playwright
- **Lint/format** — Biome (root)
- **Node** — 22 LTS

## Struttura
```
taskflow/
├── api/  src/{routes,services,app.ts,server.ts,types.ts}  tests/
├── web/  src/{components,App.tsx,main.tsx,api.ts,types.ts}
├── e2e/  tests/  playwright.config.ts
└── .github/workflows/ci.yml
```

## Comandi esatti (usali per build/test/self-check)
- Install (tutti i workspace): `npm ci`
- API dev: `npm run dev -w api`  (http://localhost:3000)
- Web dev: `npm run dev -w web`  (http://localhost:5173, proxy /api -> :3000)
- Build API: `npm run build -w api`
- Test API: `npm run test -w api`
- Coverage: `npm run test:coverage -w api`
- Vitest UI: `npm run test:ui -w api`
- E2E: `npm test -w e2e`  (richiede `npx playwright install` una volta)
- Lint: `npm run lint`

## Modello di dominio (già definito in api/src/types.ts e web/src/types.ts)
`Task { id, title, description?, status: "todo"|"in-progress"|"done", createdAt }`

## API REST da implementare (api/src/routes/tasks.ts + services/taskService.ts)
- `GET    /api/tasks?status=` — lista, filtro opzionale per stato
- `POST   /api/tasks` — `{ title, description? }` → 201 + task creato (titolo obbligatorio)
- `PATCH  /api/tasks/:id` — aggiorna stato/titolo → 200
- `DELETE /api/tasks/:id` — → 204

## Convenzioni
- TypeScript strict; niente `any` sui parametri di richiesta (tipizza `Request`/`Response`).
- Validazione: titolo non vuoto; `status` ∈ {todo, in-progress, done}.
- Errori in formato **Problem Details RFC 9457** (`application/problem+json`):
  campi `type`, `title`, `status`, `detail`. 400 per input non valido, 404 se id assente.
- Invarianti del dominio (da coprire con `@fast-check/vitest`):
  1. dopo `create`, `getAll()` include il task;
  2. dopo `remove`, `getById()` ritorna `null`;
  3. `getAll(status)` ritorna solo task con quello stato.

## Documentazione
- **User stories** (5 storie + acceptance criteria): [`docs/user-stories/user-stories.md`](docs/user-stories/user-stories.md)

## Definition of Done
4 endpoint funzionanti · validazione + errori RFC 9457 · suite Vitest con coverage > 80% ·
≥ 2 property test fast-check · 4 componenti React collegati all'API · CI verde.
