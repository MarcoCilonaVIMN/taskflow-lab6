import { randomUUID } from "node:crypto";
import type {
  CreateTaskInput,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from "../types";

export class TaskService {
  private tasks: Map<string, Task> = new Map();

  getAll(status?: TaskStatus): Task[] {
    const all = Array.from(this.tasks.values());
    return status ? all.filter((t) => t.status === status) : all;
  }

  getById(id: string): Task | null {
    return this.tasks.get(id) ?? null;
  }

  create(input: CreateTaskInput): Task {
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description,
      status: "todo",
      createdAt: new Date().toISOString(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  update(id: string, patch: UpdateTaskInput): Task | null {
    const task = this.tasks.get(id);
    if (!task) return null;
    const updated: Task = { ...task, ...patch };
    this.tasks.set(id, updated);
    return updated;
  }

  remove(id: string): boolean {
    return this.tasks.delete(id);
  }

  reset(): void {
    this.tasks.clear();
  }
}

export const taskService = new TaskService();
