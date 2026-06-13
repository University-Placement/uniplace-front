"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getForm, listQuestions, setFormQuestions } from "@/lib/admin-api";
import type { FormWithQuestions, Question } from "@/lib/types";

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>();
  const formId = Number(params.id);

  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [pool, setPool] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const f = await getForm(formId);
      setForm(f);
      setSelected(f.questions);
      // Pool: questions in the same section, not already selected.
      const all = await listQuestions({ section: f.section });
      const chosen = new Set(f.questions.map((q) => q.id));
      setPool(all.filter((q) => !chosen.has(q.id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    void load();
  }, [load]);

  function add(q: Question) {
    setSelected((s) => [...s, q]);
    setPool((p) => p.filter((x) => x.id !== q.id));
  }

  function remove(q: Question) {
    setSelected((s) => s.filter((x) => x.id !== q.id));
    setPool((p) => [q, ...p]);
  }

  function move(idx: number, dir: -1 | 1) {
    setSelected((s) => {
      const next = [...s];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return s;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    setError(null);
    try {
      await setFormQuestions(
        formId,
        selected.map((q) => q.id),
      );
      setMsg("Saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 text-muted">
        Loading…
      </main>
    );
  }

  if (!form) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 text-red-700">
        {error ?? "Form not found"}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <Link href="/admin/forms" className="text-sm text-muted hover:text-ink">
        ← Forms
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{form.name}</h1>
          <p className="mt-1 text-muted">
            {form.section === "rw" ? "Reading & Writing" : "Math"} · Module{" "}
            {form.module} · tier <b>{form.difficulty_tier}</b> · {selected.length}{" "}
            selected
          </p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-green-700">{msg}</span>}
          {error && <span className="text-sm text-red-700">{error}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save order"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Selected (ordered) */}
        <section>
          <h2 className="mb-2 font-semibold text-ink">
            In this form ({selected.length})
          </h2>
          <div className="space-y-2">
            {selected.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
                Add questions from the bank →
              </p>
            ) : (
              selected.map((q, i) => (
                <div
                  key={q.id}
                  className="flex items-start gap-2 rounded-xl border border-line bg-white p-3"
                >
                  <span className="w-6 pt-0.5 text-sm text-muted">{i + 1}</span>
                  <p className="min-w-0 flex-1 truncate text-sm text-ink">
                    {q.stem}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    <IconBtn onClick={() => move(i, -1)} disabled={i === 0}>
                      ↑
                    </IconBtn>
                    <IconBtn
                      onClick={() => move(i, 1)}
                      disabled={i === selected.length - 1}
                    >
                      ↓
                    </IconBtn>
                    <IconBtn onClick={() => remove(q)}>✕</IconBtn>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Pool */}
        <section>
          <h2 className="mb-2 font-semibold text-ink">
            Available {form.section === "rw" ? "R&W" : "Math"} questions (
            {pool.length})
          </h2>
          <div className="space-y-2">
            {pool.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
                Nothing left to add.
              </p>
            ) : (
              pool.map((q) => (
                <button
                  key={q.id}
                  onClick={() => add(q)}
                  className="flex w-full items-center gap-2 rounded-xl border border-line bg-white p-3 text-left hover:border-brand"
                >
                  <span className="text-brand">+</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {q.stem}
                  </span>
                  {q.difficulty && (
                    <span className="shrink-0 rounded bg-surface px-1.5 py-0.5 text-xs text-muted">
                      {q.difficulty}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function IconBtn({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-line px-2 py-0.5 text-sm hover:bg-surface disabled:opacity-30"
    >
      {children}
    </button>
  );
}
