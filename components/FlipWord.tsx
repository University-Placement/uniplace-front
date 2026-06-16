"use client";

import { useEffect, useState } from "react";

/**
 * Rotates a 3D cube through `words`, showing one face at a time. Each word sits
 * on its own cube face (90° apart) so advancing the index spins the whole cube.
 */
export function FlipWord({
  words,
  className = "",
  interval = 2200,
}: {
  words: string[];
  className?: string;
  interval?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    const id = setInterval(
      () => setIndex((v) => (v + 1) % words.length),
      interval,
    );
    return () => clearInterval(id);
  }, [words.length, interval]);

  const widest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span
      className={`relative inline-block align-baseline ${className}`}
      style={{ perspective: "700px" }}
    >
      {/* Invisible spacer reserves the width/height of the widest word. */}
      <span className="invisible">{widest}</span>
      {words.map((word, i) => {
        const offset = (i - index + words.length) % words.length;
        return (
          <span
            key={word}
            aria-hidden={offset !== 0}
            className="absolute inset-0 flex items-center justify-center transition-transform duration-[650ms] ease-[cubic-bezier(.66,0,.34,1)]"
            style={{
              transformOrigin: "center center -0.62em",
              transform: `rotateX(${-offset * 90}deg)`,
              backfaceVisibility: "hidden",
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
