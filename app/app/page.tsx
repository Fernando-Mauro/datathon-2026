import { SignOutButton } from "./SignOutButton";

export default function AppPlaceholder() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="text-sm opacity-70">
        This is the placeholder app shell. Phase 4 will add the auth guard
        so that /app is only reachable when signed in.
      </p>
      <SignOutButton />
    </main>
  );
}
