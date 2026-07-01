import { useEffect, useState } from "react";
import { getTasks } from "../api";
import type { Task, TaskStatus } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  filter: TaskStatus | "all";
  refreshKey: number;
}

export function TaskList({ filter, refreshKey }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey è un contatore esterno intenzionale per forzare il re-fetch
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getTasks(filter === "all" ? undefined : filter)
      .then((data) => {
        if (!controller.signal.aborted) setTasks(data);
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(err instanceof Error ? err.message : "Errore caricamento");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filter, refreshKey]);

  function handleUpdated(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleDeleted(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) {
    return (
      <div className="py-4">
        <progress className="progress is-small is-link" max="100">
          Caricamento…
        </progress>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification is-danger is-light" role="alert">
        <strong>Errore:</strong> {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="has-text-centered py-6 has-text-grey">
        <p className="is-size-5">Nessun task trovato.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}
