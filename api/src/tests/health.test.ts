import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../app";

// Smoke test di partenza: lo espanderai con i test del TaskService.
describe("health", () => {
  it("GET /health risponde ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
