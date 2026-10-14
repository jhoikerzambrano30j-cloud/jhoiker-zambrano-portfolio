import type { Metadata } from "next";
import { Palette, Type, ShieldCheck, XCircle, CheckCircle2, Ruler, Download } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { SectionHeading, Card, Badge, CodeBlock } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { Logo, Isotipo, LogoHorizontal } from "@/components/brand/Logo";
import { CtaBand } from "@/components/sections/CtaBand";
import { BRAND, PALETTE, TYPOGRAPHY } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Marca",
  description:
    "Manual de identidad de marca v3.0 de Jhoiker Zambrano: paleta cromática oficial, sistema tipográfico, isotipo [ J Z ] y reglas de uso.",
};

const RULES_DO = [
  "Mantén el isotipo [ J Z ] sobre fondos Obsidian Deep o Slate Surface.",
  "Respeta el espacio de aire mínimo: el ancho de un corchete alrededor del isotipo.",
  "Usa la «Z» siempre en Cyan Energy #38BDF8.",
  "Usa Orbitron solo en titulares e isotipo; nunca en párrafos largos.",
  "Usa JetBrains Mono para precios, códigos, variables y cláusulas técnicas.",
  "Mantén el contraste del texto por encima del 4.5:1.",
];

const RULES_DONT = [
  "No rotar, deformar, inclinar ni aplicar sombras duras al isotipo.",
  "No cambiar los colores de los corchetes ni de la «J».",
  "No colocar el isotipo sobre fotografías sin una capa de oscurecimiento.",
  "No usar dorados, degradados ajenos ni colores fuera de la paleta.",
  "No sustituir las tipografías oficiales por alternativas del sistema.",
  "No reconstruir el logotipo escribiéndolo a mano en otra tipografía.",
];

export default function MarcaPage() {
  return (
    <>
      <PageHeader
        eyebrow={`Manual de identidad de marca ${BRAND.manualVersion}`}
        title="Mi identidad"
        highlight="hecha sistema"
        description="Todo lo que define cómo se ve y cómo se lee mi marca, en un solo lugar. Esta página es la versión viva del manual: los mismos tokens que alimentan la web."
        breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Marca" }]}
      >
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Badge tone="cyan">Propietario: {BRAND.owner}</Badge>
          <Badge tone="indigo">{BRAND.manualDate}</Badge>
          <Badge tone="muted">Fuente única de verdad</Badge>
        </div>
      </PageHeader>

      {/* 01 — ISOTIPO Y LOGOTIPO */}
      <section className="pb-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="01. Isotipo y logotipo"
            index="01 / 05"
            title="Estructura del"
            highlight="logotipo"
            description="El identificador visual representa solidez estructural de sistemas y precisión en el código. Está compuesto por el monograma cibernético [ JZ ] flanqueado por corchetes de desarrollo, garantizando contraste máximo sobre fondos oscuros."
          />

          {/* Isotipo principal en escaparate */}
          <Reveal className="mt-12">
            <div className="surface-card relative overflow-hidden rounded-2xl p-10 sm:p-16">
              <div className="absolute inset-0 grid-backdrop opacity-60" />
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-energy/10 blur-[80px]" />
              <span className="absolute left-5 top-5 h-5 w-5 border-l-2 border-t-2 border-cyan-energy/50" />
              <span className="absolute right-5 top-5 h-5 w-5 border-r-2 border-t-2 border-cyan-energy/50" />
              <span className="absolute bottom-5 left-5 h-5 w-5 border-b-2 border-l-2 border-cyan-energy/50" />
              <span className="absolute bottom-5 right-5 h-5 w-5 border-b-2 border-r-2 border-cyan-energy/50" />

              <div className="relative flex justify-center">
                <Logo size="hero" showWordmark animate />
              </div>
            </div>
          </Reveal>

          {/* Variantes */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Versión principal",
                caption: "Isotipo + wordmark sobre fondo Obsidian Deep",
                content: (
                  <div className="rounded-xl bg-obsidian p-8">
                    <div className="flex justify-center">
                      <Logo size="md" showWordmark />
                    </div>
                  </div>
                ),
              },
              {
                title: "Versión horizontal",
                caption: "Para navbar, cabeceras y firmas de correo",
                content: (
                  <div className="rounded-xl bg-obsidian p-8">
                    <div className="flex justify-center">
                      <LogoHorizontal />
                    </div>
                  </div>
                ),
              },
              {
                title: "Contenedor de app",
                caption: "Isotipo solo, para favicon y avatares",
                content: (
                  <div className="flex items-center justify-center gap-5 rounded-xl bg-obsidian p-8">
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-energy/30 bg-obsidian-800">
                      <Isotipo size={30} />
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-energy/30 bg-obsidian-800">
                      <Isotipo size={20} />
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-energy/30 bg-obsidian-800">
                      <Isotipo size={13} />
                    </span>
                  </div>
                ),
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <Card className="h-full p-5" accent>
                  {item.content}
                  <h3 className="mt-5 font-display text-[0.92rem] font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[0.8rem] leading-relaxed text-steel">{item.caption}</p>
                </Card>
              </Reveal>
            ))}
          </div>

          {/* Significado + espacio de aire */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <Card className="h-full p-6">
                <h3 className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                  Isotipo principal [ JZ ]
                </h3>
                <p className="mt-4 text-[0.88rem] leading-relaxed text-steel">
                  Sintaxis limpia inspirada en lenguajes de programación. Los corchetes simbolizan
                  contención, seguridad y estructuración lógica; el monograma, las iniciales del
                  nombre. La «Z» en Cyan Energy marca el acento de identidad.
                </p>
              </Card>
            </Reveal>
            <Reveal delay={80}>
              <Card className="h-full p-6">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-cyan-energy" />
                  <h3 className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                    Espacio de aire mínimo
                  </h3>
                </div>
                <div className="mt-5 flex justify-center">
                  <div className="relative border border-dashed border-cyan-energy/30 p-7">
                    <Logo size="sm" showWordmark={false} />
                    <span className="absolute -top-px left-1/2 -translate-x-1/2 -translate-y-1/2 bg-obsidian px-1.5 font-mono text-[0.55rem] text-cyan-energy/70">
                      X
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-center font-mono text-[0.66rem] text-steel-faint">
                  X = ancho de un corchete del isotipo
                </p>
              </Card>
            </Reveal>
          </div>

          {/* Reglas de uso */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <Card className="h-full border-emerald-400/20 p-6">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                  <h3 className="font-display text-[0.95rem] font-bold text-white">Uso correcto</h3>
                </div>
                <ul className="mt-5 space-y-3">
                  {RULES_DO.map((r) => (
                    <li key={r} className="flex items-start gap-3 text-[0.84rem] leading-snug text-chrome">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>

            <Reveal delay={80}>
              <Card className="h-full border-rose-400/20 p-6">
                <div className="flex items-center gap-2.5">
                  <XCircle className="h-4.5 w-4.5 text-rose-400" />
                  <h3 className="font-display text-[0.95rem] font-bold text-white">Uso incorrecto</h3>
                </div>
                <ul className="mt-5 space-y-3">
                  {RULES_DONT.map((r) => (
                    <li key={r} className="flex items-start gap-3 text-[0.84rem] leading-snug text-chrome">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 02 — SISTEMA TIPOGRÁFICO */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="02. Sistema tipográfico"
            index="02 / 05"
            title="Familias tipográficas"
            highlight="oficiales"
            description="Jerarquía tipográfica diseñada para comunicar alta tecnología, orden impecable y claridad absoluta en contratos y catálogos digitales."
          />

          <div className="mt-12 space-y-6">
            {TYPOGRAPHY.map((t, i) => (
              <Reveal key={t.family} delay={i * 90}>
                <Card className="p-6 sm:p-8" accent>
                  <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                      <span className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                        {t.order}. {t.scope}
                      </span>
                      <h3 className="mt-3 font-display text-xl font-black text-white">
                        {t.family}
                      </h3>
                      <p className="mt-1 font-mono text-[0.72rem] text-steel-dim">{t.weights}</p>
                      <p className="mt-4 text-[0.86rem] leading-relaxed text-steel">
                        {t.description}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.07] bg-obsidian p-6">
                      <p
                        className={
                          t.className === "font-display"
                            ? "font-display text-lg font-bold leading-snug text-white"
                            : t.className === "font-mono"
                              ? "font-mono text-sm leading-relaxed text-cyan-energy"
                              : "font-sans text-base leading-relaxed text-chrome"
                        }
                      >
                        {t.sample}
                      </p>
                      <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-steel-faint">
                        {t.family} · {t.weights}
                      </p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>

          {/* Escala tipográfica */}
          <Reveal className="mt-6">
            <Card className="p-6 sm:p-8">
              <h3 className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                Escala tipográfica en uso
              </h3>
              <div className="mt-6 space-y-5">
                {[
                  { label: "Display / Hero", cls: "font-display text-4xl font-black text-white", sample: "JHOIKER ZAMBRANO" },
                  { label: "Titular de sección", cls: "font-display text-2xl font-black text-white", sample: "El trabajo habla por sí mismo" },
                  { label: "Subtítulo", cls: "font-sans text-lg font-light text-chrome", sample: "Ingeniería de Software & Arquitectura Digital" },
                  { label: "Cuerpo de texto", cls: "font-sans text-[0.92rem] text-steel", sample: "Desarrollo web a medida, automatizaciones fluidas y soluciones digitales." },
                  { label: "Etiqueta técnica", cls: "font-mono text-[0.68rem] uppercase tracking-[0.18em] text-cyan-energy", sample: "CLÁUSULA TÉCNICA · ARTÍCULO 07" },
                  { label: "Código", cls: "font-mono text-sm text-cyan-energy", sample: 'const brand = "Jhoiker Zambrano";' },
                ].map((row) => (
                  <div key={row.label} className="border-b border-white/[0.06] pb-4 last:border-0 last:pb-0">
                    <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-steel-faint">
                      {row.label}
                    </p>
                    <p className={row.cls}>{row.sample}</p>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* 03 — PALETA DE COLORES */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="03. Paleta de colores"
            index="03 / 05"
            title="Identidad"
            highlight="cromática"
            description="Gama de tonos oscuros y destellos de alta energía para construir una atmósfera limpia, profesional y futurista."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PALETTE.map((color, i) => (
              <Reveal key={color.hex} delay={i * 80}>
                <Card className="h-full overflow-hidden" interactive>
                  <div
                    className="relative h-32 w-full"
                    style={{ backgroundColor: color.hex }}
                  >
                    <span className="absolute right-3 top-3 rounded-md border border-white/20 bg-obsidian/60 px-2 py-0.5 font-mono text-[0.6rem] text-white backdrop-blur">
                      {color.usage}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-[0.92rem] font-bold text-white">
                      {color.name}
                    </h3>
                    <p className="mt-1 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-cyan-energy">
                      {color.role}
                    </p>
                    <div className="mt-4 space-y-1.5 border-t border-white/[0.07] pt-4">
                      <p className="font-mono text-[0.72rem] text-chrome">HEX: {color.hex}</p>
                      <p className="font-mono text-[0.72rem] text-steel-dim">RGB: {color.rgb}</p>
                    </div>
                    <p className="mt-4 text-[0.8rem] leading-relaxed text-steel">
                      {color.description}
                    </p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>

          {/* Tokens en código */}
          <Reveal className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <CodeBlock
                title="globals.css — @theme"
                code={`@theme {
  --color-obsidian: #0a0d14;
  --color-cyan-energy: #38bdf8;
  --color-indigo-automation: #818cf8;
  --color-slate-surface: #1e293b;

  --font-display: var(--font-orbitron);
  --font-sans: var(--font-jakarta);
  --font-mono: var(--font-jetbrains);
}`}
              />
              <Card className="p-6">
                <h3 className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                  Proporción de uso
                </h3>
                <div className="mt-5 space-y-4">
                  {[
                    { name: "Obsidian Deep", pct: 70, hex: "#0A0D14" },
                    { name: "Slate Surface", pct: 18, hex: "#1E293B" },
                    { name: "Cyan Energy", pct: 9, hex: "#38BDF8" },
                    { name: "Indigo Automation", pct: 3, hex: "#818CF8" },
                  ].map((row) => (
                    <div key={row.name}>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[0.82rem] text-chrome">
                          <span
                            className="h-3 w-3 rounded-sm border border-white/15"
                            style={{ backgroundColor: row.hex }}
                          />
                          {row.name}
                        </span>
                        <span className="font-mono text-[0.68rem] text-steel-faint">{row.pct}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${row.pct}%`, backgroundColor: row.hex }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-[0.8rem] leading-relaxed text-steel">
                  La mayor parte de la superficie es Obsidian Deep. El Cyan Energy se reserva para
                  llamadas a la acción, isotipos, bordes activos y destaques. El acento pierde fuerza
                  si se usa en todas partes.
                </p>
              </Card>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 04 — COMPONENTES */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="04. Componentes de interfaz"
            index="04 / 05"
            title="Lenguaje de"
            highlight="componentes"
            description="Los elementos reutilizables que dan coherencia a todo el sistema, construidos sobre los tokens de marca."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <Card className="h-full p-6">
                <h3 className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                  Botones
                </h3>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button type="button" className="btn-cyan">
                    Acción principal
                  </button>
                  <button type="button" className="btn-ghost">
                    Acción secundaria
                  </button>
                  <button
                    type="button"
                    disabled
                    className="btn-cyan cursor-not-allowed !opacity-40 !shadow-none"
                  >
                    Deshabilitado
                  </button>
                </div>
              </Card>
            </Reveal>

            <Reveal delay={80}>
              <Card className="h-full p-6">
                <h3 className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                  Etiquetas de estado
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone="cyan">Publicado</Badge>
                  <Badge tone="indigo">En negociación</Badge>
                  <Badge tone="success">Firmado</Badge>
                  <Badge tone="warn">Borrador</Badge>
                  <Badge tone="danger">Rechazado</Badge>
                  <Badge tone="muted">Archivado</Badge>
                </div>
              </Card>
            </Reveal>

            <Reveal delay={120}>
              <Card className="h-full p-6">
                <h3 className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                  Campos de formulario
                </h3>
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="label-mono" htmlFor="marca-demo-input">
                      Nombre del contacto
                    </label>
                    <input id="marca-demo-input" className="field" placeholder="Ej. María Restrepo" />
                  </div>
                  <div>
                    <label className="label-mono" htmlFor="marca-demo-select">
                      Servicio de interés
                    </label>
                    <select id="marca-demo-select" className="field">
                      <option>Desarrollo web a medida</option>
                      <option>Automatización de procesos</option>
                      <option>Arquitectura y consultoría</option>
                    </select>
                  </div>
                </div>
              </Card>
            </Reveal>

            <Reveal delay={160}>
              <Card className="h-full p-6">
                <h3 className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                  Contenedores y acentos
                </h3>
                <div className="mt-5 space-y-4">
                  <div className="surface-card card-accent rounded-lg p-4">
                    <p className="text-[0.82rem] text-chrome">
                      Tarjeta de superficie con borde de acento superior
                    </p>
                  </div>
                  <div className="rounded-lg border border-cyan-energy/35 bg-cyan-energy/[0.07] p-4">
                    <p className="text-[0.82rem] text-cyan-energy">
                      Contenedor de énfasis para destacados y avisos
                    </p>
                  </div>
                  <div className="hairline" />
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-steel-faint">
                    Separador con degradado de marca
                  </p>
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 05 — VOZ Y TONO */}
      <section className="py-16">
        <div className="brand-container">
          <SectionHeading
            eyebrow="05. Voz y tono"
            index="05 / 05"
            title="Cómo habla"
            highlight="la marca"
            description="La identidad visual es la mitad. La otra mitad es cómo se escribe."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Directa",
                text: "Frases cortas, verbos concretos, cero relleno. Si una palabra no aporta información, se elimina. El lector decide en segundos y hay que respetarlo.",
              },
              {
                title: "Técnica sin pedantería",
                text: "Uso el término preciso cuando existe, y lo explico cuando hace falta. La precisión técnica no debería sonar a muro infranqueable.",
              },
              {
                title: "Cercana",
                text: "Hablo en primera persona y tuteo al cliente. Detrás de cada proyecto hay personas con un problema real y un presupuesto que les costó ganar.",
              },
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <Card className="h-full p-6" interactive>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                    <Type className="h-5 w-5 text-cyan-energy" />
                  </span>
                  <h3 className="mt-5 font-display text-base font-bold text-white">{v.title}</h3>
                  <p className="mt-3 text-[0.86rem] leading-relaxed text-steel">{v.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-6">
            <Card className="p-6 sm:p-8">
              <h3 className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan-energy">
                Ejemplos de aplicación
              </h3>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Así sí
                  </p>
                  <p className="mt-3 text-[0.88rem] leading-relaxed text-chrome">
                    «Construyo software que resuelve problemas reales y automatizo lo que no debería
                    consumir tu tiempo.»
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-rose-400">
                    <XCircle className="h-3.5 w-3.5" /> Así no
                  </p>
                  <p className="mt-3 text-[0.88rem] leading-relaxed text-steel-dim line-through decoration-rose-400/40">
                    «Somos una empresa líder con amplia experiencia ofreciendo soluciones
                    innovadoras de alto impacto y sinergias disruptivas.»
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Descarga del manual */}
      <section className="py-10">
        <div className="brand-container">
          <Reveal>
            <Card className="flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-energy/25 bg-cyan-energy/[0.08]">
                  <Download className="h-5 w-5 text-cyan-energy" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-white">
                    Manual de Identidad de Marca {BRAND.manualVersion}
                  </h3>
                  <p className="mt-1.5 max-w-lg text-[0.84rem] leading-relaxed text-steel">
                    Documento original con la definición completa de isotipo, sistema tipográfico y
                    paleta cromática. Propietario: {BRAND.owner} · {BRAND.manualDate}.
                  </p>
                </div>
              </div>
              <a
                href="/manual_marca_jhoiker_zambrano_v3.pdf"
                download
                className="btn-cyan shrink-0"
              >
                <Download className="h-4 w-4" />
                Descargar PDF
              </a>
            </Card>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="¿Te gusta"
        highlight="esta identidad?"
        description="Así mismo cuido cada proyecto: decisiones visuales y técnicas alineadas con lo que la marca quiere comunicar."
      />
    </>
  );
}
