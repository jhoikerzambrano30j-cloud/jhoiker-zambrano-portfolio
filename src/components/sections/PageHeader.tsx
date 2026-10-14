import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

/** Cabecera de página interior, con migas de pan y encabezado de marca. */
export function PageHeader({
  eyebrow,
  title,
  highlight,
  description,
  breadcrumb,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  breadcrumb?: Crumb[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative pt-32 pb-14 sm:pt-40 sm:pb-16", className)}>
      <div className="brand-container">
        {breadcrumb && breadcrumb.length > 0 && (
          <Reveal>
            <nav aria-label="Migas de pan" className="mb-7 flex flex-wrap items-center gap-1.5">
              {breadcrumb.map((crumb, i) => (
                <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3 w-3 text-steel-faint" />}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-steel-dim transition-colors hover:text-cyan-energy"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan-energy">
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          </Reveal>
        )}

        <Reveal>
          <span className="tag-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-energy shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
            {eyebrow}
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="section-title mt-6 max-w-4xl text-4xl sm:text-5xl lg:text-6xl">
            <span className="text-white">{title}</span>
            {highlight && <span className="text-cyan-energy text-glow-cyan"> {highlight}</span>}
          </h1>
        </Reveal>

        <Reveal delay={140}>
          <div className="hairline mt-6 w-28" />
        </Reveal>

        {description && (
          <Reveal delay={180}>
            <p className="mt-6 max-w-2xl text-[0.98rem] leading-relaxed text-steel">{description}</p>
          </Reveal>
        )}

        {children && <Reveal delay={240}>{children}</Reveal>}
      </div>
    </section>
  );
}
