"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createForm, deleteForm, listForms } from "@/lib/admin-api";
import type { Form, Section, Tier } from "@/lib/types";

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setForms(await listForms());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Forms</h1>
          <p className="mt-1 text-muted">
            A form is one module&apos;s worth of questions (R&amp;W or Math, module
            1 or 2, with a difficulty tier for adaptive routing).
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark"
        >
          New form
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-2">
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : forms.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-muted">
            No forms yet.
          </p>
        ) : (
          forms.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-xl border border-line bg-white p-4"
            >
              <div>
                <Link
                  href={`/admin/forms/${f.id}`}
                  className="font-medium text-ink hover:text-brand"
                >
                  {f.name}
                </Link>
                <p className="mt-0.5 text-sm text-muted">
                  {f.section === "rw" ? "Reading & Writing" : "Math"} · Module{" "}
                  {f.module} · tier <b>{f.difficulty_tier}</b> ·{" "}
                  {f.question_count} questions
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/forms/${f.id}`}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-surface"
                >
                  Build
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm(`Delete form "${f.name}"?`)) return;
                    await deleteForm(f.id);
                    await load();
                  }}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {creating && (
        <NewFormDialog
          onClose={() => setCreating(false)}
          onCreated={async () => {
            setCreating(false);
            await load();
          }}
        />
      )}
    </main>
  );
}

function NewFormDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [section, setSection] = useState<Section>("rw");
  const [module, setModule] = useState(1);
  const [tier, setTier] = useState<Tier>("base");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Module 1 is always the 'base' tier; only Module 2 splits easier/harder.
  const tierOptions: Tier[] = module === 1 ? ["base"] : ["easier", "harder"];

  async function handleCreate() {
    setSaving(true);
    setErr(null);
    try {
      await createForm({
        name,
        section,
        module,
        difficulty_tier: module === 1 ? "base" : tier,
      });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Create failed");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-ink">New form</h2>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Form name (e.g. R&W Module 1 — Mockday 1)"
            className="w-full rounded-lg border border-line px-3 py-2"
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as Section)}
              className="rounded-lg border border-line px-3 py-2"
            >
              <option value="rw">R&amp;W</option>
              <option value="math">Math</option>
            </select>
            <select
              value={module}
              onChange={(e) => {
                const m = Number(e.target.value);
                setModule(m);
                setTier(m === 1 ? "base" : "easier");
              }}
              className="rounded-lg border border-line px-3 py-2"
            >
              <option value={1}>Module 1</option>
              <option value={2}>Module 2</option>
            </select>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as Tier)}
              disabled={module === 1}
              className="rounded-lg border border-line px-3 py-2 disabled:opacity-60"
            >
              {tierOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {err && <p className="text-sm text-red-700">{err}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 hover:bg-surface"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving || !name}
              className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
