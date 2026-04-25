"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";

/**
 * Protect a client subtree. Mounts `Authenticator.Provider` is assumed to
 * be present at root (`app/AmplifyProvider.tsx`).
 *
 * Three states:
 *   - `configuring`    → spinner + "Loading…" (no flash of protected content)
 *   - `unauthenticated`→ router.replace to /login?from=<current path>
 *   - `authenticated`  → renders children
 *
 * MUST NOT be mounted on /login itself (would loop). The pathname guard below
 * is a defensive backstop; the convention is "only wrap routes that should be
 * authenticated."
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  useEffect(() => {
    if (authStatus === "unauthenticated" && !pathname.startsWith("/login")) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [authStatus, pathname, router]);

  if (authStatus === "configuring") {
    return (
      <div
        role="status"
        aria-label="Loading"
        className="flex min-h-screen items-center justify-center"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          <p className="text-sm opacity-70">Loading…</p>
        </div>
      </div>
    );
  }

  if (authStatus === "authenticated") {
    return <>{children}</>;
  }

  // unauthenticated — redirect effect has fired; render nothing in the meantime
  return null;
}
