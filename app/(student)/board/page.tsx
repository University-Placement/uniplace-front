"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
  type Task,
  type TaskCategory,
  type TaskStatus,
} from "@/lib/student-api";

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "doing", label: "In Progress" },
  { key: "done", label: "Done" },
];

const CATEGORY_STYLE: Record<TaskCategory, string> = {
  task: "bg-brand/10 text-brand",
  study: "bg-accent-yellow/30 text-ink",
  goal: "bg-accent-orange/15 text-accent-orange",
};

const CATEGORY_LABEL: Record<TaskCategory, string> = {
  task: "To-do",
  study: "Study",
  goal: "Goal",
};

export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("task");
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);

  async function load() {
    setTasks(await listTasks());
    setLoading(false);
  }
  useEffect(() => {
    void load();
  }, []);

  async function add() {
    if (!title.trim()) return;
    const t = await createTask({ title: title.trim(), category });
    setTasks((prev) => [...prev, t]);
    setTitle("");
  }

  async function setStatus(id: number, status: TaskStatus) {
    setTasks((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    await updateTask(id, { status });
  }

  async function remove(t: Task) {
    setTasks((prev) => prev.filter((x) => x.id !== t.id));
    await deleteTask(t.id);
  }

  function onDrop(status: TaskStatus) {
    if (draggingId != null) void setStatus(draggingId, status);
    setDraggingId(null);
    setOverCol(null);
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Study Board</h1>
        <p className="mt-1 text-muted">
          Plan your prep — drag cards across columns to track to-dos, study tasks,
          and goals.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a card… (e.g. Review linear equations)"
            className="flex-1 rounded-lg border border-line px-3 py-2 text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            <option value="task">To-do</option>
            <option value="study">Study</option>
            <option value="goal">Goal</option>
          </select>
          <button
            onClick={add}
            disabled={!title.trim()}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            Add
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = tasks.filter((t) => t.status === col.key);
            const isOver = overCol === col.key;
            return (
              <div
                key={col.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverCol(col.key);
                }}
                onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
                onDrop={() => onDrop(col.key)}
                className={`rounded-2xl border p-3 transition ${
                  isOver
                    ? "border-brand bg-brand/5"
                    : "border-line bg-surface/60"
                }`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold text-ink">{col.label}</h2>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-muted">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {loading ? (
                    <p className="px-1 text-sm text-muted">Loading…</p>
                  ) : items.length === 0 ? (
                    <p className="px-1 py-6 text-center text-xs text-muted">
                      {isOver ? "Drop here" : "Nothing here yet."}
                    </p>
                  ) : (
                    items.map((t) => (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={() => setDraggingId(t.id)}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setOverCol(null);
                        }}
                        className={`cursor-grab rounded-xl border border-line bg-white p-3 shadow-sm active:cursor-grabbing ${
                          draggingId === t.id ? "opacity-50" : ""
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                              t.assigned
                                ? "bg-brand text-white"
                                : CATEGORY_STYLE[t.category]
                            }`}
                          >
                            {t.assigned ? "Homework" : CATEGORY_LABEL[t.category]}
                          </span>
                          {!t.assigned && (
                            <button
                              onClick={() => remove(t)}
                              className="text-xs text-muted hover:text-red-600"
                              aria-label="Delete"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <p
                          className={`text-sm text-ink ${t.status === "done" ? "line-through opacity-60" : ""}`}
                        >
                          {t.title}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">Tip: drag a card to another column to move it.</p>
      </main>
    </>
  );
}
