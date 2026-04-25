// HAVI rainbow ring — CSS conic-gradient via .hey-havi-ring class in globals.css.
// Animation honors prefers-reduced-motion. `aria-hidden` because the ring is
// purely decorative (the chat author label conveys identity).

type Props = {
  size?: number;
  className?: string;
};

export function HaviRing({ size = 56, className = "" }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`hey-havi-ring inline-block ${className}`}
      style={{ ["--ring-size" as string]: `${size}px` }}
    />
  );
}
