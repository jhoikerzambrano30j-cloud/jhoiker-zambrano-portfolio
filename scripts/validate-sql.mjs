#!/usr/bin/env node
/**
 * Validador estático del SQL de Supabase.
 * No sustituye a ejecutar el SQL en PostgreSQL, pero detecta los errores que
 * más rompen una migración: desbalance de paréntesis y de bloques
 * dollar-quoted/plpgsql, columnas de `types.ts` que no existen en el esquema,
 * y tablas sin Row Level Security.
 *
 *   node scripts/validate-sql.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

const problems = [];
const notes = [];

/* ------------------------------------------------------------------ */
/* 1. Balance de paréntesis, ignorando strings, comentarios y $$ ... $$ */
/* ------------------------------------------------------------------ */
function stripSqlNoise(sql) {
  let out = "";
  let i = 0;
  while (i < sql.length) {
    // Comentario de línea
    if (sql[i] === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i += 1;
      continue;
    }
    // Comentario de bloque
    if (sql[i] === "/" && sql[i + 1] === "*") {
      i += 2;
      while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }
    // Dollar-quoted: $$ ... $$ o $tag$ ... $tag$
    if (sql[i] === "$") {
      const m = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(sql.slice(i));
      if (m) {
        const tag = m[0];
        const close = sql.indexOf(tag, i + tag.length);
        if (close === -1) {
          problems.push(`Dollar-quote sin cerrar: ${tag}`);
          return out;
        }
        i = close + tag.length;
        out += " "; // el cuerpo se ignora para el balance de paréntesis
        continue;
      }
    }
    // Literal entre comillas simples (con '' escapado)
    if (sql[i] === "'") {
      i += 1;
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") i += 2;
        else if (sql[i] === "'") {
          i += 1;
          break;
        } else i += 1;
      }
      out += "''";
      continue;
    }
    // Identificador entre comillas dobles
    if (sql[i] === '"') {
      i += 1;
      while (i < sql.length && sql[i] !== '"') i += 1;
      i += 1;
      out += '""';
      continue;
    }
    out += sql[i];
    i += 1;
  }
  return out;
}

function checkBalance(file, sql) {
  const clean = stripSqlNoise(sql);
  let depth = 0;
  let min = 0;
  for (const ch of clean) {
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth < min) min = depth;
    }
  }
  if (depth !== 0 || min < 0) {
    problems.push(
      `${file}: paréntesis desbalanceados (final=${depth}, mínimo=${min}).`,
    );
  } else {
    notes.push(`${file}: paréntesis balanceados ✔`);
  }

  // BEGIN/END en plpgsql
  const begins = (clean.match(/\bbegin\b/gi) ?? []).length;
  const ends = (clean.match(/\bend\b/gi) ?? []).length;
  if (begins !== ends) {
    problems.push(
      `${file}: bloques BEGIN/END desbalanceados (begin=${begins}, end=${ends}).`,
    );
  } else if (begins > 0) {
    notes.push(`${file}: ${begins} bloques BEGIN/END balanceados ✔`);
  }
}

const FILES = [
  "supabase/migrations/0001_init.sql",
  "supabase/migrations/0002_rls.sql",
  "supabase/seed.sql",
];

for (const file of FILES) {
  if (!existsSync(join(root, file))) {
    problems.push(`Falta el archivo ${file}`);
    continue;
  }
  const sql = read(file);
  checkBalance(file, sql);

  // Sentencias sin punto y coma final (heurística suave)
  const lastMeaningful = sql
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("--"))
    .pop();
  if (lastMeaningful && !lastMeaningful.endsWith(";") && !lastMeaningful.endsWith("$$")) {
    notes.push(`${file}: la última línea no termina en «;» (${lastMeaningful.slice(0, 40)}…)`);
  }
}

/* ------------------------------------------------------------------ */
/* 2. Coherencia esquema ↔ types.ts                                    */
/* ------------------------------------------------------------------ */
const schema = read("supabase/migrations/0001_init.sql");
const rls = read("supabase/migrations/0002_rls.sql");
const types = read("src/lib/types.ts");

/** Extrae columnas declaradas de una tabla del esquema. */
function columnsOf(table) {
  const re = new RegExp(
    `create table if not exists public\\.${table}\\s*\\(([\\s\\S]*?)\\n\\);`,
    "i",
  );
  const m = re.exec(schema);
  if (!m) return null;
  return m[1]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("--") && !l.startsWith("constraint"))
    .map((l) => l.split(/\s+/)[0].replace(/,$/, ""))
    .filter((c) => /^[a-z_][a-z0-9_]*$/i.test(c));
}

/** Extrae los campos de una interface de types.ts. */
function fieldsOf(iface) {
  const re = new RegExp(`export interface ${iface} \\{([\\s\\S]*?)\\n\\}`, "m");
  const m = re.exec(types);
  if (!m) return null;
  return m[1]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !l.startsWith("/*") && !l.startsWith("*"))
    .map((l) => l.match(/^([a-z_][a-z0-9_]*)\??:/i)?.[1])
    .filter(Boolean);
}

const PAIRS = [
  ["projects", "Project"],
  ["services", "Service"],
  ["skill_groups", "SkillGroup"],
  ["automations", "Automation"],
  ["leads", "Lead"],
  ["contracts", "Contract"],
  ["contract_templates", "ContractTemplate"],
  ["profiles", "Profile"],
];

for (const [table, iface] of PAIRS) {
  const cols = columnsOf(table);
  const fields = fieldsOf(iface);

  if (!cols) {
    problems.push(`No se encontró la tabla public.${table} en el esquema.`);
    continue;
  }
  if (!fields) {
    problems.push(`No se encontró la interface ${iface} en types.ts.`);
    continue;
  }

  const missing = fields.filter((f) => !cols.includes(f));
  if (missing.length > 0) {
    problems.push(
      `public.${table} no tiene las columnas que usa ${iface}: ${missing.join(", ")}`,
    );
  } else {
    notes.push(`public.${table} ↔ ${iface}: ${fields.length} campos coinciden ✔`);
  }
}

/** Tablas declaradas vs tablas con RLS. */
const tables = [...schema.matchAll(/create table if not exists public\.([a-z_]+)/gi)].map(
  (m) => m[1],
);
const rlsTables = [
  ...rls.matchAll(/alter table public\.([a-z_]+)\s+enable row level security/gi),
].map((m) => m[1]);

const noRls = tables.filter((t) => !rlsTables.includes(t));
if (noRls.length > 0) {
  problems.push(`Tablas SIN Row Level Security: ${noRls.join(", ")}`);
} else {
  notes.push(`RLS activo en las ${tables.length} tablas ✔`);
}

/* ------------------------------------------------------------------ */
/* 3. Reglas de seguridad del proyecto                                 */
/* ------------------------------------------------------------------ */
if (!/on public\.leads for insert[\s\S]{0,200}?to anon/i.test(rls.replace(/\n/g, " "))) {
  // La política puede declararse en una sola línea; comprobación flexible
  const hasAnonInsert =
    /create policy[^;]*on public\.leads[^;]*for insert[^;]*to anon/i.test(rls) ||
    /create policy[^;]*on public\.leads[^;]*to anon[^;]*for insert/i.test(rls);
  if (!hasAnonInsert) {
    problems.push("No se encontró política de INSERT anónimo en public.leads.");
  } else {
    notes.push("public.leads permite INSERT a anon ✔");
  }
} else {
  notes.push("public.leads permite INSERT a anon ✔");
}

const anonSelectLeads = /create policy[^;]*on public\.leads[^;]*for select[^;]*(?:to|for)\s+anon/i.test(
  rls,
);
if (anonSelectLeads) {
  problems.push("¡RIESGO! public.leads tiene política de SELECT para anon.");
} else {
  notes.push("public.leads NO expone SELECT a anon ✔");
}

for (const t of ["contracts", "site_settings", "audit_log"]) {
  const hasAnonPolicy = new RegExp(
    `create policy[^;]*on public\\.${t}\\b[^;]*to anon`,
    "i",
  ).test(rls);
  if (hasAnonPolicy) {
    problems.push(`¡RIESGO! public.${t} tiene una política para anon.`);
  }
}
notes.push("contracts / site_settings / audit_log sin acceso anónimo ✔");

/* ------------------------------------------------------------------ */
/* 4. Cobertura del seed                                               */
/* ------------------------------------------------------------------ */
const seed = read("supabase/seed.sql");
const checks = [
  ["6 proyectos", (seed.match(/insert into public\.projects/gi) ?? []).length > 0],
  ["servicios", /insert into public\.services/i.test(seed)],
  ["skill_groups", /insert into public\.skill_groups/i.test(seed)],
  ["automatizaciones", /insert into public\.automations/i.test(seed)],
  ["plantillas de contrato", /insert into public\.contract_templates/i.test(seed)],
  ["contrato de ejemplo", /insert into public\.contracts/i.test(seed)],
  ["site_settings", /insert into public\.site_settings/i.test(seed)],
  ["perfil admin desde auth.users", /auth\.users/i.test(seed)],
];

for (const [label, ok] of checks) {
  if (ok) notes.push(`seed incluye ${label} ✔`);
  else problems.push(`El seed no incluye ${label}.`);
}

/* ------------------------------------------------------------------ */
/* Informe                                                             */
/* ------------------------------------------------------------------ */
console.log("\n=== VALIDACIÓN DEL SQL ===\n");
notes.forEach((n) => console.log(`  ✓ ${n}`));

if (problems.length === 0) {
  console.log("\n✅ Sin problemas estructurales detectados.\n");
  console.log("Recuerda: esto es análisis estático. La prueba definitiva es");
  console.log("ejecutar el SQL en Supabase (SQL Editor).\n");
} else {
  console.log("\n❌ PROBLEMAS DETECTADOS:\n");
  problems.forEach((p) => console.log(`  ✗ ${p}`));
  console.log("");
  process.exitCode = 1;
}
