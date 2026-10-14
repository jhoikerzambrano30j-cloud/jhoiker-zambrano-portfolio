"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Workflow,
  Inbox,
  FileSignature,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Isotipo } from "@/components/brand/Logo";
import { logout } from "@/app/acceso/actions";
import { cn } from "@/lib/utils";
import type { AdminSession } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/admin/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/admin/servicios", label: "Servicios", icon: Briefcase },
  { href: "/admin/automatizaciones", label: "Automatizaciones", icon: Workflow },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/contratos", label: "Contratos", icon: FileSignature },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

/** Estructura visual del panel: barra lateral + cabecera. */
export function AdminShell({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const current = NAV.find((n) => isActive(n.href, n.exact));

  return (
    <div className="relative z-10 min-h-screen">
      <div className="brand-container py-6 lg:py-8">
        <div className="flex gap-6">
          {/* Barra lateral */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 shrink-0 border-r border-white/[0.07] bg-obsidian-800 px-4 py-6 transition-transform duration-300 lg:sticky lg:top-6 lg:z-auto lg:h-[calc(100vh-3rem)] lg:translate-x-0 lg:rounded-2xl lg:border lg:bg-transparent lg:px-3",
              open ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="flex items-center justify-between px-2">
              <Link href="/admin" className="flex items-center gap-2.5">
                <Isotipo size={26} />
                <span className="flex flex-col leading-none">
                  <span className="font-display text-[11px] font-black tracking-[0.14em] text-white">
                    PANEL
                  </span>
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-cyan-energy">
                    Admin
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-steel lg:hidden"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-7 space-y-1">
              {NAV.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.85rem] font-medium transition-all duration-200",
                      active
                        ? "border border-cyan-energy/30 bg-cyan-energy/[0.09] text-cyan-energy"
                        : "border border-transparent text-steel hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", active && "text-cyan-energy")} />
                    {item.label}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-energy shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-7 border-t border-white/[0.07] pt-5">
              <div className="surface-card rounded-xl p-3.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-energy" />
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-steel-faint">
                    Sesión admin
                  </span>
                </div>
                <p className="mt-2 truncate text-[0.82rem] font-semibold text-white">
                  {session.fullName}
                </p>
                <p className="truncate font-mono text-[0.64rem] text-steel-dim">{session.email}</p>
              </div>

              <Link
                href="/"
                target="_blank"
                className="mt-3 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.85rem] text-steel transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
                Ver el sitio
              </Link>

              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.85rem] text-rose-300 transition-colors hover:bg-rose-400/[0.08] hover:text-rose-200"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </aside>

          {/* Fondo oscuro en móvil */}
          {open && (
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-obsidian/80 backdrop-blur-sm lg:hidden"
            />
          )}

          {/* Contenido */}
          <div className="min-w-0 flex-1">
            <header className="mb-6 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-chrome lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>

              <div className="min-w-0">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel-faint">
                  Administración
                </p>
                <h1 className="truncate font-display text-xl font-black text-white sm:text-2xl">
                  {current?.label ?? "Panel"}
                </h1>
              </div>

              <div className="ml-auto hidden items-center gap-2 sm:flex">
                <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
                  En línea
                </span>
              </div>
            </header>

            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
