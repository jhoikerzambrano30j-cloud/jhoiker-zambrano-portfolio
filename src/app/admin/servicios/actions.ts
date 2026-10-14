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

function toArray(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const serviceSchema = z.object({
  name: z.string().min(3, "El nombre es obligatorio"),
  slug: z.string().optional().or(z.literal("")),
  tagline: z.string().min(5, "El eslogan es obligatorio"),
  description: z.string().min(20, "La descripción es obligatoria"),
  tier: z.enum(["starter", "professional", "enterprise"]),
  price_from: z.coerce.number().min(0).optional(),
  duration: z.string().optional().or(z.literal("")),
  icon: z.string().optional().or(z.literal("")),
  sort_order: z.coerce.number().int().default(0),
});

function revalidateAll() {
  revalidatePath("/admin/servicios");
  revalidatePath("/admin");
  revalidatePath("/servicios");
  revalidatePath("/");
}

export async function saveService(
  id: string | null,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = serviceSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      tagline: formData.get("tagline"),
      description: formData.get("description"),
      tier: formData.get("tier"),
      price_from: formData.get("price_from") || undefined,
      duration: formData.get("duration"),
      icon: formData.get("icon"),
      sort_order: formData.get("sort_order") || 0,
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }

    const d = parsed.data;
    const payload = {
      name: d.name,
      slug: d.slug?.trim() ? slugify(d.slug) : slugify(d.name),
      tagline: d.tagline,
      description: d.description,
      tier: d.tier,
      price_from: d.price_from ?? null,
      currency: "COP",
      duration: d.duration || null,
      icon: d.icon || "boxes",
      sort_order: d.sort_order,
      deliverables: toArray(formData.get("deliverables")),
      features: toArray(formData.get("features")),
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
    };

    const supabase = await createAdminSupabase();

    if (id) {
      const { error } = await supabase.from("services").update(payload).eq("id", id);
      if (error) return { ok: false, message: error.message };
      await logAction(session.email, "actualizar", "services", id, { name: payload.name });
    } else {
      const { data, error } = await supabase.from("services").insert(payload).select("id").single();
      if (error) return { ok: false, message: error.message };
      await logAction(session.email, "crear", "services", data?.id ?? null, { name: payload.name });
    }

    revalidateAll();
    return { ok: true, message: id ? "Servicio actualizado." : "Servicio creado." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const supabase = await createAdminSupabase();
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return { ok: false, message: error.message };
    await logAction(session.email, "eliminar", "services", id);
    revalidateAll();
    return { ok: true, message: "Servicio eliminado." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

export async function toggleServiceActive(id: string, active: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = await createAdminSupabase();
    const { error } = await supabase.from("services").update({ active }).eq("id", id);
    if (error) return { ok: false, message: error.message };
    revalidateAll();
    return { ok: true, message: active ? "Servicio activado." : "Servicio desactivado." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}
