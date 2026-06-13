"use client";

import { useEffect, useState } from "react";
import {
  assignHomework,
  listStudents,
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

  useEffect(() => {
    listStudents().then(setStudents).catch(() => {});
  }, []);

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
    } finally {
      setSaving(false);
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
    </main>
  );
}
