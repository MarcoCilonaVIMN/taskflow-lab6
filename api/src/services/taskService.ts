import type { Task } from "../types";

/**
 * TaskService — logica di business del dominio.
 *
 * TODO (con l'AI): implementa i metodi CRUD usando lo store in-memory `tasks`.
 *   - getAll(status?: TaskStatus): Task[]
 *   - getById(id: string): Task | null
 *   - create(input: CreateTaskInput): Task
 *   - update(id: string, patch: UpdateTaskInput): Task | null
 *   - remove(id: string): boolean
 * Invarianti da rispettare (le verificheremo con fast-check):
 *   - dopo create, getAll() include il task creato
 *   - dopo remove, getById() ritorna null per quell'id
 *   - getAll(status) ritorna solo task con quello stato
 */
export class TaskService {
  private tasks: Task[] = [];
}
