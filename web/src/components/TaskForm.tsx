import { useState } from "react";
import { createTask } from "../api";
import type { Task } from "../types";

interface TaskFormProps {
  onCreated: (task: Task) => void;
}

export function TaskForm({ onCreated }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const task = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onCreated(task);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore creazione task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="title is-5 mb-4">Nuovo Task</p>

      <div className="field">
        <label className="label" htmlFor="task-title">
          Titolo *
        </label>
        <div className="control">
          <input
            id="task-title"
            className="input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            required
            placeholder="Es. Revisione PR #42"
          />
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="task-description">
          Descrizione
        </label>
        <div className="control">
          <textarea
            id="task-description"
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            placeholder="Dettagli opzionali…"
            rows={2}
          />
        </div>
      </div>

      {error && (
        <div className="notification is-danger is-light py-2 px-3 mb-3">
          {error}
        </div>
      )}

      <div className="field is-grouped is-grouped-right">
        <p className="control">
          <button
            className={`button is-link${submitting ? " is-loading" : ""}`}
            type="submit"
            disabled={submitting || title.trim() === ""}
          >
            Crea Task
          </button>
        </p>
      </div>
    </form>
  );
}
