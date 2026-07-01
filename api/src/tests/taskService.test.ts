import { describe, it, expect, beforeEach } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import { TaskService, taskService } from "../services/taskService";
import type { TaskStatus } from "../types";
import request from "supertest";
import { app } from "../app";

// ---------------------------------------------------------------------------
// SERVICE — istanza fresca per ogni test unitario
// ---------------------------------------------------------------------------
let svc: TaskService;
beforeEach(() => {
  svc = new TaskService();
});

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
describe("create", () => {
  it("restituisce un task con i campi corretti", () => {
    const task = svc.create({ title: "Scrivi i test" });

    expect(task.id).toBeTypeOf("string");
    expect(task.id.length).toBeGreaterThan(0);
    expect(task.title).toBe("Scrivi i test");
    expect(task.description).toBeUndefined();
    expect(task.status).toBe("todo");
    expect(task.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("include la description quando fornita", () => {
    const task = svc.create({ title: "T", description: "dettaglio" });
    expect(task.description).toBe("dettaglio");
  });

  it("genera id univoci per task distinti", () => {
    const a = svc.create({ title: "A" });
    const b = svc.create({ title: "B" });
    expect(a.id).not.toBe(b.id);
  });
});

// ---------------------------------------------------------------------------
// READ — getAll
// ---------------------------------------------------------------------------
describe("getAll", () => {
  it("ritorna array vuoto quando non ci sono task", () => {
    expect(svc.getAll()).toEqual([]);
  });

  it("ritorna array vuoto con filtro attivo e store vuoto", () => {
    expect(svc.getAll("done")).toEqual([]);
  });

  it("ritorna tutti i task senza filtro", () => {
    svc.create({ title: "A" });
    svc.create({ title: "B" });
    expect(svc.getAll()).toHaveLength(2);
  });

  it("filtra per status todo", () => {
    svc.create({ title: "A" });
    const b = svc.create({ title: "B" });
    svc.update(b.id, { status: "in-progress" });

    const result = svc.getAll("todo");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("A");
  });

  it("filtra per status in-progress", () => {
    const a = svc.create({ title: "A" });
    svc.create({ title: "B" });
    svc.update(a.id, { status: "in-progress" });

    const result = svc.getAll("in-progress");
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("in-progress");
  });

  it("filtra per status done", () => {
    const a = svc.create({ title: "A" });
    svc.create({ title: "B" });
    svc.update(a.id, { status: "done" });

    const result = svc.getAll("done");
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("done");
  });

  it("ritorna array vuoto quando nessun task corrisponde al filtro", () => {
    svc.create({ title: "A" });
    expect(svc.getAll("done")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// READ — getById
// ---------------------------------------------------------------------------
describe("getById", () => {
  it("ritorna il task corretto tramite id", () => {
    const created = svc.create({ title: "Task X" });
    const found = svc.getById(created.id);
    expect(found).toEqual(created);
  });

  it("ritorna null per id inesistente", () => {
    expect(svc.getById("id-che-non-esiste")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
describe("update", () => {
  it("aggiorna il title", () => {
    const task = svc.create({ title: "Vecchio titolo" });
    const updated = svc.update(task.id, { title: "Nuovo titolo" });

    expect(updated).not.toBeNull();
    expect(updated!.title).toBe("Nuovo titolo");
    expect(updated!.status).toBe("todo");
  });

  it("aggiorna lo status", () => {
    const task = svc.create({ title: "T" });
    const updated = svc.update(task.id, { status: "in-progress" });

    expect(updated!.status).toBe("in-progress");
    expect(updated!.title).toBe("T");
  });

  it("aggiorna title e status insieme", () => {
    const task = svc.create({ title: "T" });
    const updated = svc.update(task.id, { title: "U", status: "done" });

    expect(updated!.title).toBe("U");
    expect(updated!.status).toBe("done");
  });

  it("id e createdAt restano invariati dopo update", () => {
    const task = svc.create({ title: "T" });
    const updated = svc.update(task.id, { title: "Nuovo", status: "done" });

    expect(updated!.id).toBe(task.id);
    expect(updated!.createdAt).toBe(task.createdAt);
  });

  it("patch vuota {} restituisce il task invariato", () => {
    const task = svc.create({ title: "T" });
    const updated = svc.update(task.id, {});

    expect(updated).toEqual(task);
  });

  it("persiste la modifica — getById riflette il nuovo valore", () => {
    const task = svc.create({ title: "T" });
    svc.update(task.id, { status: "done" });
    expect(svc.getById(task.id)!.status).toBe("done");
  });

  it("ritorna null per id inesistente", () => {
    expect(svc.update("id-inesistente", { status: "done" })).toBeNull();
  });

  it("non modifica altri task", () => {
    const a = svc.create({ title: "A" });
    const b = svc.create({ title: "B" });
    svc.update(a.id, { status: "done" });

    expect(svc.getById(b.id)!.status).toBe("todo");
  });
});

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
describe("remove", () => {
  it("ritorna true e rimuove il task", () => {
    const task = svc.create({ title: "T" });
    expect(svc.remove(task.id)).toBe(true);
    expect(svc.getById(task.id)).toBeNull();
  });

  it("ritorna false per id inesistente", () => {
    expect(svc.remove("id-inesistente")).toBe(false);
  });

  it("doppia cancellazione: la seconda chiamata ritorna false", () => {
    const task = svc.create({ title: "T" });
    svc.remove(task.id);
    expect(svc.remove(task.id)).toBe(false);
  });

  it("non rimuove altri task", () => {
    const a = svc.create({ title: "A" });
    const b = svc.create({ title: "B" });
    svc.remove(a.id);
    expect(svc.getById(b.id)).not.toBeNull();
  });

  it("dopo remove getAll non include più il task", () => {
    const task = svc.create({ title: "T" });
    svc.remove(task.id);
    expect(svc.getAll().find((t) => t.id === task.id)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// PROPERTY TEST — invarianti di dominio con fast-check
// ---------------------------------------------------------------------------
describe("property tests", () => {
  const titleArb = fc
    .oneof(
      fc.string({ minLength: 1, maxLength: 80 }),
      fc.constantFrom("Fix bug", "Review PR", "Deploy", "Write docs", "A", "  hello  ")
    )
    .filter((s) => s.trim().length > 0);

  const statusArb = fc.constantFrom<TaskStatus>("todo", "in-progress", "done");
  const descriptionArb = fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined });

  // Proprietà 1: create restituisce un task con esattamente il titolo passato
  test.prop([titleArb, descriptionArb])(
    "create: il task restituito ha esattamente il titolo passato in input",
    (title, description) => {
      const task = svc.create({ title, description });

      expect(task.title).toBe(title);
      expect(task.status).toBe("todo");
      expect(task.id).toBeTypeOf("string");
      expect(task.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      if (description !== undefined) expect(task.description).toBe(description);
    }
  );

  // Proprietà 2: dopo remove(), getById() ritorna sempre null
  test.prop([titleArb])(
    "remove: dopo la cancellazione getById() ritorna null",
    (title) => {
      const task = svc.create({ title });
      svc.remove(task.id);

      expect(svc.getById(task.id)).toBeNull();
    }
  );

  // Proprietà 3: getAll(status) ritorna esattamente i task con quello status
  // — verifica sia "nessun intruso" sia "nessuna omissione"
  test.prop([
    fc.array(fc.record({ title: titleArb, status: statusArb }), { minLength: 1, maxLength: 10 }),
    statusArb,
  ])(
    "getAll(status): risultato coincide esattamente con i task aventi quello status",
    (inputs, filterStatus) => {
      const created = inputs.map(({ title, status }) => {
        const t = svc.create({ title });
        svc.update(t.id, { status });
        return { ...t, status };
      });

      const expectedCount = created.filter((t) => t.status === filterStatus).length;
      const filtered = svc.getAll(filterStatus);

      // nessun intruso
      expect(filtered.every((t) => t.status === filterStatus)).toBe(true);
      // nessuna omissione
      expect(filtered).toHaveLength(expectedCount);
    }
  );

  // Proprietà bonus: getAll() senza filtro non perde task
  test.prop([fc.array(titleArb, { minLength: 1, maxLength: 15 })])(
    "getAll senza filtro include tutti i task creati",
    (titles) => {
      const ids = titles.map((title) => svc.create({ title }).id);
      const allIds = svc.getAll().map((t) => t.id);

      expect(ids.every((id) => allIds.includes(id))).toBe(true);
    }
  );
});

// ---------------------------------------------------------------------------
// ROUTE — il singleton viene resettato prima di ogni test
// per evitare stato condiviso e dipendenza dall'ordine
// ---------------------------------------------------------------------------
describe("routes", () => {
  beforeEach(() => {
    taskService.reset();
  });

  // --- Happy path ---

  it("GET /api/tasks → 200 con array", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("GET /api/tasks restituisce i task creati", async () => {
    await request(app).post("/api/tasks").send({ title: "T1" });
    await request(app).post("/api/tasks").send({ title: "T2" });

    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("GET /api/tasks?status=todo → 200 solo task con status todo", async () => {
    const post = await request(app).post("/api/tasks").send({ title: "A" });
    const id = post.body.id;
    await request(app).post("/api/tasks").send({ title: "B" });
    await request(app).patch(`/api/tasks/${id}`).send({ status: "done" });

    const res = await request(app).get("/api/tasks?status=todo");
    expect(res.status).toBe(200);
    expect(res.body.every((t: { status: string }) => t.status === "todo")).toBe(true);
  });

  it("POST con titolo valido → 201 + body corretto", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Nuovo task", description: "desc" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: "Nuovo task",
      description: "desc",
      status: "todo",
    });
    expect(res.body.id).toBeTypeOf("string");
    expect(res.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("POST con spazi attorno al titolo → titolo trimmato nel task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "  Task con spazi  " });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Task con spazi");
  });

  it("PATCH solo title su task esistente → 200 titolo aggiornato", async () => {
    const { body: created } = await request(app)
      .post("/api/tasks")
      .send({ title: "Originale" });

    const res = await request(app)
      .patch(`/api/tasks/${created.id}`)
      .send({ title: "Modificato" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Modificato");
    expect(res.body.status).toBe("todo");
  });

  it("PATCH body vuoto {} su task esistente → 200 task invariato", async () => {
    const { body: created } = await request(app)
      .post("/api/tasks")
      .send({ title: "Stabile" });

    const res = await request(app)
      .patch(`/api/tasks/${created.id}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Stabile");
    expect(res.body.status).toBe("todo");
  });

  it("DELETE task esistente → 204 body vuoto", async () => {
    const { body: created } = await request(app)
      .post("/api/tasks")
      .send({ title: "Da eliminare" });

    const res = await request(app).delete(`/api/tasks/${created.id}`);
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
  });

  // --- Validazione e error handling ---

  it("POST titolo vuoto → 400 RFC 9457 completo", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "" });

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
    expect(res.body).toMatchObject({
      type: expect.stringContaining("400"),
      title: "Bad Request",
      status: 400,
      detail: expect.any(String),
    });
  });

  it("POST titolo solo spazi → 400", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "   " });
    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
  });

  it("POST senza title → 400", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ description: "nessun titolo" });

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
  });

  it("GET ?status=invalido → 400 RFC 9457 completo", async () => {
    const res = await request(app).get("/api/tasks?status=invalido");

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
    expect(res.body).toMatchObject({
      type: expect.stringContaining("400"),
      title: "Bad Request",
      status: 400,
      detail: expect.any(String),
    });
  });

  it("PATCH titolo vuoto → 400 RFC 9457 completo", async () => {
    const { body: created } = await request(app)
      .post("/api/tasks")
      .send({ title: "T" });

    const res = await request(app)
      .patch(`/api/tasks/${created.id}`)
      .send({ title: "" });

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
    expect(res.body).toMatchObject({ status: 400, title: "Bad Request", detail: expect.any(String) });
  });

  it("PATCH titolo solo spazi → 400", async () => {
    const { body: created } = await request(app)
      .post("/api/tasks")
      .send({ title: "T" });

    const res = await request(app)
      .patch(`/api/tasks/${created.id}`)
      .send({ title: "   " });

    expect(res.status).toBe(400);
  });

  it("PATCH status non valido → 400 RFC 9457 completo", async () => {
    const res = await request(app)
      .patch("/api/tasks/qualsiasi-id")
      .send({ status: "strano" });

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
    expect(res.body).toMatchObject({ status: 400, title: "Bad Request", detail: expect.any(String) });
  });

  it("PATCH id inesistente → 404 RFC 9457 completo", async () => {
    const res = await request(app)
      .patch("/api/tasks/id-inesistente")
      .send({ status: "done" });

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
    expect(res.body).toMatchObject({
      type: expect.stringContaining("404"),
      title: "Not Found",
      status: 404,
      detail: expect.any(String),
    });
  });

  it("DELETE id inesistente → 404 RFC 9457 completo", async () => {
    const res = await request(app).delete("/api/tasks/id-inesistente");

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
    expect(res.body).toMatchObject({
      type: expect.stringContaining("404"),
      title: "Not Found",
      status: 404,
      detail: expect.any(String),
    });
  });

  // --- Flusso completo ---

  it("flusso completo: crea → aggiorna status → aggiorna title → elimina", async () => {
    const post = await request(app)
      .post("/api/tasks")
      .send({ title: "Flusso completo" });
    expect(post.status).toBe(201);
    const id: string = post.body.id;

    const patch1 = await request(app)
      .patch(`/api/tasks/${id}`)
      .send({ status: "in-progress" });
    expect(patch1.body.status).toBe("in-progress");

    const patch2 = await request(app)
      .patch(`/api/tasks/${id}`)
      .send({ title: "Completato", status: "done" });
    expect(patch2.body.title).toBe("Completato");
    expect(patch2.body.status).toBe("done");

    const del = await request(app).delete(`/api/tasks/${id}`);
    expect(del.status).toBe(204);

    const list = await request(app).get("/api/tasks");
    expect(list.body.find((t: { id: string }) => t.id === id)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// INPUT EDGE CASE — titoli invisibili, caratteri speciali, payloads XSS
// ---------------------------------------------------------------------------
describe("input edge cases", () => {
  beforeEach(() => {
    taskService.reset();
  });

  // --- Titoli visivamente vuoti: devono essere rifiutati (400) ---

  const blankTitles: Array<[string, string]> = [
    ["spazio singolo", " "],
    ["solo tab", "\t"],
    ["solo newline", "\n"],
    ["tab + newline", "\t\n"],
    ["zero-width space (U+200B)", "​"],
    ["zero-width non-joiner (U+200C)", "‌"],
    ["zero-width joiner (U+200D)", "‍"],
    ["BOM / zero-width no-break (U+FEFF)", "﻿"],
    ["mix zero-width + spazi", "​ ‌ \t"],
    ["control char NUL (U+0000)", "\x00"],
    ["control char US (U+001F)", "\x1F"],
    ["control chars multipli", "\x00\x01\x1F"],
  ];

  for (const [label, value] of blankTitles) {
    it(`POST title "${label}" → 400`, async () => {
      const res = await request(app).post("/api/tasks").send({ title: value });
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/problem\+json/);
    });

    it(`PATCH title "${label}" → 400`, async () => {
      const { body: created } = await request(app)
        .post("/api/tasks")
        .send({ title: "Base" });
      const res = await request(app)
        .patch(`/api/tasks/${created.id}`)
        .send({ title: value });
      expect(res.status).toBe(400);
    });
  }

  // --- Titoli con zero-width ma contenuto reale: devono passare (201) ---

  it('POST "​hello" (ZWS + testo) → 201 accettato', async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "​hello" });
    expect(res.status).toBe(201);
  });

  // --- Bidi / spoofing: l'API accetta, il frontend è responsabile del render ---

  it("POST title con RTL override (U+202E) → 201 salvato verbatim (responsabilità frontend)", async () => {
    const title = "Task‮payload";
    const res = await request(app).post("/api/tasks").send({ title });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(title);
  });

  // --- XSS payload: API JSON non renderizza HTML, salva verbatim ---

  const xssPayloads = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    '"><svg/onload=alert(1)>',
  ];

  for (const payload of xssPayloads) {
    it(`POST title XSS "${payload.slice(0, 30)}…" → 201 salvato verbatim`, async () => {
      const res = await request(app).post("/api/tasks").send({ title: payload });
      expect(res.status).toBe(201);
      // L'API restituisce la stringa intatta: il sanitize è responsabilità del client
      expect(res.body.title).toBe(payload);
    });
  }

  // --- description: nessuna validazione, qualsiasi stringa viene salvata ---

  it("POST description XSS → 201 salvato verbatim", async () => {
    const description = "<script>alert(1)</script>";
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "T", description });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe(description);
  });

  it("POST description con caratteri zero-width → 201 accettato senza validazione", async () => {
    const description = "​‌ testo ‍";
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "T", description });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe(description);
  });

  // --- Property test: qualsiasi titolo con contenuto visibile reale → sempre 201 ---

  const visibleTitleArb = fc
    .string({ minLength: 1, maxLength: 80 })
    .filter((s) => s.replace(new RegExp("[​-‍﻿\x00-\x1F]", "g"), "").trim().length > 0);

  test.prop([visibleTitleArb])(
    "POST: qualsiasi titolo visibile → 201",
    async (title) => {
      taskService.reset();
      const res = await request(app).post("/api/tasks").send({ title });
      expect(res.status).toBe(201);
    }
  );
});
