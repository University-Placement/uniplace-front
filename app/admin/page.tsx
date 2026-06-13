import Link from "next/link";

// Admin home. Cards link to the management surfaces. The header + role guard
// live in app/admin/layout.tsx.
const SECTIONS = [
  {
    href: "/admin/questions",
    title: "Question bank",
    desc: "Create and edit SAT questions, keys, and tags.",
  },
  {
    href: "/admin/forms",
    title: "Forms",
    desc: "Assemble questions into tiered modules (M1, M2 easy/hard).",
  },
  {
    href: "/admin/mockdays",
    title: "Mockdays",
    desc: "Pick the six forms, schedule the window, and go live.",
  },
  {
    href: "/admin/homework",
    title: "Homework",
    desc: "Assign study tasks to students' boards.",
  },
];

export default function AdminHome() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink">Admin</h1>
      <p className="mt-1 text-muted">Manage content and run Mockdays.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
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
  );
}
