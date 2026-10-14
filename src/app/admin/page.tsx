import Link from "next/link";
import {
  FolderKanban,
  Inbox,
  FileSignature,
  Workflow,
  TrendingUp,
  Clock,
  ArrowUpRight,
  CircleDollarSign,
} from "lucide-react";
import { Card, Badge, Stat } from "@/components/ui/Primitives";
import { NotConfigured } from "@/components/admin/NotConfigured";
import { StatusPill } from "@/components/admin/StatusPill";
import { adminDashboardStats } from "@/lib/admin";
import { formatCOP, formatDate } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types";

export const dynamic = "force-dynamic";

function QuickCard({
  href,
  label,
  value,
  sub,
  icon: Icon,
  tone = "cyan",
}: {
  href: string;
  label: string;
  value: string | number;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "cyan" | "indigo" | "emerald" | "amber";
}) {
  const tones = {
    cyan: "border-cyan-energy/25 bg-cyan-energy/[0.07] text-cyan-energy",
    indigo: "border-indigo-automation/25 bg-indigo-automation/[0.07] text-indigo-automation",
    emerald: "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300",
    amber: "border-amber-400/25 bg-amber-400/[0.07] text-amber-300",
  };

  return (
    <Link
      href={href}
      className="surface-card group rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-energy/35"
    >
      <div className="flex items-start justify-between">
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-steel-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-energy" />
      </div>
      <p className="mt-5 font-display text-3xl font-black text-white">{value}</p>
      <p className="mt-1.5 text-[0.82rem] font-medium text-chrome">{label}</p>
      <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-steel-faint">
        {sub}
      </p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  let stats: DashboardStats | null = null;
  let error: string | null = null;

  try {
    stats = await adminDashboardStats();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error desconocido al consultar la base de datos.";
  }

  if (!stats) {
    return (
      <NotConfigured
        title="No se pudo leer la base de datos"
        reason={error ?? undefined}
      />
    );
  }

  const maxContractCount = Math.max(...stats.contractsByStatus.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      {/* Accesos rápidos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickCard
          href="/admin/proyectos"
          label="Proyectos en el portafolio"
          value={stats.projects}
          sub={`${stats.publishedProjects} publicados`}
          icon={FolderKanban}
        />
        <QuickCard
          href="/admin/contratos"
          label="Contratos gestionados"
          value={stats.contracts}
          sub={`${stats.signedContracts} firmados`}
          icon={FileSignature}
          tone="indigo"
        />
        <QuickCard
          href="/admin/leads"
          label="Leads recibidos"
          value={stats.leads}
          sub={`${stats.newLeads} sin atender`}
          icon={Inbox}
          tone="amber"
        />
        <QuickCard
          href="/admin/automatizaciones"
          label="Automatizaciones"
          value={stats.automations}
          sub={`${stats.activeAutomations} activas`}
          icon={Workflow}
          tone="emerald"
        />
      </div>

      {/* Métricas económicas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6" accent>
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-cyan-energy" />
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel-faint">
              Pipeline abierto
            </span>
          </div>
          <p className="mt-4 font-display text-2xl font-black text-white">
            {formatCOP(stats.pipelineValue)}
          </p>
          <p className="mt-1 font-mono text-[0.64rem] text-steel-dim">
            Contratos en negociación y aprobados
          </p>
        </Card>

        <Card className="p-6" accent>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel-faint">
              Valor firmado
            </span>
          </div>
          <p className="mt-4 font-display text-2xl font-black text-white">
            {formatCOP(stats.signedValue)}
          </p>
          <p className="mt-1 font-mono text-[0.64rem] text-steel-dim">
            Contratos firmados y completados
          </p>
        </Card>

        <Card className="p-6" accent>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-automation" />
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel-faint">
              Horas automatizadas
            </span>
          </div>
          <p className="mt-4 font-display text-2xl font-black text-white">
            {stats.savedHoursMonth} h
          </p>
          <p className="mt-1 font-mono text-[0.64rem] text-steel-dim">Ahorradas al mes</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contratos por estado */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-white">Contratos por estado</h2>
            <Link
              href="/admin/contratos"
              className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-cyan-energy"
            >
              Gestionar
            </Link>
          </div>

          {stats.contractsByStatus.length === 0 ? (
            <p className="mt-6 text-[0.84rem] text-steel-dim">Aún no hay contratos registrados.</p>
          ) : (
            <div className="mt-6 space-y-3.5">
              {stats.contractsByStatus.map((row) => (
                <div key={row.status}>
                  <div className="flex items-center justify-between">
                    <StatusPill status={row.status} />
                    <span className="font-mono text-[0.72rem] text-chrome">{row.count}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-energy to-indigo-automation"
                      style={{ width: `${(row.count / maxContractCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Leads recientes */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-white">Leads recientes</h2>
            <Link
              href="/admin/leads"
              className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-cyan-energy"
            >
              Ver todos
            </Link>
          </div>

          {stats.recentLeads.length === 0 ? (
            <p className="mt-6 text-[0.84rem] text-steel-dim">
              Todavía no has recibido solicitudes desde el sitio.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {stats.recentLeads.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-white/[0.07] p-3.5 transition-colors hover:border-cyan-energy/25"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[0.86rem] font-semibold text-white">{lead.name}</p>
                    <p className="truncate font-mono text-[0.68rem] text-steel-dim">{lead.email}</p>
                    <p className="mt-1 line-clamp-1 text-[0.76rem] text-steel">{lead.message}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusPill status={lead.status} />
                    <p className="mt-1.5 font-mono text-[0.6rem] text-steel-faint">
                      {formatDate(lead.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Contratos recientes */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-white">Contratos recientes</h2>
          <Link
            href="/admin/contratos/nuevo"
            className="btn-cyan !px-3.5 !py-2 !text-[0.78rem]"
          >
            Nuevo contrato
          </Link>
        </div>

        {stats.recentContracts.length === 0 ? (
          <p className="mt-6 text-[0.84rem] text-steel-dim">
            Crea tu primer contrato desde una plantilla en menos de un minuto.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  {["Código", "Cliente", "Estado", "Versión", "Valor", "Actualizado"].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentContracts.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-white/[0.05] transition-colors last:border-0 hover:bg-cyan-energy/[0.03]"
                  >
                    <td className="px-3 py-3">
                      <Link
                        href={`/admin/contratos/${c.id}`}
                        className="font-mono text-[0.74rem] text-cyan-energy"
                      >
                        {c.code}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-[0.82rem] text-chrome">{c.client_name}</td>
                    <td className="px-3 py-3">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-3 py-3 font-mono text-[0.72rem] text-steel">
                      v{c.current_version}
                    </td>
                    <td className="px-3 py-3 font-mono text-[0.76rem] text-chrome">
                      {formatCOP(c.total)}
                    </td>
                    <td className="px-3 py-3 font-mono text-[0.68rem] text-steel-faint">
                      {formatDate(c.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Distribución de leads */}
      {stats.leadsByStatus.length > 0 && (
        <Card className="p-6">
          <h2 className="font-display text-base font-bold text-white">Leads por estado</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {stats.leadsByStatus.map((row) => (
              <div
                key={row.status}
                className="flex items-center gap-3 rounded-lg border border-white/[0.07] px-4 py-2.5"
              >
                <StatusPill status={row.status} />
                <span className="font-display text-lg font-black text-white">{row.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
