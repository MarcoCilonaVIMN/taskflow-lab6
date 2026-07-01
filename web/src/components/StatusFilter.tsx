import type { TaskStatus } from "../types";

type FilterValue = TaskStatus | "all";

const OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Tutti" },
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

interface StatusFilterProps {
  current: FilterValue;
  onChange: (value: FilterValue) => void;
}

export function StatusFilter({ current, onChange }: StatusFilterProps) {
  return (
    <fieldset
      className="buttons has-addons"
      aria-label="Filtra per stato"
      style={{ border: "none", padding: 0, margin: 0 }}
    >
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`button is-small${current === value ? " is-link is-selected" : ""}`}
          aria-pressed={current === value}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </fieldset>
  );
}
