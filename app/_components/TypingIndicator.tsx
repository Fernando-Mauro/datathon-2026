// Three-dot pulse — animation via @keyframes hey-typing-dot in globals.css.
// Used inside ChatMessage when HAVI is "thinking" (D-48 typing delay).

export function TypingIndicator() {
  return (
    <span
      role="status"
      aria-label="HAVI está escribiendo"
      className="inline-flex items-center gap-1.5 px-1 py-2"
    >
      <Dot delay="0s" />
      <Dot delay="0.15s" />
      <Dot delay="0.3s" />
    </span>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="block h-1.5 w-1.5 rounded-full bg-hey-fg-2"
      style={{
        animation: "hey-typing-dot 1.2s ease-in-out infinite",
        animationDelay: delay,
      }}
    />
  );
}
