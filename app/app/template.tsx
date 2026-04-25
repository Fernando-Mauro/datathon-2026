"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { SideRail } from "@/app/_components/SideRail";
import { ContextPane } from "@/app/_components/ContextPane";

// Template re-mounts on each navigation under /app/* — perfect spot for the
// MotionConfig wrapper + responsive desktop shell.
//
// Mobile (<lg): SideRail + ContextPane render `hidden`, children fill the
// viewport with their own AppHeader / MobileNav chrome.
//
// Desktop (≥lg): SideRail (72px) is fixed left, ContextPane (320px) is fixed
// right. Children render between them via `lg:pl-[72px] lg:pr-[320px]`.
// `min-h-screen` ensures sticky composer in chat home anchors to viewport.
export default function AppTemplate({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}>
      <SideRail />
      <ContextPane />
      <div className="min-h-screen lg:pl-[72px] lg:pr-[320px]">{children}</div>
    </MotionConfig>
  );
}
