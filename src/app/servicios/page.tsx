import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading, Card, Badge } from "@/components/ui/Primitives";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { Faq } from "@/components/sections/Faq";
import { CtaBand } from "@/components/sections/CtaBand";
import { getServices } from "@/lib/data";
import { formatCOP } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Desarrollo web a medida, automatización de procesos, arquitectura digital y consultoría técnica. Alcance claro, entregables concretos y precio desde.",
};

export const revalidate = 300;

const FAQ_ITEMS = [
  {
    q: "¿Cómo se define el precio final de un proyecto?",
    a: "El precio «desde» cubre el alcance base descrito en cada servicio. Después de una llamada de descubrimiento de 30 minutos preparo una propuesta con alcance cerrado, entregables, cronograma y valor final. Nunca hay costos sorpresa: si algo cambia, se firma una orden de cambio antes de ejecutarlo.",
  },
  {
    q: "¿Trabajas con contrato?",
    a: "Siempre. Antes de empezar firmamos un contrato que define objeto, alcance, exclusiones, cronograma, forma de pago, propiedad intelectual, confidencialidad, garantía y manejo de cambios. Puedes ver el contrato completo y negociarlo cláusula por cláusula desde el módulo de contratos de este sitio.",
  },
  {
    q: "¿Qué necesitas de mi parte para empezar?",
    a: "Tres cosas: un responsable con capacidad de decisión, acceso a la información del negocio (procesos, datos, identidad de marca si existe) y disposición a revisar avances cada semana. Con eso, el proyecto avanza solo.",
  },
  {
    q: "¿Cómo son los pagos?",
    a: "Se dividen por hitos verificables, normalmente 40% de anticipo, 20% al aprobar el diseño, 20% en staging y 20% contra entrega final. El plan exacto queda escrito en el contrato y se ajusta al tamaño del proyecto.",
  },
  {
    q: "¿Qué pasa después de la entrega?",
    a: "Cada servicio incluye un periodo de garantía sobre defectos (90 días en desarrollo web, 60 en automatización, 120 en consultoría). Pasado ese periodo puedes contratar el servicio de mantenimiento y evolución mensual.",
  },
  {
    q: "¿El código queda a mi nombre?",
    a: "Sí. Al liquidar el pago final se cede la totalidad de los derechos patrimoniales del software desarrollado. El repositorio, la base de datos y los accesos quedan en tus cuentas, no en las mías.",
  },
  {
    q: "¿Puedo pedir solo una parte de un servicio?",
    a: "Es posible, pero prefiero no fragmentar. Los alcances parciales suelen producir sistemas a medias que después cuestan más que hacerlo bien desde el principio. Si el presupuesto es el límite, ajustamos el alcance completo a la baja en lugar de recortar piezas críticas.",
  },
  {
    q: "¿Cómo manejas los cambios de alcance?",
    a: "Todo cambio se documenta: qué se pide, qué implica en tiempo y en costo, y qué se sacrifica si no se amplía el presupuesto. Se aprueba por escrito antes de tocar una línea de código.",
  },
];

export default async function ServiciosPage() {
  const services = await getServices();
  const cheapest = services.reduce<number | null>(
    (min, s) => (s.price_from !== null && (min === null || s.price_from < min) ? s.price_from : min),
    null,
  );

  return (
    <>
      <PageHeader
        eyebrow="Servicios"
        title="Alcance claro,"
        highlight="entregables concretos"
        description="Cada servicio está definido con precisión: qué incluye, qué no incluye, cuánto dura y cuánto cuesta. Si algo no está en la lista, se cotiza aparte antes de empezar."
        breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Servicios" }]}
      >
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Badge tone="cyan">
            Precios desde {cheapest ? formatCOP(cheapest) : "a convenir"}
          </Badge>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-steel-faint">
            {services.length} líneas de servicio · contratos con alcance negociable
          </span>
        </div>
      </PageHeader>

      {/* Servicios */}
      <section className="pb-16">
        <div className="brand-container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={i * 80}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comparativa */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Comparativa"
            index="01 / 03"
            title="¿Cuál"
            highlight="te corresponde?"
            description="Una vista rápida para ubicarte. Si dudas, escríbeme y te digo con franqueza cuál encaja mejor con lo que necesitas."
          />

          <Reveal className="mt-12">
            <div className="surface-card overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[46rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/[0.09] bg-white/[0.02]">
                      <th className="px-5 py-4 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-steel-faint">
                        Servicio
                      </th>
                      <th className="px-5 py-4 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-steel-faint">
                        Nivel
                      </th>
                      <th className="px-5 py-4 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-steel-faint">
                        Duración
                      </th>
                      <th className="px-5 py-4 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-steel-faint">
                        Entregables
                      </th>
                      <th className="px-5 py-4 text-right font-mono text-[0.64rem] uppercase tracking-[0.16em] text-steel-faint">
                        Desde
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-cyan-energy/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <span className="block text-[0.88rem] font-semibold text-white">
                            {s.name}
                          </span>
                          <span className="mt-0.5 block text-[0.76rem] text-steel-dim">
                            {s.tagline}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={s.tier === "enterprise" ? "indigo" : s.tier === "professional" ? "cyan" : "muted"}>
                            {s.tier}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 font-mono text-[0.76rem] text-steel">
                          {s.duration ?? "—"}
                        </td>
                        <td className="px-5 py-4 font-mono text-[0.76rem] text-steel">
                          {s.deliverables.length}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-[0.82rem] font-semibold text-cyan-energy">
                          {s.price_from ? formatCOP(s.price_from) : "A convenir"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Proceso */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Metodología"
            index="02 / 03"
            title="Cómo se ejecuta"
            highlight="un proyecto"
            description="Cinco fases con entregables visibles. Sabes en todo momento en qué punto estamos y qué falta."
          />
          <div className="mt-14">
            <ProcessTimeline />
          </div>
        </div>
      </section>

      {/* Qué incluye siempre */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Incluido siempre"
            index="03 / 03"
            title="Lo que va"
            highlight="en todos los servicios"
            description="Sin importar el tamaño del proyecto, esto viene de serie."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Contrato y alcance firmados",
                text: "Objeto, entregables, exclusiones, cronograma, pagos, propiedad intelectual y garantía por escrito antes de empezar.",
              },
              {
                title: "Repositorio y accesos a tu nombre",
                text: "El código, la base de datos y la infraestructura quedan en tus cuentas. Nada queda amarrado a mí.",
              },
              {
                title: "Despliegue automatizado",
                text: "Integración y despliegue continuos con vista previa por cada cambio. Producción siempre estable.",
              },
              {
                title: "Documentación real",
                text: "Arquitectura, decisiones técnicas y manual de operación. Tu equipo puede continuar sin depender de mí.",
              },
              {
                title: "Comunicación semanal",
                text: "Avance visible cada semana, con demo funcional. Nada de reportes de humo.",
              },
              {
                title: "Garantía post-entrega",
                text: "Corrección sin costo de defectos atribuibles al desarrollo durante el periodo pactado en el contrato.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 70}>
                <Card className="h-full p-6" interactive>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-black text-cyan-energy/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-cyan-energy/40 to-transparent" />
                  </div>
                  <h3 className="mt-4 font-display text-[0.95rem] font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[0.84rem] leading-relaxed text-steel">{item.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Lo que"
            highlight="siempre me preguntan"
            align="center"
          />
          <div className="mx-auto mt-12 max-w-3xl">
            <Faq items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      <CtaBand
        title="¿Empezamos"
        highlight="por una llamada?"
        description="30 minutos, sin costo y sin compromiso. Salimos de ahí con claridad sobre alcance, tiempos y presupuesto."
      />
    </>
  );
}
