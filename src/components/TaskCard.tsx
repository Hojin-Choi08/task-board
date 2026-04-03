import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, isBefore, addDays } from "date-fns";
import type { Task } from "../types";

interface Props {
  task: Task;
  onClick: () => void;
  onDelete: (id: string) => void;
}

function getDueDateBadge(due_date?: string) {
  if (!due_date) return null;
  const due = new Date(due_date);
  const now = new Date();
  if (isBefore(due, now))
    return { cls: "badge badge-overdue", label: "⚠️ Overdue" };
  if (isBefore(due, addDays(now, 2)))
    return { cls: "badge badge-soon", label: "⏰ Due soon" };
  return { cls: "badge badge-date", label: "📅 " + format(due, "MMM d") };
}

export function TaskCard({ task, onClick, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueBadge = getDueDateBadge(task.due_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`task-card${isDragging ? " dragging" : ""}`}
    >
      <div className="task-card-top">
        <p className="task-title">{task.title}</p>
        <button
          className="task-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          ✕
        </button>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-badges">
        <span className={`badge badge-${task.priority}`}>
          {task.priority === "high"
            ? "🔴"
            : task.priority === "normal"
              ? "🟡"
              : "🟢"}{" "}
          {task.priority}
        </span>
        {dueBadge && <span className={dueBadge.cls}>{dueBadge.label}</span>}
      </div>
    </div>
  );
}
