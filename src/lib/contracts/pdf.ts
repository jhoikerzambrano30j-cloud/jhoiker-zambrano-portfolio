/**
 * Generación del PDF de contrato — Jhoiker Zambrano
 * Ingeniería de Software & Arquitectura Digital
 *
 * Documento A4 vertical construido con `pdf-lib` usando exclusivamente las
 * fuentes estándar (Helvetica / Helvetica-Bold / Helvetica-Oblique / Courier),
 * por lo que no requiere incrustar archivos `.ttf`.
 *
 * El módulo es seguro de importar desde el servidor: `pdf-lib` funciona en
 * cualquier entorno y toda la API de navegador (`document`, `window`, `btoa`,
 * `Blob`, `URL`) queda protegida detrás de guardas de entorno.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";

import type { Contract, ContractClause, ContractStatus } from "@/lib/types";
import { formatCOP, formatDate } from "@/lib/utils";

import { contractFileName } from "./engine";

/* -------------------------------------------------------------------------- */
/*  Tipos públicos                                                            */
/* -------------------------------------------------------------------------- */

/** Datos del contratista y de la plaza de firma del documento. */
export interface ContractPdfOptions {
  ownerName?: string;
  ownerId?: string;
  city?: string;
}

/* -------------------------------------------------------------------------- */
/*  Identidad de marca (coincide con el Manual v3.0 — src/lib/brand.ts)        */
/* -------------------------------------------------------------------------- */

/** Fondo base / texto principal. */
const OBSIDIAN = "#0A0D14";
/** Acento principal. */
const CYAN = "#38BDF8";
/** Acento secundario. */
const INDIGO = "#818CF8";
/** Superficies y tablas. */
const SLATE = "#1E293B";
/** Texto secundario. */
const STEEL = "#64748B";
/** Texto secundario claro / filetes. */
const STEEL_LIGHT = "#94A3B8";
/** Blanco puro. */
const WHITE = "#FFFFFF";

const ISOTIPO = "[ J Z ]";
const WORDMARK = "JHOIKER ZAMBRANO";
const ROLE = "Ingeniería de Software & Arquitectura Digital";

const DEFAULT_OWNER_NAME = "Jhoiker Zambrano";
const DEFAULT_OWNER_ID = "C.C. 1.000.000.000";
const DEFAULT_OWNER_ROLE = "Ingeniero de Software · Contratista";
const DEFAULT_OWNER_EMAIL = "contacto@jhoikerzambrano.com";
const DEFAULT_CITY = "Colombia";
const DEFAULT_CURRENCY = "COP";

/* -------------------------------------------------------------------------- */
/*  Métricas de página                                                        */
/* -------------------------------------------------------------------------- */

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

const MARGIN_X = 52;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const BAND_HEIGHT = 38;

/**
 * Cabecera de marca, medida desde el borde superior de la página.
 * Se usan distancias desde arriba (y no coordenadas del lienzo) para que la
 * geometría sea legible; el eje de pdf-lib va de abajo hacia arriba.
 *
 *   banda obsidian ....... 0      → 38
 *   isotipo [ J Z ] ...... base 27
 *   wordmark ............. base 46
 *   subtítulo ............ base 57
 *   filete cyan .......... 66
 */
const ISO_BASELINE_FROM_TOP = 27;
const WORDMARK_BASELINE_FROM_TOP = 46;
const ROLE_BASELINE_FROM_TOP = 57;
/** Filete cyan que cierra la cabecera de marca (deja 9 pt tras el subtítulo). */
const HEADER_RULE_FROM_TOP = 66;
const HEADER_RULE_Y = PAGE_HEIGHT - HEADER_RULE_FROM_TOP;
const HEADER_TOP_Y = HEADER_RULE_Y - 14;

const FOOTER_RULE_Y = 60;
const FOOTER_BASELINE = 47;
/** Coordenada Y útil más baja para el contenido (por encima del pie). */
const CONTENT_FLOOR = FOOTER_RULE_Y + 8;
/** Altura máxima de contenido que cabe en una página. */
const USABLE_HEIGHT = HEADER_TOP_Y - CONTENT_FLOOR;

const BODY_SIZE = 9.5;
const BODY_LEADING = 14;
const LABEL_SIZE = 6.5;
const KV_SIZE = 8.5;
const KV_LABEL_SIZE = 6.5;
const TABLE_HEADER_SIZE = 8;
const TABLE_CELL_SIZE = 8.5;
const HEADING_SIZE = 14;

/* -------------------------------------------------------------------------- */
/*  Utilidades cromáticas                                                     */
/* -------------------------------------------------------------------------- */

/** Convierte un color hexadecimal (`#RRGGBB` / `#RGB`) a un `RGB` de pdf-lib. */
function hexToRgb(hex: string): RGB {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const int = Number.parseInt(full.slice(0, 6), 16);
  if (!Number.isFinite(int) || full.length < 6) return rgb(0, 0, 0);

  return rgb(
    ((int >> 16) & 0xff) / 255,
    ((int >> 8) & 0xff) / 255,
    (int & 0xff) / 255,
  );
}

/* -------------------------------------------------------------------------- */
/*  Colores resueltos                                                         */
/* -------------------------------------------------------------------------- */

interface Palette {
  obsidian: RGB;
  cyan: RGB;
  indigo: RGB;
  slate: RGB;
  steel: RGB;
  steelLight: RGB;
  white: RGB;
  rowTint: RGB;
  cardTint: RGB;
  lineSoft: RGB;
}

const C: Palette = {
  obsidian: hexToRgb(OBSIDIAN),
  cyan: hexToRgb(CYAN),
  indigo: hexToRgb(INDIGO),
  slate: hexToRgb(SLATE),
  steel: hexToRgb(STEEL),
  steelLight: hexToRgb(STEEL_LIGHT),
  white: hexToRgb(WHITE),
  rowTint: rgb(0.968, 0.98, 0.992),
  cardTint: rgb(0.976, 0.984, 0.992),
  lineSoft: rgb(0.886, 0.91, 0.941),
};

/* -------------------------------------------------------------------------- */
/*  Sanitización de texto para las fuentes WinAnsi                            */
/* -------------------------------------------------------------------------- */

/**
 * Normaliza el texto para las fuentes estándar de `pdf-lib` (codificación
 * WinAnsi): sustituye comillas tipográficas y guiones largos, colapsa puntos
 * suspensivos y elimina cualquier carácter fuera de `\u0020-\u00FF`.
 * Los saltos de línea (`\n`, `\r`) se preservan.
 */
function sanitize(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/\t/g, " ")
    // Elimina todo lo que las fuentes WinAnsi no pueden codificar.
    .replace(/[^\n\u0020-\u00FF]/g, "");
}

/* -------------------------------------------------------------------------- */
/*  Ajuste de línea y justificación                                           */
/* -------------------------------------------------------------------------- */

/** `true` si `word` cabe completo en una línea vacía de ancho `maxWidth`. */
function wordFits(word: string, font: PDFFont, size: number, maxWidth: number): boolean {
  return font.widthOfTextAtSize(word, size) <= maxWidth;
}

/**
 * Divide `words` en líneas que quepan en `maxWidth`.
 *
 * Garantía anti-bucle: ninguna palabra se descarta ni se reencola. Cuando una
 * palabra no cabe en una línea vacía se corta por caracteres (o se emite tal
 * cual si ni un solo carácter cabe, caso en el que se permite el desborde
 * visual), de modo que `words` siempre se consume por completo.
 */
function wrapWords(words: string[], font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";

  for (let w = 0; w < words.length; w += 1) {
    const word = words[w] ?? "";
    const candidate = current.length > 0 ? `${current} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }

    // No cabe: cerramos la línea que teníamos (si tenía contenido) y
    // revaluamos la MISMA palabra contra una línea vacía.
    if (current.length > 0) {
      lines.push(current);
      current = "";
      w -= 1;
      continue;
    }

    if (wordFits(word, font, size, maxWidth)) {
      // La palabra cabe sola: se convierte en la línea actual.
      current = word;
      continue;
    }

    // La palabra es más ancha que la caja: corte por caracteres. El bucle
    // siempre avanza (`consumed >= 1`) o emite la palabra completa, así que
    // nunca puede quedarse girando sobre la misma palabra.
    let chunk = "";
    let consumed = 0;

    for (let i = 0; i < word.length; i += 1) {
      const next = chunk + word.charAt(i);
      if (chunk.length > 0 && font.widthOfTextAtSize(next, size) > maxWidth) break;
      chunk = next;
      consumed = i + 1;
    }

    if (chunk.length === 0) {
      // Ni un carácter cabe (ancho absurdamente pequeño): se emite tal cual
      // para no entrar en bucle infinito.
      lines.push(word);
      continue;
    }

    const rest = word.slice(consumed);
    if (rest.length > 0) {
      lines.push(chunk);
      words[w] = rest;
      w -= 1;
    } else {
      current = chunk;
    }
  }

  if (current.length > 0) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

/**
 * Envoltorio de texto consciente de párrafos.
 *
 * `\n\n` (o más saltos) separa párrafos y produce una línea vacía, de modo que
 * el consumidor pueda separar visualmente los bloques. Un `\n` simple se trata
 * como espacio dentro del párrafo.
 */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const paragraphs = sanitize(text)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) return [""];

  const lines: string[] = [];
  paragraphs.forEach((paragraph, index) => {
    if (index > 0) lines.push("");
    const words = paragraph.split(" ").filter((w) => w.length > 0);
    lines.push(...wrapWords(words, font, size, maxWidth));
  });

  return lines;
}

/**
 * Reparte el espacio sobrante entre las palabras de una línea para alinearla a
 * ambos márgenes. Devuelve los segmentos a dibujar.
 *
 * Se limita la separación extra a la mitad del ancho de un espacio: si hiciera
 * falta más (líneas con pocas palabras), se prefiere dejar la línea alineada a
 * la izquierda antes que producir un "río" blanco antiestético.
 */
function justifyLine(
  line: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): { text: string; x: number }[] {
  const words = line.split(" ").filter((w) => w.length > 0);
  if (words.length < 2) return [{ text: line, x: 0 }];

  const spaceWidth = font.widthOfTextAtSize(" ", size);
  const natural = font.widthOfTextAtSize(words.join(" "), size);
  const extra = maxWidth - natural;
  if (extra <= 0 || extra > spaceWidth * 0.5 * (words.length - 1)) {
    return [{ text: line, x: 0 }];
  }

  const gap = extra / (words.length - 1);
  const segments: { text: string; x: number }[] = [];
  let cursor = 0;

  for (const word of words) {
    segments.push({ text: word, x: cursor });
    cursor += font.widthOfTextAtSize(word, size) + spaceWidth + gap;
  }

  return segments;
}

/**
 * Dibuja un párrafo justificado. La última línea de cada párrafo (y las líneas
 * vacías de separación) se dibujan alineadas a la izquierda.
 */
function drawParagraph(
  layout: Layout,
  text: string,
  opts: {
    x: number;
    maxWidth: number;
    size: number;
    leading: number;
    font: PDFFont;
    color: RGB;
  },
): void {
  const lines = wrapText(text, opts.font, opts.size, opts.maxWidth);

  lines.forEach((line, index) => {
    layout.ensureSpace(opts.leading + 2);

    const isLastOfParagraph = index === lines.length - 1 || (lines[index + 1] ?? "") === "";
    const baseline = layout.y - opts.size;

    if (line.length > 0) {
      if (isLastOfParagraph) {
        layout.drawTextAt(line, opts.x, baseline, {
          font: opts.font,
          size: opts.size,
          color: opts.color,
        });
      } else {
        for (const segment of justifyLine(line, opts.font, opts.size, opts.maxWidth)) {
          layout.drawTextAt(segment.text, opts.x + segment.x, baseline, {
            font: opts.font,
            size: opts.size,
            color: opts.color,
          });
        }
      }
    }

    layout.y -= opts.leading;
  });
}

/* -------------------------------------------------------------------------- */
/*  Cursor de escritura con salto de página automático                        */
/* -------------------------------------------------------------------------- */

interface WriterFonts {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  mono: PDFFont;
}

interface WriterContext {
  doc: PDFDocument;
  font: WriterFonts;
  meta: Required<ContractPdfOptions>;
  generatedAt: Date;
}

interface WriterPage {
  page: PDFPage;
  index: number;
}

interface Layout {
  ctx: WriterContext;
  page: PDFPage;
  pageIndex: number;
  /** Coordenada Y (base) donde comenzará el siguiente bloque. */
  y: number;
  ensureSpace(height: number): void;
  addPage(): void;
  moveDown(amount: number): void;
  drawTextAt(
    text: string,
    x: number,
    baseline: number,
    opts: { font: PDFFont; size: number; color: RGB },
  ): void;
  drawLine(
    y: number,
    opts?: { x?: number; width?: number; thickness?: number; color?: RGB },
  ): void;
  fillRect(
    x: number,
    bottom: number,
    width: number,
    height: number,
    opts?: { fill?: RGB; border?: RGB; borderWidth?: number },
  ): void;
}

/** Cabecera de marca: banda obsidian + isotipo + wordmark + filete cyan. */
function drawBrandHeader(ctx: WriterContext, page: PDFPage): void {
  const bandTop = PAGE_HEIGHT;

  page.drawRectangle({
    x: 0,
    y: bandTop - BAND_HEIGHT,
    width: PAGE_WIDTH,
    height: BAND_HEIGHT,
    color: C.obsidian,
  });

  const isotipoSize = 13;
  const isotipoWidth = ctx.font.mono.widthOfTextAtSize(ISOTIPO, isotipoSize);
  page.drawText(sanitize(ISOTIPO), {
    x: (PAGE_WIDTH - isotipoWidth) / 2,
    y: PAGE_HEIGHT - ISO_BASELINE_FROM_TOP,
    size: isotipoSize,
    font: ctx.font.mono,
    color: C.white,
  });

  const wordmarkSize = 8.5;
  const wordmarkWidth = ctx.font.mono.widthOfTextAtSize(WORDMARK, wordmarkSize);
  page.drawText(sanitize(WORDMARK), {
    x: (PAGE_WIDTH - wordmarkWidth) / 2,
    y: PAGE_HEIGHT - WORDMARK_BASELINE_FROM_TOP,
    size: wordmarkSize,
    font: ctx.font.mono,
    color: C.indigo,
  });

  const roleSize = 6.5;
  const roleWidth = ctx.font.regular.widthOfTextAtSize(ROLE, roleSize);
  page.drawText(sanitize(ROLE), {
    x: (PAGE_WIDTH - roleWidth) / 2,
    y: PAGE_HEIGHT - ROLE_BASELINE_FROM_TOP,
    size: roleSize,
    font: ctx.font.regular,
    color: C.steelLight,
  });

  page.drawLine({
    start: { x: MARGIN_X, y: HEADER_RULE_Y },
    end: { x: PAGE_WIDTH - MARGIN_X, y: HEADER_RULE_Y },
    thickness: 1,
    color: C.cyan,
  });
}

/** Pie: filete gris, leyenda de generación y numeración de página. */
function drawFooters(ctx: WriterContext, pages: WriterPage[]): void {
  const total = pages.length;
  const legal = `Documento generado electrónicamente el ${formatDate(ctx.generatedAt)}.`;

  pages.forEach(({ page, index }) => {
    page.drawLine({
      start: { x: MARGIN_X, y: FOOTER_RULE_Y },
      end: { x: PAGE_WIDTH - MARGIN_X, y: FOOTER_RULE_Y },
      thickness: 0.5,
      color: C.lineSoft,
    });

    page.drawText(sanitize(legal), {
      x: MARGIN_X,
      y: FOOTER_BASELINE,
      size: 6.5,
      font: ctx.font.regular,
      color: C.steel,
    });

    const label = `Página ${index + 1} de ${total}`;
    const labelWidth = ctx.font.regular.widthOfTextAtSize(label, 6.5);
    page.drawText(sanitize(label), {
      x: PAGE_WIDTH - MARGIN_X - labelWidth,
      y: FOOTER_BASELINE,
      size: 6.5,
      font: ctx.font.regular,
      color: C.steel,
    });
  });
}

/** Estado de escritura con su cierre (pie de página) diferido. */
interface Writer {
  layout: Layout;
  /** Dibuja los pies de página una vez conocido el total de hojas. */
  finish(): void;
}

/** Crea el estado de escritura con salto de página automático. */
function createWriter(ctx: WriterContext): Writer {
  const pages: WriterPage[] = [];

  const newPage = (): WriterPage => {
    const page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const entry: WriterPage = { page, index: pages.length };
    pages.push(entry);
    drawBrandHeader(ctx, page);
    return entry;
  };

  const first = newPage();

  const layout: Layout = {
    ctx,
    page: first.page,
    pageIndex: first.index,
    y: HEADER_TOP_Y,

    ensureSpace(height: number): void {
      if (layout.y - height >= CONTENT_FLOOR) return;
      // Un bloque más alto que la caja de texto no cabría en ninguna página:
      // se deja pasar para que el salto de página no se repita sin fin.
      if (height > USABLE_HEIGHT) return;
      layout.addPage();
    },

    addPage(): void {
      const entry = newPage();
      layout.page = entry.page;
      layout.pageIndex = entry.index;
      layout.y = HEADER_TOP_Y;
    },

    moveDown(amount: number): void {
      layout.y -= amount;
    },

    drawTextAt(text, x, baseline, opts): void {
      if (text.length === 0) return;
      layout.page.drawText(sanitize(text), {
        x,
        y: baseline,
        size: opts.size,
        font: opts.font,
        color: opts.color,
      });
    },

    drawLine(y, opts): void {
      const x = opts?.x ?? MARGIN_X;
      const width = opts?.width ?? CONTENT_WIDTH;
      layout.page.drawLine({
        start: { x, y },
        end: { x: x + width, y },
        thickness: opts?.thickness ?? 0.5,
        color: opts?.color ?? C.lineSoft,
      });
    },

    fillRect(x, bottom, width, height, opts): void {
      layout.page.drawRectangle({
        x,
        y: bottom,
        width,
        height,
        color: opts?.fill,
        borderColor: opts?.border,
        borderWidth: opts?.border === undefined ? undefined : (opts?.borderWidth ?? 0.75),
      });
    },
  };

  return {
    layout,
    finish(): void {
      drawFooters(ctx, pages);
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Primitivas de composición                                                 */
/* -------------------------------------------------------------------------- */

/** Etiqueta pequeña en mayúsculas grises. */
function drawLabel(layout: Layout, text: string, x: number, baseline: number): void {
  layout.drawTextAt(text.toUpperCase(), x, baseline, {
    font: layout.ctx.font.bold,
    size: LABEL_SIZE,
    color: C.steel,
  });
}

/** Línea rotulada (label + valor). Devuelve la altura consumida. */
function drawKeyValue(
  layout: Layout,
  label: string,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  opts?: { size?: number; color?: RGB; font?: PDFFont },
): number {
  const size = opts?.size ?? KV_SIZE;
  const font = opts?.font ?? layout.ctx.font.bold;
  const safeValue = value.trim().length > 0 ? value : "—";

  drawLabel(layout, label, x, y);
  const lines = wrapText(safeValue, font, size, maxWidth);

  let cursor = y - KV_LABEL_SIZE - 8;
  for (const line of lines) {
    layout.drawTextAt(line, x, cursor, {
      font,
      size,
      color: opts?.color ?? C.obsidian,
    });
    cursor -= size + 2.5;
  }

  return y - cursor;
}

/**
 * Título de sección con filete cyan.
 * `keepWith` reserva espacio para el primer bloque que va debajo, de modo que
 * un título nunca quede solo al final de una página.
 */
function drawSectionHeading(layout: Layout, title: string, keepWith = 0): void {
  layout.ensureSpace(Math.max(34, keepWith));
  const top = layout.y;
  drawLabel(layout, title, MARGIN_X, top);
  layout.drawLine(top - 8, { thickness: 1, color: C.cyan });
  layout.y = top - 22;
}

/** Cabecera de tabla sobre fondo Slate Surface con texto blanco. */
function drawTableHeader(
  layout: Layout,
  columns: { label: string; align: "left" | "right" }[],
  widths: number[],
  height: number,
): void {
  const top = layout.y;
  const bottom = top - height;
  layout.fillRect(MARGIN_X, bottom, CONTENT_WIDTH, height, { fill: C.slate });

  let x = MARGIN_X + 8;
  columns.forEach((column, index) => {
    const width = widths[index] ?? 0;
    const text = column.label.toUpperCase();
    const size = TABLE_HEADER_SIZE;
    const textWidth = layout.ctx.font.bold.widthOfTextAtSize(text, size);
    const drawX = column.align === "right" ? x + width - textWidth - 8 : x;

    layout.drawTextAt(text, drawX, bottom + height / 2 - size * 0.36, {
      font: layout.ctx.font.bold,
      size,
      color: C.white,
    });

    x += width;
  });

  layout.y = bottom;
}

/** Fila de tabla con fondo alternado y separador inferior. */
function drawTableRow(
  layout: Layout,
  cells: { text: string; align: "left" | "right" }[],
  widths: number[],
  rowIndex: number,
  opts?: { bold?: boolean; height?: number },
): void {
  const height = opts?.height ?? 20;
  layout.ensureSpace(height + 4);

  const top = layout.y;
  const bottom = top - height;
  const font = opts?.bold === true ? layout.ctx.font.bold : layout.ctx.font.regular;

  if (rowIndex % 2 === 1 || opts?.bold === true) {
    layout.fillRect(MARGIN_X, bottom, CONTENT_WIDTH, height, {
      fill: opts?.bold === true ? rgb(0.918, 0.945, 0.973) : C.rowTint,
    });
  }

  let x = MARGIN_X + 8;
  cells.forEach((cell, index) => {
    const width = widths[index] ?? 0;
    const text = cell.text;
    const textWidth = font.widthOfTextAtSize(text, TABLE_CELL_SIZE);
    const drawX = cell.align === "right" ? x + width - textWidth - 8 : x;

    layout.drawTextAt(text, drawX, bottom + height / 2 - TABLE_CELL_SIZE * 0.36, {
      font,
      size: TABLE_CELL_SIZE,
      color: C.obsidian,
    });

    x += width;
  });

  layout.drawLine(bottom, { thickness: 0.5, color: C.lineSoft });
  layout.y = bottom;
}

/** Píldora de estado con color según el ciclo de vida del contrato. */
function statusColor(status: ContractStatus): RGB {
  switch (status) {
    case "firmado":
    case "aprobado":
    case "completado":
      return C.cyan;
    case "enviado":
    case "en_negociacion":
      return C.indigo;
    case "rechazado":
    case "cancelado":
      return rgb(0.937, 0.267, 0.267);
    case "borrador":
    default:
      return C.slate;
  }
}

const STATUS_LABELS: Record<ContractStatus, string> = {
  borrador: "Borrador",
  enviado: "Enviado",
  en_negociacion: "En negociación",
  aprobado: "Aprobado",
  firmado: "Firmado",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
  completado: "Completado",
};

const CATEGORY_LABELS: Record<ContractClause["category"], string> = {
  general: "General",
  tecnico: "Técnico",
  legal: "Legal",
  economico: "Económico",
  propiedad: "Propiedad",
};

/** Formato arábigo de dos dígitos para la numeración de cláusulas. */
function clauseNumber(order: number): string {
  return `CLÁUSULA ${String(order).padStart(2, "0")}`;
}

function textOr(value: string | null | undefined, fallback = "—"): string {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/* -------------------------------------------------------------------------- */
/*  Secciones del documento                                                   */
/* -------------------------------------------------------------------------- */

/** 2. Datos del contrato: código, estado, fecha de emisión y versión. */
function sectionContractData(layout: Layout, contract: Contract): void {
  const height = 64;
  layout.ensureSpace(height + 12);

  const top = layout.y;
  const bottom = top - height;

  layout.fillRect(MARGIN_X, bottom, CONTENT_WIDTH, height, {
    fill: rgb(0.98, 0.988, 0.996),
    border: C.cyan,
    borderWidth: 1,
  });

  drawLabel(layout, "Código de contrato", MARGIN_X + 12, top - 16);
  layout.drawTextAt(contract.code, MARGIN_X + 12, top - 31, {
    font: layout.ctx.font.mono,
    size: 11,
    color: C.obsidian,
  });

  const statusText = STATUS_LABELS[contract.status];
  const pillFontSize = 7.5;
  const pillTextWidth = layout.ctx.font.bold.widthOfTextAtSize(statusText, pillFontSize);
  const pillWidth = pillTextWidth + 22;
  const pillX = PAGE_WIDTH - MARGIN_X - 12 - pillWidth;
  const pillHeight = 16;
  const pillBottom = top - 16 - pillHeight + 4;

  layout.fillRect(pillX, pillBottom, pillWidth, pillHeight, {
    fill: statusColor(contract.status),
  });
  layout.drawTextAt(statusText, pillX + 11, pillBottom + pillHeight / 2 - pillFontSize * 0.36, {
    font: layout.ctx.font.bold,
    size: pillFontSize,
    color: C.white,
  });

  const rightColumn = MARGIN_X + CONTENT_WIDTH / 2 + 28;

  drawLabel(layout, "Emitido", rightColumn, top - 16);
  layout.drawTextAt(formatDate(contract.created_at), rightColumn, top - 27, {
    font: layout.ctx.font.regular,
    size: 8,
    color: C.obsidian,
  });

  drawLabel(layout, "Versión actual", rightColumn, top - 42);
  layout.drawTextAt(`v${contract.current_version}`, rightColumn, top - 53, {
    font: layout.ctx.font.mono,
    size: 8,
    color: C.obsidian,
  });

  layout.y = bottom - 14;
}

/** 3. Partes: EL CONTRATISTA y EL CLIENTE, lado a lado. */
function sectionParties(layout: Layout, contract: Contract, ctx: WriterContext): void {
  const gap = 14;
  const cardWidth = (CONTENT_WIDTH - gap) / 2;
  /** Alto de la tarjeta más larga (cliente con dirección incluida). */
  const boxHeight = 124;
  const hasClientAddress = (contract.client_address ?? "").trim().length > 0;
  /** Alto del contenido realmente dibujado en cada variante. */
  const contentHeight = hasClientAddress ? boxHeight : boxHeight - 23;

  layout.ensureSpace(boxHeight + 10);
  const top = layout.y;
  const bottom = top - boxHeight;

  const cards: {
    x: number;
    label: string;
    name: string;
    id: string;
    extra: string;
    email: string;
    address: string;
    showAddress: boolean;
  }[] = [
    {
      x: MARGIN_X,
      label: "El Contratista",
      name: ctx.meta.ownerName,
      id: ctx.meta.ownerId,
      extra: DEFAULT_OWNER_ROLE,
      email: DEFAULT_OWNER_EMAIL,
      address: "",
      showAddress: false,
    },
    {
      x: MARGIN_X + cardWidth + gap,
      label: "El Cliente",
      name: textOr(contract.client_name),
      id: textOr(contract.client_doc_id, "Documento no registrado"),
      extra: textOr(contract.client_company, "Persona natural"),
      email: textOr(contract.client_email, "Correo no registrado"),
      address: textOr(contract.client_address, ""),
      showAddress: (contract.client_address ?? "").trim().length > 0,
    },
  ];

  for (const card of cards) {
    layout.fillRect(card.x, bottom, cardWidth, contentHeight, { fill: C.cardTint });
    layout.fillRect(card.x, bottom, 2.5, contentHeight, { fill: C.indigo });

    const innerX = card.x + 14;
    const innerWidth = cardWidth - 26;

    drawLabel(layout, card.label, innerX, top - 16);
    layout.drawLine(top - 25, { x: innerX, width: innerWidth, thickness: 0.5, color: C.lineSoft });

    drawKeyValue(layout, "Nombre", card.name, innerX, top - 35, innerWidth);
    drawKeyValue(layout, "Documento / NIT", card.id, innerX, top - 58, innerWidth);
    drawKeyValue(layout, "Empresa / Cargo", card.extra, innerX, top - 81, innerWidth);
    drawKeyValue(layout, "Correo", card.email, innerX, top - 104, innerWidth);

    if (card.showAddress) {
      drawKeyValue(layout, "Dirección", card.address, innerX, top - 127, innerWidth);
    }
  }

  layout.y = bottom - 14;
}

/** 4. Objeto del contrato: título y alcance justificado. */
function sectionObject(layout: Layout, contract: Contract): void {
  drawSectionHeading(layout, "Objeto del contrato", 26 + HEADING_SIZE + 5);

  layout.ensureSpace(24);
  const titleLines = wrapText(contract.title, layout.ctx.font.bold, HEADING_SIZE, CONTENT_WIDTH);
  for (const line of titleLines) {
    layout.ensureSpace(HEADING_SIZE + 8);
    layout.drawTextAt(line, MARGIN_X, layout.y - HEADING_SIZE, {
      font: layout.ctx.font.bold,
      size: HEADING_SIZE,
      color: C.obsidian,
    });
    layout.y -= HEADING_SIZE + 5;
  }

  layout.moveDown(6);

  drawParagraph(layout, contract.scope, {
    x: MARGIN_X,
    maxWidth: CONTENT_WIDTH,
    size: BODY_SIZE,
    leading: BODY_LEADING,
    font: layout.ctx.font.regular,
    color: C.obsidian,
  });

  if (contract.deliverables.length > 0) {
    layout.moveDown(6);
    layout.ensureSpace(26);
    drawLabel(layout, "Entregables", MARGIN_X, layout.y);
    layout.moveDown(11);
    drawParagraph(layout, contract.deliverables.map((d: string) => `- ${d}`).join("\n"), {
      x: MARGIN_X,
      maxWidth: CONTENT_WIDTH,
      size: 8,
      leading: 11,
      font: layout.ctx.font.regular,
      color: C.slate,
    });
  }

  if (contract.exclusions.length > 0) {
    layout.moveDown(6);
    layout.ensureSpace(26);
    drawLabel(layout, "Exclusiones", MARGIN_X, layout.y);
    layout.moveDown(11);
    drawParagraph(layout, contract.exclusions.map((e: string) => `- ${e}`).join("\n"), {
      x: MARGIN_X,
      maxWidth: CONTENT_WIDTH,
      size: 8,
      leading: 11,
      font: layout.ctx.font.regular,
      color: C.slate,
    });
  }

  layout.moveDown(14);
}

/** 5. Tabla económica. */
function sectionEconomics(layout: Layout, contract: Contract): void {
  drawSectionHeading(layout, "Condiciones económicas", 24 + 6 * 20 + 6);

  const colA = 170;
  const colB = CONTENT_WIDTH - colA;

  const duration = contract.duration_days === null ? "Por definir" : `${contract.duration_days} días calendario`;
  const warranty =
    contract.warranty_days === null ? "No especificada" : `${contract.warranty_days} días calendario`;
  const startDate = contract.start_date === null ? "Por definir" : formatDate(contract.start_date);
  const currency = contract.currency.trim().length > 0 ? contract.currency : DEFAULT_CURRENCY;

  const rows: [string, string][] = [
    ["Alcance", contract.title],
    ["Valor total", formatCOP(contract.total)],
    ["Moneda", currency],
    ["Plazo de ejecución", duration],
    ["Garantía", warranty],
    ["Fecha de inicio", startDate],
  ];

  layout.ensureSpace(24 + rows.length * 20 + 6);

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (row === undefined) continue;
    layout.page.drawRectangle({
      x: MARGIN_X,
      y: layout.y - 20,
      width: CONTENT_WIDTH,
      height: 20,
      color: i % 2 === 1 ? C.rowTint : undefined,
    });
    layout.drawTextAt(row[0].toUpperCase(), MARGIN_X + 8, layout.y - 13.5, {
      font: layout.ctx.font.bold,
      size: 8,
      color: C.steel,
    });
    const valueFont = i === 1 ? layout.ctx.font.bold : layout.ctx.font.regular;
    const valueText = wrapText(row[1], valueFont, TABLE_CELL_SIZE, colB - 16)[0] ?? row[1];
    layout.drawTextAt(valueText, MARGIN_X + colA + 8, layout.y - 13.5, {
      font: valueFont,
      size: TABLE_CELL_SIZE,
      color: C.obsidian,
    });
    layout.drawLine(layout.y - 20, { thickness: 0.5, color: C.lineSoft });
    layout.y -= 20;
  }

  layout.moveDown(16);
}

/** 6. Plan de pagos en tres columnas. */
function sectionPaymentPlan(layout: Layout, contract: Contract): void {
  drawSectionHeading(
    layout,
    "Plan de pagos",
    24 + (contract.payment_plan.length + 1) * 20 + 6,
  );

  const widths = [CONTENT_WIDTH - 200, 60, 140];
  const columns: { label: string; align: "left" | "right" }[] = [
    { label: "Hito", align: "left" },
    { label: "%", align: "right" },
    { label: "Monto", align: "right" },
  ];

  layout.ensureSpace(24 + (contract.payment_plan.length + 1) * 20 + 6);
  drawTableHeader(layout, columns, widths, 20);

  let total = 0;
  contract.payment_plan.forEach((item: { milestone: string; percent: number; amount: number }, index: number) => {
    total += item.amount;
    const milestone =
      wrapText(item.milestone, layout.ctx.font.regular, TABLE_CELL_SIZE, widths[0] - 16)[0] ??
      item.milestone;
    drawTableRow(
      layout,
      [
        { text: milestone, align: "left" },
        { text: `${item.percent}%`, align: "right" },
        { text: formatCOP(item.amount), align: "right" },
      ],
      widths,
      index,
    );
  });

  const totalAmount = total > 0 ? total : contract.total;
  drawTableRow(
    layout,
    [
      { text: "TOTAL", align: "left" },
      { text: "100%", align: "right" },
      { text: formatCOP(totalAmount), align: "right" },
    ],
    widths,
    contract.payment_plan.length,
    { bold: true },
  );

  layout.moveDown(16);
}

/** 7. Cláusulas con salto de página y cabecera repetida. */
function sectionClauses(layout: Layout, contract: Contract): void {
  if (contract.clauses.length === 0) return;

  drawSectionHeading(layout, "Cláusulas contractuales", 24 + 10.5 + 4 + 2 * BODY_LEADING);

  const ordered = [...contract.clauses].sort((a, b) => a.order - b.order);

  ordered.forEach((clause, index) => {
    const titleSize = 10.5;
    const titleLines = wrapText(clause.title, layout.ctx.font.bold, titleSize, CONTENT_WIDTH);
    const bodyLines = wrapText(clause.body, layout.ctx.font.regular, BODY_SIZE, CONTENT_WIDTH);

    const headerHeight = 24 + titleLines.length * (titleSize + 4);
    const fullHeight = headerHeight + bodyLines.length * BODY_LEADING + 20;

    // Se evita dejar el encabezado huérfano: si la cláusula cabe entera en una
    // página pero no en lo que queda de la actual, empieza en la siguiente.
    if (fullHeight <= USABLE_HEIGHT && layout.y - fullHeight < CONTENT_FLOOR) {
      layout.addPage();
    } else {
      // Si no cabe entera, al menos se reserva el encabezado y las primeras
      // líneas del cuerpo (un mínimo de 60 pt) antes de decidir el corte.
      layout.ensureSpace(Math.min(headerHeight + 6 * BODY_LEADING, 200));
    }

    const headerTop = layout.y;
    layout.drawTextAt(clauseNumber(index + 1), MARGIN_X, headerTop, {
      font: layout.ctx.font.bold,
      size: 7,
      color: C.cyan,
    });

    const category = CATEGORY_LABELS[clause.category].toUpperCase();
    const categoryWidth = layout.ctx.font.bold.widthOfTextAtSize(category, 6.5);
    layout.drawTextAt(category, PAGE_WIDTH - MARGIN_X - categoryWidth, headerTop, {
      font: layout.ctx.font.bold,
      size: 6.5,
      color: C.indigo,
    });

    layout.moveDown(16);

    for (const line of titleLines) {
      layout.ensureSpace(titleSize + 6);
      layout.drawTextAt(line, MARGIN_X, layout.y - titleSize, {
        font: layout.ctx.font.bold,
        size: titleSize,
        color: C.obsidian,
      });
      layout.y -= titleSize + 4;
    }

    layout.moveDown(5);

    drawParagraph(layout, clause.body, {
      x: MARGIN_X,
      maxWidth: CONTENT_WIDTH,
      size: BODY_SIZE,
      leading: BODY_LEADING,
      font: layout.ctx.font.regular,
      color: C.obsidian,
    });

    layout.moveDown(11);
    layout.ensureSpace(12);
    layout.drawLine(layout.y, { thickness: 0.5, color: C.lineSoft });
    layout.moveDown(14);
  });
}

/** Una de las dos columnas del bloque de firmas. */
function drawSignature(
  layout: Layout,
  x: number,
  width: number,
  top: number,
  label: string,
  name: string,
  docId: string,
  role: string,
  email: string,
): void {
  const lineY = top - 52;

  drawLabel(layout, label, x, top);
  layout.drawLine(lineY, { x, width, thickness: 0.75, color: C.slate });

  layout.drawTextAt(name, x, lineY - 14, {
    font: layout.ctx.font.bold,
    size: 9,
    color: C.obsidian,
  });
  layout.drawTextAt(docId, x, lineY - 26, {
    font: layout.ctx.font.regular,
    size: 7.5,
    color: C.steel,
  });
  layout.drawTextAt(role, x, lineY - 37, {
    font: layout.ctx.font.regular,
    size: 7.5,
    color: C.steel,
  });
  layout.drawTextAt(email, x, lineY - 48, {
    font: layout.ctx.font.regular,
    size: 7.5,
    color: C.steel,
  });
}

/** 8. Bloque de firmas en página nueva (o al final si cabe). */
function sectionSignatures(layout: Layout, contract: Contract, ctx: WriterContext): void {
  const blockHeight = 150;

  if (layout.y - blockHeight < CONTENT_FLOOR) {
    layout.addPage();
  }

  drawSectionHeading(layout, "Firmas", blockHeight);

  const gap = 24;
  const columnWidth = (CONTENT_WIDTH - gap) / 2;
  const top = layout.y;

  drawSignature(
    layout,
    MARGIN_X,
    columnWidth,
    top,
    "El Contratista",
    ctx.meta.ownerName,
    ctx.meta.ownerId,
    DEFAULT_OWNER_ROLE,
    DEFAULT_OWNER_EMAIL,
  );

  drawSignature(
    layout,
    MARGIN_X + columnWidth + gap,
    columnWidth,
    top,
    "El Cliente",
    textOr(contract.client_name),
    textOr(contract.client_doc_id, "Documento no registrado"),
    textOr(contract.client_company, "Representante legal"),
    textOr(contract.client_email, "Correo no registrado"),
  );

  layout.y = top - 112;

  layout.ensureSpace(30);
  layout.drawLine(layout.y, { thickness: 0.5, color: C.lineSoft });
  layout.moveDown(14);

  const place = ctx.meta.city.trim().length > 0 ? ctx.meta.city : DEFAULT_CITY;
  layout.drawTextAt(`${place}, ${formatDate(ctx.generatedAt)}.`, MARGIN_X, layout.y, {
    font: layout.ctx.font.italic,
    size: 7.5,
    color: C.steel,
  });
  layout.moveDown(12);

  const note =
    "Las partes declaran haber leído y aceptado el presente documento en su totalidad y firman en señal de conformidad.";
  drawParagraph(layout, note, {
    x: MARGIN_X,
    maxWidth: CONTENT_WIDTH,
    size: 7.5,
    leading: 10,
    font: layout.ctx.font.italic,
    color: C.steel,
  });

  // Espacio de firma deliberado en blanco antes del pie de página.
  layout.moveDown(8);
}

/* -------------------------------------------------------------------------- */
/*  API pública                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Genera el PDF del contrato y devuelve sus bytes.
 * Es seguro de invocar tanto en el servidor como en el cliente.
 */
export async function generateContractPdf(
  contract: Contract,
  options?: ContractPdfOptions,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  const generatedAt = new Date();

  doc.setTitle(`${contract.code} — ${contract.title}`);
  doc.setAuthor(options?.ownerName?.trim() || DEFAULT_OWNER_NAME);
  doc.setSubject("Contrato de prestación de servicios de ingeniería de software");
  doc.setCreator(WORDMARK);
  doc.setProducer("pdf-lib");
  doc.setCreationDate(generatedAt);

  const ctx: WriterContext = {
    doc,
    font: {
      regular: await doc.embedFont(StandardFonts.Helvetica),
      bold: await doc.embedFont(StandardFonts.HelveticaBold),
      italic: await doc.embedFont(StandardFonts.HelveticaOblique),
      mono: await doc.embedFont(StandardFonts.Courier),
    },
    meta: {
      ownerName: options?.ownerName?.trim() || DEFAULT_OWNER_NAME,
      ownerId: options?.ownerId?.trim() || DEFAULT_OWNER_ID,
      city: options?.city?.trim() || DEFAULT_CITY,
    },
    generatedAt,
  };

  const writer = createWriter(ctx);
  const { layout } = writer;

  sectionContractData(layout, contract);
  sectionParties(layout, contract, ctx);
  sectionObject(layout, contract);
  sectionEconomics(layout, contract);
  sectionPaymentPlan(layout, contract);
  sectionClauses(layout, contract);
  sectionSignatures(layout, contract, ctx);

  // El pie necesita conocer el total de páginas, por eso se dibuja al final.
  writer.finish();

  return doc.save();
}

/** Copia los bytes a un `ArrayBuffer` con dueño propio, apto como `BlobPart`. */
function toBlobPart(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

/**
 * Genera el PDF y dispara la descarga en el navegador con el nombre de archivo
 * canónico del contrato. Sólo produce efectos en cliente.
 */
export async function downloadContractPdf(
  contract: Contract,
  options?: ContractPdfOptions,
): Promise<void> {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const bytes = await generateContractPdf(contract, options);
  const blob = new Blob([toBlobPart(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = contractFileName(contract);
    anchor.rel = "noopener";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    // Se libera el object URL después de que el navegador haya leído el blob.
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

/**
 * Abre el PDF en una pestaña nueva e intenta lanzar la impresión.
 * Si el navegador bloquea el popup, cae a `downloadContractPdf`.
 */
export async function printContractPdf(
  contract: Contract,
  options?: ContractPdfOptions,
): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const bytes = await generateContractPdf(contract, options);
  const blob = new Blob([toBlobPart(bytes)], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  // El visor de PDF del navegador no es accesible por DOM: se abre el blob URL
  // en una pestaña nueva e se intenta disparar la impresión sobre ella.
  const printWindow = window.open(blobUrl, "_blank");
  if (printWindow === null) {
    URL.revokeObjectURL(blobUrl);
    await downloadContractPdf(contract, options);
    return;
  }

  window.setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      // Algunos visores nativos de PDF no exponen `print()`: la pestaña queda
      // abierta con el documento para imprimir con Ctrl/Cmd + P.
    }
  }, 900);
}

/**
 * Convierte los bytes del PDF en un `data:` URI base64 sin usar `Buffer`.
 * Se procesa por chunks para no desbordar la pila con `String.fromCharCode`.
 */
export function contractPdfDataUri(bytes: Uint8Array): string {
  if (typeof btoa !== "function") {
    throw new Error("contractPdfDataUri requiere un entorno con btoa (navegador).");
  }

  const CHUNK = 0x8000;
  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += CHUNK) {
    const chunk = bytes.subarray(offset, Math.min(offset + CHUNK, bytes.length));
    binary += String.fromCharCode(...Array.from(chunk));
  }

  return `data:application/pdf;base64,${btoa(binary)}`;
}
