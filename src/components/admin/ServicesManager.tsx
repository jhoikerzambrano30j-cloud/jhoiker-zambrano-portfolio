"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus, X, AlertTriangle, Loader2, Check, Power } from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";
import { saveService, deleteService, toggleServiceActive } from "@/app/admin/servicios/actions";
import { cn, formatCOP } from "@/lib/utils";
import type { Service, ServiceTier } from "@/lib/types";

const TIERS: ServiceTier[] = ["starter", "professional", "enterprise"];
const ICONS = ["layout-template", "code-2", "workflow", "boxes", "sparkles", "brain", "shield"];

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  type = "text",
  hint,
  textarea,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  type?: string;
  hint?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="label-mono" htmlFor={`s-${name}`}>
        {label} {required && <span className="text-cyan-energy">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={`s-${name}`}
          name={name}
          rows={rows}
          required={required}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className="field resize-y"
        />
      ) : (
        <input
          id={`s-${name}`}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className="field"
        />
      )}
      {hint && <p className="mt-1.5 font-mono text-[0.62rem] text-steel-faint">{hint}</p>}
    </div>
  );
}

export function ServicesManager({ services }: { services: Service[] }) {
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const panelOpen = creating || editing !== null;

  function closePanel() {
    setCreating(false);
    setEditing(null);
    setFeedback(null);
  }

  function onSubmit(formData: FormData) {
    const id = editing?.id ?? null;
    startTransition(async () => {
      const result = await saveService(id, { ok: false, message: "" }, formData);
      setFeedback(result);
      if (result.ok) closePanel();
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const result = await deleteService(id);
      setFeedback(result);
      setConfirmId(null);
    });
  }

  function onToggle(service: Service) {
    startTransition(async () => {
      const result = await toggleServiceActive(service.id, !service.active);
      setFeedback(result);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel-dim">
          {services.length} servicios · {services.filter((s) => s.active).length} activos
        </span>
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setFeedback(null);
          }}
          className="btn-cyan !px-4 !py-2.5 !text-[0.82rem]"
        >
          <Plus className="h-4 w-4" />
          Nuevo servicio
        </button>
      </div>

      {feedback && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border p-4",
            feedback.ok
              ? "border-emerald-400/30 bg-emerald-400/[0.07] text-emerald-200"
              : "border-rose-400/30 bg-rose-400/[0.07] text-rose-200",
          )}
          role="status"
        >
          {feedback.ok ? <Check className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          <p className="text-[0.84rem]">{feedback.message}</p>
          <button type="button" onClick={() => setFeedback(null)} className="ml-auto rounded p-1 opacity-60 hover:opacity-100" aria-label="Cerrar">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className={cn("grid gap-5", panelOpen && "xl:grid-cols-[1fr_26rem]")}>
        <div className="space-y-3">
          {services.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-[0.88rem] text-steel">Aún no hay servicios configurados.</p>
            </Card>
          )}

          {services.map((service) => (
            <Card key={service.id} className="p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={service.tier === "enterprise" ? "indigo" : service.tier === "professional" ? "cyan" : "muted"}>
                      {service.tier}
                    </Badge>
                    <Badge tone={service.active ? "success" : "muted"}>
                      {service.active ? "Activo" : "Inactivo"}
                    </Badge>
                    {service.featured && <Badge tone="cyan">Destacado</Badge>}
                  </div>

                  <h3 className="mt-2.5 font-display text-[0.95rem] font-bold text-white">
                    {service.name}
                  </h3>
                  <p className="mt-0.5 text-[0.8rem] text-cyan-energy/85">{service.tagline}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[0.64rem] text-steel-faint">
                    <span>{service.price_from ? formatCOP(service.price_from) : "A convenir"}</span>
                    <span>·</span>
                    <span>{service.duration ?? "sin duración"}</span>
                    <span>·</span>
                    <span>{service.deliverables.length} entregables</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggle(service)}
                    disabled={pending}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                      service.active
                        ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-300"
                        : "border-white/10 bg-white/[0.03] text-steel hover:border-emerald-400/35",
                    )}
                    title={service.active ? "Desactivar" : "Activar"}
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditing(service);
                      setCreating(false);
                      setFeedback(null);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-steel transition-colors hover:border-cyan-energy/40 hover:text-cyan-energy"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmId(service.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-steel transition-colors hover:border-rose-400/40 hover:text-rose-300"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {confirmId === service.id && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-rose-400/30 bg-rose-400/[0.06] p-3.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-300" />
                  <p className="text-[0.82rem] text-rose-200">
                    ¿Eliminar «{service.name}»? Los contratos que lo referencien no se ven afectados.
                  </p>
                  <div className="ml-auto flex gap-2">
                    <button type="button" onClick={() => setConfirmId(null)} className="rounded-lg border border-white/12 px-3 py-1.5 text-[0.78rem] text-chrome hover:bg-white/[0.05]">
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(service.id)}
                      disabled={pending}
                      className="inline-flex items-center gap-2 rounded-lg bg-rose-500/90 px-3 py-1.5 text-[0.78rem] font-semibold text-white hover:bg-rose-500"
                    >
                      {pending && <Loader2 className="h-3 w-3 animate-spin" />}
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {panelOpen && (
          <Card className="h-fit p-5 xl:sticky xl:top-6" accent>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[0.95rem] font-bold text-white">
                {editing ? "Editar servicio" : "Nuevo servicio"}
              </h2>
              <button type="button" onClick={closePanel} className="rounded-lg p-1.5 text-steel hover:text-white" aria-label="Cerrar panel">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={onSubmit} className="mt-5 space-y-4">
              <Field label="Nombre" name="name" required defaultValue={editing?.name} placeholder="Aplicación Web a Medida" />
              <Field label="Slug" name="slug" defaultValue={editing?.slug} placeholder="se-genera-del-nombre" />
              <Field label="Eslogan" name="tagline" required defaultValue={editing?.tagline} placeholder="Software hecho para tu operación exacta." />
              <Field label="Descripción" name="description" required textarea rows={5} defaultValue={editing?.description} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-mono" htmlFor="s-tier">
                    Nivel <span className="text-cyan-energy">*</span>
                  </label>
                  <select id="s-tier" name="tier" defaultValue={editing?.tier ?? "professional"} className="field" required>
                    {TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-mono" htmlFor="s-icon">
                    Icono
                  </label>
                  <select id="s-icon" name="icon" defaultValue={editing?.icon ?? "boxes"} className="field">
                    {ICONS.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Precio desde (COP)" name="price_from" type="number" defaultValue={editing?.price_from} placeholder="4500000" />
                <Field label="Orden" name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} />
              </div>

              <Field label="Duración" name="duration" defaultValue={editing?.duration} placeholder="4 – 8 semanas" />
              <Field
                label="Entregables"
                name="deliverables"
                textarea
                rows={5}
                defaultValue={editing?.deliverables.join("\n")}
                hint="Uno por línea."
              />
              <Field
                label="Características"
                name="features"
                textarea
                rows={4}
                defaultValue={editing?.features.join("\n")}
                hint="Una por línea."
              />

              <div className="space-y-2.5">
                <label className="flex items-center gap-3 rounded-lg border border-white/[0.08] p-3.5">
                  <input type="checkbox" name="active" defaultChecked={editing?.active ?? true} className="h-4 w-4 accent-cyan-energy" />
                  <span className="text-[0.84rem] text-chrome">Visible en el sitio</span>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-white/[0.08] p-3.5">
                  <input type="checkbox" name="featured" defaultChecked={editing?.featured} className="h-4 w-4 accent-cyan-energy" />
                  <span className="text-[0.84rem] text-chrome">Marcar como más solicitado</span>
                </label>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={pending} className="btn-cyan flex-1 !py-2.5 !text-[0.84rem]">
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando…
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
                <button type="button" onClick={closePanel} className="btn-ghost !py-2.5 !text-[0.84rem]">
                  Cancelar
                </button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
