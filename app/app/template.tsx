"use client";

import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { SideRail } from "@/app/_components/SideRail";
import { ContextPane } from "@/app/_components/ContextPane";
import { NotificationScheduler } from "@/app/_components/NotificationScheduler";
import { PersonaProvider } from "@/app/_hooks/usePersona";
import { PersonaGuard } from "@/app/_components/PersonaGuard";

// Template re-mounts on each navigation under /app/*.
// - PersonaProvider: localStorage-backed active persona (the impersonation target).
// - PersonaGuard: redirects to /app/personas if no persona is selected.
// - On the picker route itself, the desktop rails are hidden and the layout
//   renders edge-to-edge so the picker fills the viewport.
export default function AppTemplate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPicker = pathname === "/app/personas";

  return (
    <PersonaProvider>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}>
        {!isPicker && <SideRail />}
        {!isPicker && <ContextPane />}
        {!isPicker && <NotificationScheduler />}
        <div className={isPicker ? "min-h-screen" : "min-h-screen lg:pl-[72px] lg:pr-[320px]"}>
          <PersonaGuard>{children}</PersonaGuard>
        </div>
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#161616",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#F5F5F5",
            },
          }}
        />
      </MotionConfig>
    </PersonaProvider>
  );
}
