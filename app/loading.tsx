export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-screen items-center justify-center"
    >
      <div className="h-10 w-10 animate-pulse rounded-full bg-foreground/10" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
