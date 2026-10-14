"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Star, Plus, X, AlertTriangle, Loader2, Check } from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";
import { StatusPill } from "@/components/admin/StatusPill";
import { saveProject, deleteProject, toggleProjectFeatured } from "@/app/admin/proyectos/actions";
import { cn } from "@/lib/utils";
import type { Project, ProjectCategory } from "@/lib/types";

const CATEGORIES: ProjectCategory[] = [
  "Web",
  "Automatización",
  "App",
  "IA",
  "E-commerce",
  "Arquitectura",
  "Data",
];

const STATUSES = ["publicado", "borrador", "archivado"] as const;

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
      <label className="label-mono" htmlFor={`f-${name}`}>
        {label} {required && <span className="text-cyan-energy">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={`f-${name}`}
          name={name}
          rows={rows}
          required={required}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className="field resize-y"
        />
      ) : (
        <input
          id={`f-${name}`}
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

export function ProjectsManager({ projects }: { projects: Project[] }) {
  const [editing, setEditing] = useState<Project | null>(null);
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
      const result = await saveProject(id, { ok: false, message: "" }, formData);
      setFeedback(result);
      if (result.ok) {
        closePanel();
      }
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const result = await deleteProject(id);
      setFeedback(result);
      setConfirmId(null);
    });
  }

  function onToggleFeatured(project: Project) {
    startTransition(async () => {
      const result = await toggleProjectFeatured(project.id, !project.featured);
      setFeedback(result);
    });
  }

  return (
    <div className="space-y-5">
      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-steel-dim">
            {projects.length} proyectos
          </span>
          <span className="font-mono text-[0.68rem] text-steel-faint">
            {projects.filter((p) => p.status === "publicado").length} publicados
          </span>
        </div>

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
          Nuevo proyecto
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
          {feedback.ok ? (
            <Check className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <p className="text-[0.84rem]">{feedback.message}</p>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="ml-auto rounded p-1 opacity-60 hover:opacity-100"
            aria-label="Cerrar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className={cn("grid gap-5", panelOpen && "xl:grid-cols-[1fr_26rem]")}>
        {/* Lista */}
        <div className="space-y-3">
          {projects.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-[0.88rem] text-steel">
                Aún no hay proyectos. Crea el primero con el botón de arriba.
              </p>
            </Card>
          )}

          {projects.map((project) => (
            <Card key={project.id} className="p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="cyan">{project.category}</Badge>
                    <StatusPill status={project.status} />
                    {project.featured && <Badge tone="indigo">Destacado</Badge>}
                    <span className="font-mono text-[0.62rem] text-steel-faint">
                      {project.year ?? "—"} · orden {project.sort_order}
                    </span>
                  </div>

                  <h3 className="mt-2.5 font-display text-[0.95rem] font-bold text-white">
                    {project.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[0.8rem] text-steel">{project.summary}</p>
                  <p className="mt-2 font-mono text-[0.62rem] text-steel-faint">/{project.slug}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleFeatured(project)}
                    disabled={pending}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                      project.featured
                        ? "border-indigo-automation/40 bg-indigo-automation/10 text-indigo-automation"
                        : "border-white/10 bg-white/[0.03] text-steel hover:border-indigo-automation/35",
                    )}
                    title={project.featured ? "Quitar de destacados" : "Marcar como destacado"}
                  >
                    <Star className={cn("h-3.5 w-3.5", project.featured && "fill-current")} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditing(project);
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
                    onClick={() => setConfirmId(project.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-steel transition-colors hover:border-rose-400/40 hover:text-rose-300"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Confirmación de borrado */}
              {confirmId === project.id && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-rose-400/30 bg-rose-400/[0.06] p-3.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-300" />
                  <p className="text-[0.82rem] text-rose-200">
                    ¿Eliminar «{project.title}»? Esta acción no se puede deshacer.
                  </p>
                  <div className="ml-auto flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-lg border border-white/12 px-3 py-1.5 text-[0.78rem] text-chrome hover:bg-white/[0.05]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(project.id)}
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

        {/* Panel de edición */}
        {panelOpen && (
          <Card className="h-fit p-5 xl:sticky xl:top-6" accent>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[0.95rem] font-bold text-white">
                {editing ? "Editar proyecto" : "Nuevo proyecto"}
              </h2>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-lg p-1.5 text-steel transition-colors hover:text-white"
                aria-label="Cerrar panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={onSubmit} className="mt-5 space-y-4">
              <Field label="Título" name="title" required defaultValue={editing?.title} placeholder="Sistema de Gestión Hotelera" />
              <Field
                label="Slug"
                name="slug"
                defaultValue={editing?.slug}
                placeholder="se-genera-del-titulo"
                hint="Déjalo vacío para generarlo desde el título."
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-mono" htmlFor="f-category">
                    Categoría <span className="text-cyan-energy">*</span>
                  </label>
                  <select
                    id="f-category"
                    name="category"
                    defaultValue={editing?.category ?? "Web"}
                    className="field"
                    required
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-mono" htmlFor="f-status">
                    Estado <span className="text-cyan-energy">*</span>
                  </label>
                  <select
                    id="f-status"
                    name="status"
                    defaultValue={editing?.status ?? "borrador"}
                    className="field"
                    required
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Field label="Resumen" name="summary" required textarea rows={3} defaultValue={editing?.summary} placeholder="Una o dos frases que resuman el proyecto." />
              <Field label="Descripción" name="description" textarea rows={6} defaultValue={editing?.description} placeholder="Separa los párrafos con una línea en blanco." />

              <div className="grid grid-cols-2 gap-4">
                <Field label="Año" name="year" type="number" defaultValue={editing?.year} placeholder="2026" />
                <Field label="Orden" name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} />
              </div>

              <Field label="Cliente" name="client" defaultValue={editing?.client} placeholder="Opcional" />
              <Field label="Mi rol" name="role" defaultValue={editing?.role} placeholder="Desarrollador full-stack" />

              <Field
                label="Stack"
                name="stack"
                textarea
                rows={3}
                defaultValue={editing?.stack.join("\n")}
                hint="Una tecnología por línea."
              />
              <Field
                label="Etiquetas"
                name="tags"
                textarea
                rows={2}
                defaultValue={editing?.tags.join("\n")}
                hint="Una etiqueta por línea."
              />

              <Field label="URL del repositorio" name="repo_url" defaultValue={editing?.repo_url} placeholder="https://github.com/..." />
              <Field label="URL en vivo" name="live_url" defaultValue={editing?.live_url} placeholder="https://..." />

              <label className="flex items-center gap-3 rounded-lg border border-white/[0.08] p-3.5">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={editing?.featured}
                  className="h-4 w-4 accent-cyan-energy"
                />
                <span className="text-[0.84rem] text-chrome">
                  Destacar en la página de inicio
                </span>
              </label>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={pending} className="btn-cyan flex-1 !py-2.5 !text-[0.84rem]">
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando…
                    </>
                  ) : (
                    <>Guardar</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closePanel}
                  className="btn-ghost !py-2.5 !text-[0.84rem]"
                >
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
