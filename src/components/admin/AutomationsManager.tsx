"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, AlertTriangle, Loader2, Check, Play, Pause } from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";
import {
  saveAutomation,
  deleteAutomation,
  toggleAutomationStatus,
} from "@/app/admin/automatizaciones/actions";
import { cn } from "@/lib/utils";
import type { Automation, AutonomyLevel } from "@/lib/types";

const AUTONOMY: AutonomyLevel[] = ["supervisado", "semiautonomo", "autonomo"];
const STATUSES = ["activa", "pausada", "borrador", "error"] as const;

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
  step,
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
  step?: string;
}) {
  return (
    <div>
      <label className="label-mono" htmlFor={`a-${name}`}>
        {label} {required && <span className="text-cyan-energy">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={`a-${name}`}
          name={name}
          rows={rows}
          required={required}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className="field resize-y"
        />
      ) : (
        <input
          id={`a-${name}`}
          name={name}
          type={type}
          step={step}
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

export function AutomationsManager({ automations }: { automations: Automation[] }) {
  const [editing, setEditing] = useState<Automation | null>(null);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const panelOpen = creating || editing !== null;

  function closePanel() {
    setCreating(false);
    setEditing(null);
  }

  function onSubmit(formData: FormData) {
    const id = editing?.id ?? null;
    startTransition(async () => {
      const result = await saveAutomation(id, { ok: false, message: "" }, formData);
      setFeedback(result);
      if (result.ok) closePanel();
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      setFeedback(await deleteAutomation(id));
      setConfirmId(null);
    });
  }

  function onToggle(automation: Automation) {
    startTransition(async () => {
      setFeedback(
        await toggleAutomationStatus(
          automation.id,
          automation.status === "activa" ? "pausada" : "activa",
        ),
      );
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel-dim">
          {automations.length} flujos · {automations.filter((a) => a.status === "activa").length} activos
        </span>
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          className="btn-cyan !px-4 !py-2.5 !text-[0.82rem]"
        >
          <Plus className="h-4 w-4" />
          Nueva automatización
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
          {automations.map((automation) => (
            <Card key={automation.id} className="p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={automation.status === "activa" ? "success" : automation.status === "pausada" ? "warn" : "muted"}>
                      {automation.status}
                    </Badge>
                    <Badge tone="cyan">{automation.autonomy_level}</Badge>
                    {automation.featured && <Badge tone="indigo">Destacado</Badge>}
                  </div>

                  <h3 className="mt-2.5 font-display text-[0.95rem] font-bold text-white">
                    {automation.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-steel-faint">
                    {automation.trigger_type}
                  </p>
                  <p className="mt-2 line-clamp-2 text-[0.8rem] text-steel">{automation.description}</p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-3 font-mono text-[0.64rem] text-steel-faint">
                    <span>{automation.runs_count.toLocaleString("es-CO")} ejecuciones</span>
                    <span>·</span>
                    <span>{automation.success_rate ?? "—"}% éxito</span>
                    <span>·</span>
                    <span>{automation.saved_hours_month ?? 0} h/mes</span>
                    <span>·</span>
                    <span>{automation.workflow.length} pasos</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggle(automation)}
                    disabled={pending}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                      automation.status === "activa"
                        ? "border-amber-400/35 bg-amber-400/10 text-amber-300"
                        : "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
                    )}
                    title={automation.status === "activa" ? "Pausar" : "Activar"}
                  >
                    {automation.status === "activa" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditing(automation);
                      setCreating(false);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-steel transition-colors hover:border-cyan-energy/40 hover:text-cyan-energy"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmId(automation.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-steel transition-colors hover:border-rose-400/40 hover:text-rose-300"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {confirmId === automation.id && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-rose-400/30 bg-rose-400/[0.06] p-3.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-300" />
                  <p className="text-[0.82rem] text-rose-200">¿Eliminar «{automation.name}»?</p>
                  <div className="ml-auto flex gap-2">
                    <button type="button" onClick={() => setConfirmId(null)} className="rounded-lg border border-white/12 px-3 py-1.5 text-[0.78rem] text-chrome hover:bg-white/[0.05]">
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(automation.id)}
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
                {editing ? "Editar automatización" : "Nueva automatización"}
              </h2>
              <button type="button" onClick={closePanel} className="rounded-lg p-1.5 text-steel hover:text-white" aria-label="Cerrar panel">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={onSubmit} className="mt-5 space-y-4">
              <Field label="Nombre" name="name" required defaultValue={editing?.name} placeholder="Captura y calificación de leads" />
              <Field label="Slug" name="slug" defaultValue={editing?.slug} placeholder="se-genera-del-nombre" />
              <Field label="Descripción" name="description" required textarea rows={4} defaultValue={editing?.description} />
              <Field label="Disparador" name="trigger_type" required defaultValue={editing?.trigger_type} placeholder="Formulario web / webhook" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-mono" htmlFor="a-autonomy_level">
                    Autonomía
                  </label>
                  <select id="a-autonomy_level" name="autonomy_level" defaultValue={editing?.autonomy_level ?? "semiautonomo"} className="field">
                    {AUTONOMY.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-mono" htmlFor="a-status">
                    Estado
                  </label>
                  <select id="a-status" name="status" defaultValue={editing?.status ?? "activa"} className="field">
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Ejecuciones" name="runs_count" type="number" defaultValue={editing?.runs_count ?? 0} />
                <Field label="Orden" name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Tasa de éxito (%)" name="success_rate" type="number" step="0.1" defaultValue={editing?.success_rate} placeholder="98.6" />
                <Field label="Ahorro h/mes" name="saved_hours_month" type="number" defaultValue={editing?.saved_hours_month} placeholder="14" />
              </div>

              <Field
                label="Herramientas"
                name="tools"
                textarea
                rows={3}
                defaultValue={editing?.tools.join("\n")}
                hint="Una por línea."
              />

              <label className="flex items-center gap-3 rounded-lg border border-white/[0.08] p-3.5">
                <input type="checkbox" name="featured" defaultChecked={editing?.featured} className="h-4 w-4 accent-cyan-energy" />
                <span className="text-[0.84rem] text-chrome">Destacar en el sitio</span>
              </label>

              <p className="rounded-lg border border-cyan-energy/20 bg-cyan-energy/[0.05] p-3 font-mono text-[0.64rem] leading-relaxed text-steel">
                Los pasos del flujo (workflow) se editan directamente en Supabase o con el seed.
              </p>

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
