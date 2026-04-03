import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, Status } from "../types";
import { TaskCard } from "./TaskCard";

interface Props {
  id: Status;
  label: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDelete: (id: string) => void;
}

const columnStyles: Record<Status, { dot: string; countCls: string }> = {
  todo: { dot: "#94a3b8", countCls: "column-count" },
  in_progress: { dot: "#6366f1", countCls: "column-count" },
  in_review: { dot: "#f59e0b", countCls: "column-count" },
  done: { dot: "#22c55e", countCls: "column-count" },
};

export function Column({ id, label, tasks, onTaskClick, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const { dot } = columnStyles[id];

  return (
    <div className="column">
      <div className="column-header">
        <span className="column-dot" style={{ background: dot }} />
        <span className="column-title">{label}</span>
        <span
          className="column-count"
          style={{
            background:
              id === "done"
                ? "#f0fdf4"
                : id === "in_progress"
                  ? "#eef2ff"
                  : id === "in_review"
                    ? "#fffbeb"
                    : "#f8fafc",
            color:
              id === "done"
                ? "#16a34a"
                : id === "in_progress"
                  ? "#6366f1"
                  : id === "in_review"
                    ? "#d97706"
                    : "#64748b",
          }}
        >
          {tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className={`column-body${isOver ? " over" : ""}`}>
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="column-empty">Drop tasks here</div>
        )}
      </div>
    </div>
  );
}
