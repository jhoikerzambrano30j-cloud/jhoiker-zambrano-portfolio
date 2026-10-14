import { NotConfigured } from "@/components/admin/NotConfigured";
import { AutomationsManager } from "@/components/admin/AutomationsManager";
import { adminListAutomations } from "@/lib/admin";
import type { Automation } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminAutomatizacionesPage() {
  let automations: Automation[] = [];
  let error: string | null = null;

  try {
    automations = await adminListAutomations();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error desconocido";
  }

  if (error) {
    return <NotConfigured title="No se pudo leer la tabla de automatizaciones" reason={error} />;
  }

  return <AutomationsManager automations={automations} />;
}
