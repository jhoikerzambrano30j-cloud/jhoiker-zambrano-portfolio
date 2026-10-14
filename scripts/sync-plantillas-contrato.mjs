#!/usr/bin/env node
/**
 * Sincroniza las plantillas de contrato desde el código hacia la base de datos.
 *
 *   node scripts/sync-plantillas-contrato.mjs          → muestra qué haría
 *   node scripts/sync-plantillas-contrato.mjs --aplicar → lo aplica
 *
 * El código (`src/lib/contracts/templates.ts`) es la fuente autoritativa:
 * es lo que usa el panel al crear un contrato. La base de datos guarda además
 * una copia para poder listarlas y versionarlas.
 *
 * Si la copia en la base de datos queda desactualizada, el panel muestra
 * plantillas con menos cláusulas de las que realmente se generan. Este script
 * las vuelve a poner de acuerdo.
 *
 * Es idempotente y seguro: actualiza por `slug`, conserva los ids y no toca
 * los contratos ya creados (cada contrato guarda su propia copia de cláusulas).
 */

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const APLICAR = process.argv.includes("--aplicar");

const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m",
};
const ok = (m) => console.log(`${C.green}  ✓${C.reset} ${m}`);
const bad = (m) => console.log(`${C.red}  ✗${C.reset} ${m}`);
const warn = (m) => console.log(`${C.yellow}  !${C.reset} ${m}`);
const info = (m) => console.log(`${C.cyan}  →${C.reset} ${m}`);

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
const SB_URL = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? "";

console.log(`\n${C.bold}${C.cyan}═══ SINCRONIZAR PLANTILLAS DE CONTRATO ═══${C.reset}`);
if (!APLICAR) warn("Modo simulación. Añade --aplicar para escribir los cambios.\n");

if (!SB_URL || !KEY) {
  bad("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const { CONTRACT_TEMPLATES } = await import("../src/lib/contracts/templates.ts");
info(`Código: ${CONTRACT_TEMPLATES.length} plantillas, ${CONTRACT_TEMPLATES.reduce((a, t) => a + t.clauses.length, 0)} cláusulas`);

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

// Estado actual en la base de datos
const actualRes = await fetch(`${SB_URL}/rest/v1/contract_templates?select=id,slug,name,clauses,base_price,duration_days,warranty_days`, { headers: H });
if (!actualRes.ok) {
  bad(`No se pudo leer la tabla (HTTP ${actualRes.status})`);
  process.exit(1);
}
const actuales = await actualRes.json();
info(`Base de datos: ${actuales.length} plantillas`);

console.log("");
let desincronizadas = 0;

for (const t of CONTRACT_TEMPLATES) {
  const fila = actuales.find((a) => a.slug === t.slug);
  const nCodigo = t.clauses.length;
  const lockCodigo = t.clauses.filter((c) => c.locked).length;

  if (!fila) {
    warn(`${t.slug}: NO EXISTE en la base de datos → se creará (${nCodigo} cláusulas)`);
    desincronizadas++;
    if (APLICAR) {
      const r = await fetch(`${SB_URL}/rest/v1/contract_templates`, {
        method: "POST",
        headers: { ...H, Prefer: "return=representation" },
        body: JSON.stringify({
          slug: t.slug, name: t.name, description: t.description, category: t.category,
          base_price: t.base_price, duration_days: t.duration_days, warranty_days: t.warranty_days,
          deliverables: t.deliverables, exclusions: t.exclusions, clauses: t.clauses,
          payment_plan: t.payment_plan, active: t.active, sort_order: t.sort_order,
        }),
      });
      if (r.ok) ok(`${t.slug}: creada`);
      else bad(`${t.slug}: ${(await r.text()).slice(0, 200)}`);
    }
    continue;
  }

  const nFila = Array.isArray(fila.clauses) ? fila.clauses.length : 0;
  const lockFila = (fila.clauses ?? []).filter((c) => c.locked).length;
  const problemas = [];
  if (nFila !== nCodigo) problemas.push(`cláusulas ${nFila} ≠ ${nCodigo}`);
  if (lockFila !== lockCodigo) problemas.push(`bloqueadas ${lockFila} ≠ ${lockCodigo}`);
  if (Number(fila.base_price) !== t.base_price) problemas.push(`precio ${fila.base_price} ≠ ${t.base_price}`);
  if (fila.duration_days !== t.duration_days) problemas.push(`plazo ${fila.duration_days} ≠ ${t.duration_days}`);
  if (fila.warranty_days !== t.warranty_days) problemas.push(`garantía ${fila.warranty_days} ≠ ${t.warranty_days}`);

  if (problemas.length === 0) {
    ok(`${t.slug}: ya está sincronizada (${nFila} cláusulas, ${lockFila} bloqueadas)`);
    continue;
  }

  desincronizadas++;
  warn(`${t.slug}: DESACTUALIZADA → ${problemas.join(", ")}`);

  if (APLICAR) {
    const r = await fetch(`${SB_URL}/rest/v1/contract_templates?id=eq.${fila.id}`, {
      method: "PATCH",
      headers: { ...H, Prefer: "return=representation" },
      body: JSON.stringify({
        name: t.name, description: t.description, category: t.category,
        base_price: t.base_price, duration_days: t.duration_days, warranty_days: t.warranty_days,
        deliverables: t.deliverables, exclusions: t.exclusions, clauses: t.clauses,
        payment_plan: t.payment_plan, active: t.active, sort_order: t.sort_order,
      }),
    });
    if (r.ok) {
      const out = await r.json();
      const n = out[0]?.clauses?.length ?? 0;
      const lk = (out[0]?.clauses ?? []).filter((c) => c.locked).length;
      ok(`${t.slug}: actualizada a ${n} cláusulas (${lk} bloqueadas)`);
    } else {
      bad(`${t.slug}: ${(await r.text()).slice(0, 200)}`);
    }
  }
}

// Plantillas en la base de datos que ya no existen en el código
const huerfanas = actuales.filter((a) => !CONTRACT_TEMPLATES.some((t) => t.slug === a.slug));
if (huerfanas.length > 0) {
  warn(`Plantillas en la base de datos sin equivalente en el código: ${huerfanas.map((h) => h.slug).join(", ")}`);
  info("Se dejan intactas: puede que las uses. Elimínalas desde el panel si no.");
}

console.log("");
if (desincronizadas === 0) {
  console.log(`${C.green}${C.bold}  Todo sincronizado.${C.reset}\n`);
} else if (APLICAR) {
  console.log(`${C.green}${C.bold}  ${desincronizadas} plantillas sincronizadas.${C.reset}\n`);
} else {
  console.log(`${C.yellow}${C.bold}  ${desincronizadas} plantillas necesitan sincronizarse.${C.reset}`);
  console.log(`${C.dim}  Ejecuta: node scripts/sync-plantillas-contrato.mjs --aplicar${C.reset}\n`);
}
