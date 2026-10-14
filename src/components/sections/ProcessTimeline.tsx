"use client";

import { useState } from "react";
import { Search, Compass, PenTool, Code2, Rocket, LifeBuoy, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  icon: LucideIcon;
  phase: string;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
}

const PHASES: Phase[] = [
  {
    icon: Search,
    phase: "Fase 01",
    title: "Descubrimiento",
    duration: "2 – 4 días",
    description:
      "Entiendo el negocio antes de tocar código. Levanto procesos, restricciones, usuarios reales y el criterio con el que vas a juzgar el resultado.",
    deliverables: [
      "Documento de alcance cerrado",
      "Mapa de procesos y usuarios",
      "Criterios de aceptación medibles",
      "Propuesta económica y cronograma",
    ],
  },
  {
    icon: Compass,
    phase: "Fase 02",
    title: "Diseño y arquitectura",
    duration: "4 – 10 días",
    description:
      "Modelo el dominio y la arquitectura técnica, y diseño las interfaces clave. Aquí se toman las decisiones que evitan reescribir todo en un año.",
    deliverables: [
      "Modelo de datos y migraciones",
      "Arquitectura de la solución",
      "Prototipo de interfaces críticas",
      "Plan de integraciones",
    ],
  },
  {
    icon: Code2,
    phase: "Fase 03",
    title: "Construcción",
    duration: "2 – 8 semanas",
    description:
      "Desarrollo por incrementos verificables. Cada semana hay algo funcionando que puedes ver, usar y cuestionar.",
    deliverables: [
      "Incrementos funcionales semanales",
      "Repositorio con historial limpio",
      "Ambiente de pruebas desplegado",
      "Pruebas automatizadas de lo crítico",
    ],
  },
  {
    icon: Rocket,
    phase: "Fase 04",
    title: "Entrega y despliegue",
    duration: "2 – 5 días",
    description:
      "Paso a producción con despliegue automatizado, monitoreo activo y una validación conjunta contra los criterios de aceptación.",
    deliverables: [
      "Producción en tu dominio",
      "Integración y despliegue continuos",
      "Pruebas de aceptación firmadas",
      "Capacitación de uso",
    ],
  },
  {
    icon: LifeBuoy,
    phase: "Fase 05",
    title: "Garantía y evolución",
    duration: "60 – 120 días",
    description:
      "Acompaño la operación real: corrijo defectos sin costo durante la garantía y, si lo necesitas, continúo con mantenimiento y evolución.",
    deliverables: [
      "Corrección de defectos incluida",
      "Monitoreo de errores y alertas",
      "Informe de cierre del proyecto",
      "Plan de evolución opcional",
    ],
  },
];

/** Línea de tiempo del proceso, con fases seleccionables. */
export function ProcessTimeline() {
  const [active, setActive] = useState(0);
  const current = PHASES[active];

  return (
    <div>
      {/* Selector de fases */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PHASES.map((phase, i) => {
          const Icon = phase.icon;
          const isActive = i === active;
          return (
            <button
              key={phase.title}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "group relative flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all duration-300",
                isActive
                  ? "border-cyan-energy/45 bg-cyan-energy/[0.07] shadow-[0_0_0_1px_rgba(56,189,248,0.15),0_18px_50px_-30px_rgba(56,189,248,0.7)]"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-cyan-energy/25",
              )}
              aria-pressed={isActive}
            >
              <span
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                  isActive
                    ? "border-cyan-energy/45 bg-cyan-energy/12"
                    : "border-white/10 bg-white/[0.03] group-hover:border-cyan-energy/30",
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", isActive ? "text-cyan-energy" : "text-steel")} />
              </span>

              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-steel-faint">
                {phase.phase}
              </span>
              <span
                className={cn(
                  "font-display text-[0.88rem] font-bold leading-tight",
                  isActive ? "text-cyan-energy" : "text-white",
                )}
              >
                {phase.title}
              </span>

              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-xl bg-gradient-to-r from-transparent via-cyan-energy to-transparent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Detalle de la fase activa */}
      <div className="surface-card card-accent mt-6 rounded-xl p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                {current.phase}
              </span>
              <span className="font-mono text-[0.64rem] text-steel-faint">·</span>
              <span className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-steel-dim">
                {current.duration}
              </span>
            </div>

            <h3 className="mt-3 font-display text-2xl font-black text-white">{current.title}</h3>
            <p className="mt-4 text-[0.92rem] leading-relaxed text-steel">{current.description}</p>
          </div>

          <div className="border-t border-white/[0.07] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <h4 className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-steel-faint">
              Entregables de esta fase
            </h4>
            <ul className="mt-4 space-y-2.5">
              {current.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-3 text-[0.85rem] leading-snug text-chrome">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-energy shadow-[0_0_6px_rgba(56,189,248,0.9)]" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
