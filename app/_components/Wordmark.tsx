// Havi-business wordmark — IBM Plex Serif Bold. The "-business" tail renders in
// blue for emphasis (HAVI = the assistant, -business = product variant). Used
// in /, /login header, public home, and SideRail brand mark.

type Props = {
  /** rem size — defaults to lg ramp. */
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
      className={`font-serif font-bold tracking-tight text-hey-fg-1 select-none ${sizeClass[size]} ${className}`}
      aria-label="Havi-business"
    >
      Havi<span className="text-hey-blue">-business</span>
    </span>
  );
}
