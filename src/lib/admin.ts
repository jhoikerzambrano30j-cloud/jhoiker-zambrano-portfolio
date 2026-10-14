import { createAdminSupabase } from "./supabase/server";
import type {
  AuditLog,
  Automation,
  Contract,
  DashboardStats,
  Lead,
  Project,
  Service,
} from "./types";

/**
 * Acceso a datos del panel de administración.
 * Usa el cliente con service role (solo servidor) y salta RLS:
 * por eso TODAS las rutas que lo usan deben validar la sesión de admin antes.
 */

export async function adminListProjects(): Promise<Project[]> {
  const supabase = await createAdminSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Project[];
}

export async function adminListServices(): Promise<Service[]> {
  const supabase = await createAdminSupabase();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Service[];
}

export async function adminListAutomations(): Promise<Automation[]> {
  const supabase = await createAdminSupabase();
  const { data, error } = await supabase
    .from("automations")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Automation[];
}

export async function adminListLeads(limit = 200): Promise<Lead[]> {
  const supabase = await createAdminSupabase();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Lead[];
}

export async function adminListContracts(limit = 200): Promise<Contract[]> {
  const supabase = await createAdminSupabase();
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Contract[];
}

export async function adminGetContract(id: string): Promise<Contract | null> {
  const supabase = await createAdminSupabase();
  const { data, error } = await supabase.from("contracts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Contract) ?? null;
}

export async function adminListAudit(limit = 100): Promise<AuditLog[]> {
  const supabase = await createAdminSupabase();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as AuditLog[];
}

/** Registra una acción en la bitácora de auditoría. */
export async function logAction(
  actorEmail: string,
  action: string,
  entity: string,
  entityId: string | null,
  detail: Record<string, unknown> | null = null,
) {
  try {
    const supabase = await createAdminSupabase();
    await supabase.from("audit_log").insert({
      actor_email: actorEmail,
      action,
      entity,
      entity_id: entityId,
      detail,
    });
  } catch {
    // La auditoría nunca debe tumbar la operación principal.
  }
}

/** Métricas agregadas del panel. */
export async function adminDashboardStats(): Promise<DashboardStats> {
  const supabase = await createAdminSupabase();

  const [projects, services, automations, leads, contracts] = await Promise.all([
    adminListProjects(),
    adminListServices(),
    adminListAutomations(),
    adminListLeads(50),
    adminListContracts(50),
  ]);

  const signedStatuses: Contract["status"][] = ["firmado", "completado"];
  const openStatuses: Contract["status"][] = [
    "borrador",
    "enviado",
    "en_negociacion",
    "aprobado",
  ];

  const contractsByStatus = contracts.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});

  const leadsByStatus = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  const { count: totalContracts } = await supabase
    .from("contracts")
    .select("id", { count: "exact", head: true });

  const { count: totalLeads } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true });

  return {
    projects: projects.length,
    publishedProjects: projects.filter((p) => p.status === "publicado").length,
    services: services.length,
    automations: automations.length,
    activeAutomations: automations.filter((a) => a.status === "activa").length,
    leads: totalLeads ?? leads.length,
    newLeads: leads.filter((l) => l.status === "nuevo").length,
    contracts: totalContracts ?? contracts.length,
    signedContracts: contracts.filter((c) => signedStatuses.includes(c.status)).length,
    pipelineValue: contracts
      .filter((c) => openStatuses.includes(c.status))
      .reduce((acc, c) => acc + (c.total ?? 0), 0),
    signedValue: contracts
      .filter((c) => signedStatuses.includes(c.status))
      .reduce((acc, c) => acc + (c.total ?? 0), 0),
    savedHoursMonth: automations
      .filter((a) => a.status === "activa")
      .reduce((acc, a) => acc + (a.saved_hours_month ?? 0), 0),
    recentLeads: leads.slice(0, 5),
    recentContracts: contracts.slice(0, 5),
    contractsByStatus: Object.entries(contractsByStatus).map(([status, count]) => ({
      status: status as Contract["status"],
      count,
    })),
    leadsByStatus: Object.entries(leadsByStatus).map(([status, count]) => ({
      status: status as Lead["status"],
      count,
    })),
  };
}

/** Siguiente consecutivo de contrato. */
export async function nextContractCode(): Promise<string> {
  const year = new Date().getFullYear();
  const supabase = await createAdminSupabase();
  const { count } = await supabase
    .from("contracts")
    .select("id", { count: "exact", head: true })
    .like("code", `JZ-CT-${year}-%`);
  const seq = (count ?? 0) + 1;
  return `JZ-CT-${year}-${String(seq).padStart(4, "0")}`;
}
