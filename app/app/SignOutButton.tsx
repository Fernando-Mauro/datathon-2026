"use client";

import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { LogOut } from "lucide-react";

type Props = {
  variant?: "icon" | "text";
};

export function SignOutButton({ variant = "icon" }: Props) {
  const router = useRouter();

  async function handleClick() {
    await signOut();
    router.push("/");
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label="Cerrar sesión"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-hey-fg-2 transition hover:bg-hey-surface-2 hover:text-hey-fg-1 active:opacity-60"
      >
        <LogOut size={18} strokeWidth={2} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-hey-pill border border-hey-outline px-4 py-2 text-[13px] font-medium text-hey-fg-1 transition hover:border-hey-error hover:text-hey-error active:opacity-60"
    >
      <LogOut size={14} strokeWidth={2.2} />
      Cerrar sesión
    </button>
  );
}
