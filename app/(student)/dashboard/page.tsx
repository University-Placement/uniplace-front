"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Logo } from "@/components/Logo";
import { listLiveMockdays, startAttempt } from "@/lib/exam-api";
import { listTasks, updateTask, type Task, type TaskStatus } from "@/lib/student-api";
import type { LiveMockday } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [mockdays, setMockdays] = useState<LiveMockday[]>([]);
  const [homework, setHomework] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listLiveMockdays()
      .then(setMockdays)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
    listTasks()
      .then((tasks) => setHomework(tasks.filter((t) => t.assigned)))
      .catch(() => {});
  }, []);

  async function setHomeworkStatus(t: Task, status: TaskStatus) {
    setHomework((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, status } : x)),
    );
    await updateTask(t.id, { status });
  }

  async function enter(m: LiveMockday) {
    setBusy(m.id);
    setError(null);
    try {
      const attemptId =
        m.attempt_id ?? (await startAttempt(m.id)).attempt_id;
      router.push(`/exam/${attemptId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start");
      setBusy(null);
    }
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Your hub</h1>
        <p className="mt-1 text-muted">
          Take your Mockdays, review results, and plan your prep.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/results"
            className="rounded-2xl border border-line bg-white p-6 transition hover:border-brand hover:shadow-sm"
          >
            <h2 className="font-semibold text-ink">My Results</h2>
            <p className="mt-1 text-sm text-muted">
              Scores and areas to focus on, once released.
            </p>
          </Link>
          <Link
            href="/board"
            className="rounded-2xl border border-line bg-white p-6 transition hover:border-brand hover:shadow-sm"
          >
            <h2 className="font-semibold text-ink">Study Board</h2>
            <p className="mt-1 text-sm text-muted">
              Your to-dos, study plan, and goals.
            </p>
          </Link>
        </div>

        {homework.length > 0 && (
          <section className="mt-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Your homework</h2>
              <Link href="/board" className="text-sm font-medium text-brand hover:underline">
                Open Study Board →
              </Link>
            </div>
            <div className="space-y-2">
              {homework.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-brand px-1.5 py-0.5 text-[11px] font-medium text-white">
                      Homework
                    </span>
                    <span
                      className={`text-sm text-ink ${t.status === "done" ? "line-through opacity-60" : ""}`}
                    >
                      {t.title}
                    </span>
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) =>
                      setHomeworkStatus(t, e.target.value as TaskStatus)
                    }
                    className="rounded-lg border border-line px-2 py-1 text-xs text-ink"
                  >
                    <option value="todo">To do</option>
                    <option value="doing">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        )}

        <h2 className="mt-10 text-lg font-semibold text-ink">Live now</h2>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 space-y-3">
          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : mockdays.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
              <Logo variant="mark" className="mb-4 h-20 w-auto opacity-90" />
              <p className="font-medium text-ink">No Mockday is live right now</p>
              <p className="mt-1 text-sm text-muted">
                Check back during your scheduled time block.
              </p>
            </div>
          ) : (
            mockdays.map((m) => {
              const done = m.attempt_status === "submitted";
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-2xl border border-line bg-white p-5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">{m.name}</span>
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        live
                      </span>
                    </div>
                    {m.close_at && (
                      <p className="mt-0.5 text-sm text-muted">
                        Closes {new Date(m.close_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => enter(m)}
                    disabled={busy === m.id || done}
                    className="rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    {done
                      ? "Completed"
                      : busy === m.id
                        ? "Loading…"
                        : m.attempt_id
                          ? "Resume"
                          : "Start"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </main>
    </>
  );
}
