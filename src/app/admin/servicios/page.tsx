import { NotConfigured } from "@/components/admin/NotConfigured";
import { ServicesManager } from "@/components/admin/ServicesManager";
import { adminListServices } from "@/lib/admin";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminServiciosPage() {
  let services: Service[] = [];
  let error: string | null = null;

  try {
    services = await adminListServices();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error desconocido";
  }

  if (error) {
    return <NotConfigured title="No se pudo leer la tabla de servicios" reason={error} />;
  }

  return <ServicesManager services={services} />;
}
