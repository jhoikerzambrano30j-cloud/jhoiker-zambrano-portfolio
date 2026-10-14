import { Zap, Activity, Clock, Bot, ShieldCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";
import type { Automation } from "@/lib/types";

const AUTONOMY: Record<Automation["autonomy_level"], { label: string; tone: "cyan" | "indigo" | "success" }> = {
  supervisado: { label: "Supervisado", tone: "indigo" },
  semiautonomo: { label: "Semiautónomo", tone: "cyan" },
  autonomo: { label: "Autónomo", tone: "success" },
};

const STATUS: Record<Automation["status"], { label: string; dot: string }> = {
  activa: { label: "Activa", dot: "bg-emerald-400" },
  pausada: { label: "Pausada", dot: "bg-amber-400" },
  borrador: { label: "Borrador", dot: "bg-steel-dim" },
  error: { label: "Con error", dot: "bg-rose-400" },
};

/** Diagrama de flujo de una automatización con sus pasos y métricas. */
export function AutomationFlow({
  automation,
  className,
}: {
  automation: Automation;
  className?: string;
}) {
  const autonomy = AUTONOMY[automation.autonomy_level];
  const status = STATUS[automation.status];

  return (
    <div className={cn("surface-card card-accent flex h-full flex-col rounded-xl p-6", className)}>
      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-energy/25 bg-cyan-energy/[0.08]">
            <Bot className="h-5 w-5 text-cyan-energy" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold leading-tight text-white">
              {automation.name}
            </h3>
            <p className="mt-0.5 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-steel-faint">
              {automation.trigger_type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={autonomy.tone}>{autonomy.label}</Badge>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-chrome">
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot, automation.status === "activa" && "motion-safe:animate-pulse")} />
            {status.label}
          </span>
        </div>
      </div>

      <p className="mt-4 text-[0.85rem] leading-relaxed text-steel">{automation.description}</p>

      {/* Flujo de pasos */}
      <div className="mt-6 flex-1">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-steel-faint">
          Flujo de ejecución
        </p>
        <ol className="mt-4 space-y-0">
          {automation.workflow.map((step, i) => {
            const isLast = i === automation.workflow.length - 1;
            return (
              <li key={`${step.step}-${i}`} className="relative flex gap-4 pb-5 last:pb-0">
                {/* Conector vertical */}
                {!isLast && (
                  <span
                    className="absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-px bg-gradient-to-b from-cyan-energy/45 to-indigo-automation/15"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10 mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-energy/35 bg-obsidian font-mono text-[0.62rem] font-semibold text-cyan-energy">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[0.82rem] font-semibold text-white">{step.step}</p>
                  <p className="mt-0.5 text-[0.78rem] leading-snug text-steel">{step.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Herramientas */}
      {automation.tools.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5 border-t border-white/[0.07] pt-5">
          {automation.tools.map((tool) => (
            <span
              key={tool}
              className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 font-mono text-[0.62rem] text-steel"
            >
              {tool}
            </span>
          ))}
        </div>
      )}

      {/* Métricas */}
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.07] pt-5">
        {[
          { icon: Activity, label: "Ejecuciones", value: automation.runs_count.toLocaleString("es-CO") },
          {
            icon: ShieldCheck,
            label: "Éxito",
            value: automation.success_rate !== null ? `${automation.success_rate}%` : "—",
          },
          {
            icon: Clock,
            label: "Ahorro/mes",
            value: automation.saved_hours_month !== null ? `${automation.saved_hours_month} h` : "—",
          },
        ].map((m) => (
          <div key={m.label}>
            <m.icon className="h-3.5 w-3.5 text-cyan-energy/70" />
            <div className="mt-1.5 font-mono text-[0.82rem] font-semibold text-white">{m.value}</div>
            <div className="text-[0.6rem] uppercase tracking-[0.1em] text-steel-faint">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
