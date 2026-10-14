import { NotConfigured } from "@/components/admin/NotConfigured";
import { LeadsManager } from "@/components/admin/LeadsManager";
import { adminListLeads } from "@/lib/admin";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  let leads: Lead[] = [];
  let error: string | null = null;

  try {
    leads = await adminListLeads();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error desconocido";
  }

  if (error) {
    return <NotConfigured title="No se pudo leer la tabla de leads" reason={error} />;
  }

  return <LeadsManager leads={leads} />;
}
