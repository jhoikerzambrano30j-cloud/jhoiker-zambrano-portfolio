import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Code2, Compass, Rocket, Heart, GraduationCap, MapPin, Coffee } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { SectionHeading, Card, Badge, Stat } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { Logo } from "@/components/brand/Logo";
import { SkillMatrix } from "@/components/sections/SkillMatrix";
import { CtaBand } from "@/components/sections/CtaBand";
import { getSkillGroups } from "@/lib/data";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Jhoiker Zambrano — Ingeniero de software y arquitecto digital. Historia, principios de trabajo, stack técnico y forma de colaborar.",
};

export const revalidate = 300;

const TIMELINE = [
  {
    year: "2021",
    title: "Los primeros sistemas",
    text: "Empecé resolviendo problemas concretos de operación: planillas que nadie quería llenar, reportes que se armaban a mano. Descubrí que la mayoría del trabajo repetitivo se puede eliminar, y que eso cambia la vida de quien lo hacía.",
  },
  {
    year: "2022",
    title: "De scripts a productos",
    text: "Pasé de resolver tareas sueltas a construir aplicaciones completas. Aprendí a modelar datos antes de escribir interfaz, y a diseñar pensando en quien va a usar el sistema de pie, con prisa y sin manual.",
  },
  {
    year: "2023",
    title: "Arquitectura y escala",
    text: "Proyectos más grandes, equipos más grandes, errores más caros. Adopté tipado estricto, pruebas, despliegue continuo y documentación. La disciplina dejó de ser opcional.",
  },
  {
    year: "2024",
    title: "Fundamentos de diseño gráfico",
    text: "Estudié en serio lo que antes hacía por intuición: jerarquía, retícula, escala tipográfica, teoría del color y contraste accesible. Convertí esas decisiones en tokens y componentes reutilizables.",
  },
  {
    year: "2025",
    title: "Plataformas completas",
    text: "Llegaron los sistemas de gestión hotelera, los portales inmobiliarios, los paneles de datos y los e-commerce. El patrón se repitió: entender el negocio, diseñar la jerarquía y construir sobre datos sólidos.",
  },
  {
    year: "2026",
    title: "Infraestructura propia y de clientes",
    text: "Asumí la parte que nadie ve: servidores Linux, despliegue continuo, certificados, respaldos con restauración probada y monitoreo con alertas. Una web bonita que se cae no sirve; ahora también me hago cargo de que no se caiga.",
  },
];

const VALUES = [
  {
    icon: Compass,
    title: "Claridad antes que código",
    text: "No empiezo a construir hasta entender el problema, los usuarios y el criterio con el que se va a evaluar el resultado. Un mal entendimiento cuesta más que una mala línea de código.",
  },
  {
    icon: Code2,
    title: "Código que se pueda mantener",
    text: "Tipado, nombres honestos, responsabilidades separadas y decisiones documentadas. Escribo pensando en quien va a leer esto en dos años, que probablemente sea yo.",
  },
  {
    icon: Rocket,
    title: "Entrega visible y frecuente",
    text: "Nada de tres meses de silencio y una entrega final. Cada semana hay algo funcionando que puedes ver, usar y cuestionar. Los malentendidos se corrigen barato y temprano.",
  },
  {
    icon: Heart,
    title: "Honestidad técnica",
    text: "Si algo no se puede hacer en el tiempo o el presupuesto, lo digo antes de empezar. Si una tecnología no es la adecuada, lo argumento. Prefiero incomodar a fallar.",
  },
];

export default async function SobreMiPage() {
  const skillGroups = await getSkillGroups();

  return (
    <>
      <PageHeader
        eyebrow="Sobre mí"
        title="Construyo software"
        highlight="que resuelve de verdad"
        description={BRAND.claim}
        breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Sobre mí" }]}
      />

      {/* Presentación */}
      <section className="pb-16">
        <div className="brand-container">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <Reveal>
              <Card className="p-8" accent>
                <div className="flex justify-center">
                  <Logo size="lg" showWordmark showRole animate />
                </div>

                <div className="mt-8 space-y-4 border-t border-white/[0.07] pt-6">
                  {[
                    { icon: MapPin, label: "Ubicación", value: "Colombia · Trabajo remoto" },
                    { icon: GraduationCap, label: "Enfoque", value: "Ingeniería de Software & Arquitectura Digital" },
                    { icon: Coffee, label: "Disponibilidad", value: "Abierto a nuevos proyectos" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3">
                      <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-energy/70" />
                      <div>
                        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel-faint">
                          {row.label}
                        </p>
                        <p className="mt-0.5 text-[0.86rem] text-chrome">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-2 border-t border-white/[0.07] pt-6">
                  <Badge tone="cyan">Diseño y desarrollo web</Badge>
                  <Badge tone="indigo">Infraestructura</Badge>
                  <Badge tone="muted">Design systems</Badge>
                </div>

                <Link href="/contacto" className="btn-cyan mt-6 w-full">
                  Trabajemos juntos
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Card>
            </Reveal>

            <div className="space-y-6">
              <Reveal delay={80}>
                <h2 className="section-title text-2xl sm:text-3xl">
                  <span className="text-white">Hola, soy</span>{" "}
                  <span className="text-cyan-energy">Jhoiker Zambrano</span>
                </h2>
                <div className="hairline mt-5 w-24" />
              </Reveal>

              {[
                "Soy desarrollador web y diseñador de interfaces. Mi trabajo consiste en construir páginas y aplicaciones que se entiendan a la primera, y en administrar la infraestructura que las mantiene en línea.",
                "Empecé resolviendo problemas pequeños y concretos: una planilla que nadie quería llenar, un reporte que se armaba a mano cada semana. Con el tiempo entendí que la diferencia entre una buena y una mala solución casi nunca está en la cantidad de funciones, sino en el orden: cómo se jerarquiza la información y cómo se modelan los datos por debajo.",
                "Por eso el diseño gráfico no es un adorno en lo que hago. Jerarquía, retícula, escala tipográfica, contraste y color son reglas que aplico con el mismo rigor que el tipado estricto. Y como una página bonita que se cae no sirve, también me encargo de los servidores: despliegue continuo, certificados, respaldos con restauración probada y monitoreo con alertas.",
                "Me tomo en serio el estándar: si algo se entrega, se entrega bien y sigue funcionando después. Esa es la promesa de mi marca y la razón por la que mis clientes vuelven.",
              ].map((p, i) => (
                <Reveal key={i} delay={120 + i * 60}>
                  <p className="text-[0.95rem] leading-[1.85] text-steel">{p}</p>
                </Reveal>
              ))}

              <Reveal delay={380}>
                <div className="grid grid-cols-3 gap-6 border-t border-white/[0.07] pt-8">
                  <Stat value="5" suffix=" años" label="Construyendo" />
                  <Stat value="6" suffix="+" label="Proyectos" />
                  <Stat value="40" suffix=" h" label="Ahorradas / mes" />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Trayectoria */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Trayectoria"
            index="01 / 03"
            title="Cómo llegué"
            highlight="hasta aquí"
            description="Seis años de aprendizaje acumulado, cada uno con una lección técnica que sigo aplicando."
          />

          <div className="mt-14 relative">
            {/* Línea vertical */}
            <span
              className="absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-cyan-energy/50 via-indigo-automation/25 to-transparent sm:block"
              aria-hidden="true"
            />

            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <Reveal key={item.year} delay={i * 70}>
                  <div className="flex gap-6">
                    <span className="relative z-10 mt-1.5 hidden h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-cyan-energy/60 bg-obsidian sm:flex">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-energy shadow-[0_0_8px_rgba(56,189,248,0.95)]" />
                    </span>
                    <div className="surface-card flex-1 rounded-xl p-6 transition-colors hover:border-cyan-energy/25">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="font-display text-lg font-black text-cyan-energy">
                          {item.year}
                        </span>
                        <h3 className="font-display text-[0.95rem] font-bold text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-[0.88rem] leading-relaxed text-steel">{item.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Principios"
            index="02 / 03"
            title="Cómo"
            highlight="trabajo"
            description="Cuatro reglas que aplican a cualquier proyecto, sin importar el tamaño."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <Card className="h-full p-6" interactive accent>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                    <v.icon className="h-5 w-5 text-cyan-energy" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-bold text-white">{v.title}</h3>
                  <p className="mt-3 text-[0.86rem] leading-relaxed text-steel">{v.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Stack"
            index="03 / 03"
            title="Con qué"
            highlight="trabajo a diario"
            description="Herramientas que uso en producción, con el nivel de dominio que realmente tengo en cada una."
          />
          <div className="mt-12">
            <SkillMatrix groups={skillGroups} />
          </div>
        </div>
      </section>

      <CtaBand
        title="¿Te suena"
        highlight="mi forma de trabajar?"
        description="Si buscas a alguien que entienda el problema antes de escribir código y entregue con estándar, hablemos."
      />
    </>
  );
}
