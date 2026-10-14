import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

/** Encabezado de sección con etiqueta monoespaciada y barra de acento cyan. */
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "left",
  className,
  index,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  index?: string;
}) {
  return (
    <Reveal className={cn(align === "center" && "text-center", className)}>
      <div
        className={cn(
          "flex items-center gap-3",
          align === "center" && "justify-center",
        )}
      >
        {eyebrow && (
          <span className="tag-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-energy shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
            {eyebrow}
          </span>
        )}
        {index && <span className="font-mono text-[0.68rem] tracking-[0.2em] text-steel-faint">{index}</span>}
      </div>

      <h2
        className={cn(
          "section-title mt-5 text-3xl sm:text-4xl lg:text-[2.75rem]",
          align === "center" && "mx-auto max-w-3xl",
        )}
      >
        <span className="text-white">{title}</span>
        {highlight && <span className="text-cyan-energy text-glow-cyan"> {highlight}</span>}
      </h2>

      <div
        className={cn(
          "hairline mt-5 w-24",
          align === "center" && "mx-auto",
        )}
      />

      {description && (
        <p
          className={cn(
            "mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-steel",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}

/** Etiqueta técnica pequeña. */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "cyan" | "indigo" | "success" | "warn" | "danger" | "muted";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-white/10 bg-white/[0.04] text-chrome",
    cyan: "border-cyan-energy/35 bg-cyan-energy/10 text-cyan-energy",
    indigo: "border-indigo-automation/35 bg-indigo-automation/10 text-indigo-automation",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    warn: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    danger: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    muted: "border-white/[0.07] bg-white/[0.02] text-steel-dim",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[0.66rem] uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Tarjeta con superficie de marca y borde de acento opcional. */
export function Card({
  children,
  className,
  accent = false,
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "surface-card rounded-xl",
        accent && "card-accent",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-cyan-energy/40 hover:shadow-[0_18px_50px_-24px_rgba(56,189,248,0.55)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Bloque de código estilo terminal, con tipografía JetBrains Mono. */
export function CodeBlock({
  code,
  title = "terminal",
  className,
}: {
  code: string;
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-white/10 bg-obsidian-800/90", className)}>
      <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-steel-faint">
          {title}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[0.78rem] leading-relaxed text-cyan-energy/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Métrica grande con etiqueta monoespaciada. */
export function Stat({
  value,
  label,
  suffix,
  className,
}: {
  value: string | number;
  label: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-left", className)}>
      <div className="font-display text-3xl font-black text-white sm:text-4xl">
        {value}
        {suffix && <span className="text-cyan-energy">{suffix}</span>}
      </div>
      <div className="mt-1.5 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-steel-dim">
        {label}
      </div>
    </div>
  );
}

/** Barra de habilidad/tecnología. */
export function SkillBar({
  name,
  level,
  delay = 0,
}: {
  name: string;
  level: number;
  delay?: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.82rem] font-medium text-chrome">{name}</span>
        <span className="font-mono text-[0.68rem] text-steel-faint">{level}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-energy to-indigo-automation shadow-[0_0_10px_rgba(56,189,248,0.7)] motion-safe:transition-[width] motion-safe:duration-1000 motion-safe:ease-out"
          style={{ width: `${Math.max(0, Math.min(100, level))}%`, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}
