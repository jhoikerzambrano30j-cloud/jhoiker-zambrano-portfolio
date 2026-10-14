import Image from "next/image";
import { cn } from "@/lib/utils";

const CATEGORY_GLYPH: Record<string, string> = {
  Web: "WWW",
  Infraestructura: "SRV",
  App: "APP",
  IA: "AI",
  "E-commerce": "ECOM",
  Arquitectura: "ARCH",
  Data: "DATA",
};

/**
 * Visual de marca para proyectos.
 * Si el proyecto tiene imagen de portada se usa; si no, se genera un motivo
 * geométrico coherente con la identidad (isotipo + rejilla + categoría).
 */
export function ProjectVisual({
  title,
  category,
  index,
  coverUrl,
  className,
  priority = false,
}: {
  title: string;
  category: string;
  index?: number;
  coverUrl?: string | null;
  className?: string;
  priority?: boolean;
}) {
  if (coverUrl) {
    return (
      <div className={cn("relative aspect-[16/10] w-full overflow-hidden bg-obsidian-800", className)}>
        <Image
          src={coverUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/25 to-transparent" />
      </div>
    );
  }

  const glyph = CATEGORY_GLYPH[category] ?? category.slice(0, 4).toUpperCase();

  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden border-b border-white/[0.07] bg-obsidian-800",
        className,
      )}
      aria-hidden="true"
    >
      {/* Rejilla técnica */}
      <div className="absolute inset-0 dot-backdrop opacity-60" />

      {/* Halos */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-energy/12 blur-[50px] transition-all duration-500 group-hover:bg-cyan-energy/20" />
      <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-indigo-automation/10 blur-[50px] transition-all duration-500 group-hover:bg-indigo-automation/18" />

      {/* Marcas de esquina */}
      <span className="absolute left-4 top-4 h-4 w-4 border-l border-t border-cyan-energy/50" />
      <span className="absolute right-4 top-4 h-4 w-4 border-r border-t border-cyan-energy/50" />
      <span className="absolute bottom-4 left-4 h-4 w-4 border-b border-l border-cyan-energy/50" />
      <span className="absolute bottom-4 right-4 h-4 w-4 border-b border-r border-cyan-energy/50" />

      {/* Isotipo central grande y translúcido */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-[3.5rem] font-black leading-none tracking-tight text-white/[0.07] transition-all duration-500 group-hover:text-white/[0.12] sm:text-[4.5rem]">
          [ J<span className="text-cyan-energy/20 group-hover:text-cyan-energy/35">Z</span> ]
        </span>
      </div>

      {/* Categoría y consecutivo */}
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-cyan-energy/85">
          {glyph}
        </span>
        {typeof index === "number" && (
          <span className="font-display text-[1.6rem] font-black leading-none text-white/12">
            {String(index).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Barra de acento inferior */}
      <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-energy/70 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
