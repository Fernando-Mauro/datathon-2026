"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { AlertItem, AlertLevel } from "@/app/_data/types";

type Props = { alert: AlertItem };

const levelMap: Record<
  AlertLevel,
  { icon: React.ElementType; ring: string; chip: string }
> = {
  warning: {
    icon: AlertTriangle,
    ring: "text-hey-warning",
    chip: "bg-hey-accent-amber-bg",
  },
  success: {
    icon: CheckCircle2,
    ring: "text-hey-success",
    chip: "bg-hey-accent-green-bg",
  },
  info: {
    icon: Info,
    ring: "text-hey-info",
    chip: "bg-hey-accent-sky-bg",
  },
  error: {
    icon: XCircle,
    ring: "text-hey-error",
    chip: "bg-hey-accent-magenta-bg",
  },
};

export function AlertCard({ alert }: Props) {
  const { icon: Icon, ring, chip } = levelMap[alert.level];
  return (
    <article className="rounded-hey-md bg-hey-surface-2 p-5">
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-9 w-9 flex-none items-center justify-center rounded-full ${chip}`}
        >
          <Icon size={18} strokeWidth={2.2} className={ring} />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="font-serif text-[18px] font-semibold leading-tight text-hey-fg-1">
            {alert.title}
          </h3>
          <p className="text-[14px] leading-snug text-hey-fg-2">{alert.body}</p>
        </div>
      </div>
      {alert.cta && (
        <div className="mt-4 flex justify-end">
          {alert.href ? (
            <Link
              href={alert.href}
              className="inline-flex items-center rounded-hey-pill bg-hey-blue px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-hey-blue-hover active:bg-hey-blue-press"
            >
              {alert.cta}
            </Link>
          ) : (
            <button
              type="button"
              className="inline-flex items-center rounded-hey-pill bg-hey-surface-3 px-4 py-2 text-[13px] font-semibold text-hey-fg-1 transition hover:bg-hey-surface-2"
            >
              {alert.cta}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
