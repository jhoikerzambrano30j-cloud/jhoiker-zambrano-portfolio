import Link from "next/link";
import { Github, Linkedin, Mail, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { PALETTE } from "@/lib/brand";
import { NAV_LINKS } from "@/lib/nav";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-24 border-t border-white/[0.07] no-print">
      <div className="brand-container py-14">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Marca */}
          <div>
            <Logo size="md" showWordmark showRole className="!items-start" />
            <p className="mt-6 max-w-xs text-[0.85rem] leading-relaxed text-steel">
              Arquitectura digital y automatizaciones con estándar de excelencia impecable.
              El trabajo habla por sí mismo.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              <a
                href="https://github.com/jhoikerzambrano"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-steel transition-colors hover:border-cyan-energy/45 hover:text-cyan-energy"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/jhoikerzambrano"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-steel transition-colors hover:border-cyan-energy/45 hover:text-cyan-energy"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:contacto@jhoikerzambrano.com"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-steel transition-colors hover:border-cyan-energy/45 hover:text-cyan-energy"
                aria-label="Correo electrónico"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h3 className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-steel-faint">
              Navegación
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.85rem] text-steel transition-colors hover:text-cyan-energy"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-steel-faint">
              Servicios
            </h3>
            <ul className="mt-4 space-y-2.5">
              {[
                "Desarrollo web a medida",
                "Automatización de procesos",
                "Arquitectura digital",
                "Consultoría técnica",
                "Integración de IA",
              ].map((s) => (
                <li key={s}>
                  <Link
                    href="/servicios"
                    className="text-[0.85rem] text-steel transition-colors hover:text-cyan-energy"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Paleta de marca + acceso */}
          <div>
            <h3 className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-steel-faint">
              Identidad cromática
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {PALETTE.map((c) => (
                <div
                  key={c.hex}
                  className="group flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] p-2 transition-colors hover:border-cyan-energy/30"
                  title={`${c.name} — ${c.hex}`}
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-md border border-white/10"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[0.6rem] text-chrome">
                      {c.hex}
                    </span>
                    <span className="block truncate text-[0.58rem] text-steel-faint">
                      {c.role}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/acceso"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel-dim transition-colors hover:border-cyan-energy/40 hover:text-cyan-energy"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Acceso administrador
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="hairline mt-12" />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.68rem] text-steel-faint">
            © {year} Jhoiker Zambrano · Ingeniería de Software &amp; Arquitectura Digital
          </p>
          <p className="font-mono text-[0.66rem] text-steel-faint">
            Manual de Identidad de Marca{" "}
            <span className="text-cyan-energy/80">v3.0</span> · Obsidian Deep{" "}
            <span className="text-cyan-energy/80">#0A0D14</span> · Cyan Energy{" "}
            <span className="text-cyan-energy/80">#38BDF8</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
