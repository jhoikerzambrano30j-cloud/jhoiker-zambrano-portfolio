"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Mail,
  Phone,
  Building2,
  Search,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";
import { StatusPill } from "@/components/admin/StatusPill";
import { updateLeadStatus, updateLeadNotes, deleteLead } from "@/app/admin/leads/actions";
import { cn, formatDate } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/lib/types";

const STATUSES: LeadStatus[] = [
  "nuevo",
  "contactado",
  "en_negociacion",
  "ganado",
  "perdido",
  "archivado",
];

export function LeadsManager({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<LeadStatus | "todos">("todos");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchStatus = filter === "todos" || lead.status === filter;
      if (!matchStatus) return false;
      if (!q) return true;
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        (lead.company ?? "").toLowerCase().includes(q)
      );
    });
  }, [leads, filter, query]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { todos: leads.length };
    leads.forEach((l) => {
      map[l.status] = (map[l.status] ?? 0) + 1;
    });
    return map;
  }, [leads]);

  function onStatus(lead: Lead, status: LeadStatus) {
    startTransition(async () => {
      const result = await updateLeadStatus(lead.id, status);
      setFeedback(result);
    });
  }

  function onSaveNotes(lead: Lead) {
    startTransition(async () => {
      const result = await updateLeadNotes(lead.id, notes[lead.id] ?? lead.notes ?? "");
      setFeedback(result);
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const result = await deleteLead(id);
      setFeedback(result);
    });
  }

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, correo o empresa…"
              className="field pl-9"
              aria-label="Buscar leads"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["todos", ...STATUSES] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status as LeadStatus | "todos")}
                className={cn(
                  "rounded-lg border px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.1em] transition-colors",
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

      {/* Lista */}
      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-[0.88rem] text-steel">
            No hay leads que coincidan con el filtro seleccionado.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const isOpen = openId === lead.id;
            return (
              <Card key={lead.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : lead.id)}
                  className="flex w-full flex-wrap items-start gap-4 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={lead.status} />
                      <span className="font-mono text-[0.62rem] text-steel-faint">
                        {formatDate(lead.created_at, true)}
                      </span>
                      {lead.project_type && <Badge tone="muted">{lead.project_type}</Badge>}
                    </div>

                    <h3 className="mt-2.5 font-display text-[0.95rem] font-bold text-white">
                      {lead.name}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-3 font-mono text-[0.68rem] text-steel-dim">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </span>
                      {lead.company && (
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="h-3 w-3" />
                          {lead.company}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                      )}
                    </div>

                    {!isOpen && (
                      <p className="mt-2 line-clamp-1 text-[0.8rem] text-steel">{lead.message}</p>
                    )}
                  </div>

                  <ChevronDown
                    className={cn(
                      "mt-1 h-4 w-4 shrink-0 text-steel-faint transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-white/[0.07] p-4">
                    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                      <div>
                        <h4 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel-faint">
                          Mensaje
                        </h4>
                        <p className="mt-2.5 whitespace-pre-wrap text-[0.86rem] leading-relaxed text-chrome">
                          {lead.message}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                          {[
                            { label: "Presupuesto", value: lead.budget_range },
                            { label: "Plazo", value: lead.timeline },
                            { label: "Origen", value: lead.source },
                            { label: "Empresa", value: lead.company },
                          ]
                            .filter((r) => r.value)
                            .map((row) => (
                              <div key={row.label}>
                                <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel-faint">
                                  {row.label}
                                </p>
                                <p className="mt-0.5 text-[0.82rem] text-chrome">{row.value}</p>
                              </div>
                            ))}
                        </div>

                        <div className="mt-5">
                          <label className="label-mono" htmlFor={`notes-${lead.id}`}>
                            Notas internas
                          </label>
                          <textarea
                            id={`notes-${lead.id}`}
                            rows={3}
                            value={notes[lead.id] ?? lead.notes ?? ""}
                            onChange={(e) =>
                              setNotes((prev) => ({ ...prev, [lead.id]: e.target.value }))
                            }
                            placeholder="Seguimiento, acuerdos, próximos pasos…"
                            className="field resize-y"
                          />
                          <div className="mt-2.5 flex gap-2">
                            <button
                              type="button"
                              onClick={() => onSaveNotes(lead)}
                              disabled={pending}
                              className="inline-flex items-center gap-2 rounded-lg border border-cyan-energy/35 bg-cyan-energy/[0.09] px-3.5 py-2 text-[0.8rem] font-semibold text-cyan-energy transition-colors hover:bg-cyan-energy/15"
                            >
                              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                              Guardar notas
                            </button>
                            <a
                              href={`mailto:${lead.email}?subject=Re:%20tu%20proyecto`}
                              className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-3.5 py-2 text-[0.8rem] text-chrome transition-colors hover:border-cyan-energy/40 hover:text-cyan-energy"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Responder
                            </a>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel-faint">
                          Estado del lead
                        </h4>
                        <div className="mt-3 space-y-2">
                          {STATUSES.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => onStatus(lead, status)}
                              disabled={pending}
                              className={cn(
                                "flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left transition-colors",
                                lead.status === status
                                  ? "border-cyan-energy/45 bg-cyan-energy/[0.09]"
                                  : "border-white/[0.08] hover:border-cyan-energy/30 hover:bg-white/[0.03]",
                              )}
                            >
                              <StatusPill status={status} />
                              {lead.status === status && (
                                <Check className="h-3.5 w-3.5 text-cyan-energy" />
                              )}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => onDelete(lead.id)}
                          disabled={pending}
                          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-400/30 bg-rose-400/[0.06] px-3.5 py-2.5 text-[0.8rem] font-semibold text-rose-300 transition-colors hover:bg-rose-400/12"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar lead
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
