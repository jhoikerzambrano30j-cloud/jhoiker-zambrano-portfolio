import type {
  Contract,
  ContractClause,
  ContractStatus,
  ContractTemplate,
  ContractVersion,
} from "@/lib/types";
import { addDays, contractCode, formatCOP, numeroALetras, slugify, toISODate } from "@/lib/utils";
import { DEFAULT_PAYMENT_PLANS } from "./templates";

/**
 * Motor de contratos — puro, determinista y sin dependencias de React, red o
 * base de datos. Solo importa tipos del dominio, utilidades y las plantillas.
 *
 * Reglas de diseño:
 * - Ninguna función muta sus argumentos: se trabaja con spread, `.map` y
 *   `.filter`.
 * - Las funciones que generan marcas de tiempo aceptan `now: Date = new Date()`
 *   para poder inyectar un reloj determinista en pruebas.
 * - Los textos se renderizan con `renderTemplate`, que resuelve los marcadores
 *   `{{clave}}` y elimina cualquier marcador desconocido.
 */

/** Nombre del contratista usado como valor por defecto. */
const CONTRATISTA_NOMBRE = "Jhoiker Zambrano";

/** Meses del año en español, en minúscula, para fechas largas. */
export const MESES_ES: string[] = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Tonos visuales disponibles para los estados del contrato. */
export type ContractStatusTone = "neutral" | "info" | "warn" | "success" | "danger";

/** Estados posibles de un contrato con su etiqueta, tono y descripción. */
export const CONTRACT_STATUSES: {
  value: ContractStatus;
  label: string;
  tone: ContractStatusTone;
  description: string;
}[] = [
  {
    value: "borrador",
    label: "Borrador",
    tone: "neutral",
    description: "Contrato en construcción a partir de una plantilla, aún no enviado al cliente.",
  },
  {
    value: "enviado",
    label: "Enviado",
    tone: "info",
    description: "Contrato remitido al cliente y pendiente de revisión.",
  },
  {
    value: "en_negociacion",
    label: "En negociación",
    tone: "warn",
    description: "El cliente solicitó ajustes de cláusulas, alcance o valor.",
  },
  {
    value: "aprobado",
    label: "Aprobado",
    tone: "success",
    description: "Contrato aceptado por el cliente y listo para firma.",
  },
  {
    value: "firmado",
    label: "Firmado",
    tone: "success",
    description: "Contrato suscrito por las partes; inicia la ejecución y la facturación.",
  },
  {
    value: "completado",
    label: "Completado",
    tone: "success",
    description: "Proyecto entregado y aceptado; el contrato se encuentra cerrado.",
  },
  {
    value: "rechazado",
    label: "Rechazado",
    tone: "danger",
    description: "El cliente declinó la propuesta; el contrato no continuará.",
  },
  {
    value: "cancelado",
    label: "Cancelado",
    tone: "danger",
    description: "Contrato terminado anticipadamente o dejado sin efecto por cualquiera de las partes.",
  },
];

/** Avance estimado (0-100) asociado a cada estado del contrato. */
const STATUS_PROGRESS: Record<ContractStatus, number> = {
  borrador: 10,
  enviado: 30,
  en_negociacion: 55,
  aprobado: 75,
  firmado: 100,
  completado: 100,
  rechazado: 0,
  cancelado: 0,
};

/** Resumen de negociación de un contrato. */
export interface NegotiationSummary {
  totalClauses: number;
  lockedClauses: number;
  editableClauses: number;
  changes: number;
  daysOpen: number;
}

/** Variables disponibles para renderizar las cláusulas de un contrato. */
export interface ContractVariables {
  cliente: string;
  empresa?: string;
  doc_id?: string;
  email_cliente?: string;
  valor: number;
  plazo: number;
  fecha_inicio: string | Date;
  ciudad: string;
  contratista?: string;
  alcance?: string;
  entregables?: string[];
  exclusiones?: string[];
  garantia?: number;
}

/* ------------------------------------------------------------------ *
 * Utilidades internas
 * ------------------------------------------------------------------ */

/** Convierte un valor ISO o Date en Date, sin lanzar excepciones. */
function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Texto limpio o valor por defecto cuando viene vacío o indefinido. */
function cleanText(value: string | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/** Lista de elementos sin valores vacíos. */
function cleanList(value: string[] | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  const items = value.map((item) => item.trim()).filter((item) => item.length > 0);
  return items.length > 0 ? items : fallback;
}

/** Convierte un número a letras en minúscula, sin el sufijo de moneda. */
function numeroEnLetras(n: number): string {
  return numeroALetras(n)
    .replace(/\s*PESOS M\/CTE\s*$/i, "")
    .trim()
    .toLowerCase();
}

/** Formato legal "45 (cuarenta y cinco) días calendario". */
function numeroConUnidad(n: number, unidad: string): string {
  const valor = Number.isFinite(n) ? Math.round(n) : 0;
  const letras = numeroEnLetras(valor);
  return letras.length > 0 ? `${valor} (${letras}) ${unidad}` : `${valor} ${unidad}`;
}

/** Lista numerada con salto de línea, lista para interpolar en una cláusula. */
function numberedList(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

/** Añade una entrada al registro de negociación y actualiza `updated_at`. */
function withLogEntry(
  contract: Contract,
  entry: { at: string; actor: string; action: string; detail: string },
): Contract {
  return {
    ...contract,
    updated_at: entry.at,
    negotiation_log: [...contract.negotiation_log, entry],
  };
}

/** Renumera las cláusulas de 1..n conservando su orden actual. */
function renumberClauses(clauses: ContractClause[]): ContractClause[] {
  return clauses.map((clause, index) => ({ ...clause, order: index + 1 }));
}

const MARKER_RE = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
const MAX_RENDER_DEPTH = 4;

/** Valor de reemplazo de un marcador. Los desconocidos se resuelven como "". */
function markerValue(key: string, vars: ContractVariables, depth: number): string {
  if (depth > MAX_RENDER_DEPTH) return "";
  switch (key) {
    case "cliente":
      return vars.cliente ?? "";
    case "empresa":
      return vars.empresa ?? "";
    case "doc_id":
      return vars.doc_id ?? "";
    case "email_cliente":
      return vars.email_cliente ?? "";
    case "contratista":
      return cleanText(vars.contratista, CONTRATISTA_NOMBRE);
    case "ciudad":
      return cleanText(vars.ciudad, "Colombia");
    case "valor":
      return formatCOP(vars.valor);
    case "valor_letras":
      return numeroALetras(vars.valor);
    case "plazo":
      return numeroConUnidad(vars.plazo, "días calendario");
    case "garantia":
      return numeroConUnidad(vars.garantia ?? 0, "días");
    case "fecha_inicio":
      return formatFechaLarga(vars.fecha_inicio);
    case "fecha_fin":
      return formatFechaLarga(addDays(toDate(vars.fecha_inicio), Math.round(vars.plazo)));
    case "alcance":
      return vars.alcance ?? "";
    case "entregables":
      return numberedList((vars.entregables ?? []).map((item) => renderWithDepth(item, vars, depth + 1)));
    case "exclusiones":
      return numberedList((vars.exclusiones ?? []).map((item) => renderWithDepth(item, vars, depth + 1)));
    default:
      return "";
  }
}

/** Reemplazo de marcadores con control de profundidad para listas anidadas. */
function renderWithDepth(text: string, vars: ContractVariables, depth: number): string {
  const rendered = text.replace(MARKER_RE, (_match: string, key: string) =>
    markerValue(key.toLowerCase(), vars, depth),
  );
  return depth === 0 ? rendered.replace(MARKER_RE, "") : rendered;
}

/* ------------------------------------------------------------------ *
 * Fechas y variables
 * ------------------------------------------------------------------ */

/** Fecha larga en español: "14 de octubre de 2026". */
export function formatFechaLarga(date: Date | string): string {
  const value = toDate(date);
  if (Number.isNaN(value.getTime())) return "fecha por definir";
  return `${value.getUTCDate()} de ${MESES_ES[value.getUTCMonth()]} de ${value.getUTCFullYear()}`;
}

/**
 * Normaliza las variables de un contrato con valores por defecto coherentes con
 * la plantilla seleccionada.
 */
export function buildVariables(
  input: Partial<ContractVariables>,
  template?: ContractTemplate,
  now: Date = new Date(),
): ContractVariables {
  return {
    cliente: cleanText(input.cliente, "Cliente por definir"),
    empresa: cleanText(input.empresa, "persona natural"),
    doc_id: cleanText(input.doc_id, "NIT/CC por informar"),
    email_cliente: cleanText(input.email_cliente, "correo por informar"),
    valor: input.valor ?? template?.base_price ?? 0,
    plazo: input.plazo ?? template?.duration_days ?? 0,
    fecha_inicio: input.fecha_inicio ?? now,
    ciudad: cleanText(input.ciudad, "Colombia"),
    contratista: cleanText(input.contratista, CONTRATISTA_NOMBRE),
    alcance: cleanText(
      input.alcance,
      template?.description ?? "Según el alcance y los entregables acordados en este contrato.",
    ),
    entregables: cleanList(input.entregables, template ? [...template.deliverables] : []),
    exclusiones: cleanList(input.exclusiones, template ? [...template.exclusions] : []),
    garantia: input.garantia ?? template?.warranty_days ?? 0,
  };
}

/* ------------------------------------------------------------------ *
 * Renderizado de plantillas
 * ------------------------------------------------------------------ */

/** Reemplaza todos los marcadores `{{clave}}` de un texto. */
export function renderTemplate(text: string, vars: ContractVariables): string {
  return renderWithDepth(text, vars, 0);
}

/** Renderiza el cuerpo de cada cláusula devolviendo una copia nueva. */
export function renderClauses(clauses: ContractClause[], vars: ContractVariables): ContractClause[] {
  return clauses.map((clause) => ({ ...clause, body: renderTemplate(clause.body, vars) }));
}

/* ------------------------------------------------------------------ *
 * Plan de pagos y cláusulas
 * ------------------------------------------------------------------ */

/**
 * Reparte un monto entre los hitos respetando sus porcentajes y ajustando el
 * residuo de redondeo en el último hito, de modo que la suma sea exactamente
 * `basePrice`.
 */
export function calcPaymentPlan(
  basePrice: number,
  plan: { milestone: string; percent: number }[],
): { milestone: string; percent: number; amount: number }[] {
  if (plan.length === 0) return [];
  const amounts = plan.map((item) => Math.round((basePrice * item.percent) / 100));
  const assigned = amounts.reduce((sum, amount) => sum + amount, 0);
  const last = amounts.length - 1;
  amounts[last] = amounts[last] + (basePrice - assigned);
  return plan.map((item, index) => ({
    milestone: item.milestone,
    percent: item.percent,
    amount: amounts[index],
  }));
}

/** Construye una cláusula con valores por defecto seguros. */
export function newContractClause(order: number, partial: Partial<ContractClause> = {}): ContractClause {
  const safeOrder = Number.isFinite(order) && order > 0 ? Math.trunc(order) : 1;
  return {
    id: cleanText(partial.id, `c${String(safeOrder).padStart(2, "0")}`),
    order: safeOrder,
    title: cleanText(partial.title, `Cláusula ${safeOrder}`),
    body: partial.body ?? "",
    locked: partial.locked ?? false,
    category: partial.category ?? "general",
  };
}

/* ------------------------------------------------------------------ *
 * Construcción de contratos
 * ------------------------------------------------------------------ */

/**
 * Instancia una plantilla y devuelve un contrato completo en estado `borrador`,
 * con las cláusulas renderizadas, el plan de pagos calculado y la versión 1.
 */
export function instantiateTemplate(
  template: ContractTemplate,
  input: Partial<ContractVariables> & { code?: string; seq?: number },
  now: Date = new Date(),
): Omit<Contract, "id" | "created_at" | "updated_at"> {
  const vars = buildVariables(input, template, now);
  const percentPlan =
    DEFAULT_PAYMENT_PLANS[template.slug] ??
    template.payment_plan.map((item) => ({ milestone: item.milestone, percent: item.percent }));
  const clauses = renumberClauses(renderClauses(template.clauses, vars));

  /**
   * `renderWithDepth` se detiene en el primer nivel para no expandir listas de
   * forma recursiva, así que un marcador que viva dentro de un ítem de lista
   * (por ejemplo «Soporte presencial fuera de la ciudad de {{ciudad}}») sobrevive
   * a la sustitución de `{{entregables}}` / `{{exclusiones}}`.
   *
   * Como estos dos campos se guardan como texto final del contrato —y no solo
   * dentro de una cláusula—, se les aplica una pasada de primer nivel para
   * resolver sus marcadores y eliminar los que no correspondan.
   */
  const renderListField = (items: string[]): string[] =>
    items.map((item) => renderTemplate(item, vars));

  const timestamp = now.toISOString();
  const author = cleanText(vars.contratista, CONTRATISTA_NOMBRE);
  const code = cleanText(input.code, contractCode(input.seq ?? 1, now.getFullYear()));
  const version: ContractVersion = {
    version: 1,
    created_at: timestamp,
    author,
    note: `Versión inicial generada desde la plantilla ${template.name}.`,
    total: vars.valor,
    clauses_count: clauses.length,
  };

  return {
    code,
    title: `${template.name} — ${vars.cliente}`,
    status: "borrador",
    template_slug: template.slug,
    client_name: vars.cliente,
    client_company: cleanText(input.empresa, "") || null,
    client_email: cleanText(input.email_cliente, "") || null,
    client_doc_id: cleanText(input.doc_id, "") || null,
    client_address: null,
    scope: vars.alcance ?? "",
    deliverables: renderListField(vars.entregables ?? []),
    exclusions: renderListField(vars.exclusiones ?? []),
    total: vars.valor,
    currency: "COP",
    payment_plan: calcPaymentPlan(vars.valor, percentPlan),
    start_date: toISODate(toDate(vars.fecha_inicio)),
    duration_days: vars.plazo,
    warranty_days: vars.garantia ?? template.warranty_days,
    clauses,
    negotiation_log: [
      { at: timestamp, actor: author, action: "creacion", detail: "Contrato creado desde plantilla" },
    ],
    versions: [version],
    current_version: 1,
    notes: null,
  };
}

/** Incrementa la versión del contrato y guarda un snapshot del estado actual. */
export function bumpVersion(
  contract: Contract,
  note: string,
  author: string = CONTRATISTA_NOMBRE,
  now: Date = new Date(),
): Contract {
  const version = contract.current_version + 1;
  const at = now.toISOString();
  const snapshot: ContractVersion = {
    version,
    created_at: at,
    author,
    note,
    total: contract.total,
    clauses_count: contract.clauses.length,
  };
  const bumped: Contract = {
    ...contract,
    current_version: version,
    versions: [...contract.versions, snapshot],
  };
  return withLogEntry(bumped, {
    at,
    actor: author,
    action: "version",
    detail: `Versión ${version}: ${note}`,
  });
}

/** Registra un movimiento en el historial de negociación del contrato. */
export function logNegotiation(
  contract: Contract,
  actor: string,
  action: string,
  detail: string,
  now: Date = new Date(),
): Contract {
  return withLogEntry(contract, { at: now.toISOString(), actor, action, detail });
}

/** Recalcula el monto de cada hito del plan de pagos a partir de `total`. */
export function recalcTotals(contract: Contract): Contract {
  const plan = contract.payment_plan.map((item) => ({
    milestone: item.milestone,
    percent: item.percent,
  }));
  return { ...contract, payment_plan: calcPaymentPlan(contract.total, plan) };
}

/** Reemplaza el plan de pagos conservando los porcentajes recibidos. */
export function applyPaymentPlan(
  contract: Contract,
  plan: { milestone: string; percent: number }[],
  now: Date = new Date(),
): Contract {
  const payment_plan = calcPaymentPlan(contract.total, plan);
  const updated: Contract = { ...contract, payment_plan };
  return withLogEntry(updated, {
    at: now.toISOString(),
    actor: CONTRATISTA_NOMBRE,
    action: "plan_pagos",
    detail: `Plan de pagos actualizado con ${payment_plan.length} hitos.`,
  });
}

/**
 * Edita el título o el cuerpo de una cláusula. Si la cláusula está bloqueada
 * (`locked: true`) o no existe, devuelve el contrato sin cambios.
 */
export function updateClause(
  contract: Contract,
  clauseId: string,
  patch: Partial<Pick<ContractClause, "title" | "body">>,
  actor: string,
  now: Date = new Date(),
): Contract {
  const target = contract.clauses.find((clause) => clause.id === clauseId);
  if (!target || target.locked) return contract;
  const clauses = contract.clauses.map((clause) =>
    clause.id === clauseId
      ? {
          ...clause,
          title: patch.title === undefined ? clause.title : patch.title,
          body: patch.body === undefined ? clause.body : patch.body,
        }
      : clause,
  );
  const updated: Contract = { ...contract, clauses };
  return withLogEntry(updated, {
    at: now.toISOString(),
    actor,
    action: "clausula_editada",
    detail: `Cláusula ${target.order} (${target.title}) actualizada.`,
  });
}

/** Añade una cláusula al final del contrato y renumera el resto. */
export function addClause(
  contract: Contract,
  clause: {
    id?: string;
    title: string;
    body: string;
    category?: ContractClause["category"];
    locked?: boolean;
  },
  actor: string = CONTRATISTA_NOMBRE,
  now: Date = new Date(),
): Contract {
  const order = contract.clauses.length + 1;
  const baseId = cleanText(clause.id, `c${String(order).padStart(2, "0")}`);
  let uniqueId = baseId;
  let suffix = 2;
  while (contract.clauses.some((item) => item.id === uniqueId)) {
    uniqueId = `${baseId}-${suffix}`;
    suffix += 1;
  }
  const created = newContractClause(order, { ...clause, id: uniqueId });
  const clauses = renumberClauses([...contract.clauses, created]);
  const updated: Contract = { ...contract, clauses };
  return withLogEntry(updated, {
    at: now.toISOString(),
    actor,
    action: "clausula_agregada",
    detail: `Cláusula añadida: ${created.title}.`,
  });
}

/** Elimina una cláusula. Si está bloqueada (`locked: true`) no hace cambios. */
export function removeClause(
  contract: Contract,
  clauseId: string,
  actor: string = CONTRATISTA_NOMBRE,
  now: Date = new Date(),
): Contract {
  const target = contract.clauses.find((clause) => clause.id === clauseId);
  if (!target || target.locked) return contract;
  const clauses = renumberClauses(contract.clauses.filter((clause) => clause.id !== clauseId));
  const updated: Contract = { ...contract, clauses };
  return withLogEntry(updated, {
    at: now.toISOString(),
    actor,
    action: "clausula_eliminada",
    detail: `Cláusula eliminada: ${target.title}.`,
  });
}

/** Mueve una cláusula una posición arriba (-1) o abajo (1) y renumera. */
export function moveClause(
  contract: Contract,
  clauseId: string,
  direction: -1 | 1,
  now: Date = new Date(),
): Contract {
  const index = contract.clauses.findIndex((clause) => clause.id === clauseId);
  if (index < 0) return contract;
  const target = index + direction;
  if (target < 0 || target >= contract.clauses.length) return contract;
  const moved = contract.clauses[index];
  const reordered = contract.clauses.filter((clause) => clause.id !== clauseId);
  reordered.splice(target, 0, moved);
  const updated: Contract = { ...contract, clauses: renumberClauses(reordered) };
  return withLogEntry(updated, {
    at: now.toISOString(),
    actor: CONTRATISTA_NOMBRE,
    action: "clausula_movida",
    detail: `Cláusula ${moved.title} reordenada a la posición ${target + 1}.`,
  });
}

/* ------------------------------------------------------------------ *
 * Métricas y validación
 * ------------------------------------------------------------------ */

/** Avance del contrato (0-100) según su estado. */
export function contractProgress(contract: Contract): number {
  return STATUS_PROGRESS[contract.status] ?? 0;
}

/** Resumen cuantitativo del estado de negociación del contrato. */
export function negotiationSummary(contract: Contract): NegotiationSummary {
  const totalClauses = contract.clauses.length;
  const lockedClauses = contract.clauses.filter((clause) => clause.locked).length;
  const created = toDate(contract.created_at).getTime();
  const updated = toDate(contract.updated_at).getTime();
  const elapsed = Number.isFinite(created) && Number.isFinite(updated) ? updated - created : 0;
  return {
    totalClauses,
    lockedClauses,
    editableClauses: totalClauses - lockedClauses,
    changes: contract.negotiation_log.length,
    daysOpen: Math.max(0, Math.round(elapsed / 86_400_000)),
  };
}

/** Valida los campos mínimos exigibles antes de enviar un contrato al cliente. */
export function validateContract(contract: Contract): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (contract.title.trim().length === 0) {
    errors.push("El contrato debe tener un título.");
  }
  if (contract.client_name.trim().length === 0) {
    errors.push("El contrato debe identificar al cliente.");
  }
  if (contract.scope.trim().length === 0) {
    errors.push("El contrato debe definir el alcance del servicio.");
  }
  if (!Number.isFinite(contract.total) || contract.total <= 0) {
    errors.push("El valor total del contrato debe ser mayor que cero.");
  }
  if (contract.clauses.length < 5) {
    errors.push("El contrato debe incluir al menos cinco (5) cláusulas.");
  }
  if (contract.payment_plan.length === 0) {
    errors.push("El contrato debe tener un plan de pagos con al menos un hito.");
  }
  const percentTotal = contract.payment_plan.reduce((sum, item) => sum + item.percent, 0);
  if (Math.abs(percentTotal - 100) > 0.001) {
    errors.push(`El plan de pagos debe sumar 100% (suma actual: ${percentTotal}%).`);
  }
  return { ok: errors.length === 0, errors };
}

/* ------------------------------------------------------------------ *
 * Exportación a texto plano (base del PDF)
 * ------------------------------------------------------------------ */

const PAGE_WIDTH = 94;

/** Línea divisoria de ancho fijo. */
function rule(char: string = "="): string {
  return char.repeat(PAGE_WIDTH);
}

/** Centra un texto en el ancho de página. */
function center(text: string, width: number = PAGE_WIDTH): string {
  if (text.length >= width) return text;
  return `${" ".repeat(Math.floor((width - text.length) / 2))}${text}`;
}

/** Ajusta un texto a un ancho, respetando párrafos y sin cortar palabras. */
function wrap(text: string, width: number = 92, indent: number = 0): string {
  const prefix = " ".repeat(indent);
  return text
    .split("\n")
    .map((line) => {
      if (line.trim().length === 0) return "";
      if (line.length <= width - indent) return `${prefix}${line}`;
      const lines: string[] = [];
      let current = "";
      line.split(/\s+/).forEach((word) => {
        if (current.length === 0) {
          current = word;
        } else if (`${current} ${word}`.length <= width - indent) {
          current = `${current} ${word}`;
        } else {
          lines.push(current);
          current = word;
        }
      });
      if (current.length > 0) lines.push(current);
      return lines.map((item) => `${prefix}${item}`).join("\n");
    })
    .join("\n");
}

/** Trunca una etiqueta larga para la tabla de pagos. */
function truncateLabel(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/**
 * Convierte el contrato completo en texto plano monoespaciado, listo para
 * imprimir, copiar o exportar a PDF.
 */
export function contractToPlainText(contract: Contract): string {
  const status = CONTRACT_STATUSES.find((item) => item.value === contract.status);
  const lines: string[] = [];

  lines.push(rule("="));
  lines.push(center("CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES"));
  lines.push(center("INGENIERÍA DE SOFTWARE Y ARQUITECTURA DIGITAL"));
  lines.push(rule("="));
  lines.push("");
  lines.push(`Código:        ${contract.code}`);
  lines.push(`Título:        ${contract.title}`);
  lines.push(`Plantilla:     ${contract.template_slug ?? "personalizada"}`);
  lines.push(`Estado:        ${status ? status.label : contract.status}`);
  lines.push(`Versión:       ${contract.current_version}`);
  lines.push(
    `Fecha inicio:  ${contract.start_date ? formatFechaLarga(contract.start_date) : "por definir"}`,
  );
  lines.push(`Duración:      ${contract.duration_days ?? 0} días calendario`);
  lines.push(`Garantía:      ${contract.warranty_days ?? 0} días`);
  lines.push(`Moneda:        ${contract.currency}`);
  lines.push("");
  lines.push(rule("-"));
  lines.push("PARTES");
  lines.push(rule("-"));
  lines.push("");
  lines.push(`CONTRATISTA: ${CONTRATISTA_NOMBRE} — Ingeniería de Software y Arquitectura Digital`);
  lines.push(`CLIENTE:     ${contract.client_name}`);
  lines.push(`EMPRESA:     ${contract.client_company ?? "no aplica"}`);
  lines.push(`DOCUMENTO:   ${contract.client_doc_id ?? "por informar"}`);
  lines.push(`CORREO:      ${contract.client_email ?? "por informar"}`);
  lines.push("");
  lines.push(rule("-"));
  lines.push("OBJETO");
  lines.push(rule("-"));
  lines.push("");
  lines.push(wrap(`Objeto: ${contract.title}.`));
  lines.push("");
  lines.push(wrap(contract.scope));
  lines.push("");

  if (contract.deliverables.length > 0) {
    lines.push(rule("-"));
    lines.push("ENTREGABLES");
    lines.push(rule("-"));
    lines.push("");
    contract.deliverables.forEach((item, index) => {
      lines.push(wrap(`${index + 1}. ${item}`));
    });
    lines.push("");
  }

  if (contract.exclusions.length > 0) {
    lines.push(rule("-"));
    lines.push("EXCLUSIONES");
    lines.push(rule("-"));
    lines.push("");
    contract.exclusions.forEach((item, index) => {
      lines.push(wrap(`${index + 1}. ${item}`));
    });
    lines.push("");
  }

  lines.push(rule("-"));
  lines.push("CLÁUSULAS");
  lines.push(rule("-"));
  lines.push("");
  contract.clauses.forEach((clause) => {
    lines.push(wrap(`${clause.order}. ${clause.title.toUpperCase()}`));
    lines.push("");
    lines.push(wrap(clause.body));
    lines.push("");
  });

  lines.push(rule("-"));
  lines.push("PLAN DE PAGOS");
  lines.push(rule("-"));
  lines.push("");
  lines.push(`${"HITO".padEnd(56)}${"%".padStart(5)}  ${"VALOR".padStart(16)}`);
  lines.push(rule("-"));
  contract.payment_plan.forEach((item) => {
    const label = truncateLabel(item.milestone, 54).padEnd(56);
    lines.push(`${label}${`${item.percent}%`.padStart(5)}  ${formatCOP(item.amount).padStart(16)}`);
  });
  lines.push(rule("-"));
  lines.push(`${"TOTAL".padEnd(56)}${"100%".padStart(5)}  ${formatCOP(contract.total).padStart(16)}`);
  lines.push("");

  lines.push(rule("="));
  lines.push(center("FIRMAS"));
  lines.push(rule("="));
  lines.push("");
  lines.push(
    wrap(
      "En constancia de lo anterior, las partes suscriben el presente contrato en dos (2) ejemplares del mismo tenor y valor probatorio.",
    ),
  );
  lines.push("");
  lines.push("");
  lines.push(`${CONTRATISTA_NOMBRE.padEnd(45)}${contract.client_name}`);
  lines.push(`${"Contratista".padEnd(45)}Contratante`);
  lines.push(`${"C.C. ______________________".padEnd(45)}Doc: ${contract.client_doc_id ?? "________________"}`);
  lines.push(`${"Correo: ____________________".padEnd(45)}Correo: ${contract.client_email ?? "________________"}`);
  lines.push("");
  lines.push("");
  lines.push(`${"_______________________________".padEnd(45)}_______________________________`);
  lines.push(`${"Firma del contratista".padEnd(45)}Firma del contratante`);
  lines.push("");
  lines.push(
    `Documento: ${contract.code} · Versión ${contract.current_version} · ${contract.clauses.length} cláusulas · ${contract.deliverables.length} entregables`,
  );

  return lines.join("\n");
}

/** Nombre de archivo sugerido para el PDF del contrato. */
export function contractFileName(contract: Contract): string {
  const code = cleanText(contract.code, "contrato");
  const slug = slugify(contract.template_slug ?? contract.title);
  return `${code}-contrato-${slug.length > 0 ? slug : "servicios"}.pdf`;
}
