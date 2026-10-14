import type { Metadata } from "next";
import { Zap, Clock, Activity, ShieldCheck, Brain, GitBranch, Layers } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { SectionHeading, Card, Stat } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { AutomationFlow } from "@/components/sections/AutomationFlow";
import { CtaBand } from "@/components/sections/CtaBand";
import { getAutomations } from "@/lib/data";

export const metadata: Metadata = {
  title: "Automatizaciones",
  description:
    "Flujos automatizados con n8n, Supabase y APIs: captura de leads, sincronización de datos, reportes y onboarding sin intervención manual.",
};

export const revalidate = 300;

const LEVELS = [
  {
    icon: ShieldCheck,
    level: "Supervisado",
    tone: "indigo" as const,
    text: "El flujo prepara todo y se detiene para que una persona apruebe antes de ejecutar la acción irreversible. Ideal para decisiones con impacto externo.",
  },
  {
    icon: Brain,
    level: "Semiautónomo",
    tone: "cyan" as const,
    text: "El flujo decide por reglas y puntuaciones, pero escala a revisión humana cuando el caso sale del patrón esperado o la confianza baja del umbral.",
  },
  {
    icon: Zap,
    level: "Autónomo",
    tone: "success" as const,
    text: "Corre de extremo a extremo sin intervención, con registro completo, reintentos y alertas inmediatas si algo se desvía. Para tareas deterministas.",
  },
];

export default async function AutomatizacionesPage() {
  const automations = await getAutomations();
  const active = automations.filter((a) => a.status === "activa");
  const totalRuns = automations.reduce((acc, a) => acc + a.runs_count, 0);
  const savedHours = active.reduce((acc, a) => acc + (a.saved_hours_month ?? 0), 0);
  const avgSuccess =
    automations.filter((a) => a.success_rate !== null).reduce((acc, a) => acc + (a.success_rate ?? 0), 0) /
    Math.max(automations.filter((a) => a.success_rate !== null).length, 1);

  return (
    <>
      <PageHeader
        eyebrow="Automatización"
        title="Que el sistema trabaje"
        highlight="mientras tú decides"
        description="Diseño flujos que eliminan el trabajo repetitivo sin volverse cajas negras. Cada ejecución queda registrada, cada error genera alerta y cada automatización se puede pausar o auditar."
        breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Automatizaciones" }]}
      />

      {/* Métricas */}
      <section className="pb-14">
        <div className="brand-container">
          <div className="grid grid-cols-2 gap-6 border-y border-white/[0.07] py-8 sm:grid-cols-4">
            <Stat value={active.length} label="Flujos activos" />
            <Stat value={totalRuns.toLocaleString("es-CO")} label="Ejecuciones registradas" />
            <Stat value={Math.round(avgSuccess)} suffix="%" label="Éxito promedio" />
            <Stat value={savedHours} suffix=" h" label="Ahorradas al mes" />
          </div>
        </div>
      </section>

      {/* Flujos */}
      <section className="pb-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Flujos en producción"
            index="01 / 03"
            title="Automatizaciones"
            highlight="que ya están corriendo"
            description="Cada flujo con su disparador, sus pasos y las métricas reales de operación."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {automations.map((automation, i) => (
              <Reveal key={automation.id} delay={i * 90}>
                <AutomationFlow automation={automation} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Niveles de autonomía */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Niveles de autonomía"
            index="02 / 03"
            title="Cuánta libertad"
            highlight="le das al sistema"
            description="No toda tarea debe correr sola. Estos son los tres niveles que uso y cuándo aplica cada uno."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {LEVELS.map((lvl, i) => (
              <Reveal key={lvl.level} delay={i * 90}>
                <Card className="h-full p-6" interactive accent>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                      <lvl.icon className="h-5.5 w-5.5 text-cyan-energy" />
                    </span>
                    <span className="font-display text-2xl font-black text-white/10">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-white">{lvl.level}</h3>
                  <p className="mt-3 text-[0.86rem] leading-relaxed text-steel">{lvl.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo se construye */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="Bajo el capó"
            index="03 / 03"
            title="Qué hago para que"
            highlight="no falle en silencio"
            description="Automatizar es fácil. Automatizar de forma confiable es el trabajo real."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: GitBranch,
                title: "Reintentos con espera exponencial",
                text: "Si un servicio externo falla, el flujo reintenta con intervalos crecientes antes de rendirse. La mayoría de las caídas temporales se resuelven solas.",
              },
              {
                icon: Activity,
                title: "Registro de cada ejecución",
                text: "Entrada, salida, duración y resultado de cada paso quedan guardados. Cuando algo se comporta raro, hay evidencia para revisar.",
              },
              {
                icon: ShieldCheck,
                title: "Alertas accionables",
                text: "Cuando un flujo falla de verdad, llega una notificación con el contexto necesario para arreglarlo, no un mensaje genérico de error.",
              },
              {
                icon: Layers,
                title: "Idempotencia",
                text: "Ejecutar dos veces el mismo evento no genera duplicados ni efectos dobles. Es la diferencia entre una automatización y un problema.",
              },
              {
                icon: Clock,
                title: "Interruptor de emergencia",
                text: "Cada flujo se puede pausar de inmediato sin tocar el código. Si algo sale mal, se detiene primero y se investiga después.",
              },
              {
                icon: Zap,
                title: "Secretos fuera del código",
                text: "Credenciales y tokens viven en variables de entorno gestionadas, nunca en el repositorio ni en texto plano.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <Card className="flex h-full gap-4 p-6" interactive>
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                    <item.icon className="h-5 w-5 text-cyan-energy" />
                  </span>
                  <div>
                    <h3 className="font-display text-[0.95rem] font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.84rem] leading-relaxed text-steel">{item.text}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="¿Qué proceso te está"
        highlight="robando horas?"
        description="Cuéntame la tarea repetitiva que más te molesta y te digo si se puede automatizar, cómo y cuánto ahorrarías."
      />
    </>
  );
}
