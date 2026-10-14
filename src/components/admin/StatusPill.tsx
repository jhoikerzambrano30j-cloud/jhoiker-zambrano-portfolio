import { Badge } from "@/components/ui/Primitives";
import type { ContractStatus, LeadStatus, ProjectStatus } from "@/lib/types";

type AnyStatus = ContractStatus | LeadStatus | ProjectStatus | string;

type Tone = "neutral" | "cyan" | "indigo" | "success" | "warn" | "danger" | "muted";

const MAP: Record<string, { label: string; tone: Tone }> = {
  // Contratos
  borrador: { label: "Borrador", tone: "muted" },
  enviado: { label: "Enviado", tone: "cyan" },
  en_negociacion: { label: "En negociación", tone: "indigo" },
  aprobado: { label: "Aprobado", tone: "success" },
  firmado: { label: "Firmado", tone: "success" },
  rechazado: { label: "Rechazado", tone: "danger" },
  cancelado: { label: "Cancelado", tone: "danger" },
  completado: { label: "Completado", tone: "success" },
  // Leads
  nuevo: { label: "Nuevo", tone: "cyan" },
  contactado: { label: "Contactado", tone: "indigo" },
  ganado: { label: "Ganado", tone: "success" },
  perdido: { label: "Perdido", tone: "danger" },
  archivado: { label: "Archivado", tone: "muted" },
  // Proyectos
  publicado: { label: "Publicado", tone: "success" },
  activa: { label: "Activa", tone: "success" },
  activo: { label: "Activo", tone: "success" },
  pausada: { label: "Pausada", tone: "warn" },
  error: { label: "Con error", tone: "danger" },
};

/** Etiqueta de estado unificada, con color y texto en español. */
export function StatusPill({ status, className }: { status: AnyStatus; className?: string }) {
  const entry = MAP[status] ?? { label: status, tone: "neutral" as Tone };
  return (
    <Badge tone={entry.tone} className={className}>
      {entry.label}
    </Badge>
  );
}

export const STATUS_OPTIONS = {
  contract: [
    "borrador",
    "enviado",
    "en_negociacion",
    "aprobado",
    "firmado",
    "rechazado",
    "cancelado",
    "completado",
  ] as ContractStatus[],
  lead: ["nuevo", "contactado", "en_negociacion", "ganado", "perdido", "archivado"] as LeadStatus[],
  project: ["publicado", "borrador", "archivado"] as ProjectStatus[],
};
