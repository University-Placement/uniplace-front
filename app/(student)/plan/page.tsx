import { AppHeader } from "@/components/AppHeader";
import { SYLLABUS_URL, WEEKS, type Resource } from "@/lib/curriculum";

export const metadata = { title: "Class Plan · UniPlace" };

function Tag({ subject }: { subject?: "rw" | "math" }) {
  if (!subject) return null;
  return (
    <span
      className={`mr-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
        subject === "rw"
          ? "bg-brand/10 text-brand"
          : "bg-accent-orange/15 text-accent-orange"
      }`}
    >
      {subject === "rw" ? "RW" : "MATH"}
    </span>
  );
}

function ResourceItem({ r }: { r: Resource }) {
  const body = (
    <>
      <Tag subject={r.subject} />
      <span className={r.url ? "group-hover:text-brand" : ""}>{r.label}</span>
    </>
  );
  if (!r.url) {
    return <li className="text-sm leading-relaxed text-ink">{body}</li>;
  }
  return (
    <li>
      <a
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start text-sm leading-relaxed text-ink"
      >
        {body}
        <span className="ml-1 text-muted group-hover:text-brand">↗</span>
      </a>
    </li>
  );
}

export default function PlanPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Class Plan</h1>
            <p className="mt-1 text-muted">
              Watch the pre-class videos and work through the recommended material
              before each session.
            </p>
          </div>
          <a
            href={SYLLABUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-brand hover:text-brand"
          >
            📄 Syllabus & Class Structure ↗
          </a>
        </div>

        <div className="mt-8 space-y-4">
          {WEEKS.map((w) => (
            <div
              key={w.n}
              className="overflow-hidden rounded-2xl border border-line bg-white"
            >
              <div className="flex items-center gap-3 border-b border-line bg-surface px-5 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {w.n}
                </span>
                <span className="font-semibold text-ink">Week {w.n}</span>
                <span className="text-sm text-muted">· {w.date}</span>
              </div>

              <div className="grid gap-6 p-5 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                    ▶ Pre-Class Videos
                  </h3>
                  <ul className="space-y-1.5">
                    {w.videos.map((r, i) => (
                      <ResourceItem key={i} r={r} />
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                    📚 Recommended Material
                  </h3>
                  <ul className="space-y-1.5">
                    {w.material.map((r, i) => (
                      <ResourceItem key={i} r={r} />
                    ))}
                  </ul>
                </div>
              </div>

              {w.tip && (
                <div className="border-t border-line bg-accent-yellow/10 px-5 py-3 text-sm text-ink">
                  <span className="font-semibold">Tip:</span> {w.tip}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
