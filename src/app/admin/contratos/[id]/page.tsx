import { notFound } from "next/navigation";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { ContractWorkspace } from "@/components/admin/ContractWorkspace";
import { adminGetContract } from "@/lib/admin";
import type { Contract } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminContratoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let contract: Contract | null = null;
  let error: string | null = null;

  try {
    contract = await adminGetContract(id);
  } catch (err) {
    error = err instanceof Error ? err.message : "Error desconocido";
  }

  if (error) {
    return <NotConfigured title="No se pudo cargar el contrato" reason={error} />;
  }

  if (!contract) notFound();

  return <ContractWorkspace contract={contract} />;
}
