"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "aws-amplify/auth";
import {
  Bell,
  Bookmark,
  ListOrdered,
  LogOut,
  MessageSquare,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HaviRing } from "./HaviRing";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV: readonly NavItem[] = [
  { label: "Conversación", href: "/app", icon: MessageSquare },
  { label: "Notificaciones", href: "/app/notificaciones", icon: Bell },
  { label: "Guardados", href: "/app/guardados", icon: Bookmark },
  { label: "Movimientos", href: "/app/movimientos", icon: ListOrdered },
  { label: "Cambiar usuario", href: "/app/personas", icon: Users },
];

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SideRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setMobileOpen((open) => !open);
    window.addEventListener("havi:toggle-sidebar", handler);
    return () => window.removeEventListener("havi:toggle-sidebar", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[72px] flex-col items-center border-r border-hey-divider bg-[#0A0A0A] py-5 lg:flex ${mobileOpen ? "flex" : "hidden"}`}
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.015) 100%)",
        }}
        aria-label="Navegación principal"
      >
      {/* Brand mark + home button */}
      <Link
        href="/app"
        aria-label="Ir a conversación"
        className="group relative flex h-12 w-12 items-center justify-center"
      >
        <HaviRing size={36} />
        <span className="pointer-events-none absolute left-full ml-3 origin-left scale-95 rounded-hey-sm border border-hey-divider bg-hey-surface-2 px-2.5 py-1.5 font-serif text-[13px] font-semibold text-hey-fg-1 opacity-0 shadow-lg transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
          Havi<span className="text-hey-blue">CA</span>
        </span>
      </Link>

      {/* Hairline separator */}
      <div className="my-5 h-px w-8 bg-hey-divider" />

      {/* Nav cluster */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="group relative flex h-11 w-11 items-center justify-center rounded-hey-sm text-hey-fg-2 transition-colors hover:bg-hey-surface-2 hover:text-hey-fg-1"
            >
              {/* Active accent strip — vertical 2px on left edge */}
              {active && (
                <span
                  aria-hidden
                  className="absolute -left-5 top-1.5 bottom-1.5 w-[2px] rounded-r bg-hey-blue"
                />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.8}
                className={active ? "text-hey-fg-1" : ""}
              />
              {/* Hover label tooltip */}
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-hey-sm border border-hey-divider bg-hey-surface-2 px-2.5 py-1.5 text-[12px] font-medium text-hey-fg-1 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sign-out at bottom */}
      <button
        type="button"
        onClick={handleSignOut}
        aria-label="Cerrar sesión"
        className="group relative flex h-11 w-11 items-center justify-center rounded-hey-sm text-hey-fg-2 transition-colors hover:bg-hey-surface-2 hover:text-hey-error"
      >
        <LogOut size={18} strokeWidth={1.8} />
        <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-hey-sm border border-hey-divider bg-hey-surface-2 px-2.5 py-1.5 text-[12px] font-medium text-hey-fg-1 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
          Cerrar sesión
        </span>
      </button>
      </aside>
    </>
  );
}
