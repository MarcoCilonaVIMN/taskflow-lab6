import type { Task } from "./types";

const BASE = "/api/tasks";

// Helper fetch verso l'API. Punto di partenza.
// TODO (con l'AI): completa create / update / remove riusando questo pattern.
export async function getTasks(status?: string): Promise<Task[]> {
  const url = status ? `${BASE}?status=${status}` : BASE;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}
