import { Router } from "express";

// Router dei task.
// TODO (con l'AI): implementa
//   GET    /            lista con filtro ?status=
//   POST   /            crea task (titolo obbligatorio) -> 201
//   PATCH  /:id         aggiorna stato/titolo -> 200
//   DELETE /:id         elimina -> 204
// Error handling in formato Problem Details (RFC 9457, application/problem+json).
export const tasksRouter = Router();
