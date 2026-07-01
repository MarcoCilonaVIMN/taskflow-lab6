import { useState } from "react";
import { deleteTask, updateTask } from "../api";
import type { Task, TaskStatus } from "../types";

const NEXT_STATUSES: Record<TaskStatus, TaskStatus[]> = {
  todo: ["in-progress"],
  "in-progress": ["todo", "done"],
  done: ["in-progress"],
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  "in-progress": "In Progress",
  done: "Done",
};

const TAG_CLASS: Record<TaskStatus, string> = {
  todo: "tag is-info is-light",
  "in-progress": "tag is-warning is-light",
  done: "tag is-success is-light",
};

interface TaskCardProps {
  task: Task;
  onUpdated: (updated: Task) => void;
  onDeleted: (id: string) => void;
}

export function TaskCard({ task, onUpdated, onDeleted }: TaskCardProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(status: TaskStatus) {
    setBusy(true);
    setError(null);
    try {
      const updated = await updateTask(task.id, { status });
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore aggiornamento stato");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await deleteTask(task.id);
      onDeleted(task.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore eliminazione");
      setBusy(false);
    }
  }

  const date = new Date(task.createdAt).toLocaleDateString("it-IT", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div className="card">
      <div className="card-content pb-3">
        <div className="level is-mobile mb-2">
          <div className="level-left">
            <p className="title is-6 mb-0">{task.title}</p>
          </div>
          <div className="level-right">
            <span className={TAG_CLASS[task.status]} aria-label="stato">
              {STATUS_LABELS[task.status]}
            </span>
          </div>
        </div>

        {task.description && (
          <p className="is-size-7 has-text-grey mb-2">{task.description}</p>
        )}

        <p className="is-size-7 has-text-grey-light">
          <time dateTime={task.createdAt}>Creato il {date}</time>
        </p>
      </div>

      <footer className="card-footer">
        {NEXT_STATUSES[task.status].map((status) => (
          <button
            key={status}
            className="card-footer-item button is-ghost is-small"
            type="button"
            onClick={() => handleStatusChange(status)}
            disabled={busy}
          >
            → {STATUS_LABELS[status]}
          </button>
        ))}
        <button
          className="card-footer-item button is-ghost is-small has-text-danger"
          type="button"
          onClick={handleDelete}
          disabled={busy}
        >
          Elimina
        </button>
      </footer>

      {error && (
        <div className="notification is-danger is-light py-2 px-3 mx-4 mb-3">
          {error}
        </div>
      )}
    </div>
  );
}
