"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save, Loader2, Check, AlertTriangle, ShieldCheck, Database, User } from "lucide-react";
import { Card, CodeBlock, Badge } from "@/components/ui/Primitives";
import { saveSiteSettings } from "@/app/admin/ajustes/actions";
import { cn } from "@/lib/utils";
import type { AdminSession } from "@/lib/auth";
import type { AuditLog } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-cyan !py-2.5 !text-[0.84rem]">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Guardando…
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          Guardar ajustes
        </>
      )}
    </button>
  );
}

export function SettingsManager({
  session,
  settings,
  audit,
  supabaseUrl,
}: {
  session: AdminSession;
  settings: Record<string, unknown>;
  audit: AuditLog[];
  supabaseUrl: string;
}) {
  const [state, formAction] = useActionState(saveSiteSettings, { ok: false, message: "" });

  const social = (settings.social_links ?? {}) as Record<string, string | null>;
  const str = (key: string, fallback = "") =>
    typeof settings[key] === "string" ? (settings[key] as string) : fallback;

  return (
    <div className="space-y-6">
      {state.message && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border p-4",
            state.ok
              ? "border-emerald-400/30 bg-emerald-400/[0.07] text-emerald-200"
              : "border-rose-400/30 bg-rose-400/[0.07] text-rose-200",
          )}
          role="status"
        >
          {state.ok ? <Check className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          <p className="text-[0.84rem]">{state.message}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Formulario */}
        <Card className="p-6" accent>
          <h2 className="font-display text-base font-bold text-white">Datos públicos del sitio</h2>
          <p className="mt-2 text-[0.84rem] text-steel">
            Estos valores se guardan en la tabla <span className="font-mono text-chrome">site_settings</span> y
            alimentan el sitio público.
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-mono" htmlFor="contact_email">
                  Correo de contacto
                </label>
                <input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  required
                  defaultValue={str("contact_email", "contacto@jhoikerzambrano.com")}
                  className="field"
                />
              </div>

              <div>
                <label className="label-mono" htmlFor="whatsapp">
                  WhatsApp (con indicativo)
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  required
                  defaultValue={str("whatsapp", "+57")}
                  placeholder="+573001234567"
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="label-mono" htmlFor="availability">
                Disponibilidad
              </label>
              <input
                id="availability"
                name="availability"
                required
                defaultValue={str("availability", "Disponible para nuevos proyectos")}
                className="field"
              />
            </div>

            <div>
              <label className="label-mono" htmlFor="hero_headline">
                Titular principal
              </label>
              <input
                id="hero_headline"
                name="hero_headline"
                required
                defaultValue={str("hero_headline", "JHOIKER ZAMBRANO")}
                className="field"
              />
            </div>

            <div>
              <label className="label-mono" htmlFor="hero_subheadline">
                Subtítulo principal
              </label>
              <input
                id="hero_subheadline"
                name="hero_subheadline"
                required
                defaultValue={str("hero_subheadline", "Ingeniería de Software & Arquitectura Digital")}
                className="field"
              />
            </div>

            <div className="border-t border-white/[0.07] pt-5">
              <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-energy">
                Redes sociales
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="label-mono" htmlFor="github">
                    GitHub
                  </label>
                  <input
                    id="github"
                    name="github"
                    defaultValue={social.github ?? "https://github.com/jhoikerzambrano"}
                    className="field"
                  />
                </div>
                <div>
                  <label className="label-mono" htmlFor="linkedin">
                    LinkedIn
                  </label>
                  <input
                    id="linkedin"
                    name="linkedin"
                    defaultValue={social.linkedin ?? "https://www.linkedin.com/in/jhoikerzambrano"}
                    className="field"
                  />
                </div>
                <div>
                  <label className="label-mono" htmlFor="x">
                    X / Twitter
                  </label>
                  <input id="x" name="x" defaultValue={social.x ?? ""} className="field" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>
        </Card>

        {/* Información de la sesión y del sistema */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-cyan-energy" />
              <h2 className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-cyan-energy">
                Tu cuenta
              </h2>
            </div>

            <dl className="mt-5 space-y-3.5">
              <div>
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                  Nombre
                </dt>
                <dd className="mt-0.5 text-[0.86rem] text-chrome">{session.fullName}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                  Correo
                </dt>
                <dd className="mt-0.5 break-all font-mono text-[0.78rem] text-chrome">
                  {session.email}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                  Rol
                </dt>
                <dd className="mt-0.5">
                  <Badge tone="cyan">Administrador</Badge>
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-start gap-3 rounded-lg border border-cyan-energy/20 bg-cyan-energy/[0.05] p-3.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-energy" />
              <p className="text-[0.78rem] leading-relaxed text-chrome">
                Acceso completo a proyectos, servicios, automatizaciones, leads y contratos.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-energy" />
              <h2 className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-cyan-energy">
                Infraestructura
              </h2>
            </div>

            <dl className="mt-5 space-y-3.5">
              <div>
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                  Supabase
                </dt>
                <dd className="mt-0.5 break-all font-mono text-[0.72rem] text-chrome">
                  {supabaseUrl || "no configurado"}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                  Repositorio
                </dt>
                <dd className="mt-0.5 font-mono text-[0.72rem] text-chrome">
                  jhoiker-zambrano-portfolio
                </dd>
              </div>
            </dl>

            <p className="mt-5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel-faint">
              Comandos útiles
            </p>
            <CodeBlock className="mt-3" title="terminal" code={`pnpm dev        # desarrollo
pnpm build      # compilar
pnpm db:seed    # crear admin
pnpm db:sql     # ver el SQL`} />
          </Card>
        </div>
      </div>

      {/* Auditoría */}
      <Card className="p-6">
        <h2 className="font-display text-base font-bold text-white">Bitácora de actividad</h2>
        <p className="mt-2 text-[0.84rem] text-steel">
          Registro de las últimas acciones realizadas en el panel.
        </p>

        {audit.length === 0 ? (
          <p className="mt-5 text-[0.84rem] text-steel-dim">Aún no hay actividad registrada.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  {["Fecha", "Actor", "Acción", "Entidad"].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {audit.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/[0.05] last:border-0">
                    <td className="px-3 py-2.5 font-mono text-[0.68rem] text-steel-faint">
                      {formatDate(entry.created_at, true)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[0.68rem] text-steel">
                      {entry.actor_email}
                    </td>
                    <td className="px-3 py-2.5 text-[0.8rem] text-chrome">{entry.action}</td>
                    <td className="px-3 py-2.5 font-mono text-[0.68rem] text-cyan-energy/80">
                      {entry.entity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
