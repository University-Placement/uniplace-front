import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

// Admin home. The cards link to the management surfaces built in later phases.
// Note: this route is currently gated only by login. Phase 1 follow-up adds a
// role check (admin vs student) once roles live in the users table.
const SECTIONS = [
  {
    href: "/admin/questions",
    title: "Question bank",
    desc: "Create and edit SAT questions, keys, and tags.",
  },
  {
    href: "/admin/mockdays",
    title: "Mockdays",
    desc: "Assemble forms, schedule the window, and go live.",
  },
];

export default function AdminHome() {
  return (
    <>
      <AppHeader admin />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Admin</h1>
        <p className="mt-1 text-muted">Manage content and run Mockdays.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-2xl border border-line bg-white p-6 transition hover:border-brand hover:shadow-sm"
            >
              <h2 className="font-semibold text-ink">{s.title}</h2>
              <p className="mt-1 text-sm text-muted">{s.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
