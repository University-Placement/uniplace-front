"use client";

// Standard SAT math reference facts (universal geometry formulas), shown like
// Bluebook's reference panel.
const FORMULAS: { label: string; value: string }[] = [
  { label: "Area of a circle", value: "A = πr²" },
  { label: "Circumference of a circle", value: "C = 2πr" },
  { label: "Area of a rectangle", value: "A = ℓw" },
  { label: "Area of a triangle", value: "A = ½bh" },
  { label: "Pythagorean theorem", value: "c² = a² + b²" },
  { label: "Special right triangle (45°)", value: "sides x, x, x√2" },
  { label: "Special right triangle (30°–60°)", value: "sides x, x√3, 2x" },
  { label: "Volume of a rectangular solid", value: "V = ℓwh" },
  { label: "Volume of a cylinder", value: "V = πr²h" },
  { label: "Volume of a sphere", value: "V = 4⁄3 πr³" },
  { label: "Volume of a cone", value: "V = 1⁄3 πr²h" },
  { label: "Volume of a pyramid", value: "V = 1⁄3 ℓwh" },
];

const FACTS = [
  "The number of degrees of arc in a circle is 360.",
  "The number of radians of arc in a circle is 2π.",
  "The sum of the measures in degrees of the angles of a triangle is 180.",
];

export function ReferenceSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Reference</h2>
          <button
            onClick={onClose}
            className="rounded px-2 text-muted hover:bg-surface hover:text-ink"
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {FORMULAS.map((f) => (
            <div key={f.label} className="rounded-lg border border-line p-3">
              <div className="font-mono text-base text-ink">{f.value}</div>
              <div className="mt-1 text-xs text-muted">{f.label}</div>
            </div>
          ))}
        </div>
        <ul className="mt-4 space-y-1 text-sm text-muted">
          {FACTS.map((f) => (
            <li key={f}>• {f}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
