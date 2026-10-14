"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { logAction, nextContractCode } from "@/lib/admin";
import { createAdminSupabase } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/contracts/templates";
import {
  applyPaymentPlan,
  bumpVersion,
  instantiateTemplate,
  recalcTotals,
} from "@/lib/contracts/engine";
import { DEFAULT_PAYMENT_PLANS } from "@/lib/contracts/templates";
import type { ActionResult } from "@/app/admin/proyectos/actions";
import type { Contract, ContractClause, ContractStatus } from "@/lib/types";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado");
  return session;
}

function revalidateAll(id?: string) {
  revalidatePath("/admin/contratos");
  revalidatePath("/admin");
  if (id) revalidatePath(`/admin/contratos/${id}`);
}

const createSchema = z.object({
  template_slug: z.string().min(1, "Selecciona una plantilla"),
  client_name: z.string().min(3, "El nombre del cliente es obligatorio"),
  client_company: z.string().optional().or(z.literal("")),
  client_email: z.string().email("Correo del cliente no válido").optional().or(z.literal("")),
  client_doc_id: z.string().optional().or(z.literal("")),
  client_address: z.string().optional().or(z.literal("")),
  total: z.coerce.number().min(1, "El valor debe ser mayor que cero"),
  duration_days: z.coerce.number().int().min(1, "El plazo debe ser mayor que cero"),
  warranty_days: z.coerce.number().int().min(0).optional(),
  start_date: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  scope: z.string().optional().or(z.literal("")),
});

/** Crea un contrato nuevo a partir de una plantilla predefinida. */
export async function createContract(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult & { id?: string }> {
  try {
    const session = await requireAdmin();

    const parsed = createSchema.safeParse({
      template_slug: formData.get("template_slug"),
      client_name: formData.get("client_name"),
      client_company: formData.get("client_company"),
      client_email: formData.get("client_email"),
      client_doc_id: formData.get("client_doc_id"),
      client_address: formData.get("client_address"),
      total: formData.get("total"),
      duration_days: formData.get("duration_days"),
      warranty_days: formData.get("warranty_days") || 0,
      start_date: formData.get("start_date"),
      city: formData.get("city"),
      scope: formData.get("scope"),
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }

    const d = parsed.data;
    const template = getTemplate(d.template_slug);
    if (!template) return { ok: false, message: "Plantilla no encontrada" };

    const startDate = d.start_date ? new Date(d.start_date) : new Date();
    const code = await nextContractCode();

    const draft = instantiateTemplate(template, {
      code,
      cliente: d.client_name,
      empresa: d.client_company || undefined,
      doc_id: d.client_doc_id || undefined,
      email_cliente: d.client_email || undefined,
      contratista: session.fullName,
      valor: d.total,
      plazo: d.duration_days,
      garantia: d.warranty_days ?? template.warranty_days,
      fecha_inicio: startDate,
      ciudad: d.city || "Colombia",
      alcance: d.scope || undefined,
    });

    const payload = {
      code,
      title: `${template.name} — ${d.client_name}`,
      status: "borrador" as ContractStatus,
      template_slug: template.slug,
      client_name: d.client_name,
      client_company: d.client_company || null,
      client_email: d.client_email || null,
      client_doc_id: d.client_doc_id || null,
      client_address: d.client_address || null,
      scope: draft.scope,
      deliverables: draft.deliverables,
      exclusions: draft.exclusions,
      total: draft.total,
      currency: draft.currency,
      payment_plan: draft.payment_plan,
      start_date: startDate.toISOString().slice(0, 10),
      duration_days: d.duration_days,
      warranty_days: d.warranty_days ?? template.warranty_days,
      clauses: draft.clauses,
      negotiation_log: draft.negotiation_log,
      versions: draft.versions,
      current_version: 1,
      notes: null,
    };

    const supabase = await createAdminSupabase();
    const { data, error } = await supabase.from("contracts").insert(payload).select("id").single();

    if (error) return { ok: false, message: error.message };

    await logAction(session.email, "crear", "contracts", data?.id ?? null, { code });
    revalidateAll();

    return { ok: true, message: `Contrato ${code} creado.`, id: data?.id };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

const clauseSchema = z.object({
  clause_id: z.string().min(1),
  title: z.string().min(2, "El título es obligatorio"),
  body: z.string().min(10, "El cuerpo de la cláusula es obligatorio"),
});

/** Actualiza una cláusula negociable y registra la versión. */
export async function updateContractClause(
  contractId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = clauseSchema.safeParse({
      clause_id: formData.get("clause_id"),
      title: formData.get("title"),
      body: formData.get("body"),
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }

    const supabase = await createAdminSupabase();
    const { data: contract, error: readError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .maybeSingle();

    if (readError) return { ok: false, message: readError.message };
    if (!contract) return { ok: false, message: "Contrato no encontrado" };

    const current = contract as Contract;
    const target = current.clauses.find((c) => c.id === parsed.data.clause_id);
    if (!target) return { ok: false, message: "Cláusula no encontrada" };
    if (target.locked) {
      return {
        ok: false,
        message: "Esta cláusula es jurídicamente sensible y está bloqueada para edición.",
      };
    }

    const updatedClauses: ContractClause[] = current.clauses.map((c) =>
      c.id === parsed.data.clause_id
        ? { ...c, title: parsed.data.title, body: parsed.data.body }
        : c,
    );

    const nextState = bumpVersion(
      { ...current, clauses: updatedClauses },
      `Cláusula ${target.order} «${target.title}» modificada`,
      session.fullName,
    );

    const { error } = await supabase
      .from("contracts")
      .update({
        clauses: nextState.clauses,
        negotiation_log: nextState.negotiation_log,
        versions: nextState.versions,
        current_version: nextState.current_version,
      })
      .eq("id", contractId);

    if (error) return { ok: false, message: error.message };

    await logAction(session.email, "editar-clausula", "contracts", contractId, {
      clause: target.id,
    });
    revalidateAll(contractId);

    return { ok: true, message: `Cláusula ${target.order} actualizada a la versión ${nextState.current_version}.` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

/** Cambia el estado del contrato y lo registra en la bitácora. */
export async function updateContractStatus(
  contractId: string,
  status: ContractStatus,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const supabase = await createAdminSupabase();

    const { data: contract, error: readError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .maybeSingle();

    if (readError) return { ok: false, message: readError.message };
    if (!contract) return { ok: false, message: "Contrato no encontrado" };

    const current = contract as Contract;
    const withLog: Contract = {
      ...current,
      status,
      negotiation_log: [
        ...current.negotiation_log,
        {
          at: new Date().toISOString(),
          actor: session.fullName,
          action: "cambio-de-estado",
          detail: `${current.status} → ${status}`,
        },
      ],
    };

    const { error } = await supabase
      .from("contracts")
      .update({ status, negotiation_log: withLog.negotiation_log })
      .eq("id", contractId);

    if (error) return { ok: false, message: error.message };

    await logAction(session.email, "cambiar-estado", "contracts", contractId, { status });
    revalidateAll(contractId);

    return { ok: true, message: "Estado actualizado." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

const valueSchema = z.object({
  total: z.coerce.number().min(1, "El valor debe ser mayor que cero"),
  duration_days: z.coerce.number().int().min(1),
  warranty_days: z.coerce.number().int().min(0),
});

/** Actualiza valor, plazo y garantía, recalculando el plan de pagos. */
export async function updateContractValue(
  contractId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = valueSchema.safeParse({
      total: formData.get("total"),
      duration_days: formData.get("duration_days"),
      warranty_days: formData.get("warranty_days"),
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" };
    }

    const d = parsed.data;
    const supabase = await createAdminSupabase();

    const { data: contract, error: readError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .maybeSingle();

    if (readError) return { ok: false, message: readError.message };
    if (!contract) return { ok: false, message: "Contrato no encontrado" };

    const current = contract as Contract;
    const recalculated = recalcTotals({
      ...current,
      total: d.total,
      duration_days: d.duration_days,
      warranty_days: d.warranty_days,
    });

    const nextState = bumpVersion(
      recalculated,
      `Valor actualizado a ${d.total} con plazo de ${d.duration_days} días`,
      session.fullName,
    );

    const { error } = await supabase
      .from("contracts")
      .update({
        total: nextState.total,
        duration_days: nextState.duration_days,
        warranty_days: nextState.warranty_days,
        payment_plan: nextState.payment_plan,
        negotiation_log: nextState.negotiation_log,
        versions: nextState.versions,
        current_version: nextState.current_version,
      })
      .eq("id", contractId);

    if (error) return { ok: false, message: error.message };

    await logAction(session.email, "editar-valor", "contracts", contractId, { total: d.total });
    revalidateAll(contractId);

    return { ok: true, message: "Condiciones económicas actualizadas." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

/** Aplica un plan de pagos predefinido por nombre. */
export async function applyPaymentPlanPreset(
  contractId: string,
  presetKey: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const plan = DEFAULT_PAYMENT_PLANS[presetKey];
    if (!plan) return { ok: false, message: "Plan de pagos no encontrado" };

    const supabase = await createAdminSupabase();
    const { data: contract, error: readError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .maybeSingle();

    if (readError) return { ok: false, message: readError.message };
    if (!contract) return { ok: false, message: "Contrato no encontrado" };

    const current = contract as Contract;
    const applied = applyPaymentPlan(current, plan);
    const nextState = bumpVersion(
      applied,
      `Plan de pagos cambiado a ${plan.map((p) => `${p.percent}%`).join(" / ")}`,
      session.fullName,
    );

    const { error } = await supabase
      .from("contracts")
      .update({
        payment_plan: nextState.payment_plan,
        negotiation_log: nextState.negotiation_log,
        versions: nextState.versions,
        current_version: nextState.current_version,
      })
      .eq("id", contractId);

    if (error) return { ok: false, message: error.message };

    await logAction(session.email, "editar-pagos", "contracts", contractId, { presetKey });
    revalidateAll(contractId);

    return { ok: true, message: "Plan de pagos actualizado." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}

/** Elimina un contrato. */
export async function deleteContract(contractId: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const supabase = await createAdminSupabase();
    const { error } = await supabase.from("contracts").delete().eq("id", contractId);
    if (error) return { ok: false, message: error.message };
    await logAction(session.email, "eliminar", "contracts", contractId);
    revalidateAll();
    return { ok: true, message: "Contrato eliminado." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Error inesperado" };
  }
}
