import { NotConfigured } from "@/components/admin/NotConfigured";
import { ContractsManager } from "@/components/admin/ContractsManager";
import { adminListContracts } from "@/lib/admin";
import type { Contract } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminContratosPage() {
  let contracts: Contract[] = [];
  let error: string | null = null;

  try {
    contracts = await adminListContracts();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error desconocido";
  }

  if (error) {
    return <NotConfigured title="No se pudo leer la tabla de contratos" reason={error} />;
  }

  return <ContractsManager contracts={contracts} />;
}
