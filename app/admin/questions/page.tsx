"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createQuestion,
  deleteQuestion,
  listQuestions,
  updateQuestion,
} from "@/lib/admin-api";
import type {
  Choice,
  Difficulty,
  Question,
  QuestionInput,
  QuestionType,
  Section,
} from "@/lib/types";

const EMPTY_CHOICES: Choice[] = [
  { id: "A", text: "" },
  { id: "B", text: "" },
  { id: "C", text: "" },
  { id: "D", text: "" },
];

function blankForm(): QuestionInput {
  return {
    section: "rw",
    type: "mc",
    passage: null,
    stem: "",
    stem_image: null,
    choices: EMPTY_CHOICES.map((c) => ({ ...c })),
    correct_answer: "A",
    explanation: null,
    domain: null,
    skill: null,
    difficulty: "medium",
    source: null,
  };
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fSection, setFSection] = useState("");
  const [fType, setFType] = useState("");
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<QuestionInput | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listQuestions({
        section: fSection || undefined,
        type: fType || undefined,
        search: search || undefined,
      });
      setQuestions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [fSection, fType, search]);

  useEffect(() => {
    void load();
  }, [load]);

  function startNew() {
    setEditingId(null);
    setEditing(blankForm());
  }

  function startEdit(q: Question) {
    setEditingId(q.id);
    setEditing({
      section: q.section,
      type: q.type,
      passage: q.passage,
      stem: q.stem,
      stem_image: q.stem_image,
      choices: q.choices ?? EMPTY_CHOICES.map((c) => ({ ...c })),
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      domain: q.domain,
      skill: q.skill,
      difficulty: q.difficulty,
      source: q.source,
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this question?")) return;
    await deleteQuestion(id);
    await load();
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Question bank</h1>
          <p className="mt-1 text-muted">{questions.length} questions</p>
        </div>
        <button
          onClick={startNew}
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark"
        >
          New question
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={fSection}
          onChange={(e) => setFSection(e.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-sm"
        >
          <option value="">All sections</option>
          <option value="rw">Reading &amp; Writing</option>
          <option value="math">Math</option>
        </select>
        <select
          value={fType}
          onChange={(e) => setFType(e.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="mc">Multiple choice</option>
          <option value="spr">Grid-in (SPR)</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stem…"
          className="flex-1 rounded-lg border border-line px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* List */}
      <div className="mt-6 space-y-2">
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : questions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-muted">
            No questions yet. Create one to get started.
          </p>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-line bg-white p-4"
            >
              <div className="min-w-0">
                <div className="mb-1 flex gap-2 text-xs">
                  <Tag>{q.section === "rw" ? "R&W" : "Math"}</Tag>
                  <Tag>{q.type === "mc" ? "MC" : "SPR"}</Tag>
                  {q.difficulty && <Tag>{q.difficulty}</Tag>}
                  {q.skill && <Tag muted>{q.skill}</Tag>}
                </div>
                <p className="truncate text-sm text-ink">{q.stem}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => startEdit(q)}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-surface"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <QuestionEditor
          initial={editing}
          editingId={editingId}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}
    </main>
  );
}

function Tag({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 ${
        muted ? "bg-surface text-muted" : "bg-brand/10 text-brand"
      }`}
    >
      {children}
    </span>
  );
}

function QuestionEditor({
  initial,
  editingId,
  onClose,
  onSaved,
}: {
  initial: QuestionInput;
  editingId: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<QuestionInput>(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof QuestionInput>(key: K, value: QuestionInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setChoiceText(idx: number, text: string) {
    setForm((f) => {
      const choices = (f.choices ?? []).map((c, i) =>
        i === idx ? { ...c, text } : c,
      );
      return { ...f, choices };
    });
  }

  async function handleSave() {
    setSaving(true);
    setErr(null);
    try {
      // Per choice: typed text overrides the imported image; otherwise keep image.
      const choices = (form.choices ?? []).map((c) =>
        c.text && c.text.trim()
          ? { id: c.id, text: c.text.trim() }
          : { id: c.id, image: c.image },
      );
      const payload: QuestionInput = {
        ...form,
        // Typing a stem replaces the stem image with text.
        stem_image: form.stem.trim() ? null : form.stem_image,
        choices: form.type === "mc" ? choices : null,
      };
      if (editingId == null) await createQuestion(payload);
      else await updateQuestion(editingId, payload);
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            {editingId == null ? "New question" : `Edit question #${editingId}`}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Section">
              <select
                value={form.section}
                onChange={(e) => set("section", e.target.value as Section)}
                className="w-full rounded-lg border border-line px-3 py-2"
              >
                <option value="rw">Reading &amp; Writing</option>
                <option value="math">Math</option>
              </select>
            </Field>
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value as QuestionType)}
                className="w-full rounded-lg border border-line px-3 py-2"
              >
                <option value="mc">Multiple choice</option>
                <option value="spr">Grid-in (SPR)</option>
              </select>
            </Field>
          </div>

          <Field label="Passage / context (optional)">
            <textarea
              value={form.passage ?? ""}
              onChange={(e) => set("passage", e.target.value || null)}
              rows={3}
              className="w-full rounded-lg border border-line px-3 py-2"
            />
          </Field>

          <Field label="Question stem">
            {form.stem_image && !form.stem.trim() && (
              <div className="mb-2 rounded-lg border border-line bg-surface p-2">
                <img src={form.stem_image} alt="Current stem" className="max-h-40" />
                <p className="mt-1 text-xs text-muted">
                  Imported image. Type below to replace it with text.
                </p>
              </div>
            )}
            <textarea
              value={form.stem}
              onChange={(e) => set("stem", e.target.value)}
              rows={3}
              placeholder="Leave blank to keep the image above"
              className="w-full rounded-lg border border-line px-3 py-2"
            />
          </Field>

          {form.type === "mc" ? (
            <Field label="Choices (select the correct one; type to replace an image)">
              <div className="space-y-3">
                {(form.choices ?? []).map((c, i) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="correct"
                      className="mt-2"
                      checked={form.correct_answer === c.id}
                      onChange={() => set("correct_answer", c.id)}
                    />
                    <span className="mt-1.5 w-5 font-medium text-muted">{c.id}</span>
                    <div className="flex-1">
                      {c.image && !(c.text && c.text.trim()) && (
                        <img
                          src={c.image}
                          alt={`Choice ${c.id}`}
                          className="mb-1 max-h-14 rounded border border-line bg-surface p-1"
                        />
                      )}
                      <input
                        value={c.text ?? ""}
                        onChange={(e) => setChoiceText(i, e.target.value)}
                        className="w-full rounded-lg border border-line px-3 py-1.5"
                        placeholder={c.image ? "Type to replace this image" : `Choice ${c.id}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Field>
          ) : (
            <Field label="Correct answer (accepted value)">
              <input
                value={form.correct_answer}
                onChange={(e) => set("correct_answer", e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2"
                placeholder="e.g. 3.5 or 7/2"
              />
            </Field>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Field label="Difficulty">
              <select
                value={form.difficulty ?? ""}
                onChange={(e) =>
                  set("difficulty", (e.target.value || null) as Difficulty | null)
                }
                className="w-full rounded-lg border border-line px-3 py-2"
              >
                <option value="">—</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>
            <Field label="Domain">
              <input
                value={form.domain ?? ""}
                onChange={(e) => set("domain", e.target.value || null)}
                className="w-full rounded-lg border border-line px-3 py-2"
              />
            </Field>
            <Field label="Skill">
              <input
                value={form.skill ?? ""}
                onChange={(e) => set("skill", e.target.value || null)}
                className="w-full rounded-lg border border-line px-3 py-2"
              />
            </Field>
          </div>

          <Field label="Explanation (optional)">
            <textarea
              value={form.explanation ?? ""}
              onChange={(e) => set("explanation", e.target.value || null)}
              rows={2}
              className="w-full rounded-lg border border-line px-3 py-2"
            />
          </Field>

          <Field label="Source (optional)">
            <input
              value={form.source ?? ""}
              onChange={(e) => set("source", e.target.value || null)}
              className="w-full rounded-lg border border-line px-3 py-2"
              placeholder="e.g. College Board Question Bank"
            />
          </Field>

          {err && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 hover:bg-surface"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
