/**
 * Identidad de marca — Jhoiker Zambrano
 * Fuente única de verdad, extraída del Manual de Identidad de Marca v3.0
 * (manual_marca_jhoiker_zambrano_v3.pdf)
 */

export const BRAND = {
  name: "Jhoiker Zambrano",
  shortName: "JZ",
  isotipo: "[ J Z ]",
  wordmark: "JHOIKER ZAMBRANO",
  role: "Ingeniería de Software & Arquitectura Digital",
  roleShort: "Ingeniería de Software",
  focus: "Páginas web · Diseño gráfico · Infraestructura",
  tagline: "Eficiencia técnica absoluta.",
  manualVersion: "v3.0",
  owner: "Jhoiker Zambrano",
  manualDate: "Octubre 2026",
  claim:
    "Marca personal futurista y cercana. Eficiencia técnica absoluta donde el trabajo habla por sí mismo y cada solución cuenta con un estándar de excelencia impecable.",
} as const;

/** Paleta cromática oficial — Manual de Identidad v3.0, página 03 */
export const PALETTE = [
  {
    name: "Obsidian Deep",
    role: "Fondo Base",
    hex: "#0A0D14",
    rgb: "10, 13, 20",
    description:
      "Fondo general para sitios web y documentos, reduce la fatiga visual y aporta elegancia.",
    usage: "background",
  },
  {
    name: "Cyan Energy",
    role: "Acento Principal / Neón",
    hex: "#38BDF8",
    rgb: "56, 189, 248",
    description:
      "Reservado para llamadas a la acción, isotipos, bordes activos y destaques visuales.",
    usage: "primary",
  },
  {
    name: "Indigo Automation",
    role: "Secundario",
    hex: "#818CF8",
    rgb: "129, 140, 248",
    description:
      "Ideal para tarjetas secundarias, separadores y acentos de apoyo.",
    usage: "secondary",
  },
  {
    name: "Slate Surface",
    role: "Contenedores",
    hex: "#1E293B",
    rgb: "30, 41, 59",
    description:
      "Color de superficie para tarjetas de servicios, bloques de texto y cajas de contratos.",
    usage: "surface",
  },
] as const;

/** Sistema tipográfico oficial — Manual de Identidad v3.0, página 02 */
export const TYPOGRAPHY = [
  {
    order: "01",
    scope: "TITULARES, ENCABEZADOS E ISOTIPO",
    family: "Orbitron",
    weights: "Bold / Black",
    sample: "JHOIKER ZAMBRANO — TECH LAB",
    description:
      "Estética geométrica inspirada en interfaces de ciencia ficción y terminales de control avanzado.",
    cssVar: "--font-orbitron",
    className: "font-display",
  },
  {
    order: "02",
    scope: "CUERPO DE TEXTO, CONTRATOS Y CATÁLOGOS",
    family: "Plus Jakarta Sans",
    weights: "Regular / SemiBold",
    sample: "Desarrollo web a medida, automatizaciones fluidas y soluciones digitales.",
    description:
      "Máxima legibilidad en pantallas de alta resolución y documentos legales limpios.",
    cssVar: "--font-jakarta",
    className: "font-sans",
  },
  {
    order: "03",
    scope: "BLOQUES DE CÓDIGO, PRECIOS Y VARIABLES TÉCNICAS",
    family: "JetBrains Mono",
    weights: "Regular",
    sample: 'const brand = "Jhoiker Zambrano";',
    description:
      "Aporta el toque de programación profesional en especificaciones y cláusulas técnicas.",
    cssVar: "--font-jetbrains",
    className: "font-mono",
  },
] as const;

export type PaletteItem = (typeof PALETTE)[number];
export type TypographyItem = (typeof TYPOGRAPHY)[number];
