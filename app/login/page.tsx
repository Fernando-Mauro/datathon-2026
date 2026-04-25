"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";

export default function LoginPage() {
  const router = useRouter();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.push("/app");
    }
  }, [authStatus, router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      {authStatus === "configuring" && (
        <p className="text-sm opacity-70">Loading…</p>
      )}
      {authStatus !== "authenticated" && <Authenticator />}
    </main>
  );
}
