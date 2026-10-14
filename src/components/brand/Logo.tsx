import { cn } from "@/lib/utils";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const SIZES: Record<
  LogoSize,
  { box: string; bracket: string; letter: string; word: string; tracking: string; gap: string }
> = {
  xs: { box: "gap-[3px]", bracket: "text-[13px]", letter: "text-[12px]", word: "text-[7px]", tracking: "tracking-[0.34em]", gap: "mt-1" },
  sm: { box: "gap-1", bracket: "text-[18px]", letter: "text-[16px]", word: "text-[9px]", tracking: "tracking-[0.36em]", gap: "mt-1.5" },
  md: { box: "gap-1.5", bracket: "text-[26px]", letter: "text-[23px]", word: "text-[11px]", tracking: "tracking-[0.4em]", gap: "mt-2" },
  lg: { box: "gap-2", bracket: "text-[38px]", letter: "text-[34px]", word: "text-[14px]", tracking: "tracking-[0.44em]", gap: "mt-2.5" },
  xl: { box: "gap-3", bracket: "text-[56px]", letter: "text-[50px]", word: "text-[18px]", tracking: "tracking-[0.48em]", gap: "mt-3" },
  hero: { box: "gap-4 sm:gap-6", bracket: "text-[64px] sm:text-[104px]", letter: "text-[58px] sm:text-[96px]", word: "text-[19px] sm:text-[30px]", tracking: "tracking-[0.5em]", gap: "mt-4 sm:mt-6" },
};

/**
 * Isotipo y logotipo oficial de Jhoiker Zambrano — Manual de Identidad v3.0.
 *
 * El monograma cibernético [ JZ ] está flanqueado por corchetes de desarrollo:
 * contraste máximo sobre fondos oscuros, sintaxis inspirada en lenguajes de
 * programación. La "Z" siempre en Cyan Energy.
 */
export function Logo({
  size = "md",
  showWordmark = true,
  showRole = false,
  className,
  animate = false,
}: {
  size?: LogoSize;
  showWordmark?: boolean;
  showRole?: boolean;
  className?: string;
  animate?: boolean;
}) {
  const s = SIZES[size];

  return (
    <div className={cn("inline-flex flex-col items-center select-none", className)}>
      <div className={cn("flex items-center", s.box)} aria-hidden="true">
        <span
          className={cn(
            "font-display font-black text-white/95 leading-none",
            s.bracket,
            animate && "motion-safe:animate-[bracketL_3.4s_ease-in-out_infinite]",
          )}
        >
          [
        </span>
        <span className={cn("font-display font-black text-white leading-none", s.letter)}>J</span>
        <span
          className={cn(
            "font-display font-black text-cyan-energy leading-none text-glow-cyan",
            s.letter,
          )}
        >
          Z
        </span>
        <span
          className={cn(
            "font-display font-black text-white/95 leading-none",
            s.bracket,
            animate && "motion-safe:animate-[bracketR_3.4s_ease-in-out_infinite]",
          )}
        >
          ]
        </span>
      </div>

      {showWordmark && (
        <span
          className={cn(
            "font-mono uppercase text-chrome/85 leading-[1.4]",
            s.word,
            s.tracking,
            s.gap,
          )}
        >
          Jhoiker&nbsp;Zambrano
        </span>
      )}

      {showRole && (
        <span className="mt-2 font-sans text-[10px] uppercase tracking-[0.28em] text-steel-dim">
          Ingeniería de Software
        </span>
      )}

      <span className="sr-only">Jhoiker Zambrano — Ingeniería de Software &amp; Arquitectura Digital</span>
    </div>
  );
}

/** Isotipo solo, para favicon, avatares y espacios reducidos. */
export function Isotipo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("inline-flex items-center justify-center gap-[0.14em] font-display font-black leading-none", className)}
      style={{ fontSize: size * 0.62 }}
      aria-hidden="true"
    >
      <span className="text-white/90" style={{ fontSize: size * 0.78 }}>[</span>
      <span className="text-white">J</span>
      <span className="text-cyan-energy text-glow-cyan">Z</span>
      <span className="text-white/90" style={{ fontSize: size * 0.78 }}>]</span>
    </span>
  );
}

/** Versión horizontal del logo para navbar y cabeceras. */
export function LogoHorizontal({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3.5", className)}>
      <Isotipo size={compact ? 24 : 29} />
      {!compact && (
        <span className="hidden flex-col justify-center gap-[3px] sm:flex">
          <span className="font-display text-[12px] font-black leading-none tracking-[0.12em] text-white">
            JHOIKER
          </span>
          <span className="font-display text-[12px] font-black leading-none tracking-[0.12em] text-cyan-energy">
            ZAMBRANO
          </span>
        </span>
      )}
      <span className="sr-only">Jhoiker Zambrano</span>
    </span>
  );
}
