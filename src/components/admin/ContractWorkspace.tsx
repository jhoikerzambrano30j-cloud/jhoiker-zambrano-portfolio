"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Unlock,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Download,
  Printer,
  History,
  MessagesSquare,
  Save,
  FileSignature,
  ChevronDown,
  Copy,
  CircleDot,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";
import { StatusPill } from "@/components/admin/StatusPill";
import {
  updateContractClause,
  updateContractStatus,
  updateContractValue,
  applyPaymentPlanPreset,
} from "@/app/admin/contratos/actions";
import {
  CONTRACT_STATUSES,
  contractProgress,
  negotiationSummary,
} from "@/lib/contracts/engine";
import { downloadContractPdf, printContractPdf } from "@/lib/contracts/pdf";
import { DEFAULT_PAYMENT_PLANS } from "@/lib/contracts/templates";
import { cn, formatCOP, formatDate } from "@/lib/utils";
import type { Contract, ContractStatus } from "@/lib/types";

const CLAUSE_CATEGORY_LABEL: Record<string, string> = {
  general: "General",
  tecnico: "Técnico",
  legal: "Legal",
  economico: "Económico",
  propiedad: "Propiedad intelectual",
};

export function ContractWorkspace({ contract }: { contract: Contract }) {
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ title: string; body: string }>({ title: "", body: "" });
  const [showLog, setShowLog] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showEconomic, setShowEconomic] = useState(false);
  const [economicDraft, setEconomicDraft] = useState({
    total: contract.total,
    duration_days: contract.duration_days ?? 30,
    warranty_days: contract.warranty_days ?? 30,
  });

  const summary = useMemo(() => negotiationSummary(contract), [contract]);
  const progress = contractProgress(contract);
  const statusMeta = CONTRACT_STATUSES.find((s) => s.value === contract.status);

  function startEdit(clauseId: string) {
    const clause = contract.clauses.find((c) => c.id === clauseId);
    if (!clause || clause.locked) return;
    setEditingId(clauseId);
    setDraft({ title: clause.title, body: clause.body });
  }

  function saveClause(formData: FormData) {
    startTransition(async () => {
      const result = await updateContractClause(contract.id, { ok: false, message: "" }, formData);
      setFeedback(result);
      if (result.ok) setEditingId(null);
    });
  }

  function changeStatus(status: ContractStatus) {
    startTransition(async () => {
      setFeedback(await updateContractStatus(contract.id, status));
    });
  }

  function saveEconomic(formData: FormData) {
    startTransition(async () => {
      const result = await updateContractValue(contract.id, { ok: false, message: "" }, formData);
      setFeedback(result);
      if (result.ok) setShowEconomic(false);
    });
  }

  function applyPreset(key: string) {
    startTransition(async () => {
      setFeedback(await applyPaymentPlanPreset(contract.id, key));
    });
  }

  function exportPdf() {
    startTransition(async () => {
      try {
        await downloadContractPdf(contract, { ownerName: "Jhoiker Zambrano" });
      } catch (err) {
        setFeedback({
          ok: false,
          message: err instanceof Error ? err.message : "No se pudo generar el PDF",
        });
      }
    });
  }

  function printPdf() {
    startTransition(async () => {
      try {
        await printContractPdf(contract, { ownerName: "Jhoiker Zambrano" });
      } catch (err) {
        setFeedback({
          ok: false,
          message: err instanceof Error ? err.message : "No se pudo imprimir el contrato",
        });
      }
    });
  }

  async function copyPlainText() {
    try {
      const { contractToPlainText } = await import("@/lib/contracts/engine");
      await navigator.clipboard.writeText(contractToPlainText(contract));
      setFeedback({ ok: true, message: "Contrato copiado en texto plano al portapapeles." });
    } catch {
      setFeedback({ ok: false, message: "El navegador bloqueó el acceso al portapapeles." });
    }
  }

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <Card className="p-5" accent>
        <Link
          href="/admin/contratos"
          className="group inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel-dim transition-colors hover:text-cyan-energy"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Volver a contratos
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[0.78rem] font-semibold text-cyan-energy">
                {contract.code}
              </span>
              <StatusPill status={contract.status} />
              <Badge tone="muted">v{contract.current_version}</Badge>
            </div>

            <h1 className="mt-3 font-display text-xl font-black text-white sm:text-2xl">
              {contract.title}
            </h1>

            <p className="mt-2 font-mono text-[0.68rem] text-steel-dim">
              {contract.client_name}
              {contract.client_company ? ` · ${contract.client_company}` : ""}
              {contract.client_email ? ` · ${contract.client_email}` : ""}
            </p>
          </div>

          {/* Progreso */}
          <div className="w-full max-w-xs">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel-faint">
                Avance del contrato
              </span>
              <span className="font-display text-lg font-black text-cyan-energy">{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-energy to-indigo-automation shadow-[0_0_10px_rgba(56,189,248,0.7)] motion-safe:transition-[width] motion-safe:duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            {statusMeta && (
              <p className="mt-2 text-[0.74rem] leading-snug text-steel">{statusMeta.description}</p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-white/[0.07] pt-5">
          <button type="button" onClick={exportPdf} disabled={pending} className="btn-cyan !px-4 !py-2.5 !text-[0.8rem]">
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Descargar PDF
          </button>

          <button type="button" onClick={printPdf} disabled={pending} className="btn-ghost !px-4 !py-2.5 !text-[0.8rem]">
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </button>

          <button type="button" onClick={copyPlainText} className="btn-ghost !px-4 !py-2.5 !text-[0.8rem]">
            <Copy className="h-3.5 w-3.5" />
            Copiar texto
          </button>

          <button
            type="button"
            onClick={() => setShowLog((v) => !v)}
            className="btn-ghost !px-4 !py-2.5 !text-[0.8rem]"
          >
            <MessagesSquare className="h-3.5 w-3.5" />
            Bitácora ({contract.negotiation_log.length})
          </button>

          <button
            type="button"
            onClick={() => setShowVersions((v) => !v)}
            className="btn-ghost !px-4 !py-2.5 !text-[0.8rem]"
          >
            <History className="h-3.5 w-3.5" />
            Versiones ({contract.versions.length})
          </button>
        </div>
      </Card>

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

      {/* Bitácora */}
      {showLog && (
        <Card className="p-5">
          <h2 className="font-display text-base font-bold text-white">Bitácora de negociación</h2>
          <ol className="mt-5 space-y-0">
            {[...contract.negotiation_log].reverse().map((entry, i, arr) => (
              <li key={`${entry.at}-${i}`} className="relative flex gap-4 pb-5 last:pb-0">
                {i < arr.length - 1 && (
                  <span className="absolute left-[7px] top-5 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-cyan-energy/40 to-transparent" />
                )}
                <span className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-cyan-energy/60 bg-obsidian">
                  <span className="absolute inset-[3px] rounded-full bg-cyan-energy" />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.84rem] text-chrome">{entry.detail}</p>
                  <p className="mt-0.5 font-mono text-[0.64rem] text-steel-faint">
                    {entry.actor} · {formatDate(entry.at, true)} · {entry.action}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Versiones */}
      {showVersions && (
        <Card className="p-5">
          <h2 className="font-display text-base font-bold text-white">Historial de versiones</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  {["Versión", "Fecha", "Autor", "Nota", "Cláusulas", "Valor"].map((h) => (
                    <th key={h} className="px-3 py-3 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...contract.versions].reverse().map((v) => (
                  <tr key={`${v.version}-${v.created_at}`} className="border-b border-white/[0.05] last:border-0">
                    <td className="px-3 py-2.5 font-mono text-[0.72rem] text-cyan-energy">v{v.version}</td>
                    <td className="px-3 py-2.5 font-mono text-[0.68rem] text-steel-faint">
                      {formatDate(v.created_at, true)}
                    </td>
                    <td className="px-3 py-2.5 text-[0.8rem] text-chrome">{v.author}</td>
                    <td className="px-3 py-2.5 text-[0.8rem] text-steel">{v.note}</td>
                    <td className="px-3 py-2.5 font-mono text-[0.72rem] text-steel">{v.clauses_count}</td>
                    <td className="px-3 py-2.5 font-mono text-[0.72rem] text-chrome">{formatCOP(v.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        {/* Cláusulas */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold text-white">
              Cláusulas del contrato
            </h2>
            <div className="flex items-center gap-2 font-mono text-[0.64rem] text-steel-faint">
              <span className="inline-flex items-center gap-1.5">
                <Unlock className="h-3 w-3 text-cyan-energy" />
                {summary.editableClauses} negociables
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-amber-300" />
                {summary.lockedClauses} bloqueadas
              </span>
              <span>·</span>
              <span>{summary.changes} cambios</span>
            </div>
          </div>

          {contract.clauses.map((clause) => {
            const isEditing = editingId === clause.id;
            return (
              <Card
                key={clause.id}
                className={cn(
                  "p-5 transition-colors",
                  clause.locked ? "border-amber-400/20" : "hover:border-cyan-energy/25",
                  isEditing && "border-cyan-energy/45",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] font-mono text-[0.68rem] text-steel">
                      {String(clause.order).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      {isEditing ? (
                        <input
                          form={`clause-form-${clause.id}`}
                          name="title"
                          value={draft.title}
                          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                          className="field !py-2 !text-[0.92rem] font-semibold"
                          aria-label="Título de la cláusula"
                        />
                      ) : (
                        <h3 className="font-display text-[0.95rem] font-bold text-white">
                          {clause.title}
                        </h3>
                      )}

                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge tone="muted">
                          {CLAUSE_CATEGORY_LABEL[clause.category] ?? clause.category}
                        </Badge>
                        {clause.locked ? (
                          <Badge tone="warn">
                            <Lock className="h-2.5 w-2.5" />
                            Bloqueada
                          </Badge>
                        ) : (
                          <Badge tone="cyan">
                            <Unlock className="h-2.5 w-2.5" />
                            Negociable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {!clause.locked && !isEditing && (
                    <button
                      type="button"
                      onClick={() => startEdit(clause.id)}
                      className="shrink-0 rounded-lg border border-white/12 bg-white/[0.03] px-3 py-1.5 text-[0.78rem] font-medium text-chrome transition-colors hover:border-cyan-energy/45 hover:text-cyan-energy"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form
                    id={`clause-form-${clause.id}`}
                    action={saveClause}
                    className="mt-4 space-y-3"
                  >
                    <input type="hidden" name="clause_id" value={clause.id} />
                    <textarea
                      name="body"
                      rows={Math.min(20, Math.max(6, Math.ceil(draft.body.length / 90)))}
                      value={draft.body}
                      onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                      className="field resize-y font-mono !text-[0.78rem] leading-relaxed"
                      aria-label="Cuerpo de la cláusula"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={pending}
                        className="inline-flex items-center gap-2 rounded-lg border border-cyan-energy/40 bg-cyan-energy/[0.1] px-3.5 py-2 text-[0.8rem] font-semibold text-cyan-energy transition-colors hover:bg-cyan-energy/20"
                      >
                        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Guardar como nueva versión
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-white/12 px-3.5 py-2 text-[0.8rem] text-chrome transition-colors hover:bg-white/[0.05]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4 space-y-3">
                    {clause.body.split("\n\n").map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-[0.86rem] leading-[1.8] text-chrome/90"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Panel lateral */}
        <div className="space-y-6 lg:sticky lg:top-6">
          {/* Estado */}
          <Card className="p-5">
            <h2 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-energy">
              Estado del contrato
            </h2>
            <div className="mt-4 space-y-2">
              {CONTRACT_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => changeStatus(s.value)}
                  disabled={pending}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-colors",
                    contract.status === s.value
                      ? "border-cyan-energy/45 bg-cyan-energy/[0.09]"
                      : "border-white/[0.08] hover:border-cyan-energy/30 hover:bg-white/[0.03]",
                  )}
                >
                  <StatusPill status={s.value} />
                  {contract.status === s.value && (
                    <CircleDot className="h-3.5 w-3.5 shrink-0 text-cyan-energy" />
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Condiciones económicas */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-energy">
                Condiciones económicas
              </h2>
              <button
                type="button"
                onClick={() => setShowEconomic((v) => !v)}
                className="rounded p-1 text-steel transition-colors hover:text-white"
                aria-label="Editar condiciones económicas"
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", showEconomic && "rotate-180")} />
              </button>
            </div>

            {!showEconomic ? (
              <dl className="mt-4 space-y-3">
                {[
                  { label: "Valor total", value: formatCOP(contract.total) },
                  { label: "Plazo", value: `${contract.duration_days ?? "—"} días` },
                  { label: "Garantía", value: `${contract.warranty_days ?? "—"} días` },
                  { label: "Inicio", value: formatDate(contract.start_date) },
                  { label: "Moneda", value: contract.currency },
                ].map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-3">
                    <dt className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-steel-faint">
                      {row.label}
                    </dt>
                    <dd className="font-mono text-[0.78rem] text-chrome">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <form action={saveEconomic} className="mt-4 space-y-3.5">
                <div>
                  <label className="label-mono" htmlFor="e-total">
                    Valor total (COP)
                  </label>
                  <input
                    id="e-total"
                    name="total"
                    type="number"
                    min={1}
                    step={1000}
                    value={economicDraft.total}
                    onChange={(e) =>
                      setEconomicDraft((d) => ({ ...d, total: Number(e.target.value) }))
                    }
                    className="field"
                  />
                </div>
                <div>
                  <label className="label-mono" htmlFor="e-duration">
                    Plazo (días)
                  </label>
                  <input
                    id="e-duration"
                    name="duration_days"
                    type="number"
                    min={1}
                    value={economicDraft.duration_days}
                    onChange={(e) =>
                      setEconomicDraft((d) => ({ ...d, duration_days: Number(e.target.value) }))
                    }
                    className="field"
                  />
                </div>
                <div>
                  <label className="label-mono" htmlFor="e-warranty">
                    Garantía (días)
                  </label>
                  <input
                    id="e-warranty"
                    name="warranty_days"
                    type="number"
                    min={0}
                    value={economicDraft.warranty_days}
                    onChange={(e) =>
                      setEconomicDraft((d) => ({ ...d, warranty_days: Number(e.target.value) }))
                    }
                    className="field"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-cyan-energy/40 bg-cyan-energy/[0.1] px-3.5 py-2 text-[0.8rem] font-semibold text-cyan-energy transition-colors hover:bg-cyan-energy/20"
                  >
                    {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEconomic(false)}
                    className="rounded-lg border border-white/12 px-3.5 py-2 text-[0.8rem] text-chrome hover:bg-white/[0.05]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </Card>

          {/* Plan de pagos */}
          <Card className="p-5">
            <h2 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-energy">
              Plan de pagos
            </h2>

            <ul className="mt-4 space-y-3">
              {contract.payment_plan.map((p, i) => (
                <li key={`${p.milestone}-${i}`} className="border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.8rem] leading-snug text-chrome">{p.milestone}</span>
                    <span className="shrink-0 font-mono text-[0.72rem] text-cyan-energy">
                      {p.percent}%
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[0.72rem] text-steel-dim">{formatCOP(p.amount)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-baseline justify-between border-t border-white/[0.08] pt-4">
              <span className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-steel-faint">
                Total
              </span>
              <span className="font-display text-base font-black text-white">
                {formatCOP(contract.payment_plan.reduce((acc, p) => acc + p.amount, 0))}
              </span>
            </div>

            <p className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
              Aplicar plan predefinido
            </p>
            <div className="mt-2.5 space-y-1.5">
              {Object.entries(DEFAULT_PAYMENT_PLANS).map(([key, plan]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  disabled={pending}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/[0.08] px-3 py-2 text-left font-mono text-[0.68rem] text-steel transition-colors hover:border-cyan-energy/35 hover:text-cyan-energy"
                >
                  <span className="truncate">{key.replace(/-/g, " ")}</span>
                  <span className="shrink-0">
                    {plan.map((p) => `${p.percent}%`).join("/")}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Alcance */}
          <Card className="p-5">
            <h2 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-energy">
              Alcance y entregables
            </h2>
            <p className="mt-4 text-[0.82rem] leading-relaxed text-chrome">{contract.scope}</p>

            {contract.deliverables.length > 0 && (
              <>
                <p className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                  Entregables
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {contract.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-[0.78rem] leading-snug text-chrome">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-cyan-energy" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {contract.exclusions.length > 0 && (
              <>
                <p className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                  Exclusiones
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {contract.exclusions.map((e) => (
                    <li key={e} className="flex items-start gap-2.5 text-[0.78rem] leading-snug text-steel">
                      <X className="mt-0.5 h-3 w-3 shrink-0 text-steel-faint" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          {/* Resumen de negociación */}
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-cyan-energy" />
              <h2 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-cyan-energy">
                Resumen de negociación
              </h2>
            </div>
            <dl className="mt-4 space-y-3">
              {[
                { label: "Cláusulas totales", value: summary.totalClauses },
                { label: "Negociables", value: summary.editableClauses },
                { label: "Bloqueadas", value: summary.lockedClauses },
                { label: "Cambios registrados", value: summary.changes },
                { label: "Días abierto", value: summary.daysOpen },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-3">
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-steel-faint">
                    {row.label}
                  </dt>
                  <dd className="font-display text-sm font-bold text-white">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
