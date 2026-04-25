"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Template re-mounts on each navigation under /app/* — perfect spot for the
// MotionConfig wrapper. `reducedMotion: "user"` honors the OS setting.
export default function AppTemplate({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}>
      {children}
    </MotionConfig>
  );
}
