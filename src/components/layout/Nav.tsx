"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Terminal, ArrowUpRight } from "lucide-react";
import { LogoHorizontal } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { NAV_LINKS, isNavLinkActive } from "@/lib/nav";
import { openCommandPalette } from "./CommandPalette";

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => isNavLinkActive(pathname, href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 no-print transition-all duration-300",
        scrolled ? "py-2.5" : "py-4",
      )}
    >
      <div className="brand-container">
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-xl px-3.5 py-2.5 transition-all duration-300 sm:px-5",
            scrolled
              ? "surface-glass shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)]"
              : "border border-transparent bg-transparent",
          )}
        >
          <Link href="/" aria-label="Jhoiker Zambrano — Inicio" className="shrink-0">
            <LogoHorizontal compact />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
                data-active={isActive(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCommandPalette}
              className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[0.7rem] text-steel-dim transition-colors hover:border-cyan-energy/40 hover:text-chrome md:inline-flex"
              aria-label="Abrir paleta de comandos"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Buscar</span>
              <kbd className="rounded border border-white/10 bg-obsidian px-1.5 py-0.5 text-[0.62rem]">
                ⌘K
              </kbd>
            </button>

            <Link href="/contacto" className="btn-cyan hidden !px-4 !py-2 !text-[0.82rem] sm:inline-flex">
              Hablemos
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-chrome transition-colors hover:border-cyan-energy/40 lg:hidden"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
            >
              {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        className={cn(
          "brand-container overflow-hidden transition-all duration-300 lg:hidden",
          open ? "max-h-[34rem] pt-2 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="surface-glass rounded-xl p-3" aria-label="Principal móvil">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3.5 py-3 text-[0.92rem] font-medium transition-colors",
                isActive(link.href)
                  ? "bg-cyan-energy/10 text-cyan-energy"
                  : "text-steel hover:bg-white/[0.04] hover:text-white",
              )}
            >
              {link.label}
              <span className="font-mono text-[0.62rem] text-steel-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
            </Link>
          ))}
          <Link href="/contacto" className="btn-cyan mt-2 w-full">
            Iniciar un proyecto
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
