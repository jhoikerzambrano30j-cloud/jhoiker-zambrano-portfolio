"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { logAction } from "@/lib/admin";
import { createAdminSupabase } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/app/admin/proyectos/actions";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado");
  return session;
}

const automationSchema = z.object({
  name: z.string().min(3, "El nombre es obligatorio"),
  slug: z.string().optional().or(z.literal("")),
  description: z.string().min(20, "La descripción es obligatoria"),
  trigger_type: z.string().min(3, "El disparador es obligatorio"),
  autonomy_level: z.enum(["supervisado", "semiautonomo", "autonomo"]),
  status: z.enum(["activa", "pausada", "borrador", "error"]),
  runs_count: z.coerce.number().int().min(0).default(0),
  success_rate: z.coerce.number().min(0).max(100).optional(),
  saved_hours_month: z.coerce.number().min(0).optional(),
  sort_order: z.coerce.number().int().default(0),
});

function revalidateAll() {
  revalidatePath("/admin/automatizaciones");
  revalidatePath("/admin");
  revalidatePath("/automatizaciones");
  revalidatePath("/");
}

export async function saveAutomation(
  id: string | null,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = automationSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      trigger_type: formData.get("trigger_type"),
      autonomy_level: formData.get("autonomy_level"),
      status: formData.get("status"),
      runs_count: formData.get("runs_count") || 0,
      success_rate: formData.get("success_rate") || undefined,
      saved_hours_month: formData.get("saved_hours_month") || undefined,
      sort_order: formData.get("sort_order") || 0,
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }

    const d = parsed.data;
    const payload = {
      name: d.name,
      slug: d.slug?.trim() ? slugify(d.slug) : slugify(d.name),
      description: d.description,
      trigger_type: d.trigger_type,
      autonomy_level: d.autonomy_level,
      status: d.status,
      runs_count: d.runs_count,
      success_rate: d.success_rate ?? null,
      saved_hours_month: d.saved_hours_month ?? null,
      sort_order: d.sort_order,
      tools: String(formData.get("tools") ?? "")
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean),
      featured: formData.get("featured") === "on",
    };

    const supabase = await createAdminSupabase();

    if (id) {
      const { error } = await supabase.from("automations").update(payload).eq("id", id);
      if (error) return { ok: false, message: error.message };
      await logAction(session.email, "actualizar", "automations", id, { name: payload.name });
    } else {
      const { data, error } = await supabase
        .from("automations")
        .insert({ ...payload, workflow: [] })
        .select("id")
        .single();
      if (error) return { ok: false, message: error.message };
      await logAction(session.email, "crear", "automations", data?.id ?? null, { name: payload.name });
    }

    revalidateAll();
    return { ok: true, message: id ? "Automatización actualizada." : "Automatización creada." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

export async function deleteAutomation(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const supabase = await createAdminSupabase();
    const { error } = await supabase.from("automations").delete().eq("id", id);
    if (error) return { ok: false, message: error.message };
    await logAction(session.email, "eliminar", "automations", id);
    revalidateAll();
    return { ok: true, message: "Automatización eliminada." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

export async function toggleAutomationStatus(
  id: string,
  status: "activa" | "pausada",
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const supabase = await createAdminSupabase();
    const { error } = await supabase.from("automations").update({ status }).eq("id", id);
    if (error) return { ok: false, message: error.message };
    await logAction(session.email, "cambiar-estado", "automations", id, { status });
    revalidateAll();
    return { ok: true, message: status === "activa" ? "Flujo activado." : "Flujo pausado." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}
