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
      ? "/uniplace-mark.svg"
      : variant === "wordmark"
        ? "/uniplace-wordmark.svg"
        : "/uniplace-logo.svg";
  const dims =
    variant === "mark"
      ? { width: 130, height: 140 }
      : variant === "wordmark"
        ? { width: 180, height: 48 }
        : { width: 235, height: 75 };

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
