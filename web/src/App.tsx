import { useState } from "react";
import { StatusFilter } from "./components/StatusFilter";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import type { Task, TaskStatus } from "./types";

export function App() {
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  function handleCreated(_task: Task) {
    setRefreshKey((k) => k + 1);
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="mb-5">
          <h1 className="title is-2 mb-1">TaskFlow</h1>
          <p className="subtitle is-6 has-text-grey">
            Gestisci i task del tuo team
          </p>
        </div>

        <div className="box mb-4">
          <StatusFilter current={filter} onChange={setFilter} />
        </div>

        <div className="box mb-5">
          <TaskForm onCreated={handleCreated} />
        </div>

        <TaskList filter={filter} refreshKey={refreshKey} />
      </div>
    </section>
  );
}
