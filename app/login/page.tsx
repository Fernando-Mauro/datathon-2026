"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Authenticator, ThemeProvider, useAuthenticator } from "@aws-amplify/ui-react";
import { safeFromPath } from "@/app/_components/safeFromPath";
import { Wordmark } from "@/app/_components/Wordmark";
import { heyAmplifyTheme } from "@/app/_styles/amplifyTheme";

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
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-hey-bg p-8">
      <Wordmark size="lg" />
      {authStatus === "configuring" && (
        <p className="text-sm text-hey-fg-2">Cargando…</p>
      )}
      {authStatus !== "authenticated" && (
        <div className="hey-app-frame">
          <Authenticator />
        </div>
      )}
    </main>
  );
}

export default function LoginPage() {
  // <Suspense> mandatory — LoginPageInner uses useSearchParams (K-3 / L-1).
  // Without this boundary, `bun run build` fails.
  return (
    <ThemeProvider theme={heyAmplifyTheme} colorMode="dark">
      <Suspense
        fallback={
          <main className="flex min-h-screen items-center justify-center bg-hey-bg p-8">
            <p className="text-sm text-hey-fg-2">Cargando…</p>
          </main>
        }
      >
        <LoginPageInner />
      </Suspense>
    </ThemeProvider>
  );
}
