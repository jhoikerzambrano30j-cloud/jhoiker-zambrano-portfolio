"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Home,
  FolderKanban,
  Briefcase,
  Server,
  User,
  Palette,
  Mail,
  Github,
  Linkedin,
  FileText,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/nav";

const EVT = "jz:open-command-palette";

/** Abre la paleta de comandos desde cualquier componente. */
export function openCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVT));
  }
}

interface Command {
  id: string;
  label: string;
  hint: string;
  group: "Navegación" | "Marca" | "Externo";
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "/": Home,
  "/proyectos": FolderKanban,
  "/servicios": Briefcase,
  "/infraestructura": Server,
  "/sobre-mi": User,
  "/marca": Palette,
  "/contacto": Mail,
};

/**
 * Paleta de comandos (⌘K / Ctrl+K) — navegación instantánea estilo terminal.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  }, []);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    function onKey(e: KeyboardEvent) {
      const isPaletteKey = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isPaletteKey) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener(EVT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(EVT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = "hidden";
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const commands: Command[] = useMemo(() => {
    const nav: Command[] = NAV_LINKS.map((l) => ({
      id: `nav-${l.href}`,
      label: l.label,
      hint: l.href,
      group: "Navegación" as const,
      icon: ICONS[l.href] ?? Home,
      action: () => router.push(l.href),
    }));

    const brand: Command[] = [
      {
        id: "brand-manual",
        label: "Manual de identidad de marca",
        hint: "Colores, tipografía e isotipo",
        group: "Marca" as const,
        icon: Palette,
        action: () => router.push("/marca"),
      },
      {
        id: "brand-admin",
        label: "Panel de administración",
        hint: "Área privada",
        group: "Marca" as const,
        icon: FileText,
        action: () => router.push("/admin"),
      },
    ];

    const external: Command[] = [
      {
        id: "ext-github",
        label: "GitHub",
        hint: "github.com/jhoikerzambrano",
        group: "Externo" as const,
        icon: Github,
        action: () => window.open("https://github.com/jhoikerzambrano", "_blank", "noopener"),
      },
      {
        id: "ext-linkedin",
        label: "LinkedIn",
        hint: "Perfil profesional",
        group: "Externo" as const,
        icon: Linkedin,
        action: () => window.open("https://www.linkedin.com/in/jhoikerzambrano", "_blank", "noopener"),
      },
    ];

    return [...nav, ...brand, ...external];
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>();
    filtered.forEach((c) => {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const flatIndex = (id: string) => filtered.findIndex((c) => c.id === id);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(filtered.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[cursor];
      if (cmd) {
        cmd.action();
        close();
      }
    }
  }

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-cursor="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] no-print" role="dialog" aria-modal="true" aria-label="Paleta de comandos">
      <button
        type="button"
        aria-label="Cerrar paleta de comandos"
        onClick={close}
        className="absolute inset-0 cursor-default bg-obsidian/80 backdrop-blur-sm"
      />

      <div className="relative mx-auto mt-[12vh] w-[92%] max-w-xl">
        <div className="surface-card overflow-hidden rounded-xl shadow-[0_40px_100px_-30px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5">
            <Search className="h-4 w-4 shrink-0 text-cyan-energy" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Buscar secciones, marca, enlaces…"
              className="w-full bg-transparent text-[0.92rem] text-white placeholder:text-steel-faint focus:outline-none"
              aria-label="Buscar"
            />
            <kbd className="rounded border border-white/10 bg-obsidian px-1.5 py-0.5 font-mono text-[0.62rem] text-steel-faint">
              ESC
            </kbd>
          </div>

          <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
            {grouped.length === 0 && (
              <p className="px-3 py-8 text-center font-mono text-[0.78rem] text-steel-dim">
                Sin resultados para «{query}»
              </p>
            )}

            {grouped.map(([group, items]) => (
              <div key={group} className="mb-1">
                <div className="px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-steel-faint">
                  {group}
                </div>
                {items.map((cmd) => {
                  const idx = flatIndex(cmd.id);
                  const active = idx === cursor;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      data-cursor={active}
                      onMouseEnter={() => setCursor(idx)}
                      onClick={() => {
                        cmd.action();
                        close();
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        active ? "bg-cyan-energy/12 text-white" : "text-steel hover:bg-white/[0.04]",
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-cyan-energy" : "text-steel-dim")} />
                      <span className="flex-1 truncate text-[0.88rem] font-medium">{cmd.label}</span>
                      <span className="hidden truncate font-mono text-[0.66rem] text-steel-faint sm:block">
                        {cmd.hint}
                      </span>
                      {active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-cyan-energy" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel-faint">
            <span>↑↓ navegar · ↵ abrir</span>
            <span className="text-cyan-energy/70">[ J Z ]</span>
          </div>
        </div>
      </div>
    </div>
  );
}
