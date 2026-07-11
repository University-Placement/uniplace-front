"use client";

import { useEffect, useRef, useState } from "react";

// Desmos's published demo API key — domain-unrestricted, works on any host.
const DESMOS_API_KEY = "dcb31709b452b1cf9dc26972add0fda6";
const SRC = `https://www.desmos.com/api/v1.11/calculator.js?apiKey=${DESMOS_API_KEY}`;

const MIN_W = 340;
const MIN_H = 380;
const DEFAULT = { w: 520, h: 560 };

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
  const [pos, setPos] = useState({ x: 60, y: 70 });
  const [size, setSize] = useState(DEFAULT);
  const [maximized, setMaximized] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const resizing = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

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
        setTimeout(() => calcRef.current?.resize?.(), 0);
      })
      .catch(() => {
        if (!destroyed) setStatus("error");
      });
    return () => {
      destroyed = true;
      calcRef.current?.destroy?.();
      calcRef.current = null;
    };
  }, []);

  // Re-layout Desmos whenever the panel size changes.
  useEffect(() => {
    calcRef.current?.resize?.();
  }, [size, maximized]);

  function onDragStart(e: React.MouseEvent) {
    if (maximized) return;
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

  function onResizeStart(e: React.MouseEvent) {
    e.stopPropagation();
    resizing.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
    const move = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const w = Math.max(MIN_W, resizing.current.w + (ev.clientX - resizing.current.x));
      const h = Math.max(MIN_H, resizing.current.h + (ev.clientY - resizing.current.y));
      setSize({ w, h });
    };
    const up = () => {
      resizing.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  function toggleMax() {
    setMaximized((m) => !m);
  }

  // Effective geometry.
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const geo = maximized
    ? {
        left: 20,
        top: 20,
        width: Math.min(vw - 40, 1000),
        height: Math.min(vh - 40, 800),
      }
    : { left: pos.x, top: pos.y, width: size.w, height: size.h };

  return (
    <div
      className="fixed z-40 flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      style={{ left: geo.left, top: geo.top, width: geo.width, height: geo.height }}
    >
      <div
        onMouseDown={onDragStart}
        className={`flex shrink-0 items-center justify-between border-b border-line bg-surface px-3 py-2 ${
          maximized ? "" : "cursor-move"
        }`}
      >
        <span className="text-sm font-semibold text-ink">Calculator</span>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMax}
            className="rounded px-2 text-muted hover:bg-line hover:text-ink"
            aria-label={maximized ? "Restore" : "Maximize"}
            title={maximized ? "Restore" : "Maximize"}
          >
            {maximized ? "🗗" : "⤢"}
          </button>
          <button
            onClick={onClose}
            className="rounded px-2 text-muted hover:bg-line hover:text-ink"
            aria-label="Close calculator"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="relative flex-1">
        <div ref={mountRef} className="h-full w-full" />
        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white p-4 text-center text-sm text-muted">
            {status === "loading"
              ? "Loading calculator…"
              : "Couldn't load the calculator. Check your connection and try reopening."}
          </div>
        )}
      </div>

      {!maximized && (
        <div
          onMouseDown={onResizeStart}
          title="Drag to resize"
          className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
          style={{
            background:
              "linear-gradient(135deg, transparent 50%, var(--up-muted) 50%, var(--up-muted) 60%, transparent 60%, transparent 75%, var(--up-muted) 75%, var(--up-muted) 85%, transparent 85%)",
          }}
        />
      )}
    </div>
  );
}
