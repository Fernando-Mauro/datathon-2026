"use client";

import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { SignOutButton } from "./SignOutButton";

export default function AppPage() {
  const { user } = useAuthenticator(({ user }) => [user]);
  const email = user?.signInDetails?.loginId;
  const [name, setName] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const attrs = await fetchUserAttributes();
        if (!cancelled) setName(attrs.name);
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[AppPage] fetchUserAttributes failed:", e);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">
        {name ? `Welcome, ${name}` : "Welcome"}
      </h1>
      {email && (
        <p className="text-sm opacity-70">Signed in as {email}</p>
      )}
      <SignOutButton />
    </main>
  );
}
