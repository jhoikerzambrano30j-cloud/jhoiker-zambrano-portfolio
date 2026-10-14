#!/usr/bin/env node
/**
 * Puesta en marcha completa de Supabase en un solo comando.
 *
 *   node scripts/setup-supabase.mjs
 *
 * Qué hace, en orden:
 *   1. Lee .env.local (o las variables de entorno del sistema).
 *   2. Comprueba que las claves de Supabase sean válidas y alcanzables.
 *   3. Aplica supabase/apply-all.sql (esquema + RLS + seed) usando la
 *      Management API de Supabase.
 *   4. Verifica que las tablas y el contenido hayan quedado creados.
 *   5. Crea o repara el usuario administrador.
 *
 * Si no hay SUPABASE_ACCESS_TOKEN, deja el SQL listo para pegar en el
 * SQL Editor y avisa con instrucciones exactas.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

const ok = (m) => console.log(`${C.green}  ✓${C.reset} ${m}`);
const bad = (m) => console.log(`${C.red}  ✗${C.reset} ${m}`);
const info = (m) => console.log(`${C.cyan}  →${C.reset} ${m}`);
const warn = (m) => console.log(`${C.yellow}  !${C.reset} ${m}`);
const step = (n, m) => console.log(`\n${C.bold}${n}. ${m}${C.reset}`);

/* ------------------------------------------------------------------ */
/* Carga de variables                                                  */
/* ------------------------------------------------------------------ */
function loadEnv() {
  const env = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    const abs = join(root, file);
    if (!existsSync(abs)) continue;
    for (const raw of readFileSync(abs, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in env) || !env[key]) env[key] = value;
    }
  }
  return env;
}

const env = loadEnv();

const SUPABASE_URL = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const ACCESS_TOKEN = env.SUPABASE_ACCESS_TOKEN ?? "";
const ADMIN_EMAIL = env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = env.ADMIN_PASSWORD ?? "";
const ADMIN_NAME = env.ADMIN_NAME ?? "Jhoiker Zambrano";

console.log(`\n${C.bold}${C.cyan}═══ PUESTA EN MARCHA DE SUPABASE ═══${C.reset}`);

/* ------------------------------------------------------------------ */
/* Paso 1 — Validación de configuración                                */
/* ------------------------------------------------------------------ */
step(1, "Verificar la configuración");

const fatal = [];
if (!SUPABASE_URL || SUPABASE_URL.includes("xxxx")) {
  fatal.push("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local");
}
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL)) {
  fatal.push(
    `NEXT_PUBLIC_SUPABASE_URL no parece válida: «${SUPABASE_URL}» (debe ser https://<ref>.supabase.co)`,
  );
}
if (!SERVICE_KEY || SERVICE_KEY.length < 40) {
  fatal.push("Falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
}
if (SERVICE_KEY && SERVICE_KEY.startsWith("sb_publishable")) {
  fatal.push(
    "SUPABASE_SERVICE_ROLE_KEY tiene una clave publicable, no la secreta. Copia la clave `service_role`.",
  );
}
if (!ADMIN_EMAIL || !ADMIN_EMAIL.includes("@")) {
  fatal.push("Falta ADMIN_EMAIL (tu correo de administrador) en .env.local");
}
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  fatal.push("Falta ADMIN_PASSWORD o tiene menos de 8 caracteres");
}

if (fatal.length > 0) {
  console.log("");
  fatal.forEach(bad);
  console.log(
    `\n${C.dim}Edita .env.local y vuelve a ejecutar: node scripts/setup-supabase.mjs${C.reset}\n`,
  );
  process.exit(1);
}

ok("Variables presentes y con formato válido");
info(`Proyecto: ${SUPABASE_URL}`);
info(`Administrador: ${ADMIN_EMAIL}`);
if (!ACCESS_TOKEN) {
  warn(
    "No hay SUPABASE_ACCESS_TOKEN. El SQL habrá que pegarlo a mano en el SQL Editor.",
  );
}

/* ------------------------------------------------------------------ */
/* Paso 2 — Comprobar conectividad y claves                            */
/* ------------------------------------------------------------------ */
step(2, "Comprobar conexión con Supabase");

const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];

async function rest(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  return res;
}

try {
  const res = await rest("profiles?select=id&limit=1");
  if (res.status === 401 || res.status === 403) {
    bad("La clave de servicio fue rechazada (401/403). Revisa SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }
  if (res.status === 404) {
    warn("El esquema aún no existe (las tablas no están creadas). Es lo esperado en el primer arranque.");
  } else if (res.ok) {
    const rows = await res.json();
    ok(`Conexión correcta. La tabla profiles responde (${Array.isArray(rows) ? rows.length : 0} filas).`);
  } else {
    warn(`Respuesta inesperada del API REST: ${res.status}`);
  }
} catch (err) {
  bad(`No se pudo contactar a Supabase: ${err.message}`);
  console.log(`${C.dim}Revisa tu conexión a internet o la URL del proyecto.${C.reset}\n`);
  process.exit(1);
}

if (ANON_KEY && ANON_KEY === SERVICE_KEY) {
  warn("NEXT_PUBLIC_SUPABASE_ANON_KEY es igual a la clave de servicio. Deberían ser distintas.");
}

/* ------------------------------------------------------------------ */
/* Paso 3 — Aplicar el esquema                                         */
/* ------------------------------------------------------------------ */
step(3, "Aplicar esquema, seguridad y contenido");

const sqlPath = join(root, "supabase", "apply-all.sql");
if (!existsSync(sqlPath)) {
  bad("No existe supabase/apply-all.sql");
  info("Genéralo con:  node scripts/print-schema.mjs --write");
  process.exit(1);
}
const sql = readFileSync(sqlPath, "utf8");
info(`SQL a aplicar: ${(sql.length / 1024).toFixed(1)} KB`);

let schemaApplied = false;

if (ACCESS_TOKEN) {
  info("Usando la Management API (sin copiar y pegar nada)…");
  try {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sql }),
      },
    );

    const text = await res.text();

    if (res.ok) {
      ok("Esquema aplicado correctamente vía Management API.");
      schemaApplied = true;
    } else if (res.status === 401 || res.status === 403) {
      bad("El SUPABASE_ACCESS_TOKEN fue rechazado. Genéralo de nuevo en supabase.com/dashboard/account/tokens");
    } else {
      bad(`La Management API devolvió ${res.status}.`);
      if (text) console.log(`${C.dim}${text.slice(0, 800)}${C.reset}`);
      warn("Aplica el SQL manualmente en el SQL Editor (paso alternativo abajo).");
    }
  } catch (err) {
    bad(`Error de red con la Management API: ${err.message}`);
  }
} else {
  warn("Sin token de Management API, no puedo aplicar el SQL automáticamente.");
}

if (!schemaApplied) {
  console.log(`
${C.bold}${C.yellow}  Aplicar el SQL a mano (2 minutos):${C.reset}
${C.dim}  1. Abre https://supabase.com/dashboard/project/${projectRef}/sql/new
  2. Abre el archivo: supabase/apply-all.sql
  3. Copia TODO su contenido y pégalo en el editor
  4. Pulsa el botón «Run» (abajo a la derecha)
  5. Vuelve aquí y ejecuta otra vez este comando${C.reset}
`);
}

/* ------------------------------------------------------------------ */
/* Paso 4 — Verificar el contenido                                     */
/* ------------------------------------------------------------------ */
step(4, "Verificar el contenido cargado");

async function count(table) {
  try {
    const res = await rest(`${table}?select=id`, {
      headers: { Prefer: "count=exact", Range: "0-0" },
    });
    if (!res.ok) return null;
    const range = res.headers.get("content-range");
    if (!range) return null;
    const total = range.split("/")[1];
    return total === "*" ? null : Number(total);
  } catch {
    return null;
  }
}

const TABLES = [
  "projects",
  "services",
  "skill_groups",
  "automations",
  "contract_templates",
  "leads",
  "contracts",
  "site_settings",
];

let allGood = true;
for (const table of TABLES) {
  const n = await count(table);
  if (n === null) {
    bad(`public.${table} no responde (¿esquema no aplicado?)`);
    allGood = false;
  } else if (n === 0) {
    warn(`public.${table} existe pero está vacía`);
  } else {
    ok(`public.${table}: ${n} registros`);
  }
}

/* ------------------------------------------------------------------ */
/* Paso 5 — Crear el administrador                                     */
/* ------------------------------------------------------------------ */
step(5, "Crear el usuario administrador");

async function findUserByEmail(email) {
  for (let page = 1; page <= 20; page += 1) {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=200`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
    );
    if (!res.ok) return null;
    const body = await res.json();
    const users = body.users ?? [];
    const hit = users.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (users.length < 200) return null;
  }
  return null;
}

try {
  let userId = null;
  let created = false;

  const existing = await findUserByEmail(ADMIN_EMAIL);

  if (existing) {
    userId = existing.id;
    info(`El usuario ${ADMIN_EMAIL} ya existía. Actualizando contraseña…`);
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: ADMIN_PASSWORD, email_confirm: true }),
    });
    if (res.ok) ok("Contraseña actualizada.");
    else bad(`No se pudo actualizar la contraseña (${res.status}).`);
  } else {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: ADMIN_NAME },
      }),
    });
    const body = await res.json();
    if (res.ok && body.id) {
      userId = body.id;
      created = true;
      ok("Usuario creado en Supabase Auth.");
    } else {
      bad(`No se pudo crear el usuario: ${body.msg ?? body.message ?? res.status}`);
    }
  }

  if (userId) {
    // Promover a admin en profiles
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          id: userId,
          email: ADMIN_EMAIL,
          full_name: ADMIN_NAME,
          role: "admin",
        },
      ]),
    });

    if (res.ok) {
      const rows = await res.json();
      const role = Array.isArray(rows) ? rows[0]?.role : null;
      if (role === "admin") {
        ok(`Perfil promovido a rol «admin».${created ? " (usuario nuevo)" : " (usuario existente)"}`);
      } else {
        warn(`El perfil se guardó pero el rol quedó como «${role}».`);
      }
    } else {
      const t = await res.text();
      bad(`No se pudo crear el perfil: ${t.slice(0, 300)}`);
    }
  }
} catch (err) {
  bad(`Error al crear el administrador: ${err.message}`);
}

/* ------------------------------------------------------------------ */
/* Resumen                                                            */
/* ------------------------------------------------------------------ */
console.log(`\n${C.bold}${C.cyan}═══ RESULTADO ═══${C.reset}\n`);

if (schemaApplied && allGood) {
  console.log(`${C.green}${C.bold}  Todo listo.${C.reset}\n`);
  console.log(`  Sitio:   ${C.cyan}http://localhost:3000${C.reset}`);
  console.log(`  Acceso:  ${C.cyan}http://localhost:3000/acceso${C.reset}`);
  console.log(`  Panel:   ${C.cyan}http://localhost:3000/admin${C.reset}`);
  console.log(`  Usuario: ${C.bold}${ADMIN_EMAIL}${C.reset}`);
  console.log(`  Clave:   ${C.dim}(la que definiste en .env.local)${C.reset}\n`);
  console.log(`  Arranca el sitio con:  ${C.bold}pnpm dev${C.reset}\n`);
} else if (schemaApplied) {
  console.log(`${C.yellow}  Esquema aplicado, pero alguna tabla no respondió.${C.reset}`);
  console.log(`  Revisa el SQL Editor de Supabase y vuelve a ejecutar este comando.\n`);
} else {
  console.log(`${C.yellow}  Falta aplicar el SQL.${C.reset}`);
  console.log(`  Sigue las instrucciones del recuadro amarillo de arriba y`);
  console.log(`  vuelve a ejecutar:  ${C.bold}node scripts/setup-supabase.mjs${C.reset}\n`);
}
