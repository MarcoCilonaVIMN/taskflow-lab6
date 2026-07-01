import { describe, it, expect, beforeEach } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import { TaskService } from "../services/taskService";
import type { TaskStatus } from "../types";

// Ogni suite usa una istanza fresca — nessuna contaminazione tra test.
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
  const titleArb = fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0);
  const statusArb = fc.constantFrom<TaskStatus>("todo", "in-progress", "done");

  test.prop([titleArb])(
    "dopo create, getAll() include sempre il task creato",
    (title) => {
      const task = svc.create({ title });
      const all = svc.getAll();
      expect(all.some((t) => t.id === task.id)).toBe(true);
    }
  );

  test.prop([titleArb])(
    "dopo remove, getById() ritorna null",
    (title) => {
      const task = svc.create({ title });
      svc.remove(task.id);
      expect(svc.getById(task.id)).toBeNull();
    }
  );

  test.prop([titleArb, statusArb])(
    "getAll(status) ritorna solo task con quello status",
    (title, status) => {
      const task = svc.create({ title });
      svc.update(task.id, { status });
      const filtered = svc.getAll(status);
      expect(filtered.every((t) => t.status === status)).toBe(true);
    }
  );
});

// ---------------------------------------------------------------------------
// ROUTE — validazione input via supertest (400 e 404)
// ---------------------------------------------------------------------------
import request from "supertest";
import { app } from "../app";

describe("routes — validazione e error handling", () => {
  it("POST titolo vuoto → 400 problem+json", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "" });

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
    expect(res.body).toMatchObject({ status: 400, title: "Bad Request" });
  });

  it("POST senza title → 400", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ description: "nessun titolo" });

    expect(res.status).toBe(400);
  });

  it("GET ?status=invalido → 400 problem+json", async () => {
    const res = await request(app).get("/api/tasks?status=invalido");
    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
  });

  it("PATCH id inesistente → 404 problem+json", async () => {
    const res = await request(app)
      .patch("/api/tasks/id-inesistente")
      .send({ status: "done" });

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
    expect(res.body).toMatchObject({ status: 404, title: "Not Found" });
  });

  it("PATCH status non valido → 400 problem+json", async () => {
    const res = await request(app)
      .patch("/api/tasks/qualsiasi-id")
      .send({ status: "strano" });

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
  });

  it("DELETE id inesistente → 404 problem+json", async () => {
    const res = await request(app).delete("/api/tasks/id-inesistente");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/problem\+json/);
  });

  it("flusso completo: crea → aggiorna → elimina", async () => {
    const post = await request(app)
      .post("/api/tasks")
      .send({ title: "Flusso completo" });
    expect(post.status).toBe(201);
    const id = post.body.id;

    const patch = await request(app)
      .patch(`/api/tasks/${id}`)
      .send({ status: "done" });
    expect(patch.status).toBe(200);
    expect(patch.body.status).toBe("done");

    const del = await request(app).delete(`/api/tasks/${id}`);
    expect(del.status).toBe(204);

    const list = await request(app).get("/api/tasks");
    expect(list.body.find((t: { id: string }) => t.id === id)).toBeUndefined();
  });
});
