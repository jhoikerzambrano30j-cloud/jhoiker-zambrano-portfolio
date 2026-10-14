import {
  Server,
  GitBranch,
  Globe,
  DatabaseBackup,
  Activity,
  ShieldCheck,
  type LucideIcon,
  Info,
  ExternalLink,
  Check,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";
import { getInfrastructureCapabilities } from "@/lib/data";

export const dynamic = "force-dynamic";

const ICONS: Record<string, LucideIcon> = {
  server: Server,
  "git-branch": GitBranch,
  globe: Globe,
  "database-backup": DatabaseBackup,
  activity: Activity,
  "shield-check": ShieldCheck,
};

/**
 * Referencia de las capacidades de infraestructura que muestra el sitio
 * público. Es contenido curado en el código (`src/lib/content.ts`), no una
 * tabla de la base de datos: son la descripción técnica de un servicio, no
 * datos que cambien a diario.
 */
export default function AdminInfraestructuraPage() {
  const capabilities = getInfrastructureCapabilities();

  return (
    <div className="space-y-6">
      {/* Nota explicativa */}
      <Card className="border-cyan-energy/25 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-energy/25 bg-cyan-energy/[0.08]">
            <Info className="h-5 w-5 text-cyan-energy" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold text-white">
              Contenido de la página de infraestructura
            </h2>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-steel">
              Estas seis áreas son lo que ve un visitante en{" "}
              <a
                href="/infraestructura"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[0.8rem] text-cyan-energy hover:underline"
              >
                /infraestructura
                <ExternalLink className="h-3 w-3" />
              </a>
              . Se editan en el archivo{" "}
              <span className="font-mono text-[0.8rem] text-chrome">
                src/lib/content.ts
              </span>
              , dentro de <span className="font-mono text-[0.8rem] text-chrome">FALLBACK_CAPABILITIES</span>,
              porque describen un servicio y no cambian con frecuencia.
            </p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-steel-dim">
              Si prefieres poder editarlas desde aquí, se puede añadir una tabla en la base de datos:
              pídelo y se implementa.
            </p>
          </div>
        </div>
      </Card>

      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5" accent>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel-faint">
            Áreas publicadas
          </p>
          <p className="mt-2 font-display text-2xl font-black text-white">
            {capabilities.length}
          </p>
        </Card>
        <Card className="p-5" accent>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel-faint">
            Detalles listados
          </p>
          <p className="mt-2 font-display text-2xl font-black text-white">
            {capabilities.reduce((acc, c) => acc + c.details.length, 0)}
          </p>
        </Card>
        <Card className="p-5" accent>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel-faint">
            Origen del contenido
          </p>
          <p className="mt-2 font-display text-lg font-black text-cyan-energy">
            Código
          </p>
        </Card>
      </div>

      {/* Capacidades */}
      <div className="grid gap-6 lg:grid-cols-2">
        {capabilities.map((cap) => {
          const Icon = ICONS[cap.icon] ?? Server;
          return (
            <Card key={cap.id} className="flex h-full flex-col p-6" accent>
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                  <Icon className="h-5.5 w-5.5 text-cyan-energy" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold text-white">{cap.name}</h3>
                    <Badge tone="muted">orden {cap.sort_order}</Badge>
                  </div>
                  <p className="mt-1 font-mono text-[0.62rem] text-steel-faint">
                    /infraestructura · {cap.slug} · icono: {cap.icon}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[0.86rem] leading-relaxed text-steel">{cap.summary}</p>

              <ul className="mt-5 space-y-2 border-t border-white/[0.07] pt-5">
                {cap.details.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-[0.82rem] leading-snug text-chrome">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-energy" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
