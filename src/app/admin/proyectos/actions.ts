"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { logAction } from "@/lib/admin";
import { createAdminSupabase } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export type ActionResult = { ok: boolean; message: string };

/** Exige sesión de administrador. Lanza si no la hay. */
async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado");
  return session;
}

function toArray(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const projectSchema = z.object({
  title: z.string().min(3, "El título es obligatorio"),
  slug: z.string().optional().or(z.literal("")),
  summary: z.string().min(10, "El resumen es obligatorio"),
  description: z.string().optional().or(z.literal("")),
  category: z.string().min(1, "Selecciona una categoría"),
  status: z.enum(["publicado", "borrador", "archivado"]),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  client: z.string().optional().or(z.literal("")),
  role: z.string().optional().or(z.literal("")),
  repo_url: z.string().optional().or(z.literal("")),
  live_url: z.string().optional().or(z.literal("")),
  cover_url: z.string().optional().or(z.literal("")),
  sort_order: z.coerce.number().int().default(0),
});

function revalidateAll() {
  revalidatePath("/admin/proyectos");
  revalidatePath("/admin");
  revalidatePath("/proyectos");
  revalidatePath("/");
}

export async function saveProject(
  id: string | null,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = projectSchema.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug"),
      summary: formData.get("summary"),
      description: formData.get("description"),
      category: formData.get("category"),
      status: formData.get("status"),
      year: formData.get("year") || undefined,
      client: formData.get("client"),
      role: formData.get("role"),
      repo_url: formData.get("repo_url"),
      live_url: formData.get("live_url"),
      cover_url: formData.get("cover_url"),
      sort_order: formData.get("sort_order") || 0,
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }

    const d = parsed.data;
    const payload = {
      title: d.title,
      slug: d.slug?.trim() ? slugify(d.slug) : slugify(d.title),
      summary: d.summary,
      description: d.description || null,
      category: d.category,
      status: d.status,
      year: d.year ?? null,
      client: d.client || null,
      role: d.role || null,
      repo_url: d.repo_url || null,
      live_url: d.live_url || null,
      cover_url: d.cover_url || null,
      sort_order: d.sort_order,
      stack: toArray(formData.get("stack")),
      tags: toArray(formData.get("tags")),
      gallery: toArray(formData.get("gallery")),
      featured: formData.get("featured") === "on",
    };

    const supabase = await createAdminSupabase();

    if (id) {
      const { error } = await supabase.from("projects").update(payload).eq("id", id);
      if (error) return { ok: false, message: error.message };
      await logAction(session.email, "actualizar", "projects", id, { title: payload.title });
    } else {
      const { data, error } = await supabase.from("projects").insert(payload).select("id").single();
      if (error) return { ok: false, message: error.message };
      await logAction(session.email, "crear", "projects", data?.id ?? null, { title: payload.title });
    }

    revalidateAll();
    return { ok: true, message: id ? "Proyecto actualizado." : "Proyecto creado." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const supabase = await createAdminSupabase();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return { ok: false, message: error.message };
    await logAction(session.email, "eliminar", "projects", id);
    revalidateAll();
    return { ok: true, message: "Proyecto eliminado." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

export async function toggleProjectFeatured(id: string, featured: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = await createAdminSupabase();
    const { error } = await supabase.from("projects").update({ featured }).eq("id", id);
    if (error) return { ok: false, message: error.message };
    revalidateAll();
    return { ok: true, message: featured ? "Marcado como destacado." : "Ya no es destacado." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}
