"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  editScore,
  getMockdayResults,
  releaseAll,
  releaseScore,
  unreleaseScore,
  type MockdayResults,
} from "@/lib/admin-api";

function fmt(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

const STATUS_STYLE: Record<string, string> = {
  submitted: "bg-green-100 text-green-700",
  in_progress: "bg-accent-yellow/30 text-ink",
  expired: "bg-line text-muted",
};

const MOD_LABEL = (s: string, m: number) =>
  `${s === "rw" ? "R&W" : "Math"} M${m}`;

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const mockdayId = Number(params.id);

  const [data, setData] = useState<MockdayResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [auto, setAuto] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await getMockdayResults(mockdayId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [mockdayId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => void load(), 10000);
    return () => clearInterval(t);
  }, [auto, load]);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 text-red-700">
        {error}
      </main>
    );
  }
  if (!data) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 text-muted">
        Loading…
      </main>
    );
  }

  const { mockday, summary, attempts } = data;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <Link href="/admin/mockdays" className="text-sm text-muted hover:text-ink">
        ← Mockdays
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            {mockday.name} — Results
          </h1>
          <p className="mt-1 text-muted">
            Status <b>{mockday.status}</b> · scores are for staff review only —
            students don&apos;t see them in-app.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={auto}
              onChange={(e) => setAuto(e.target.checked)}
            />
            Auto-refresh (10s)
          </label>
          <button
            onClick={async () => {
              if (!confirm("Release scores to ALL submitted students for this Mockday?"))
                return;
              await releaseAll(mockdayId);
              await load();
            }}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Release all
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Attempts" value={summary.total_attempts} />
        <Stat label="In progress" value={summary.in_progress} />
        <Stat label="Submitted" value={summary.submitted} />
        <Stat label="Avg total (400–1600)" value={summary.avg_total_scaled ?? "—"} />
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">R&amp;W</th>
              <th className="px-4 py-3 font-medium">Math</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Release</th>
            </tr>
          </thead>
          <tbody>
            {attempts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  No one has started this Mockday yet.
                </td>
              </tr>
            ) : (
              attempts.map((a) => {
                const done = a.status === "submitted";
                const isOpen = expanded === a.attempt_id;
                return (
                  <Fragment key={a.attempt_id}>
                    <tr
                      onClick={() =>
                        setExpanded(isOpen ? null : a.attempt_id)
                      }
                      className="cursor-pointer border-t border-line hover:bg-surface/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/attempts/${a.attempt_id}/review?mockday=${mockdayId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-brand hover:underline"
                        >
                          {a.full_name ?? a.email ?? "—"}
                        </Link>
                        <div className="text-xs text-muted">{a.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            STATUS_STYLE[a.status] ?? "bg-surface text-muted"
                          }`}
                        >
                          {a.status === "in_progress" ? "in progress" : a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {done ? a.rw_scaled : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {done ? a.math_scaled : "—"}
                      </td>
                      <td className="px-4 py-3 text-base font-semibold tabular-nums text-brand">
                        {done ? a.total_scaled : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {a.current ? (
                          <span>
                            {MOD_LABEL(a.current.section, a.current.module)} ·{" "}
                            <span className="font-mono">
                              {fmt(a.current.seconds_remaining)}
                            </span>{" "}
                            left
                          </span>
                        ) : done ? (
                          `${a.modules_completed}/4 modules`
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {done ? (
                          a.released ? (
                            <button
                              onClick={async () => {
                                await unreleaseScore(a.attempt_id);
                                await load();
                              }}
                              className="rounded-lg border border-green-300 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                            >
                              ✓ Released
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                await releaseScore(a.attempt_id);
                                await load();
                              }}
                              className="rounded-lg bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand-dark"
                            >
                              Release
                            </button>
                          )
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-t border-line bg-surface/40">
                        <td colSpan={7} className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/admin/attempts/${a.attempt_id}/review?mockday=${mockdayId}`}
                            className="mb-3 inline-flex items-center gap-1 rounded-lg border border-brand px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/5"
                          >
                            View all responses →
                          </Link>
                          {done && (
                            <EditTotal attempt={a} onSaved={load} />
                          )}
                          <div className="mb-3 flex flex-wrap gap-6 text-xs text-muted">
                            <span>
                              Raw — R&amp;W <b className="text-ink">{a.rw_raw}</b>, Math{" "}
                              <b className="text-ink">{a.math_raw}</b>, Total{" "}
                              <b className="text-ink">{a.total_raw}</b>
                            </span>
                            {done && (
                              <span>
                                Scaled — R&amp;W <b className="text-ink">{a.rw_scaled}</b>,
                                Math <b className="text-ink">{a.math_scaled}</b>, Total{" "}
                                <b className="text-ink">{a.total_scaled}</b>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {a.module_scores.map((m) => (
                              <div
                                key={`${m.section}${m.module}`}
                                className="rounded-lg border border-line bg-white px-3 py-2 text-center"
                              >
                                <div className="text-sm font-semibold text-ink">
                                  {m.submitted ? (m.raw_score ?? 0) : "—"}
                                </div>
                                <div className="text-[11px] text-muted">
                                  {MOD_LABEL(m.section, m.module)}
                                </div>
                              </div>
                            ))}
                            {a.module_scores.length === 0 && (
                              <span className="text-xs text-muted">
                                Not started.
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        Section scores are 200–800 and the total is 400–1600, estimated from a raw
        linear curve (College Board doesn&apos;t publish their exact conversion).
        Click a student&apos;s name to see every question they answered; click the
        row for the per-module breakdown.
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

function EditTotal({
  attempt,
  onSaved,
}: {
  attempt: MockdayResults["attempts"][number];
  onSaved: () => void | Promise<void>;
}) {
  const [rw, setRw] = useState(String(attempt.rw_scaled ?? ""));
  const [math, setMath] = useState(String(attempt.math_scaled ?? ""));
  const [total, setTotal] = useState(String(attempt.total_scaled ?? ""));
  const [totalEdited, setTotalEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Keep total in sync with the sections unless it's been manually overridden.
  function syncSections(nextRw: string, nextMath: string) {
    if (totalEdited) return;
    const r = Number(nextRw);
    const m = Number(nextMath);
    if (Number.isFinite(r) && Number.isFinite(m)) setTotal(String(r + m));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    const payload: {
      rw_scaled?: number;
      math_scaled?: number;
      total_scaled?: number;
    } = {};
    if (rw !== "") payload.rw_scaled = Number(rw);
    if (math !== "") payload.math_scaled = Number(math);
    if (total !== "") payload.total_scaled = Number(total);
    try {
      await editScore(attempt.attempt_id, payload);
      setSaved(true);
      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  const field = (
    label: string,
    val: string,
    set: (v: string) => void,
    max: number,
  ) => (
    <label className="flex items-center gap-1.5 text-xs text-muted">
      {label}
      <input
        type="number"
        min={label === "Total" ? 400 : 200}
        max={max}
        step={10}
        value={val}
        onChange={(e) => {
          set(e.target.value);
          setSaved(false);
        }}
        className="w-20 rounded-lg border border-line px-2 py-1 text-sm tabular-nums text-ink"
      />
    </label>
  );

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium text-ink">Override scores:</span>
      {field("R&W", rw, (v) => {
        setRw(v);
        syncSections(v, math);
      }, 800)}
      {field("Math", math, (v) => {
        setMath(v);
        syncSections(rw, v);
      }, 800)}
      {field("Total", total, (v) => {
        setTotal(v);
        setTotalEdited(true);
      }, 1600)}
      <button
        onClick={save}
        disabled={saving}
        className="rounded-lg border border-line px-3 py-1 text-xs font-medium hover:bg-surface disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      {saved && <span className="text-xs text-green-700">Saved</span>}
      {attempt.released && (
        <span className="text-xs text-amber-600">
          Released — edits update what the student sees.
        </span>
      )}
    </div>
  );
}
