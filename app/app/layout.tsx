"use client";

import { AuthGuard } from "@/app/_components/AuthGuard";

// NOTE: client layouts cannot export `metadata` (K-4). The root layout's
// metadata is sufficient.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
