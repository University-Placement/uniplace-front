"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  createMockday,
  deleteMockday,
  listForms,
  listMockdays,
  updateMockday,
} from "@/lib/admin-api";
import type { Form, Mockday, MockdayStatus } from "@/lib/types";

const STATUS_STYLES: Record<MockdayStatus, string> = {
  draft: "bg-surface text-muted",
  scheduled: "bg-accent-yellow/30 text-ink",
  live: "bg-green-100 text-green-700",
  closed: "bg-line text-muted",
};

export default function MockdaysPage() {
  const [mockdays, setMockdays] = useState<Mockday[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Mockday | null>(null);
  const [newName, setNewName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, f] = await Promise.all([listMockdays(), listForms()]);
      setMockdays(m);
      setForms(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    if (!newName) return;
    await createMockday({ name: newName });
    setNewName("");
    await load();
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink">Mockdays</h1>
      <p className="mt-1 text-muted">
        Build an adaptive exam from six forms, schedule the window, and go live.
      </p>

      <div className="mt-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New Mockday name (e.g. Mockday 1)"
          className="flex-1 rounded-lg border border-line px-3 py-2"
        />
        <button
          onClick={handleCreate}
          disabled={!newName}
          className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          Create
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
        ) : mockdays.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-muted">
            No Mockdays yet.
          </p>
        ) : (
          mockdays.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-line bg-white p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">{m.name}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[m.status]}`}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  {m.open_at
                    ? new Date(m.open_at).toLocaleString()
                    : "no window set"}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/mockdays/${m.id}/results`}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-surface"
                >
                  Results
                </Link>
                <button
                  onClick={() => setEditing(m)}
                  className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-surface"
                >
                  Configure
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <MockdayEditor
          mockday={editing}
          forms={forms}
          onClose={() => setEditing(null)}
          onChanged={async () => {
            await load();
          }}
          onDeleted={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}
    </main>
  );
}

// datetime-local <-> ISO helpers.
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function MockdayEditor({
  mockday,
  forms,
  onClose,
  onChanged,
  onDeleted,
}: {
  mockday: Mockday;
  forms: Form[];
  onClose: () => void;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const [m, setM] = useState<Mockday>(mockday);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pick = (section: string, module: number, tier?: string) =>
    forms.filter(
      (f) =>
        f.section === section &&
        f.module === module &&
        (tier ? f.difficulty_tier === tier : true),
    );

  function set<K extends keyof Mockday>(key: K, value: Mockday[K]) {
    setM((prev) => ({ ...prev, [key]: value }));
  }

  async function persist(patch: Partial<Mockday>) {
    setSaving(true);
    setErr(null);
    try {
      const updated = await updateMockday(m.id, patch);
      setM(updated);
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveAll() {
    await persist({
      name: m.name,
      open_at: m.open_at,
      close_at: m.close_at,
      rw_m1_form_id: m.rw_m1_form_id,
      rw_m2_easy_form_id: m.rw_m2_easy_form_id,
      rw_m2_hard_form_id: m.rw_m2_hard_form_id,
      math_m1_form_id: m.math_m1_form_id,
      math_m2_easy_form_id: m.math_m2_easy_form_id,
      math_m2_hard_form_id: m.math_m2_hard_form_id,
      rw_routing_threshold: m.rw_routing_threshold,
      math_routing_threshold: m.math_routing_threshold,
      access_code: m.access_code,
    });
  }

  const FORM_SLOTS: {
    label: string;
    key: keyof Mockday;
    options: Form[];
  }[] = [
    { label: "R&W · Module 1", key: "rw_m1_form_id", options: pick("rw", 1) },
    { label: "R&W · Module 2 (easier)", key: "rw_m2_easy_form_id", options: pick("rw", 2, "easier") },
    { label: "R&W · Module 2 (harder)", key: "rw_m2_hard_form_id", options: pick("rw", 2, "harder") },
    { label: "Math · Module 1", key: "math_m1_form_id", options: pick("math", 1) },
    { label: "Math · Module 2 (easier)", key: "math_m2_easy_form_id", options: pick("math", 2, "easier") },
    { label: "Math · Module 2 (harder)", key: "math_m2_hard_form_id", options: pick("math", 2, "harder") },
  ];

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Configure Mockday</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            ✕
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium text-ink">Name</label>
        <input
          value={m.name}
          onChange={(e) => set("name", e.target.value)}
          className="mb-4 w-full rounded-lg border border-line px-3 py-2"
        />

        <label className="mb-1 block text-sm font-medium text-ink">
          Access code
        </label>
        <input
          value={m.access_code ?? ""}
          onChange={(e) => set("access_code", e.target.value || null)}
          placeholder="Leave blank for no code"
          className="mb-1 w-full rounded-lg border border-line px-3 py-2"
        />
        <p className="mb-4 text-xs text-muted">
          When set, students must enter this code to start. Share it only when
          you want them to begin.
        </p>

        <h3 className="mb-2 text-sm font-semibold text-ink">Forms</h3>
        <div className="space-y-2">
          {FORM_SLOTS.map((slot) => (
            <div key={slot.key} className="flex items-center gap-3">
              <span className="w-44 shrink-0 text-sm text-muted">
                {slot.label}
              </span>
              <select
                value={(m[slot.key] as number | null) ?? ""}
                onChange={(e) =>
                  set(
                    slot.key,
                    (e.target.value
                      ? Number(e.target.value)
                      : null) as Mockday[typeof slot.key],
                  )
                }
                className="flex-1 rounded-lg border border-line px-3 py-2 text-sm"
              >
                <option value="">— none —</option>
                {slot.options.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.question_count}q)
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <h3 className="mt-5 mb-2 text-sm font-semibold text-ink">
          Adaptive thresholds
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-muted">R&W → harder M2 at</span>
            <input
              type="number"
              value={m.rw_routing_threshold}
              onChange={(e) => set("rw_routing_threshold", Number(e.target.value))}
              className="w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Math → harder M2 at</span>
            <input
              type="number"
              value={m.math_routing_threshold}
              onChange={(e) =>
                set("math_routing_threshold", Number(e.target.value))
              }
              className="w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
        </div>

        <h3 className="mt-5 mb-2 text-sm font-semibold text-ink">Window</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-muted">Opens</span>
            <input
              type="datetime-local"
              value={toLocalInput(m.open_at)}
              onChange={(e) =>
                set(
                  "open_at",
                  e.target.value ? new Date(e.target.value).toISOString() : null,
                )
              }
              className="w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Closes</span>
            <input
              type="datetime-local"
              value={toLocalInput(m.close_at)}
              onChange={(e) =>
                set(
                  "close_at",
                  e.target.value ? new Date(e.target.value).toISOString() : null,
                )
              }
              className="w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
        </div>

        {err && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-4">
          <span className="text-sm text-muted">
            Status: <b className="text-ink">{m.status}</b>
          </span>
          <button
            onClick={saveAll}
            disabled={saving}
            className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save details"}
          </button>
        </div>

        {/* Status transitions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {(["draft", "scheduled", "live", "closed"] as MockdayStatus[]).map(
            (st) => (
              <button
                key={st}
                onClick={() => persist({ status: st })}
                disabled={saving || m.status === st}
                className={`rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 ${
                  st === "live"
                    ? "border-green-300 text-green-700 hover:bg-green-50"
                    : "border-line hover:bg-surface"
                }`}
              >
                {st === "live" ? "Go live" : `Set ${st}`}
              </button>
            ),
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          Going live requires all six forms assigned (enforced by the API).
        </p>

        <button
          onClick={async () => {
            if (!confirm(`Delete Mockday "${m.name}"?`)) return;
            await deleteMockday(m.id);
            onDeleted();
          }}
          className="mt-6 text-sm text-red-600 hover:underline"
        >
          Delete this Mockday
        </button>
      </div>
    </div>
  );
}
