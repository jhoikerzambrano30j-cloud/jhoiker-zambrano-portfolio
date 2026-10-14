import type { Metadata } from "next";
import {
  Server,
  GitBranch,
  Globe,
  DatabaseBackup,
  Activity,
  ShieldCheck,
  type LucideIcon,
  Terminal,
  Check,
  Clock,
  AlertTriangle,
  FileText,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { SectionHeading, Card, Badge, Stat, CodeBlock } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { getInfrastructureCapabilities } from "@/lib/data";

export const metadata: Metadata = {
  title: "Infraestructura",
  description:
    "Administración de servidores Linux, despliegue continuo, dominios, DNS, certificados SSL, respaldos verificados, monitoreo con alertas y endurecimiento de seguridad.",
};

const ICONS: Record<string, LucideIcon> = {
  server: Server,
  "git-branch": GitBranch,
  globe: Globe,
  "database-backup": DatabaseBackup,
  activity: Activity,
  "shield-check": ShieldCheck,
};

/** Flujo de una petición, desde el dominio hasta la base de datos. */
const REQUEST_FLOW = [
  { step: "Dominio y DNS", detail: "El registro apunta a la IP del servidor o al proveedor de borde." },
  { step: "CDN y protección", detail: "Cloudflare filtra tráfico malicioso y sirve el contenido estático cerca del usuario." },
  { step: "Proxy inverso", detail: "Nginx recibe la conexión, termina el TLS y decide a qué servicio enviarla." },
  { step: "Aplicación", detail: "El contenedor con la aplicación procesa la petición, aislado del resto del sistema." },
  { step: "Base de datos", detail: "PostgreSQL responde con acceso restringido por red y por rol." },
  { step: "Respuesta y registro", detail: "El resultado vuelve cifrado y cada error queda registrado para revisión." },
];

/** Rutina operativa: lo que se revisa solo, sin depender de la memoria. */
const ROUTINE = [
  { icon: Clock, label: "Cada hora", what: "Verificación de disponibilidad desde varias ubicaciones" },
  { icon: DatabaseBackup, label: "Cada día", what: "Respaldo cifrado de base de datos y archivos, fuera del servidor principal" },
  { icon: Activity, label: "Cada 5 minutos", what: "Métricas de CPU, memoria y disco con umbrales de alerta" },
  { icon: ShieldCheck, label: "Cada semana", what: "Revisión de actualizaciones de seguridad e intentos de acceso fallidos" },
  { icon: Check, label: "Cada mes", what: "Prueba de restauración del respaldo más reciente" },
  { icon: FileText, label: "Cada mes", what: "Informe de disponibilidad y consumo" },
];

export default function InfraestructuraPage() {
  const capabilities = getInfrastructureCapabilities();

  return (
    <>
      <PageHeader
        eyebrow="Servidores e infraestructura"
        title="Que tu web esté en línea"
        highlight="y que lo sepas"
        description="Una página que se cae no sirve, por bonita que sea. Me encargo de la parte que nadie ve: servidores Linux, despliegue continuo, dominios, certificados, respaldos probados, monitoreo con alertas y seguridad endurecida."
        breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Infraestructura" }]}
      />

      {/* Métricas */}
      <section className="pb-14">
        <div className="brand-container">
          <div className="grid grid-cols-2 gap-6 border-y border-white/[0.07] py-8 sm:grid-cols-4">
            <Stat value="99,96" suffix="%" label="Disponibilidad medida" />
            <Stat value="24" suffix="/7" label="Monitoreo activo" />
            <Stat value="0" label="Incidencias sin detectar" />
            <Stat value="Mensual" label="Prueba de restauración" />
          </div>
        </div>
      </section>

      {/* Capacidades */}
      <section className="pb-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Capacidades"
            index="01 / 04"
            title="Todo lo que"
            highlight="incluye el servicio"
            description="Seis áreas de trabajo que cubren el ciclo completo: desde montar el servidor hasta responder a una incidencia a las tres de la mañana."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap, i) => {
              const Icon = ICONS[cap.icon] ?? Server;
              return (
                <Reveal key={cap.id} delay={i * 80}>
                  <Card className="h-full p-6" interactive accent>
                    <div className="flex items-start justify-between">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                        <Icon className="h-5.5 w-5.5 text-cyan-energy" />
                      </span>
                      <span className="font-display text-2xl font-black text-white/10">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-lg font-bold text-white">{cap.name}</h3>
                    <p className="mt-3 text-[0.86rem] leading-relaxed text-steel">{cap.summary}</p>

                    <ul className="mt-5 space-y-2 border-t border-white/[0.07] pt-5">
                      {cap.details.map((d) => (
                        <li key={d} className="flex items-start gap-2.5 text-[0.8rem] leading-snug text-chrome">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-energy" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recorrido de una petición */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Bajo el capó"
            index="02 / 04"
            title="Qué pasa cuando"
            highlight="alguien entra a tu web"
            description="Entender el recorrido completo es lo que permite saber dónde mirar cuando algo falla."
          />

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <Reveal>
              <CodeBlock
                title="recorrido"
                code={`Navegador
   |
   v
[ DNS ]  dominio -> IP
   |
   v
[ Cloudflare ]  filtrado + cache
   |
   v
[ Nginx ]  TLS + proxy inverso
   |
   v
[ Docker ]  aplicacion Node
   |
   v
[ PostgreSQL ]  datos

  Cada paso registra
  y cada fallo avisa.`}
              />
            </Reveal>

            <ol className="space-y-0">
              {REQUEST_FLOW.map((item, i) => {
                const isLast = i === REQUEST_FLOW.length - 1;
                return (
                  <Reveal key={item.step} delay={i * 70}>
                    <li className="relative flex gap-4 pb-5 last:pb-0">
                      {!isLast && (
                        <span
                          className="absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-px bg-gradient-to-b from-cyan-energy/45 to-indigo-automation/15"
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative z-10 mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-energy/35 bg-obsidian font-mono text-[0.62rem] font-semibold text-cyan-energy">
                        {i + 1}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-[0.86rem] font-semibold text-white">{item.step}</p>
                        <p className="mt-0.5 text-[0.8rem] leading-snug text-steel">
                          {item.detail}
                        </p>
                      </div>
                    </li>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Rutina operativa */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Operación"
            index="03 / 04"
            title="Lo que se revisa"
            highlight="sin que nadie lo pida"
            description="La confiabilidad no viene de la suerte: viene de rutinas automáticas que detectan problemas antes que tus usuarios."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ROUTINE.map((item, i) => (
              <Reveal key={`${item.label}-${i}`} delay={i * 70}>
                <Card className="h-full p-6" interactive>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                      <item.icon className="h-5 w-5 text-cyan-energy" />
                    </span>
                    <Badge tone="cyan">{item.label}</Badge>
                  </div>
                  <p className="mt-4 text-[0.86rem] leading-relaxed text-chrome">{item.what}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Qué NO incluye + seguridad */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Transparencia"
            index="04 / 04"
            title="Qué incluye y"
            highlight="qué no"
            description="Prefiero que quede claro desde el principio. Si algo no está en la lista, se cotiza aparte antes de empezar."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <Card className="h-full p-6">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4.5 w-4.5 text-emerald-400" />
                  <h3 className="font-display text-base font-bold text-white">Incluido</h3>
                </div>
                <ul className="mt-5 space-y-3">
                  {[
                    "Servidor Linux configurado y endurecido",
                    "Dominio, DNS y certificados SSL automáticos",
                    "Despliegue continuo desde tu repositorio",
                    "Respaldos cifrados diarios con copia externa",
                    "Monitoreo de disponibilidad, recursos y errores",
                    "Alertas accionables por Telegram o correo",
                    "Runbook de operación y respuesta a incidencias",
                    "Informe mensual de disponibilidad",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-[0.85rem] leading-snug text-chrome">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>

            <Reveal delay={80}>
              <Card className="h-full p-6">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-300" />
                  <h3 className="font-display text-base font-bold text-white">
                    No incluido (se cotiza aparte)
                  </h3>
                </div>
                <ul className="mt-5 space-y-3">
                  {[
                    "El costo del servidor, dominio o servicios de nube",
                    "Desarrollo de funcionalidades nuevas de la aplicación",
                    "Auditoría de seguridad ofensiva o pruebas de penetración",
                    "Soporte de sistemas heredados que no fueron construidos por mí",
                    "Atención en horario nocturno o festivo, salvo emergencia pactada",
                    "Certificaciones o trámites ante entidades regulatorias",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-[0.85rem] leading-snug text-steel">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-cyan-energy/20 bg-cyan-energy/[0.05] p-4">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-cyan-energy" />
                  <p className="text-[0.8rem] leading-relaxed text-chrome">
                    Los accesos y secretos se entregan siempre a tu nombre. Nunca quedan amarrados
                    a mis cuentas.
                  </p>
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Nota sobre automatizaciones */}
      <section className="py-10">
        <div className="brand-container">
          <Reveal>
            <Card className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                <Terminal className="h-5 w-5 text-steel" />
              </span>
              <div>
                <h3 className="font-display text-[0.95rem] font-bold text-white">
                  Sobre las automatizaciones
                </h3>
                <p className="mt-1.5 max-w-2xl text-[0.85rem] leading-relaxed text-steel">
                  Mi foco hoy está en páginas web, diseño gráfico e infraestructura. Las tareas de
                  despliegue, respaldo y monitoreo sí están automatizadas —porque son parte de
                  mantener un servidor sano—, pero no ofrezco servicios de orquestación de flujos de
                  negocio. Si tu proyecto necesita algo de eso, te lo digo con franqueza antes de
                  empezar.
                </p>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="¿Tu servidor está"
        highlight="en buenas manos?"
        description="Cuéntame cómo está montado hoy y te digo qué se puede asegurar, qué falta y cuánto costaría dejarlo sólido."
      />
    </>
  );
}
