import { TECH_MARQUEE } from "@/lib/content";

/** Cinta infinita de tecnologías, puntuada con el isotipo de la marca. */
export function TechMarquee() {
  const items = [...TECH_MARQUEE, ...TECH_MARQUEE];

  return (
    <section className="relative border-y border-white/[0.07] bg-white/[0.012] py-6" aria-label="Tecnologías">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-obsidian to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-obsidian to-transparent" />

      <div className="flex w-max motion-safe:animate-[marquee_38s_linear_infinite]">
        {items.map((tech, i) => (
          <span key={`${tech}-${i}`} className="flex items-center whitespace-nowrap">
            <span className="px-5 font-mono text-[0.8rem] uppercase tracking-[0.18em] text-steel-dim transition-colors hover:text-cyan-energy">
              {tech}
            </span>
            <span className="font-display text-[0.7rem] font-black text-cyan-energy/35">[JZ]</span>
          </span>
        ))}
      </div>
    </section>
  );
}
