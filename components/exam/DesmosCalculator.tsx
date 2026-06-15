"use client";

import { useEffect, useRef, useState } from "react";

// Desmos API key. Defaults to Desmos's published test key, which is unrestricted
// and works on any domain. Override with your own via NEXT_PUBLIC_DESMOS_API_KEY
// (make sure that key allows your deployment domain in the Desmos dashboard).
const DESMOS_API_KEY =
  process.env.NEXT_PUBLIC_DESMOS_API_KEY || "dcb31709b452b1cf9dc26972add0fda6";
const SRC = `https://www.desmos.com/api/v1.11/calculator.js?apiKey=${DESMOS_API_KEY}`;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Desmos?: any;
  }
}

let loader: Promise<void> | null = null;
function loadDesmos(): Promise<void> {
  if (typeof window !== "undefined" && window.Desmos) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Desmos"));
    document.head.appendChild(s);
  });
  return loader;
}

export function DesmosCalculator({ onClose }: { onClose: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calcRef = useRef<any>(null);
  const [pos, setPos] = useState({ x: 80, y: 90 });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    let destroyed = false;
    loadDesmos()
      .then(() => {
        if (destroyed || !mountRef.current || !window.Desmos) {
          if (!window.Desmos) setStatus("error");
          return;
        }
        calcRef.current = window.Desmos.GraphingCalculator(mountRef.current, {
          expressionsCollapsed: false,
          settingsMenu: false,
          border: false,
        });
        setStatus("ready");
        // Ensure it lays out correctly inside the panel.
        setTimeout(() => calcRef.current?.resize?.(), 0);
      })
      .catch(() => {
        if (!destroyed) setStatus("error");
      });
    return () => {
      destroyed = true;
      if (calcRef.current) {
        calcRef.current.destroy();
        calcRef.current = null;
      }
    };
  }, []);

  function onMouseDown(e: React.MouseEvent) {
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    const move = (ev: MouseEvent) => {
      if (!drag.current) return;
      setPos({ x: ev.clientX - drag.current.dx, y: ev.clientY - drag.current.dy });
    };
    const up = () => {
      drag.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  return (
    <div
      className="fixed z-40 w-[420px] overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        onMouseDown={onMouseDown}
        className="flex cursor-move items-center justify-between border-b border-line bg-surface px-3 py-2"
      >
        <span className="text-sm font-semibold text-ink">Calculator</span>
        <button
          onClick={onClose}
          className="rounded px-2 text-muted hover:bg-line hover:text-ink"
          aria-label="Close calculator"
        >
          ✕
        </button>
      </div>
      <div className="relative h-[420px] w-full">
        <div ref={mountRef} className="h-full w-full" />
        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white p-4 text-center text-sm text-muted">
            {status === "loading"
              ? "Loading calculator…"
              : "Couldn't load the calculator. Check your connection and try reopening."}
          </div>
        )}
      </div>
    </div>
  );
}
