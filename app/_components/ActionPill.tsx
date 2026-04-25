"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  label: string;
  href?: string;
  onClick?: () => void;
};

const baseClass =
  "inline-flex items-center gap-1.5 rounded-hey-pill border border-hey-outline bg-hey-surface-2 px-4 py-2 text-[13px] font-medium text-hey-fg-1 transition hover:border-hey-blue hover:text-hey-blue active:opacity-60";

export function ActionPill({ label, href, onClick }: Props) {
  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {label}
        <ChevronRight size={14} strokeWidth={2.2} />
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={baseClass}>
      {label}
      <ChevronRight size={14} strokeWidth={2.2} />
    </button>
  );
}
