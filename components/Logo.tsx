import Image from "next/image";

/**
 * UniPlace logo.
 *
 * The wordmark ("UniPlace") is a built-in SVG so the brand always renders.
 * To show the full mascot logo (the graduation-cap llama), drop the artwork at
 * `public/uniplace-logo.png` and pass `variant="full"`.
 */
export function Logo({
  variant = "wordmark",
  className = "",
  priority = false,
}: {
  variant?: "wordmark" | "full";
  className?: string;
  priority?: boolean;
}) {
  if (variant === "full") {
    return (
      <Image
        src="/uniplace-logo.png"
        alt="UniPlace"
        width={300}
        height={170}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <Image
      src="/uniplace-wordmark.svg"
      alt="UniPlace"
      width={180}
      height={48}
      priority={priority}
      className={className}
    />
  );
}
