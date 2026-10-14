import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Gauge,
  Layers,
  GitBranch,
  Server,
  Palette,
  Type,
  Grid3x3,
  Eye,
  Accessibility,
  Contrast,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading, Card, Badge, CodeBlock, Stat } from "@/components/ui/Primitives";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { SkillMatrix } from "@/components/sections/SkillMatrix";
import { TechMarquee } from "@/components/sections/TechMarquee";
import { CtaBand } from "@/components/sections/CtaBand";
import { BRAND } from "@/lib/brand";
import { getFeaturedProjects, getServices, getSkillGroups } from "@/lib/data";

/** Principios de diseño gráfico aplicados a producto digital. */
const DESIGN_PRINCIPLES = [
  {
    icon: Eye,
    name: "Jerarquía visual",
    text: "Cada pantalla tiene un dato protagonista y el resto lo acompaña. La escala tipográfica, el peso y el espacio deciden qué se lee primero, sin que el usuario tenga que buscar.",
    rule: "Una idea dominante por pantalla",
  },
  {
    icon: Grid3x3,
    name: "Retícula y espaciado",
    text: "Todo el espaciado nace de una retícula de 8 puntos. La alineación constante es lo que hace que una interfaz se sienta ordenada incluso cuando nadie sabe explicar por qué.",
    rule: "Retícula de 8 pt en todo el sistema",
  },
  {
    icon: Type,
    name: "Tipografía con intención",
    text: "Escalas modulares con interlineado derivado del tamaño, medida de línea entre 60 y 75 caracteres, y familias elegidas por su función: display para titulares, texto para leer, monoespaciada para cifras.",
    rule: "Jerarquía antes que decoración",
  },
  {
    icon: Palette,
    name: "Color con propósito",
    text: "El color señala, no adorna. Una paleta corta donde el acento se reserva para la acción y el estado; superficies neutras para que el contenido respire y no compita.",
    rule: "El acento pierde fuerza si se usa en todo",
  },
  {
    icon: Contrast,
    name: "Contraste y legibilidad",
    text: "Contraste verificado contra los estándares AA y AAA, texto nunca por debajo del umbral y estados que se distinguen también en escala de grises, no solo por color.",
    rule: "Legible en el sol y con daltonismo",
  },
  {
    icon: Accessibility,
    name: "Accesibilidad real",
    text: "Navegación por teclado, foco visible, etiquetas semánticas, movimiento reducido cuando el sistema lo pide. Diseñar accesible es diseñar mejor para todos.",
    rule: "Si no se puede usar sin ratón, no está terminado",
  },
];

/** Capacidades de infraestructura, resumidas para la portada. */
const INFRA_HIGHLIGHTS = [
  {
    icon: Server,
    name: "Servidores Linux",
    text: "Aprovisionamiento y administración de Ubuntu Server endurecido, con acceso solo por clave SSH.",
  },
  {
    icon: GitBranch,
    name: "Despliegue continuo",
    text: "Cada cambio se integra y se publica solo, con vista previa y reversión inmediata.",
  },
  {
    icon: ShieldCheck,
    name: "Dominios, DNS y SSL",
    text: "Certificados que se renuevan automáticamente y registros DNS bien configurados.",
  },
  {
    icon: Layers,
    name: "Respaldos y monitoreo",
    text: "Copias cifradas con restauración probada cada mes y alertas antes de que algo falle.",
  },
];

export default async function HomePage() {
  const [projects, services, skillGroups] = await Promise.all([
    getFeaturedProjects(3),
    getServices(),
    getSkillGroups(),
  ]);

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
                  Páginas web, diseño gráfico e infraestructura
                </p>
              </Reveal>

              <Reveal delay={200}>
                <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-steel">
                  Construyo páginas web y aplicaciones que se ven bien y funcionan mejor,
                  aplicando principios de diseño gráfico en serio. Y me encargo de los servidores
                  donde viven, para que estén siempre en línea.
                </p>
              </Reveal>

              <Reveal delay={260}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link href="/proyectos" className="btn-cyan">
                    Ver proyectos
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/infraestructura" className="btn-ghost">
                    Infraestructura
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={320}>
                <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/[0.07] pt-8 sm:grid-cols-4">
                  <Stat value="6" suffix="+" label="Proyectos" />
                  <Stat value="99,9" suffix="%" label="Disponibilidad" />
                  <Stat value="AA" suffix="/AAA" label="Contraste" />
                  <Stat value="5" suffix=" años" label="Construyendo" />
                </div>
              </Reveal>
            </div>

            {/* Columna visual: isotipo protagonista */}
            <Reveal delay={180} className="relative">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-72 w-72 rounded-full bg-cyan-energy/12 blur-[90px] motion-safe:animate-[pulseGlow_3.2s_ease-in-out_infinite]" />

                <div className="surface-card relative w-full max-w-md rounded-2xl p-8 sm:p-10">
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
  focus: ["web", "diseño", "servidores"],
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

      {/* ====================== PRINCIPIOS DE DISEÑO ====================== */}
      <section className="relative py-20 sm:py-28">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Principios de diseño"
            index="01 / 06"
            title="Buen diseño"
            highlight="no es decoración"
            description="Estos seis principios son los que aplico en cada página que construyo. No son preferencias estéticas: son reglas que hacen que una interfaz se entienda, se recuerde y se use sin esfuerzo."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DESIGN_PRINCIPLES.map((p, i) => (
              <Reveal key={p.name} delay={i * 70}>
                <Card className="group h-full p-6" interactive accent>
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                      <p.icon className="h-5.5 w-5.5 text-cyan-energy" />
                    </span>
                    <span className="font-display text-2xl font-black text-white/10">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-base font-bold text-white">{p.name}</h3>
                  <p className="mt-3 text-[0.86rem] leading-relaxed text-steel">{p.text}</p>

                  <div className="mt-5 border-t border-white/[0.07] pt-4">
                    <p className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-cyan-energy/85">
                      {p.rule}
                    </p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== SERVICIOS =========================== */}
      <section className="relative py-20 sm:py-28">
        <div className="brand-container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Servicios"
              index="02 / 06"
              title="Lo que puedo"
              highlight="hacer por ti"
              description="Desde una landing que convierte hasta la infraestructura que la mantiene en línea. Cada servicio con alcance claro, entregables concretos y precio desde."
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
              index="03 / 06"
              title="El trabajo"
              highlight="habla por sí mismo"
              description="Páginas y aplicaciones en producción, cada una con su problema, su solución de diseño y sus resultados medibles."
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

      {/* ======================== INFRAESTRUCTURA ======================== */}
      <section className="relative py-20 sm:py-28">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Infraestructura"
            index="04 / 06"
            title="También me encargo"
            highlight="de los servidores"
            description="Una web bonita que se cae no sirve. Administro la infraestructura donde vive tu aplicación: servidores Linux, despliegue, dominios, SSL, respaldos y monitoreo con alertas."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INFRA_HIGHLIGHTS.map((item, i) => (
              <Reveal key={item.name} delay={i * 80}>
                <Card className="h-full p-6" interactive>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                    <item.icon className="h-5.5 w-5.5 text-cyan-energy" />
                  </span>
                  <h3 className="mt-5 font-display text-[0.95rem] font-bold text-white">
                    {item.name}
                  </h3>
                  <p className="mt-3 text-[0.85rem] leading-relaxed text-steel">{item.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal delay={260}>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Server, label: "Disponibilidad medida", value: "99,96%" },
                { icon: ShieldCheck, label: "Restauración probada", value: "Mensual" },
                { icon: Zap, label: "Incidencias sin detectar", value: "0" },
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

          <Reveal delay={300}>
            <div className="mt-6 text-center">
              <Link
                href="/infraestructura"
                className="group inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-cyan-energy"
              >
                Ver todo lo que incluye
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
            index="05 / 06"
            title="Herramientas que"
            highlight="domino de verdad"
            description="No listo tecnologías que vi una vez. Esto es lo que uso a diario para diseñar, construir y mantener productos en producción."
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
            eyebrow="Cómo trabajo"
            index="06 / 06"
            title="Cuatro reglas"
            highlight="que no negocio"
            description="Aplican a todo proyecto, sin importar el tamaño ni el presupuesto."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Gauge,
                title: "Rendimiento primero",
                text: "Si tarda, no sirve. Cada decisión de diseño y de código se mide contra la experiencia real del usuario en su dispositivo real.",
              },
              {
                icon: Palette,
                title: "Diseño con fundamento",
                text: "Nada de decisiones visuales al azar. Color, tipografía, retícula y jerarquía responden a principios, no a modas pasajeras.",
              },
              {
                icon: Server,
                title: "Infraestructura sólida",
                text: "Respaldos probados, monitoreo activo y despliegue sin caídas. La parte invisible es la que sostiene todo lo demás.",
              },
              {
                icon: ShieldCheck,
                title: "Excelencia impecable",
                text: "El estándar es que funcione, se vea bien y se pueda mantener. Sin atajos que se cobren después.",
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
                      Páginas web · Diseño gráfico · Infraestructura
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
