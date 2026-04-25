import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-semibold">404 — Not Found</h2>
      <p className="text-sm opacity-70">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5"
      >
        Return home
      </Link>
    </div>
  );
}
