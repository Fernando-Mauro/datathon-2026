"use client";

import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

export function SignOutButton() {
  const router = useRouter();

  async function handleClick() {
    await signOut();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5"
    >
      Sign out
    </button>
  );
}
