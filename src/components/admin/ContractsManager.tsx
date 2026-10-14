"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
  X,
  FileSignature,
  ArrowUpRight,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";
import { StatusPill } from "@/components/admin/StatusPill";
import { deleteContract } from "@/app/admin/contratos/actions";
import { cn, formatCOP, formatDate } from "@/lib/utils";
import type { Contract, ContractStatus } from "@/lib/types";

const STATUS_FILTERS: (ContractStatus | "todos")[] = [
  "todos",
  "borrador",
  "enviado",
  "en_negociacion",
  "aprobado",
  "firmado",
  "completado",
  "rechazado",
  "cancelado",
];

export function ContractsManager({ contracts }: { contracts: Contract[] }) {
  const [filter, setFilter] = useState<ContractStatus | "todos">("todos");
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contracts.filter((c) => {
      const matchStatus = filter === "todos" || c.status === filter;
      if (!matchStatus) return false;
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.client_name.toLowerCase().includes(q) ||
        (c.client_company ?? "").toLowerCase().includes(q)
      );
    });
  }, [contracts, filter, query]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { todos: contracts.length };
    contracts.forEach((c) => {
      map[c.status] = (map[c.status] ?? 0) + 1;
    });
    return map;
  }, [contracts]);

  const totals = useMemo(
    () => ({
      pipeline: contracts
        .filter((c) => ["borrador", "enviado", "en_negociacion", "aprobado"].includes(c.status))
        .reduce((acc, c) => acc + c.total, 0),
      signed: contracts
        .filter((c) => ["firmado", "completado"].includes(c.status))
        .reduce((acc, c) => acc + c.total, 0),
    }),
    [contracts],
  );

  function onDelete(id: string) {
    startTransition(async () => {
      const result = await deleteContract(id);
      setFeedback(result);
      setConfirmId(null);
    });
  }

  return (
    <div className="space-y-5">
      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5" accent>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel-faint">
            Total contratos
          </p>
          <p className="mt-2 font-display text-2xl font-black text-white">{contracts.length}</p>
        </Card>
        <Card className="p-5" accent>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel-faint">
            Pipeline abierto
          </p>
          <p className="mt-2 font-display text-xl font-black text-cyan-energy">
            {formatCOP(totals.pipeline)}
          </p>
        </Card>
        <Card className="p-5" accent>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel-faint">
            Valor firmado
          </p>
          <p className="mt-2 font-display text-xl font-black text-emerald-300">
            {formatCOP(totals.signed)}
          </p>
        </Card>
      </div>

      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código, título o cliente…"
            className="field pl-9"
            aria-label="Buscar contratos"
          />
        </div>

        <Link href="/admin/contratos/nuevo" className="btn-cyan !px-4 !py-2.5 !text-[0.82rem]">
          <Plus className="h-4 w-4" />
          Nuevo contrato
        </Link>
      </div>

      {/* Filtros de estado */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(
              "rounded-lg border px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.1em] transition-colors",
              filter === status
                ? "border-cyan-energy/50 bg-cyan-energy/12 text-cyan-energy"
                : "border-white/[0.08] bg-white/[0.02] text-steel-dim hover:border-cyan-energy/30 hover:text-chrome",
            )}
          >
            {status === "en_negociacion" ? "en negociación" : status}
            <span className="ml-1.5 text-steel-faint">{counts[status] ?? 0}</span>
          </button>
        ))}
      </div>

      {feedback && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border p-4",
            feedback.ok
              ? "border-emerald-400/30 bg-emerald-400/[0.07] text-emerald-200"
              : "border-rose-400/30 bg-rose-400/[0.07] text-rose-200",
          )}
          role="status"
        >
          {feedback.ok ? <Check className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          <p className="text-[0.84rem]">{feedback.message}</p>
          <button type="button" onClick={() => setFeedback(null)} className="ml-auto rounded p-1 opacity-60 hover:opacity-100" aria-label="Cerrar">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <FileSignature className="mx-auto h-8 w-8 text-steel-faint" />
          <p className="mt-4 text-[0.88rem] text-steel">
            {contracts.length === 0
              ? "Aún no has creado contratos. Empieza con una plantilla predefinida."
              : "No hay contratos que coincidan con el filtro."}
          </p>
          {contracts.length === 0 && (
            <Link href="/admin/contratos/nuevo" className="btn-cyan mt-6">
              <Plus className="h-4 w-4" />
              Crear el primero
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((contract) => (
            <Card key={contract.id} className="p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[0.72rem] font-semibold text-cyan-energy">
                      {contract.code}
                    </span>
                    <StatusPill status={contract.status} />
                    <Badge tone="muted">v{contract.current_version}</Badge>
                    <Badge tone="muted">{contract.clauses.length} cláusulas</Badge>
                  </div>

                  <h3 className="mt-2.5 font-display text-[0.95rem] font-bold text-white">
                    {contract.title}
                  </h3>

                  <div className="mt-1.5 flex flex-wrap items-center gap-3 font-mono text-[0.66rem] text-steel-dim">
                    <span>{contract.client_name}</span>
                    {contract.client_company && (
                      <>
                        <span>·</span>
                        <span>{contract.client_company}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{formatDate(contract.created_at)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <div className="text-right">
                    <p className="font-display text-lg font-black text-white">
                      {formatCOP(contract.total)}
                    </p>
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-steel-faint">
                      Valor total
                    </p>
                  </div>

                  <Link
                    href={`/admin/contratos/${contract.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-cyan-energy/35 bg-cyan-energy/[0.08] px-3.5 py-2 text-[0.8rem] font-semibold text-cyan-energy transition-colors hover:bg-cyan-energy/15"
                  >
                    Negociar
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setConfirmId(contract.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-steel transition-colors hover:border-rose-400/40 hover:text-rose-300"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {confirmId === contract.id && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-rose-400/30 bg-rose-400/[0.06] p-3.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-300" />
                  <p className="text-[0.82rem] text-rose-200">
                    ¿Eliminar el contrato {contract.code}? El historial de versiones se pierde.
                  </p>
                  <div className="ml-auto flex gap-2">
                    <button type="button" onClick={() => setConfirmId(null)} className="rounded-lg border border-white/12 px-3 py-1.5 text-[0.78rem] text-chrome hover:bg-white/[0.05]">
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(contract.id)}
                      disabled={pending}
                      className="inline-flex items-center gap-2 rounded-lg bg-rose-500/90 px-3 py-1.5 text-[0.78rem] font-semibold text-white hover:bg-rose-500"
                    >
                      {pending && <Loader2 className="h-3 w-3 animate-spin" />}
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
