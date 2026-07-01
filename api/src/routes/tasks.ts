import { Router } from "express";
import type { Request, Response } from "express";
import { taskService } from "../services/taskService";
import type { TaskStatus, CreateTaskInput, UpdateTaskInput } from "../types";

export const tasksRouter = Router();

const VALID_STATUSES: TaskStatus[] = ["todo", "in-progress", "done"];

function problem(res: Response, status: number, title: string, detail: string) {
  res.status(status).contentType("application/problem+json").json({
    type: `https://httpstatuses.com/${status}`,
    title,
    status,
    detail,
  });
}

// GET /api/tasks?status=
tasksRouter.get("/", (req: Request, res: Response) => {
  const { status } = req.query;
  if (status !== undefined && !VALID_STATUSES.includes(status as TaskStatus)) {
    return problem(res, 400, "Bad Request", `status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  res.json(taskService.getAll(status as TaskStatus | undefined));
});

// POST /api/tasks
tasksRouter.post("/", (req: Request, res: Response) => {
  const { title, description } = req.body as CreateTaskInput;
  if (!title || title.trim() === "") {
    return problem(res, 400, "Bad Request", "title is required and cannot be empty");
  }
  const task = taskService.create({ title: title.trim(), description });
  res.status(201).json(task);
});

// PATCH /api/tasks/:id
tasksRouter.patch("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const patch = req.body as UpdateTaskInput;

  if (patch.title !== undefined && patch.title.trim() === "") {
    return problem(res, 400, "Bad Request", "title cannot be empty");
  }
  if (patch.status !== undefined && !VALID_STATUSES.includes(patch.status)) {
    return problem(res, 400, "Bad Request", `status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const task = taskService.update(id, {
    ...(patch.title !== undefined && { title: patch.title.trim() }),
    ...(patch.status !== undefined && { status: patch.status }),
  });

  if (!task) return problem(res, 404, "Not Found", `Task with id "${id}" not found`);
  res.json(task);
});

// DELETE /api/tasks/:id
tasksRouter.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const deleted = taskService.remove(id);
  if (!deleted) return problem(res, 404, "Not Found", `Task with id "${id}" not found`);
  res.status(204).send();
});
