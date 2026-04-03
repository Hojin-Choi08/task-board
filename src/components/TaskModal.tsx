import { useState, useEffect } from "react";
import type { Task, Priority, Status } from "../types";

interface Props {
  task?: Task | null;
  onClose: () => void;
  onCreate: (task: Omit<Task, "id" | "user_id" | "created_at">) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

const priorities: Priority[] = ["low", "normal", "high"];

export function TaskModal({ task, onClose, onCreate, onUpdate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setDueDate(task.due_date || "");
    }
  }, [task]);

  function handleSubmit() {
    if (!title.trim()) return;
    if (task) {
      onUpdate(task.id, {
        title,
        description,
        priority,
        due_date: dueDate || undefined,
      });
    } else {
      onCreate({
        title,
        description,
        priority,
        status: "todo" as Status,
        due_date: dueDate || undefined,
      });
    }
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{task ? "Edit Task" : "New Task"}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div>
            <label className="form-label">Title *</label>
            <input
              autoFocus
              type="text"
              className="form-input"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              placeholder="Add more details..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: "none" }}
            />
          </div>

          <div>
            <label className="form-label">Priority</label>
            <div className="priority-buttons">
              {priorities.map((p) => (
                <button
                  key={p}
                  className={`priority-btn${priority === p ? ` active-${p}` : ""}`}
                  onClick={() => setPriority(p)}
                >
                  {p === "high" ? "🔴" : p === "normal" ? "🟡" : "🟢"} {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            {task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
