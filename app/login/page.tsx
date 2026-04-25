"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { safeFromPath } from "@/app/_components/safeFromPath";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      const from = safeFromPath(searchParams.get("from")) ?? "/app";
      router.replace(from);
    }
  }, [authStatus, router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      {authStatus === "configuring" && (
        <p className="text-sm opacity-70">Loading…</p>
      )}
      {authStatus !== "authenticated" && <Authenticator />}
    </main>
  );
}

export default function LoginPage() {
  // <Suspense> is mandatory because LoginPageInner uses useSearchParams (K-3 / L-1).
  // Without this boundary, `bun run build` fails with
  // "Missing Suspense boundary with useSearchParams".
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center p-8">
          <p className="text-sm opacity-70">Loading…</p>
        </main>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
