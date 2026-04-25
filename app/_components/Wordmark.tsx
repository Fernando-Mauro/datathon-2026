// "data," wordmark — D-43 (custom mark, NOT Banregio's literal "hey,").
// IBM Plex Serif Bold lowercase with trailing comma. Used in /, /login header, /app top.

type Props = {
  /** rem size — defaults to lg ramp (~1.75rem). */
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
};

export function Wordmark({ size = "lg", className = "" }: Props) {
  return (
    <span
      className={`font-serif font-bold tracking-tight text-hey-fg-1 lowercase select-none ${sizeClass[size]} ${className}`}
      aria-label="data, — datathon 2026"
    >
      data<span className="text-hey-blue">,</span>
    </span>
  );
}
