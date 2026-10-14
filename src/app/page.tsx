import Link from "next/link";
import { ArrowUpRight, ArrowRight, Sparkles, Zap, ShieldCheck, Gauge, Layers, GitBranch } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading, Card, Badge, CodeBlock, Stat } from "@/components/ui/Primitives";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { AutomationFlow } from "@/components/sections/AutomationFlow";
import { SkillMatrix } from "@/components/sections/SkillMatrix";
import { TechMarquee } from "@/components/sections/TechMarquee";
import { CtaBand } from "@/components/sections/CtaBand";
import { BRAND } from "@/lib/brand";
import { getFeaturedProjects, getServices, getSkillGroups, getAutomations } from "@/lib/data";

export default async function HomePage() {
  const [projects, services, skillGroups, automations] = await Promise.all([
    getFeaturedProjects(3),
    getServices(),
    getSkillGroups(),
    getAutomations(),
  ]);

  const activeAutomations = automations.filter((a) => a.status === "activa");
  const savedHours = activeAutomations.reduce((acc, a) => acc + (a.saved_hours_month ?? 0), 0);
  const totalRuns = automations.reduce((acc, a) => acc + a.runs_count, 0);

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="brand-container">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Columna de texto */}
            <div>
              <Reveal>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="tag-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-energy shadow-[0_0_8px_rgba(56,189,248,0.95)]" />
                    Disponible para nuevos proyectos
                  </span>
                  <span className="font-mono text-[0.68rem] text-steel-faint">
                    Manual v3.0 · Octubre 2026
                  </span>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="mt-7 font-display text-[2.6rem] font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-[4.2rem]">
                  <span className="block text-white">JHOIKER</span>
                  <span className="block text-cyan-energy text-glow-cyan">ZAMBRANO</span>
                </h1>
              </Reveal>

              <Reveal delay={140}>
                <p className="mt-6 font-sans text-lg font-light tracking-wide text-chrome sm:text-xl">
                  Ingeniería de Software &amp; Arquitectura Digital
                </p>
              </Reveal>

              <Reveal delay={200}>
                <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-steel">
                  Construyo software que resuelve problemas reales y automatizo lo que no debería
                  consumir tu tiempo. Arquitectura limpia, decisiones técnicas defendibles y una
                  obsesión sana por el detalle.
                </p>
              </Reveal>

              <Reveal delay={260}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link href="/proyectos" className="btn-cyan">
                    Ver proyectos
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/contacto" className="btn-ghost">
                    Iniciar un proyecto
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={320}>
                <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/[0.07] pt-8 sm:grid-cols-4">
                  <Stat value={projects.length > 3 ? "15" : "6"} suffix="+" label="Proyectos" />
                  <Stat value={savedHours || 40} suffix="h" label="Ahorradas / mes" />
                  <Stat value="98" suffix="%" label="Éxito en flujos" />
                  <Stat value="5" suffix=" años" label="Construyendo" />
                </div>
              </Reveal>
            </div>

            {/* Columna visual: isotipo protagonista */}
            <Reveal delay={180} className="relative">
              <div className="relative flex items-center justify-center">
                {/* Halo */}
                <div className="absolute h-72 w-72 rounded-full bg-cyan-energy/12 blur-[90px] motion-safe:animate-[pulseGlow_3.2s_ease-in-out_infinite]" />

                {/* Marco técnico */}
                <div className="surface-card relative w-full max-w-md rounded-2xl p-8 sm:p-10">
                  {/* Esquinas */}
                  {[
                    "left-0 top-0 border-l-2 border-t-2 rounded-tl-2xl",
                    "right-0 top-0 border-r-2 border-t-2 rounded-tr-2xl",
                    "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-2xl",
                    "right-0 bottom-0 border-r-2 border-b-2 rounded-br-2xl",
                  ].map((pos) => (
                    <span
                      key={pos}
                      className={`pointer-events-none absolute h-6 w-6 border-cyan-energy/70 ${pos}`}
                      aria-hidden="true"
                    />
                  ))}

                  <div className="flex justify-center">
                    <Logo size="xl" showWordmark showRole animate />
                  </div>

                  <div className="mt-9 border-t border-white/[0.07] pt-6">
                    <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-steel-faint">
                      Identidad cromática oficial
                    </p>
                    <div className="mt-3 flex gap-2">
                      {[
                        { hex: "#0A0D14", label: "Obsidian" },
                        { hex: "#38BDF8", label: "Cyan" },
                        { hex: "#818CF8", label: "Indigo" },
                        { hex: "#1E293B", label: "Slate" },
                      ].map((c) => (
                        <div key={c.hex} className="group flex-1">
                          <div
                            className="h-9 w-full rounded-md border border-white/10 transition-transform duration-300 group-hover:scale-105"
                            style={{ backgroundColor: c.hex }}
                            title={`${c.label} ${c.hex}`}
                          />
                          <p className="mt-1.5 text-center font-mono text-[0.55rem] text-steel-faint">
                            {c.hex}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-7 border-t border-white/[0.07] pt-6">
                    <CodeBlock
                      title="brand.ts"
                      code={`const brand = {
  owner: "Jhoiker Zambrano",
  role: "Ingeniería de Software",
  accent: "#38BDF8",
  standard: "excelencia impecable",
};`}
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ======================= MARQUEE DE TECNOLOGÍAS ======================= */}
      <TechMarquee />

      {/* =========================== SERVICIOS =========================== */}
      <section className="relative py-20 sm:py-28">
        <div className="brand-container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Servicios"
              index="01 / 06"
              title="Lo que puedo"
              highlight="construir para ti"
              description="Desde una landing que convierte hasta la arquitectura completa de tu producto. Cada servicio con alcance claro, entregables concretos y precio desde."
            />
            <Reveal delay={120}>
              <Link
                href="/servicios"
                className="group inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-cyan-energy"
              >
                Ver todos
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={i * 90}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== PROYECTOS =========================== */}
      <section className="relative py-20 sm:py-28">
        <div className="brand-container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Portafolio"
              index="02 / 06"
              title="El trabajo"
              highlight="habla por sí mismo"
              description="Sistemas en producción, automatizaciones corriendo todos los días y arquitecturas pensadas para no reescribirse en dos años."
            />
            <Reveal delay={120}>
              <Link
                href="/proyectos"
                className="group inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-cyan-energy"
              >
                Ver portafolio
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={i * 90}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== AUTOMATIZACIONES ======================== */}
      <section className="relative py-20 sm:py-28">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Automatización"
            index="03 / 06"
            title="El sistema trabaja"
            highlight="mientras tú decides"
            description="Flujos supervisados que eliminan el trabajo repetitivo, con monitoreo, reintentos y alertas. Nunca fallan en silencio."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {activeAutomations.slice(0, 2).map((automation, i) => (
              <Reveal key={automation.id} delay={i * 110}>
                <AutomationFlow automation={automation} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Zap, label: "Ejecuciones registradas", value: totalRuns.toLocaleString("es-CO") },
                { icon: Gauge, label: "Tasa de éxito media", value: "98,6%" },
                { icon: ShieldCheck, label: "Flujos con monitoreo", value: "100%" },
              ].map((item) => (
                <Card key={item.label} className="flex items-center gap-4 p-5" accent>
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-energy/25 bg-cyan-energy/10">
                    <item.icon className="h-5 w-5 text-cyan-energy" />
                  </span>
                  <span>
                    <span className="block font-display text-xl font-black text-white">
                      {item.value}
                    </span>
                    <span className="block font-mono text-[0.64rem] uppercase tracking-[0.14em] text-steel-dim">
                      {item.label}
                    </span>
                  </span>
                </Card>
              ))}
            </div>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-6 text-center">
              <Link
                href="/automatizaciones"
                className="group inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-cyan-energy"
              >
                Ver todas las automatizaciones
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================== STACK =========================== */}
      <section className="relative py-20 sm:py-28">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Stack técnico"
            index="04 / 06"
            title="Herramientas que"
            highlight="domino de verdad"
            description="No listo tecnologías que vi una vez. Esto es lo que uso a diario para llevar productos a producción."
          />
          <div className="mt-14">
            <SkillMatrix groups={skillGroups} />
          </div>
        </div>
      </section>

      {/* ========================== PRINCIPIOS ========================== */}
      <section className="relative py-20 sm:py-28">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Principios"
            index="05 / 06"
            title="Cómo"
            highlight="trabajo"
            description="Cuatro reglas que aplican a todo proyecto, sin importar el tamaño ni el presupuesto."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Gauge,
                title: "Rendimiento primero",
                text: "Si tarda, no sirve. Cada decisión se mide contra la experiencia real del usuario en su dispositivo real.",
              },
              {
                icon: Layers,
                title: "Arquitectura limpia",
                text: "Código tipado, responsabilidades separadas y decisiones documentadas para que el próximo cambio no duela.",
              },
              {
                icon: GitBranch,
                title: "Entrega continua",
                text: "Avances visibles cada semana. Nada de misterio: ves el progreso y participas en las decisiones.",
              },
              {
                icon: ShieldCheck,
                title: "Excelencia impecable",
                text: "El estándar es que funcione, esté bien y se pueda mantener. Sin atajos que se cobren después.",
              },
            ].map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <Card className="h-full p-6" interactive>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                    <p.icon className="h-5.5 w-5.5 text-cyan-energy" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-bold text-white">{p.title}</h3>
                  <p className="mt-3 text-[0.86rem] leading-relaxed text-steel">{p.text}</p>
                  <div className="mt-5">
                    <Badge tone="muted">{String(i + 1).padStart(2, "0")}</Badge>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== MANIFIESTO =========================== */}
      <section className="relative py-20 sm:py-28">
        <div className="brand-container">
          <Reveal>
            <div className="surface-card relative overflow-hidden rounded-2xl p-8 sm:p-14">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-automation/10 blur-[80px]" />
              <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-energy/10 blur-[80px]" />

              <div className="relative">
                <Sparkles className="h-6 w-6 text-cyan-energy" />
                <p className="mt-6 max-w-3xl font-sans text-lg font-light italic leading-relaxed text-white-soft sm:text-2xl">
                  «{BRAND.claim}»
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <div className="h-10 w-px bg-gradient-to-b from-cyan-energy to-transparent" />
                  <div>
                    <p className="font-display text-sm font-bold tracking-[0.14em] text-white">
                      JHOIKER ZAMBRANO
                    </p>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-steel-dim">
                      {BRAND.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <CtaBand />
    </>
  );
}
