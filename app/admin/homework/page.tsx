"use client";

import { useCallback, useEffect, useState } from "react";
import {
  assignHomework,
  deleteHomework,
  getHomeworkTracking,
  listStudents,
  type HomeworkAssignment,
  type Student,
} from "@/lib/admin-api";

export default function HomeworkPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("study");
  const [target, setTarget] = useState<"all" | "select">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tracking, setTracking] = useState<HomeworkAssignment[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadTracking = useCallback(() => {
    getHomeworkTracking().then(setTracking).catch(() => {});
  }, []);

  useEffect(() => {
    listStudents().then(setStudents).catch(() => {});
    loadTracking();
  }, [loadTracking]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function assign() {
    if (!title.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      const ids = target === "select" ? [...selected] : undefined;
      const res = await assignHomework({
        title: title.trim(),
        notes: notes.trim() || undefined,
        category,
        student_ids: ids,
      });
      setMsg(`Assigned to ${res.assigned_to} student${res.assigned_to === 1 ? "" : "s"}.`);
      setTitle("");
      setNotes("");
      setSelected(new Set());
      loadTracking();
    } finally {
      setSaving(false);
    }
  }

  async function remove(a: HomeworkAssignment) {
    if (
      !confirm(
        `Delete "${a.title}"? This removes it from all ${a.total} student${
          a.total === 1 ? "" : "s"
        }' boards.`,
      )
    )
      return;
    setDeleting(a.assignment_id);
    try {
      await deleteHomework(a.assignment_id);
      setTracking((prev) =>
        prev.filter((x) => x.assignment_id !== a.assignment_id),
      );
      if (expanded === a.assignment_id) setExpanded(null);
    } finally {
      setDeleting(null);
    }
  }

  const canAssign =
    title.trim() && (target === "all" || selected.size > 0) && !saving;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink">Assign homework</h1>
      <p className="mt-1 text-muted">
        Push a card to students&apos; Study Boards. They can move it across columns
        but can&apos;t delete it.
      </p>

      <div className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-6">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Complete 20 practice questions on linear equations"
            className="w-full rounded-lg border border-line px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">
            Notes (optional)
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-line px-3 py-2"
          />
        </label>

        <div className="flex gap-3">
          <label className="block flex-1">
            <span className="mb-1 block text-sm font-medium text-ink">Type</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2"
            >
              <option value="study">Study</option>
              <option value="task">To-do</option>
              <option value="goal">Goal</option>
            </select>
          </label>
          <label className="block flex-1">
            <span className="mb-1 block text-sm font-medium text-ink">
              Assign to
            </span>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as "all" | "select")}
              className="w-full rounded-lg border border-line px-3 py-2"
            >
              <option value="all">All students ({students.length})</option>
              <option value="select">Selected students</option>
            </select>
          </label>
        </div>

        {target === "select" && (
          <div className="max-h-60 overflow-y-auto rounded-lg border border-line p-2">
            {students.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface"
              >
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  onChange={() => toggle(s.id)}
                />
                <span className="text-ink">{s.full_name ?? s.email}</span>
                <span className="text-xs text-muted">{s.email}</span>
              </label>
            ))}
          </div>
        )}

        {msg && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {msg}
          </p>
        )}

        <button
          onClick={assign}
          disabled={!canAssign}
          className="rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? "Assigning…" : "Assign homework"}
        </button>
      </div>

      {/* Tracking */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Tracking</h2>
        <button
          onClick={loadTracking}
          className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-surface"
        >
          Refresh
        </button>
      </div>

      {tracking.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-muted">
          No homework assigned yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {tracking.map((a) => {
            const pct = a.total ? Math.round((100 * a.counts.done) / a.total) : 0;
            const isOpen = expanded === a.assignment_id;
            return (
              <div
                key={a.assignment_id}
                className="rounded-2xl border border-line bg-white"
              >
                <div className="flex items-center">
                  <button
                    onClick={() => setExpanded(isOpen ? null : a.assignment_id)}
                    className="flex flex-1 items-center gap-4 px-5 py-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{a.title}</p>
                      <p className="text-xs text-muted">
                        {a.counts.done}/{a.total} done · {a.counts.doing} in progress ·{" "}
                        {a.counts.todo} to do
                      </p>
                    </div>
                    <div className="hidden w-40 sm:block">
                      <div className="h-2 overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-12 text-right text-sm font-semibold tabular-nums text-ink">
                      {pct}%
                    </span>
                  </button>
                  <button
                    onClick={() => remove(a)}
                    disabled={deleting === a.assignment_id}
                    className="mr-3 shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    aria-label={`Delete ${a.title}`}
                  >
                    {deleting === a.assignment_id ? "Deleting…" : "Delete"}
                  </button>
                </div>

                {isOpen && (
                  <div className="border-t border-line px-5 py-3">
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {a.students.map((s) => (
                        <div
                          key={s.email}
                          className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-surface"
                        >
                          <span className="truncate text-ink">
                            {s.full_name ?? s.email}
                          </span>
                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${
                              s.status === "done"
                                ? "bg-green-100 text-green-700"
                                : s.status === "doing"
                                  ? "bg-accent-yellow/30 text-ink"
                                  : "bg-surface text-muted"
                            }`}
                          >
                            {s.status === "doing"
                              ? "in progress"
                              : s.status === "done"
                                ? "done"
                                : "to do"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
