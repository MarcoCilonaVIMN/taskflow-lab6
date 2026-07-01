import express from "express";
import { tasksRouter } from "./routes/tasks";

export const app = express();

app.use(express.json());

// Health check (già pronto: utile per smoke test e CI)
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/tasks", tasksRouter);
