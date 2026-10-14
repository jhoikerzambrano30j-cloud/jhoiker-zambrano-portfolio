"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { logAction } from "@/lib/admin";
import { createAdminSupabase } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/admin/proyectos/actions";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado");
  return session;
}

const settingsSchema = z.object({
  contact_email: z.string().email("Correo no válido"),
  whatsapp: z.string().min(5, "Número no válido"),
  availability: z.string().min(3, "Indica tu disponibilidad"),
  hero_headline: z.string().min(5, "El titular es obligatorio"),
  hero_subheadline: z.string().min(5, "El subtítulo es obligatorio"),
  github: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  x: z.string().optional().or(z.literal("")),
});

export async function saveSiteSettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();

    const parsed = settingsSchema.safeParse({
      contact_email: formData.get("contact_email"),
      whatsapp: formData.get("whatsapp"),
      availability: formData.get("availability"),
      hero_headline: formData.get("hero_headline"),
      hero_subheadline: formData.get("hero_subheadline"),
      github: formData.get("github"),
      linkedin: formData.get("linkedin"),
      x: formData.get("x"),
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }

    const d = parsed.data;
    const supabase = await createAdminSupabase();

    const rows = [
      { key: "contact_email", value: d.contact_email },
      { key: "whatsapp", value: d.whatsapp },
      { key: "availability", value: d.availability },
      { key: "hero_headline", value: d.hero_headline },
      { key: "hero_subheadline", value: d.hero_subheadline },
      {
        key: "social_links",
        value: { github: d.github || null, linkedin: d.linkedin || null, x: d.x || null },
      },
    ].map((row) => ({ ...row, updated_at: new Date().toISOString() }));

    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) return { ok: false, message: error.message };

    await logAction(session.email, "actualizar", "site_settings", null, {
      keys: rows.map((r) => r.key),
    });

    revalidatePath("/admin/ajustes");
    revalidatePath("/");
    revalidatePath("/contacto");

    return { ok: true, message: "Ajustes guardados correctamente." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}
