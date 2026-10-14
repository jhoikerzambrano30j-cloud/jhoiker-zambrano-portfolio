import type { Metadata } from "next";
import { Mail, MessageCircle, Github, Linkedin, Clock, MapPin, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { ContactForm } from "@/components/sections/ContactForm";
import { Card, Badge } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { Faq } from "@/components/sections/Faq";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Cuéntame tu proyecto. Respondo en menos de 24 horas hábiles con una propuesta clara de alcance, tiempos y precio.",
};

const CONTACT_FAQ = [
  {
    q: "¿Cuánto tarda la primera respuesta?",
    a: "Menos de 24 horas hábiles. Si el caso es urgente, indícalo en el mensaje y lo priorizo.",
  },
  {
    q: "¿La primera llamada tiene costo?",
    a: "No. Son 30 minutos de descubrimiento sin costo ni compromiso. El objetivo es entender el problema y decirte con honestidad si puedo ayudarte.",
  },
  {
    q: "¿Trabajas con clientes fuera de Colombia?",
    a: "Sí, trabajo de forma remota con clientes de cualquier país hispanohablante. La comunicación se adapta a tu zona horaria.",
  },
  {
    q: "¿Qué pasa si mi proyecto no encaja contigo?",
    a: "Te lo digo directamente y, cuando puedo, te refiero a alguien que sí encaje. Prefiero eso a aceptar un proyecto que no voy a poder entregar bien.",
  },
];

export default function ContactoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title="Hablemos de"
        highlight="tu proyecto"
        description="Cuéntame qué necesitas. Te respondo con una propuesta clara: alcance, tiempos y precio. Sin compromiso y sin letra menuda."
        breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Contacto" }]}
      >
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Badge tone="success">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
            Disponible para nuevos proyectos
          </Badge>
          <Badge tone="cyan">Respuesta &lt; 24 h hábiles</Badge>
        </div>
      </PageHeader>

      <section className="pb-16">
        <div className="brand-container">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
            {/* Formulario */}
            <Reveal>
              <Card className="p-6 sm:p-8" accent>
                <h2 className="font-display text-xl font-black text-white">
                  Formulario de <span className="text-cyan-energy">contacto</span>
                </h2>
                <div className="hairline mt-4 w-20" />
                <p className="mt-5 text-[0.88rem] leading-relaxed text-steel">
                  Los campos marcados con * son obligatorios. Entre más contexto me des, más precisa
                  será mi respuesta.
                </p>
                <div className="mt-7">
                  <ContactForm />
                </div>
              </Card>
            </Reveal>

            {/* Datos de contacto */}
            <div className="space-y-6">
              <Reveal delay={80}>
                <Card className="p-6">
                  <h3 className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                    Canales directos
                  </h3>
                  <div className="mt-5 space-y-4">
                    <a
                      href="mailto:contacto@jhoikerzambrano.com"
                      className="flex items-center gap-3.5 rounded-lg border border-white/[0.07] p-3.5 transition-colors hover:border-cyan-energy/40 hover:bg-cyan-energy/[0.04]"
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                        <Mail className="h-4.5 w-4.5 text-cyan-energy" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                          Correo
                        </span>
                        <span className="block truncate text-[0.85rem] text-chrome">
                          contacto@jhoikerzambrano.com
                        </span>
                      </span>
                    </a>

                    <a
                      href="https://wa.me/57"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3.5 rounded-lg border border-white/[0.07] p-3.5 transition-colors hover:border-cyan-energy/40 hover:bg-cyan-energy/[0.04]"
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                        <MessageCircle className="h-4.5 w-4.5 text-cyan-energy" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                          WhatsApp
                        </span>
                        <span className="block text-[0.85rem] text-chrome">
                          Mensaje directo
                        </span>
                      </span>
                    </a>

                    <a
                      href="https://github.com/jhoikerzambrano"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3.5 rounded-lg border border-white/[0.07] p-3.5 transition-colors hover:border-cyan-energy/40 hover:bg-cyan-energy/[0.04]"
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                        <Github className="h-4.5 w-4.5 text-chrome" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                          GitHub
                        </span>
                        <span className="block truncate text-[0.85rem] text-chrome">
                          @jhoikerzambrano
                        </span>
                      </span>
                    </a>

                    <a
                      href="https://www.linkedin.com/in/jhoikerzambrano"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3.5 rounded-lg border border-white/[0.07] p-3.5 transition-colors hover:border-cyan-energy/40 hover:bg-cyan-energy/[0.04]"
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                        <Linkedin className="h-4.5 w-4.5 text-chrome" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                          LinkedIn
                        </span>
                        <span className="block truncate text-[0.85rem] text-chrome">
                          Jhoiker Zambrano
                        </span>
                      </span>
                    </a>
                  </div>
                </Card>
              </Reveal>

              <Reveal delay={140}>
                <Card className="p-6">
                  <h3 className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                    Detalles prácticos
                  </h3>
                  <div className="mt-5 space-y-4">
                    {[
                      { icon: Clock, label: "Tiempo de respuesta", value: "Menos de 24 h hábiles" },
                      { icon: MapPin, label: "Ubicación", value: "Colombia · Trabajo remoto" },
                      { icon: ShieldCheck, label: "Confidencialidad", value: "NDA disponible a solicitud" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-start gap-3">
                        <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-energy/70" />
                        <div>
                          <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                            {row.label}
                          </p>
                          <p className="mt-0.5 text-[0.85rem] text-chrome">{row.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Reveal>

              <Reveal delay={200}>
                <Card className="card-accent p-6">
                  <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-cyan-energy">
                    Qué incluye mi propuesta
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {[
                      "Alcance cerrado y exclusiones explícitas",
                      "Cronograma por fases con hitos",
                      "Plan de pagos por entregables",
                      "Contrato con garantía y propiedad intelectual",
                      "Precio final sin sorpresas",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[0.84rem] leading-snug text-chrome">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-energy" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-16">
        <div className="brand-container">
          <Reveal>
            <h2 className="section-title text-2xl sm:text-3xl">
              <span className="text-white">Antes de</span>{" "}
              <span className="text-cyan-energy">escribirme</span>
            </h2>
            <div className="hairline mt-5 w-24" />
          </Reveal>
          <div className="mx-auto mt-10 max-w-3xl">
            <Faq items={CONTACT_FAQ} />
          </div>
        </div>
      </section>
    </>
  );
}
