import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Une clases de Tailwind resolviendo conflictos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea una fecha ISO a formato legible en español. */
export function formatDate(value?: string | Date | null, withTime = false) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(d);
}

/** Formatea un monto en pesos colombianos. */
export function formatCOP(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formatea un monto en USD. */
export function formatUSD(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Slug estable a partir de un texto. */
export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Genera un código consecutivo tipo JZ-CT-2026-0001. */
export function contractCode(seq: number, year = new Date().getFullYear()) {
  return `JZ-CT-${year}-${String(seq).padStart(4, "0")}`;
}

/** Trunca texto manteniendo palabras completas. */
export function truncate(text: string, max = 140) {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max))}…`;
}

/** Iniciales para avatares. */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Convierte un número a texto de moneda en español (para cláusulas de contrato). */
export function numeroALetras(n: number): string {
  const UNIDADES = [
    "", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
    "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS",
    "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE",
  ];
  const DECENAS = [
    "", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA",
    "SETENTA", "OCHENTA", "NOVENTA",
  ];
  const CENTENAS = [
    "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
    "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS",
  ];

  function seccion(num: number): string {
    if (num === 0) return "";
    if (num === 100) return "CIEN";
    let out = "";
    const c = Math.floor(num / 100);
    const resto = num % 100;
    if (c > 0) out += `${CENTENAS[c]} `;
    if (resto <= 20) {
      out += UNIDADES[resto];
    } else if (resto < 30) {
      out += `VEINTI${UNIDADES[resto - 20].toLowerCase()}`.toUpperCase();
    } else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      out += DECENAS[d];
      if (u > 0) out += ` Y ${UNIDADES[u]}`;
    }
    return out.trim();
  }

  if (n === 0) return "CERO PESOS M/CTE";
  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const cientos = n % 1000;
  const partes: string[] = [];
  if (millones === 1) partes.push("UN MILLÓN");
  else if (millones > 1) partes.push(`${seccion(millones)} MILLONES`);
  if (miles === 1) partes.push("MIL");
  else if (miles > 1) partes.push(`${seccion(miles)} MIL`);
  if (cientos > 0) partes.push(seccion(cientos));
  return `${partes.join(" ").replace(/\s+/g, " ").trim()} PESOS M/CTE`;
}

/** Suma días a una fecha. */
export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Fecha en formato ISO corto (YYYY-MM-DD). */
export function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}
