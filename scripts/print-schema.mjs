#!/usr/bin/env node
/**
 * Imprime el SQL que hay que ejecutar en Supabase, en el orden correcto.
 *
 *   pnpm db:sql            → imprime el SQL de las migraciones + seed
 *   pnpm db:sql --write     → además lo escribe en supabase/apply-all.sql
 *
 * Útil cuando prefieres copiar y pegar en el SQL Editor del dashboard.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const FILES = [
  "supabase/migrations/0001_init.sql",
  "supabase/migrations/0002_rls.sql",
  "supabase/seed.sql",
];

const parts = [];
let missing = 0;

for (const rel of FILES) {
  const abs = join(root, rel);
  if (!existsSync(abs)) {
    console.error(`✗ No se encontró ${rel}`);
    missing += 1;
    continue;
  }
  const sql = readFileSync(abs, "utf8");
  parts.push(
    `-- ============================================================\n-- ${rel}\n-- ============================================================\n\n${sql.trim()}\n`,
  );
}

if (missing > 0) {
  console.error(`\nFaltan ${missing} archivo(s). Nada que generar.`);
  process.exitCode = 1;
} else {
  const full = parts.join("\n\n");
  const wantsWrite = process.argv.includes("--write");

  if (wantsWrite) {
    const out = join(root, "supabase", "apply-all.sql");
    writeFileSync(out, full, "utf8");
    console.log(`✓ Escrito supabase/apply-all.sql (${(full.length / 1024).toFixed(1)} KB)`);
    console.log("  Pégalo completo en Supabase → SQL Editor → Run.");
  } else {
    console.log(full);
  }
}
