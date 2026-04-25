"use client"; // Error boundaries MUST be Client Components per Next.js conventions.

import { useEffect } from "react";

// `unstable_retry` is the Next 16.2+ prop name; the `unstable_` prefix signals
// API-stability reservation, NOT flakiness. The function re-fetches and
// re-renders the boundary's children — the recommended recovery path per
// the local Next.js docs at:
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Future phases will forward to an error reporting service (e.g., Sentry).
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <button
        onClick={() => unstable_retry()}
        className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
