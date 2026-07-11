"use client";

// Math reference sheet, shown like Bluebook's reference panel.
export function ReferenceSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Reference</h2>
          <button
            onClick={onClose}
            className="rounded px-2 text-muted hover:bg-surface hover:text-ink"
            aria-label="Close reference"
          >
            ✕
          </button>
        </div>
        <img
          src="/math-reference.png"
          alt="Math reference sheet"
          className="mx-auto w-full max-w-xl"
        />
      </div>
    </div>
  );
}
