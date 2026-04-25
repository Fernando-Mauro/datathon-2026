"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Wordmark } from "./Wordmark";

type Props = {
  /** When provided, renders a back chevron and an h1 title instead of the wordmark. */
  title?: string;
  /** Optional trailing icon button slot. */
  trailing?: React.ReactNode;
  /** Override the back action; defaults to router.back(). */
  onBack?: () => void;
};

export function AppHeader({ title, trailing, onBack }: Props) {
  const router = useRouter();

  if (title) {
    return (
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-hey-divider bg-hey-bg/95 px-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={onBack ?? (() => router.back())}
          className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-hey-fg-1 transition hover:bg-hey-surface-2 active:opacity-60"
          aria-label="Regresar"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="flex-1 truncate text-base font-semibold text-hey-fg-1">{title}</h1>
        {trailing && <div className="flex items-center gap-2">{trailing}</div>}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-hey-divider bg-hey-bg/95 px-4 backdrop-blur-sm">
      <Wordmark size="md" />
      {trailing && <div className="ml-auto flex items-center gap-2">{trailing}</div>}
    </header>
  );
}
