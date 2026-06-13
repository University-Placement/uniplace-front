"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { listLiveMockdays, startAttempt } from "@/lib/exam-api";
import type { LiveMockday } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [mockdays, setMockdays] = useState<LiveMockday[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listLiveMockdays()
      .then(setMockdays)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-semibold text-ink">Your Mockdays</h1>
        <p className="mt-1 text-muted">
          When a Mockday is live, start it here.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 space-y-3">
          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : mockdays.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
              <p className="text-muted">
                No Mockday is live right now. Check back during your scheduled
                time block.
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
