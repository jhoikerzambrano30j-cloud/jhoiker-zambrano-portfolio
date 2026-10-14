#!/usr/bin/env node
/**
 * Verificación final del proyecto antes de publicar.
 *
 *   node scripts/final-check.mjs
 *
 * Comprueba, sin necesidad de Supabase:
 *   - que existan todos los archivos clave
 *   - que las rutas públicas y del panel estén declaradas
 *   - que ningún secreto esté en el repositorio
 *   - que el balance de marca sea correcto (paleta y tipografías exactas)
 *   - que las plantillas de contrato tengan el número esperado de cláusulas
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
};

const fails = [];
const passes = [];
const ok = (m) => passes.push(m);
const bad = (m) => fails.push(m);

const exists = (rel) => existsSync(join(root, rel));
const content = (rel) => (exists(rel) ? readFileSync(join(root, rel), "utf8") : "");

/* ---------------- 1. Archivos clave ---------------- */
const REQUIRED = [
  "package.json",
  "tsconfig.json",
  "next.config.mjs",
  "postcss.config.mjs",
  "README.md",
  ".env.example",
  ".gitignore",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/globals.css",
  "src/app/middleware-placeholder-none",
  "src/middleware.ts",
  "src/lib/brand.ts",
  "src/lib/types.ts",
  "src/lib/utils.ts",
  "src/lib/content.ts",
  "src/lib/data.ts",
  "src/lib/admin.ts",
  "src/lib/auth.ts",
  "src/lib/nav.ts",
  "src/lib/supabase/client.ts",
  "src/lib/supabase/server.ts",
  "src/components/brand/Logo.tsx",
  "src/components/layout/Nav.tsx",
  "src/components/layout/Footer.tsx",
  "src/components/layout/CommandPalette.tsx",
  "src/components/admin/AdminShell.tsx",
  "src/lib/contracts/templates.ts",
  "src/lib/contracts/engine.ts",
  "src/lib/contracts/pdf.ts",
  "supabase/migrations/0001_init.sql",
  "supabase/migrations/0002_rls.sql",
  "supabase/seed.sql",
  "scripts/seed-admin.mjs",
  "scripts/setup-supabase.mjs",
  "scripts/push-to-github.mjs",
  "scripts/validate-sql.mjs",
  "public/icon.svg",
  "public/manual_marca_jhoiker_zambrano_v3.pdf",
];

for (const rel of REQUIRED) {
  if (rel.endsWith("middleware-placeholder-none")) continue;
  if (exists(rel)) ok(`existe ${rel}`);
  else bad(`FALTA ${rel}`);
}

/* ---------------- 2. Rutas ---------------- */
const ROUTES = [
  "src/app/page.tsx",
  "src/app/proyectos/page.tsx",
  "src/app/proyectos/[slug]/page.tsx",
  "src/app/servicios/page.tsx",
  "src/app/automatizaciones/page.tsx",
  "src/app/sobre-mi/page.tsx",
  "src/app/marca/page.tsx",
  "src/app/contacto/page.tsx",
  "src/app/acceso/page.tsx",
  "src/app/admin/layout.tsx",
  "src/app/admin/page.tsx",
  "src/app/admin/proyectos/page.tsx",
  "src/app/admin/servicios/page.tsx",
  "src/app/admin/automatizaciones/page.tsx",
  "src/app/admin/leads/page.tsx",
  "src/app/admin/contratos/page.tsx",
  "src/app/admin/contratos/nuevo/page.tsx",
  "src/app/admin/contratos/[id]/page.tsx",
  "src/app/admin/ajustes/page.tsx",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/not-found.tsx",
  "src/app/error.tsx",
];

for (const rel of ROUTES) {
  if (exists(rel)) ok(`ruta ${rel.replace("src/app", "").replace("/page.tsx", "") || "/"}`);
  else bad(`FALTA la ruta ${rel}`);
}

/* ---------------- 3. Identidad de marca exacta ---------------- */
const brand = content("src/lib/brand.ts");
const css = content("src/app/globals.css");

const COLORS = [
  ["#0A0D14", "Obsidian Deep"],
  ["#38BDF8", "Cyan Energy"],
  ["#818CF8", "Indigo Automation"],
  ["#1E293B", "Slate Surface"],
];
for (const [hex, name] of COLORS) {
  if (brand.includes(hex) && css.toLowerCase().includes(hex.toLowerCase())) {
    ok(`color ${name} ${hex} presente en brand.ts y globals.css`);
  } else {
    bad(`color ${name} ${hex} ausente en brand.ts o globals.css`);
  }
}

const FONTS = ["Orbitron", "Plus Jakarta Sans", "JetBrains Mono"];
for (const font of FONTS) {
  if (brand.includes(font)) ok(`tipografía ${font} declarada`);
  else bad(`tipografía ${font} ausente en brand.ts`);
}

const layout = content("src/app/layout.tsx");
for (const [fontVar, fontName] of [
  ["Orbitron", "Orbitron"],
  ["Plus_Jakarta_Sans", "Plus Jakarta Sans"],
  ["JetBrains_Mono", "JetBrains Mono"],
]) {
  if (layout.includes(fontVar)) ok(`${fontName} cargada con next/font`);
  else bad(`${fontName} NO cargada en layout.tsx`);
}

const logo = content("src/components/brand/Logo.tsx");
if (logo.includes("text-cyan-energy") && logo.includes(">Z<")) {
  ok("la «Z» del isotipo usa Cyan Energy");
} else if (logo.includes("text-cyan-energy")) {
  ok("isotipo usa Cyan Energy para el acento");
} else {
  bad("el isotipo no aplica el acento Cyan Energy");
}

/* ---------------- 4. Cláusulas de contrato (ejecutando las plantillas) ---------------- */
let contractOk = false;
try {
  const { CONTRACT_TEMPLATES, DEFAULT_PAYMENT_PLANS, getTemplate } = await import(
    "../src/lib/contracts/templates.ts"
  );

  if (CONTRACT_TEMPLATES.length !== 4) {
    bad(`se esperaban 4 plantillas, hay ${CONTRACT_TEMPLATES.length}`);
  } else {
    ok(`4 plantillas cargadas: ${CONTRACT_TEMPLATES.map((t) => t.slug).join(", ")}`);
  }

  let totalClauses = 0;
  let templateProblems = 0;

  for (const t of CONTRACT_TEMPLATES) {
    totalClauses += t.clauses.length;
    const locked = t.clauses.filter((c) => c.locked).length;
    const pct = t.payment_plan.reduce((a, p) => a + p.percent, 0);
    const amount = t.payment_plan.reduce((a, p) => a + p.amount, 0);
    const ids = new Set(t.clauses.map((c) => c.id));
    const orders = t.clauses.map((c) => c.order);

    const issues = [];
    if (t.clauses.length < 14) issues.push(`solo ${t.clauses.length} cláusulas`);
    if (locked < 4) issues.push(`solo ${locked} bloqueadas`);
    if (pct !== 100) issues.push(`porcentajes suman ${pct}`);
    if (amount !== t.base_price) issues.push(`montos suman ${amount} ≠ base ${t.base_price}`);
    if (ids.size !== t.clauses.length) issues.push("ids duplicados");
    if (orders.join(",") !== orders.slice().sort((a, b) => a - b).join(","))
      issues.push("orden no secuencial");
    const short = t.clauses.filter((c) => !c.body || c.body.length < 40);
    if (short.length) issues.push(`${short.length} cláusulas con cuerpo vacío`);

    if (issues.length === 0) {
      ok(
        `${t.slug}: ${t.clauses.length} cláusulas (${locked} bloqueadas, ${t.clauses.length - locked} negociables), plan ${t.payment_plan.map((p) => p.percent).join("/")} = 100%`,
      );
    } else {
      bad(`${t.slug}: ${issues.join("; ")}`);
      templateProblems += 1;
    }
  }

  if (templateProblems === 0) contractOk = true;
  if (totalClauses >= 60) ok(`${totalClauses} cláusulas en total`);

  if (Object.keys(DEFAULT_PAYMENT_PLANS).length < 3) {
    bad("faltan planes de pago predefinidos");
  } else {
    ok(`${Object.keys(DEFAULT_PAYMENT_PLANS).length} planes de pago predefinidos`);
  }

  if (getTemplate("desarrollo-web")) ok("getTemplate() resuelve por slug");
  else bad("getTemplate() no resuelve «desarrollo-web»");
} catch (err) {
  bad(`no se pudieron ejecutar las plantillas: ${err.message}`);
  contractOk = false;
}

/* ---------------- 5. Seguridad: nada sensible versionado ---------------- */
function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if ([".git", "node_modules", ".next", ".turbo"].includes(entry)) continue;
    const abs = join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) walk(abs, acc);
    else acc.push(relative(root, abs).split("\\").join("/"));
  }
  return acc;
}

const tracked = walk(root);

// `.env.local` es correcto que exista en local; lo que no debe existir es
// un `.env` con secretos, ni `.env.local` dentro del control de versiones.
const hardSecrets = tracked.filter((f) => f === ".env" || f.endsWith("/.env"));
if (hardSecrets.length === 0) ok("ningún archivo .env con secretos en el proyecto");
else bad(`secretos expuestos: ${hardSecrets.join(", ")}`);

const localEnv = tracked.find((f) => f.endsWith(".env.local"));
if (localEnv) {
  const gitignore = content(".gitignore");
  if (gitignore.includes(".env*.local") || gitignore.includes(".env.local")) {
    ok(".env.local existe en local y está ignorado por Git");
  } else {
    bad(".env.local existe y NO está en .gitignore");
  }
} else {
  ok("no hay .env.local en el proyecto");
}

const gitignore = content(".gitignore");
if (gitignore.includes("supabase/apply-all.sql")) {
  ok("apply-all.sql es generado (ignorado)");
} else {
  bad("apply-all.sql debería estar en .gitignore");
}

if (/NEXT_PUBLIC_SUPABASE_SERVICE|NEXT_PUBLIC_.*SERVICE_ROLE/i.test(content(".env.example"))) {
  bad("el .env.example expone la service role key con prefijo NEXT_PUBLIC_");
} else {
  ok("la service role key no se expone al navegador en .env.example");
}

/* ---------------- 6. Integridad del motor de contratos ---------------- */
const engine = content("src/lib/contracts/engine.ts");
const REQUIRED_EXPORTS = [
  "instantiateTemplate",
  "bumpVersion",
  "updateClause",
  "calcPaymentPlan",
  "contractToPlainText",
  "contractFileName",
  "validation".replace("validation", "validateContract"),
];
for (const fn of REQUIRED_EXPORTS) {
  if (engine.includes(`export function ${fn}`)) ok(`engine exporta ${fn}()`);
  else bad(`engine NO exporta ${fn}()`);
}

/* ---------------- Informe ---------------- */
console.log(`\n${C.bold}${C.cyan}═══ VERIFICACIÓN FINAL ═══${C.reset}\n`);
passes.forEach((p) => console.log(`${C.green}  ✓${C.reset} ${p}`));

if (fails.length === 0) {
  console.log(`\n${C.green}${C.bold}  TODO CORRECTO${C.reset}`);
  console.log(`${C.dim}  ${passes.length} comprobaciones superadas.${C.reset}\n`);
} else {
  console.log(`\n${C.red}${C.bold}  ${fails.length} PROBLEMAS:${C.reset}\n`);
  fails.forEach((f) => console.log(`${C.red}  ✗${C.reset} ${f}`));
  console.log("");
  process.exitCode = 1;
}
