import { LayoutTemplate, Code2, Workflow, Boxes, Check, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Primitives";
import { formatCOP, cn } from "@/lib/utils";
import type { Service } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  "layout-template": LayoutTemplate,
  "code-2": Code2,
  workflow: Workflow,
  boxes: Boxes,
};

const TIER_LABEL: Record<Service["tier"], string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

/** Tarjeta de servicio con precio desde, entregables y acento por nivel. */
export function ServiceCard({ service, featured }: { service: Service; featured?: boolean }) {
  const Icon = ICONS[service.icon] ?? Boxes;
  const isFeatured = featured ?? service.featured;

  return (
    <div
      className={cn(
        "surface-card group relative flex h-full flex-col rounded-xl p-6 transition-all duration-300 hover:-translate-y-1.5",
        isFeatured
          ? "border-cyan-energy/35 shadow-[0_0_0_1px_rgba(56,189,248,0.15),0_22px_60px_-32px_rgba(56,189,248,0.6)]"
          : "hover:border-cyan-energy/35",
        "card-accent",
      )}
    >
      {isFeatured && (
        <span className="absolute -top-2.5 right-5">
          <Badge tone="cyan">Más solicitado</Badge>
        </span>
      )}

      <span
        className={cn(
          "inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-colors",
          isFeatured
            ? "border-cyan-energy/40 bg-cyan-energy/12"
            : "border-white/10 bg-white/[0.03] group-hover:border-cyan-energy/35",
        )}
      >
        <Icon className={cn("h-5.5 w-5.5", isFeatured ? "text-cyan-energy" : "text-chrome group-hover:text-cyan-energy")} />
      </span>

      <div className="mt-5 flex items-center gap-2">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-steel-faint">
          {TIER_LABEL[service.tier]}
        </span>
      </div>

      <h3 className="mt-2 font-display text-lg font-bold leading-tight text-white">
        {service.name}
      </h3>

      <p className="mt-1.5 text-[0.82rem] font-medium text-cyan-energy/90">{service.tagline}</p>

      <p className="mt-4 flex-1 text-[0.85rem] leading-relaxed text-steel">{service.description}</p>

      {service.deliverables.length > 0 && (
        <ul className="mt-5 space-y-2 border-t border-white/[0.07] pt-5">
          {service.deliverables.slice(0, 4).map((d) => (
            <li key={d} className="flex items-start gap-2.5 text-[0.8rem] leading-snug text-chrome">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-energy" />
              <span>{d}</span>
            </li>
          ))}
          {service.deliverables.length > 4 && (
            <li className="pl-6 font-mono text-[0.68rem] text-steel-faint">
              +{service.deliverables.length - 4} entregables más
            </li>
          )}
        </ul>
      )}

      <div className="mt-6 border-t border-white/[0.07] pt-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel-faint">
              Desde
            </p>
            <p className="mt-1 font-display text-xl font-black text-white">
              {service.price_from ? formatCOP(service.price_from) : "A convenir"}
            </p>
          </div>
          {service.duration && (
            <span className="font-mono text-[0.66rem] text-steel-dim">{service.duration}</span>
          )}
        </div>

        <a
          href={`/contacto?servicio=${encodeURIComponent(service.slug)}`}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/[0.03] px-4 py-2.5 text-[0.82rem] font-semibold text-chrome transition-all duration-250 hover:border-cyan-energy/50 hover:bg-cyan-energy/10 hover:text-cyan-energy"
        >
          Cotizar este servicio
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
