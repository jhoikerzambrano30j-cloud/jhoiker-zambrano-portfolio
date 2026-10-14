"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { logAction } from "@/lib/admin";
import { createAdminSupabase } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/admin/proyectos/actions";
import type { LeadStatus } from "@/lib/types";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado");
  return session;
}

const VALID_STATUSES: LeadStatus[] = [
  "nuevo",
  "contactado",
  "en_negociacion",
  "ganado",
  "perdido",
  "archivado",
];

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<ActionResult> {
  try {
    if (!VALID_STATUSES.includes(status)) {
      return { ok: false, message: "Estado no válido" };
    }
    const session = await requireAdmin();
    const supabase = await createAdminSupabase();
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) return { ok: false, message: error.message };
    await logAction(session.email, "actualizar-estado", "leads", id, { status });
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { ok: true, message: "Estado actualizado." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

export async function updateLeadNotes(id: string, notes: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const supabase = await createAdminSupabase();
    const { error } = await supabase.from("leads").update({ notes }).eq("id", id);
    if (error) return { ok: false, message: error.message };
    await logAction(session.email, "actualizar-notas", "leads", id);
    revalidatePath("/admin/leads");
    return { ok: true, message: "Notas guardadas." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

export async function deleteLead(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const supabase = await createAdminSupabase();
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) return { ok: false, message: error.message };
    await logAction(session.email, "eliminar", "leads", id);
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { ok: true, message: "Lead eliminado." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}
