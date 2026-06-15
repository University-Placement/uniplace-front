import Image from "next/image";

/**
 * UniPlace logo — the graduation-llama mascot in Lala's colors.
 *
 * variant="full"     → mascot + "UniPlace" wordmark (default)
 * variant="mark"     → mascot only (compact spots, favicons)
 * variant="wordmark" → "UniPlace" text only
 */
export function Logo({
  variant = "full",
  className = "",
  priority = false,
}: {
  variant?: "full" | "mark" | "wordmark";
  className?: string;
  priority?: boolean;
}) {
  const src =
    variant === "mark"
      ? "/uniplace-mark.png"
      : variant === "wordmark"
        ? "/uniplace-wordmark.png"
        : "/uniplace-logo.png";
  const dims =
    variant === "mark"
      ? { width: 518, height: 664 }
      : variant === "wordmark"
        ? { width: 1108, height: 316 }
        : { width: 552, height: 682 };

  return (
    <Image
      src={src}
      alt="UniPlace"
      width={dims.width}
      height={dims.height}
      priority={priority}
      className={className}
    />
  );
}
