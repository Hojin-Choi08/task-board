import { useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useTasks } from "./hooks/useTasks";
import { Column } from "./components/Column";
import { TaskCard } from "./components/TaskCard";
import { TaskModal } from "./components/TaskModal";
import { COLUMNS } from "./types";
import type { Task, Status } from "./types";

export default function App() {
  const [search, setSearch] = useState("");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);

  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTasks(search);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const validStatuses: Status[] = [
      "todo",
      "in_progress",
      "in_review",
      "done",
    ];
    if (validStatuses.includes(over.id as Status)) {
      if (task.status !== over.id) moveTask(task.id, over.id as Status);
      return;
    }

    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask && task.status !== overTask.status) {
      moveTask(task.id, overTask.status);
    }
  }

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">📋</div>
          TaskBoard
        </div>

        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="stats">
          <span>{totalTasks} tasks</span>
          <span className="done">{doneTasks} done</span>
        </div>

        <button
          className="btn-new"
          onClick={() => {
            setSelectedTask(null);
            setShowModal(true);
          }}
        >
          + New Task
        </button>
      </header>

      {/* Board */}
      <main>
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="loading">
            <p style={{ color: "#ef4444", fontSize: "14px" }}>Error: {error}</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="board">
              {COLUMNS.map((col) => (
                <Column
                  key={col.id}
                  id={col.id}
                  label={col.label}
                  tasks={tasks.filter((t) => t.status === col.id)}
                  onTaskClick={(task) => {
                    setSelectedTask(task);
                    setShowModal(true);
                  }}
                  onDelete={deleteTask}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  onClick={() => {}}
                  onDelete={() => {}}
                />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
          }}
          onCreate={createTask}
          onUpdate={updateTask}
        />
      )}
    </div>
  );
}
