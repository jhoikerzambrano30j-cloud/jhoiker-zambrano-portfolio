"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertTriangle, Check, FileSignature, Info } from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";
import { createContract } from "@/app/admin/contratos/actions";
import { CONTRACT_TEMPLATES } from "@/lib/contracts/templates";
import { cn, formatCOP, toISODate, addDays } from "@/lib/utils";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-cyan w-full !py-3">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creando contrato…
        </>
      ) : (
        <>
          <FileSignature className="h-4 w-4" />
          Crear contrato
        </>
      )}
    </button>
  );
}

export function ContractCreateForm() {
  const [state, formAction] = useActionState(createContract, { ok: false, message: "" });
  const [selected, setSelected] = useState(CONTRACT_TEMPLATES[0]?.slug ?? "");

  const template =
    CONTRACT_TEMPLATES.find((t) => t.slug === selected) ?? CONTRACT_TEMPLATES[0];

  const today = toISODate(new Date());
  const suggestedEnd = template ? toISODate(addDays(new Date(), template.duration_days)) : "";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
      <Card className="p-6" accent>
        <Link
          href="/admin/contratos"
          className="group inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel-dim transition-colors hover:text-cyan-energy"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Volver a contratos
        </Link>

        <h2 className="mt-6 font-display text-lg font-black text-white">
          Nuevo <span className="text-cyan-energy">contrato</span>
        </h2>
        <div className="hairline mt-4 w-20" />
        <p className="mt-5 text-[0.86rem] leading-relaxed text-steel">
          Selecciona una plantilla predefinida y completa los datos del cliente. Las cláusulas se
          generan automáticamente con los marcadores ya resueltos y podrás negociarlas una por una.
        </p>

        {state.message && (
          <div
            className={cn(
              "mt-6 flex items-start gap-3 rounded-xl border p-4",
              state.ok
                ? "border-emerald-400/30 bg-emerald-400/[0.07] text-emerald-200"
                : "border-rose-400/30 bg-rose-400/[0.07] text-rose-200",
            )}
            role="status"
          >
            {state.ok ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <p className="text-[0.84rem] leading-relaxed">{state.message}</p>
          </div>
        )}

        <form action={formAction} className="mt-7 space-y-5">
          {/* Plantillas */}
          <div>
            <span className="label-mono">Plantilla predefinida *</span>
            <div className="mt-2 space-y-2.5">
              {CONTRACT_TEMPLATES.map((t) => (
                <label
                  key={t.slug}
                  className={cn(
                    "flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all duration-200",
                    selected === t.slug
                      ? "border-cyan-energy/45 bg-cyan-energy/[0.07]"
                      : "border-white/[0.08] hover:border-cyan-energy/25 hover:bg-white/[0.02]",
                  )}
                >
                  <input
                    type="radio"
                    name="template_slug"
                    value={t.slug}
                    checked={selected === t.slug}
                    onChange={() => setSelected(t.slug)}
                    className="mt-1 h-4 w-4 accent-cyan-energy"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "font-display text-[0.9rem] font-bold",
                          selected === t.slug ? "text-cyan-energy" : "text-white",
                        )}
                      >
                        {t.name}
                      </span>
                      <Badge tone="muted">{t.clauses.length} cláusulas</Badge>
                      <Badge tone="muted">
                        {t.clauses.filter((c) => c.locked).length} bloqueadas
                      </Badge>
                    </span>
                    <span className="mt-1.5 block text-[0.8rem] leading-relaxed text-steel">
                      {t.description}
                    </span>
                    <span className="mt-2 block font-mono text-[0.66rem] text-steel-faint">
                      Base {formatCOP(t.base_price)} · {t.duration_days} días · garantía{" "}
                      {t.warranty_days} días
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.07] pt-5">
            <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-energy">
              Datos del cliente
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label-mono" htmlFor="client_name">
                  Nombre o razón social *
                </label>
                <input
                  id="client_name"
                  name="client_name"
                  required
                  placeholder="Ej. María Restrepo / Hoteles del Caribe S.A.S."
                  className="field"
                />
              </div>

              <div>
                <label className="label-mono" htmlFor="client_company">
                  Empresa
                </label>
                <input id="client_company" name="client_company" placeholder="Opcional" className="field" />
              </div>

              <div>
                <label className="label-mono" htmlFor="client_email">
                  Correo electrónico
                </label>
                <input
                  id="client_email"
                  name="client_email"
                  type="email"
                  placeholder="cliente@empresa.com"
                  className="field"
                />
              </div>

              <div>
                <label className="label-mono" htmlFor="client_doc_id">
                  Cédula / NIT
                </label>
                <input id="client_doc_id" name="client_doc_id" placeholder="Opcional" className="field" />
              </div>

              <div>
                <label className="label-mono" htmlFor="city">
                  Ciudad de firma
                </label>
                <input id="city" name="city" defaultValue="Colombia" className="field" />
              </div>

              <div className="sm:col-span-2">
                <label className="label-mono" htmlFor="client_address">
                  Dirección
                </label>
                <input id="client_address" name="client_address" placeholder="Opcional" className="field" />
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.07] pt-5">
            <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-energy">
              Condiciones económicas
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-mono" htmlFor="total">
                  Valor total (COP) *
                </label>
                <input
                  id="total"
                  name="total"
                  type="number"
                  required
                  min={1}
                  step={1000}
                  key={`total-${template?.slug}`}
                  defaultValue={template?.base_price ?? 0}
                  className="field"
                />
              </div>

              <div>
                <label className="label-mono" htmlFor="start_date">
                  Fecha de inicio
                </label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  defaultValue={today}
                  className="field"
                />
              </div>

              <div>
                <label className="label-mono" htmlFor="duration_days">
                  Plazo (días) *
                </label>
                <input
                  id="duration_days"
                  name="duration_days"
                  type="number"
                  required
                  min={1}
                  key={`plazo-${template?.slug}`}
                  defaultValue={template?.duration_days ?? 30}
                  className="field"
                />
                <p className="mt-1.5 font-mono text-[0.62rem] text-steel-faint">
                  Fin estimado: {suggestedEnd}
                </p>
              </div>

              <div>
                <label className="label-mono" htmlFor="warranty_days">
                  Garantía (días)
                </label>
                <input
                  id="warranty_days"
                  name="warranty_days"
                  type="number"
                  min={0}
                  key={`gar-${template?.slug}`}
                  defaultValue={template?.warranty_days ?? 30}
                  className="field"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="label-mono" htmlFor="scope">
                Alcance específico
              </label>
              <textarea
                id="scope"
                name="scope"
                rows={4}
                placeholder={
                  template
                    ? `Describe el alcance concreto de este contrato. Si lo dejas vacío se usará el alcance de la plantilla «${template.name}».`
                    : "Describe el alcance concreto."
                }
                className="field resize-y"
              />
            </div>
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </Card>

      {/* Resumen de la plantilla */}
      <div className="space-y-6 lg:sticky lg:top-6">
        {template && (
          <>
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-cyan-energy" />
                <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-energy">
                  Plan de pagos
                </h3>
              </div>
              <ul className="mt-4 space-y-2.5">
                {template.payment_plan.map((p) => (
                  <li key={p.milestone} className="flex items-start justify-between gap-3">
                    <span className="text-[0.8rem] leading-snug text-chrome">{p.milestone}</span>
                    <span className="shrink-0 font-mono text-[0.72rem] text-cyan-energy">
                      {p.percent}%
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-energy">
                Entregables ({template.deliverables.length})
              </h3>
              <ul className="mt-4 space-y-2">
                {template.deliverables.slice(0, 6).map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-[0.78rem] leading-snug text-chrome">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-energy" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-energy">
                Exclusiones ({template.exclusions.length})
              </h3>
              <ul className="mt-4 space-y-2">
                {template.exclusions.map((e) => (
                  <li key={e} className="flex items-start gap-2.5 text-[0.78rem] leading-snug text-steel">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-steel-faint" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="border-cyan-energy/20 p-5">
              <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-energy">
                Cláusulas bloqueadas
              </h3>
              <p className="mt-3 text-[0.78rem] leading-relaxed text-steel">
                Las siguientes cláusulas son jurídicamente sensibles y no se pueden editar desde el
                panel:
              </p>
              <ul className="mt-3 space-y-1.5">
                {template.clauses
                  .filter((c) => c.locked)
                  .map((c) => (
                    <li key={c.id} className="font-mono text-[0.68rem] leading-snug text-chrome">
                      {c.order}. {c.title}
                    </li>
                  ))}
              </ul>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
