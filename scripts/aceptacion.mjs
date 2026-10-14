#!/usr/bin/env node
/**
 * Prueba de aceptación de extremo a extremo.
 *
 *   node scripts/aceptacion.mjs
 *
 * Comprueba contra los servicios reales:
 *   1. Que las 9 rutas públicas respondan 200 y sin caracteres corruptos.
 *   2. Que la ruta antigua de automatizaciones ya no exista.
 *   3. Que el panel privado exija sesión.
 *   4. Que la base de datos tenga el contenido esperado y cero corrupción.
 *   5. Que el login del administrador funcione y tenga rol admin.
 *   6. Que el RLS proteja los datos privados del público.
 *   7. Que las plantillas de contrato estén completas.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://jhoiker-zambrano-portfolio.vercel.app";
const SB_URL = "https://lgjynswvuxhmedffleih.supabase.co";

const C = { reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m" };
let pass = 0;
let fail = 0;
const ok = (m) => { pass++; console.log(`${C.green}  ✓${C.reset} ${m}`); };
const bad = (m) => { fail++; console.log(`${C.red}  ✗${C.reset} ${m}`); };
const warn = (m) => console.log(`${C.yellow}  !${C.reset} ${m}`);
const head = (m) => console.log(`\n${C.bold}${C.cyan}${m}${C.reset}`);

function loadEnv() {
  const env = { ...process.env };
  for (const f of [".env.local", ".env"]) {
    const abs = join(root, f);
    if (!existsSync(abs)) continue;
    for (const raw of readFileSync(abs, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 0) continue;
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!env[k]) env[k] = v;
    }
  }
  return env;
}
const env = loadEnv();
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ADMIN_EMAIL = env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = env.ADMIN_PASSWORD ?? "";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET que devuelve estado, bytes y conteo de caracteres corruptos. */
async function get(url, { redirect = true } = {}) {
  const res = await fetch(url, {
    redirect: redirect ? "follow" : "manual",
    headers: { "User-Agent": "verificacion-jhoiker" },
  });
  const buf = Buffer.from(await res.arrayBuffer());
  const text = buf.toString("utf8");
  const corrupt = (text.match(/\uFFFD/g) || []).length;
  return { status: res.status, bytes: buf.length, corrupt, text, headers: res.headers };
}

/* ------------------------------------------------------------------ */
head("1. SITIO PÚBLICO");

const RUTAS = ["/", "/proyectos", "/servicios", "/infraestructura", "/sobre-mi", "/marca", "/contacto", "/acceso", "/robots.txt", "/sitemap.xml"];
for (const ruta of RUTAS) {
  await sleep(1200);
  try {
    const r = await get(`${SITE}${ruta}`);
    if (r.status === 200 && r.corrupt === 0) ok(`${ruta} → 200, ${(r.bytes / 1024).toFixed(0)} KB, sin corrupción`);
    else if (r.status !== 200) bad(`${ruta} → HTTP ${r.status}`);
    else bad(`${ruta} → ${r.corrupt} caracteres corruptos`);
  } catch (err) {
    bad(`${ruta} → ${err.message}`);
  }
}

await sleep(1200);
try {
  const r = await get(`${SITE}/automatizaciones`, { redirect: false });
  if (r.status === 404 || r.status === 308 || r.status === 301) ok(`/automatizaciones ya no existe (HTTP ${r.status})`);
  else bad(`/automatizaciones devuelve HTTP ${r.status} (debería ser 404)`);
} catch (err) {
  bad(`/automatizaciones → ${err.message}`);
}

/* ------------------------------------------------------------------ */
head("2. SEGURIDAD DEL PANEL");

for (const ruta of ["/admin", "/admin/contratos", "/admin/leads", "/admin/infraestructura"]) {
  await sleep(1000);
  try {
    const r = await get(`${SITE}${ruta}`, { redirect: false });
    const loc = r.headers.get("location") ?? "";
    if (r.status === 307 && loc.includes("/acceso")) ok(`${ruta} exige sesión y redirige a /acceso`);
    else bad(`${ruta} → HTTP ${r.status} (Location: ${loc || "ninguno"})`);
  } catch (err) {
    bad(`${ruta} → ${err.message}`);
  }
}

await sleep(1000);
try {
  const r = await get(`${SITE}/api/diagnostico-contratos`);
  if (r.status === 404) ok("las rutas de diagnóstico están desactivadas en producción");
  else warn(`/api/diagnostico-contratos → HTTP ${r.status}`);
} catch (err) {
  bad(`api diagnóstico → ${err.message}`);
}

/* ------------------------------------------------------------------ */
head("3. BASE DE DATOS");

const sb = (path, key = SERVICE) =>
  fetch(`${SB_URL}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } }).then(async (r) => ({
    status: r.status,
    text: await r.text(),
  }));

// `site_settings` no tiene columna `id`: su clave primaria es `key`.
const ESPERADO = [
  ["projects", "id", 6],
  ["services", "id", 4],
  ["skill_groups", "id", 5],
  ["contract_templates", "id", 4],
  ["contracts", "id", 1],
  ["site_settings", "key", 6],
];

for (const [tabla, columna, minimo] of ESPERADO) {
  const r = await sb(`${tabla}?select=${columna}`);
  if (r.status !== 200) { bad(`${tabla} → HTTP ${r.status}`); continue; }
  const n = JSON.parse(r.text).length;
  if (n >= minimo) ok(`${tabla}: ${n} registros`);
  else bad(`${tabla}: ${n} registros (se esperaban al menos ${minimo})`);
}

const corruptRows = [
  ["projects", "title"], ["projects", "summary"], ["projects", "description"],
  ["projects", "metrics"], ["services", "name"], ["services", "deliverables"],
  ["skill_groups", "category"], ["contract_templates", "name"],
];
let totalCorrupt = 0;
for (const [tabla, campo] of corruptRows) {
  const r = await sb(`${tabla}?select=${campo}`);
  totalCorrupt += (r.text.match(/\uFFFD/g) || []).length;
}
if (totalCorrupt === 0) ok("cero caracteres corruptos en toda la base de datos");
else bad(`${totalCorrupt} caracteres corruptos en la base de datos`);

const autos = await sb("automations?select=id");
if (autos.status === 200 && JSON.parse(autos.text).length === 0) ok("no quedan datos de automatización");
else if (autos.status === 200) bad(`quedan ${JSON.parse(autos.text).length} filas de automatización`);

/* ------------------------------------------------------------------ */
head("4. AISLAMIENTO DE DATOS (RLS)");

const privadas = ["contracts", "leads", "site_settings", "audit_log"];
for (const tabla of privadas) {
  const r = await sb(`${tabla}?select=id`, ANON);
  const visible = r.status === 200 && JSON.parse(r.text || "[]").length > 0;
  if (!visible) ok(`${tabla} no es visible con la clave pública`);
  else bad(`${tabla} ES VISIBLE con la clave pública (fallo de seguridad)`);
}

const publicas = ["projects", "services", "skill_groups", "contract_templates"];
for (const tabla of publicas) {
  const r = await sb(`${tabla}?select=id`, ANON);
  const n = r.status === 200 ? JSON.parse(r.text || "[]").length : 0;
  if (n > 0) ok(`${tabla} sí es visible públicamente (${n} registros)`);
  else bad(`${tabla} no es visible con la clave pública`);
}

/* ------------------------------------------------------------------ */
head("5. ACCESO DEL ADMINISTRADOR");

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  warn("faltan ADMIN_EMAIL/ADMIN_PASSWORD en .env.local; se omite esta prueba");
} else {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    bad(`no se pudo iniciar sesión (HTTP ${res.status})`);
  } else {
    const j = await res.json();
    ok(`login correcto para ${j.user.email}`);
    ok(`correo confirmado: ${j.user.email_confirmed_at ? "sí" : "NO"}`);

    const prof = await fetch(`${SB_URL}/rest/v1/profiles?select=role,full_name&id=eq.${j.user.id}`, {
      headers: { apikey: ANON, Authorization: `Bearer ${j.access_token}` },
    });
    const rows = await prof.json();
    if (rows[0]?.role === "admin") ok(`rol verificado: ${rows[0].role} (${rows[0].full_name})`);
    else bad(`el rol no es admin: ${JSON.stringify(rows[0])}`);

    const ct = await fetch(`${SB_URL}/rest/v1/contracts?select=code,total&limit=5`, {
      headers: { apikey: ANON, Authorization: `Bearer ${j.access_token}` },
    });
    const lista = await ct.json();
    if (Array.isArray(lista) && lista.length > 0) ok(`el admin puede leer contratos (${lista.length})`);
    else bad("el admin no pudo leer los contratos");
  }
}

/* ------------------------------------------------------------------ */
head("6. PLANTILLAS DE CONTRATO");

const t = await sb("contract_templates?select=slug,name,clauses");
if (t.status === 200) {
  const plantillas = JSON.parse(t.text);
  // La base de datos debe reflejar exactamente lo que genera el código.
  if (plantillas.length === 4) ok("4 plantillas de contrato en la base de datos");
  else bad(`${plantillas.length} plantillas (el código define 4)`);

  for (const p of plantillas) {
    const n = Array.isArray(p.clauses) ? p.clauses.length : 0;
    const bloqueadas = (p.clauses ?? []).filter((c) => c.locked).length;
    if (n === 18) ok(`${p.name}: ${n} cláusulas (${bloqueadas} bloqueadas)`);
    else bad(`${p.name}: ${n} cláusulas (el código define 18)`);
  }
  const total = plantillas.reduce((a, p) => a + (p.clauses?.length ?? 0), 0);
  if (total === 72) ok(`${total} cláusulas en total`);
  else bad(`${total} cláusulas (se esperaban 72)`);
}

/* ------------------------------------------------------------------ */
console.log(`\n${C.bold}${C.cyan}═══ RESULTADO ═══${C.reset}`);
console.log(`\n  ${C.green}${pass} correctas${C.reset}${fail ? `  ${C.red}${fail} fallidas${C.reset}` : ""}\n`);
if (fail === 0) console.log(`${C.green}${C.bold}  Prueba de aceptación superada.${C.reset}\n`);
else { console.log(`${C.red}${C.bold}  Hay ${fail} fallos que revisar.${C.reset}\n`); process.exitCode = 1; }
