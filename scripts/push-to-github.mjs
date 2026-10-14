#!/usr/bin/env node
/**
 * Publica el proyecto en GitHub usando la API REST.
 * No necesita tener Git instalado.
 *
 *   node scripts/push-to-github.mjs
 *
 * Requiere en .env.local:
 *   GITHUB_TOKEN   → token clásico con el permiso «repo»
 *   GITHUB_OWNER   → tu usuario de GitHub (se autodetecta si hay token)
 *   GITHUB_REPO    → nombre del repositorio (por defecto jhoiker-zambrano-portfolio)
 *
 * Modo de prueba (no publica nada, solo valida el proceso):
 *   node scripts/push-to-github.mjs --dry-run
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, posix } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");

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
/* Variables                                                           */
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
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!env[k]) env[k] = v;
    }
  }
  return env;
}

const env = loadEnv();
const TOKEN = env.GITHUB_TOKEN ?? "";
let OWNER = env.GITHUB_OWNER ?? "";
const REPO = env.GITHUB_REPO ?? "jhoiker-zambrano-portfolio";
const BRANCH = env.GITHUB_BRANCH ?? "main";

console.log(`\n${C.bold}${C.cyan}═══ PUBLICAR EN GITHUB ═══${C.reset}`);
if (DRY_RUN) warn("MODO DE PRUEBA: no se publicará nada en GitHub.\n");

/* ------------------------------------------------------------------ */
/* Archivos a subir (respeta .gitignore)                               */
/* ------------------------------------------------------------------ */
const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "out",
  "build",
  "dist",
  ".vercel",
  ".turbo",
  "coverage",
]);
const IGNORE_FILES = new Set([
  ".env",
  ".env.local",
  ".env.development.local",
  ".env.production.local",
  ".env.test.local",
  "next-env.d.ts",
  ".DS_Store",
  "Thumbs.db",
]);
const IGNORE_SUFFIX = [".tsbuildinfo", ".log"];

function collectFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = relative(root, abs).split("\\").join("/");
    const st = statSync(abs);

    if (st.isDirectory()) {
      if (IGNORE_DIRS.has(entry)) continue;
      collectFiles(abs, acc);
      continue;
    }
    if (IGNORE_FILES.has(entry)) continue;
    if (IGNORE_SUFFIX.some((s) => entry.endsWith(s))) continue;
    if (rel.startsWith("supabase/apply-all.sql")) continue; // generado
    acc.push({ rel, abs, size: st.size });
  }
  return acc;
}

/* ------------------------------------------------------------------ */
/* Cliente de la API                                                   */
/* ------------------------------------------------------------------ */
const API = "https://api.github.com";

async function gh(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      "User-Agent": "jhoiker-zambrano-portfolio",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  return { status: res.status, ok: res.ok, body };
}

/* ------------------------------------------------------------------ */
/* Paso 1 — Validar token y deducir el propietario                     */
/* ------------------------------------------------------------------ */
step(1, "Verificar el token de GitHub");

if (!TOKEN) {
  bad("Falta GITHUB_TOKEN en .env.local");
  console.log(`
${C.dim}  Genéralo así:
  1. Entra a https://github.com/settings/tokens
  2. «Generate new token (classic)»
  3. Marca la casilla «repo»
  4. Genera y copia el token (empieza por ghp_)
  5. Pégalo en .env.local como:  GITHUB_TOKEN=ghp_...
  6. Marca también GITHUB_OWNER=tu-usuario-de-github${C.reset}
`);
  process.exit(1);
}

if (!/^gh[pousr]_[A-Za-z0-9_]+$/.test(TOKEN)) {
  warn("El token no tiene el formato habitual (ghp_…, gho_…, ghs_…). Se intentará igual.");
}

let login = OWNER;
if (!DRY_RUN) {
  const me = await gh("/user");
  if (!me.ok) {
    bad(`El token no es válido (HTTP ${me.status}).`);
    if (me.status === 401) info("Token inválido o revocado. Genera uno nuevo.");
    if (me.status === 403) info("El token no tiene permisos suficientes o superaste el límite de peticiones.");
    process.exit(1);
  }
  login = me.body.login;
  ok(`Token válido. Usuario: ${C.bold}${login}${C.reset}`);
  if (OWNER && OWNER !== login) {
    warn(`GITHUB_OWNER decía «${OWNER}» pero el token pertenece a «${login}». Se usará «${login}».`);
  }
  OWNER = login;
} else {
  OWNER = OWNER || "usuario-de-prueba";
  ok(`Token presente (formato aceptado). Usuario declarado: ${OWNER}`);
}

/* ------------------------------------------------------------------ */
/* Paso 2 — Crear (o reutilizar) el repositorio                        */
/* ------------------------------------------------------------------ */
step(2, "Preparar el repositorio");

let repoExists = false;

if (DRY_RUN) {
  info(`Se crearía o reutilizaría ${OWNER}/${REPO} (rama ${BRANCH}).`);
} else {
  const check = await gh(`/repos/${OWNER}/${REPO}`);
  if (check.ok) {
    repoExists = true;
    ok(`El repositorio ya existe: ${check.body.html_url}`);

    // La API de blobs exige que el repositorio tenga al menos un commit.
    // `size` tarda en actualizarse, así que se comprueba la rama directamente.
    const branchRes = await gh(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
    if (!branchRes.ok) {
      warn("El repositorio no tiene commits todavía. Creando el commit inicial…");
      const init = await gh(`/repos/${OWNER}/${REPO}/contents/README.md`, {
        method: "PUT",
        body: JSON.stringify({
          message: "chore: inicializar repositorio",
          content: Buffer.from("# jhoiker-zambrano-portfolio\n").toString("base64"),
        }),
      });
      if (!init.ok) {
        bad(`No se pudo inicializar el repositorio (HTTP ${init.status}).`);
        console.log(`${C.dim}${JSON.stringify(init.body).slice(0, 400)}${C.reset}`);
        process.exit(1);
      }
      ok("Commit inicial creado");
    }
  } else if (check.status === 404) {
    info("El repositorio no existe. Creándolo…");
    const created = await gh("/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name: REPO,
        description:
          "Marca personal de Jhoiker Zambrano — Ingeniería de Software & Arquitectura Digital",
        homepage: env.NEXT_PUBLIC_SITE_URL ?? "",
        private: false,
        has_issues: true,
        has_projects: false,
        has_wiki: false,
        // Necesario: la API de blobs no funciona en un repositorio sin commits.
        auto_init: true,
      }),
    });
    if (!created.ok) {
      bad(`No se pudo crear el repositorio (HTTP ${created.status}).`);
      console.log(`${C.dim}${JSON.stringify(created.body).slice(0, 500)}${C.reset}`);
      if (created.status === 403) {
        info("Puede que el token no tenga el permiso «repo».");
      }
      process.exit(1);
    }
    ok(`Repositorio creado: ${created.body.html_url}`);
  } else {
    bad(`No se pudo comprobar el repositorio (HTTP ${check.status}).`);
    process.exit(1);
  }
}

/* ------------------------------------------------------------------ */
/* Paso 3 — Subir los archivos como blobs                              */
/* ------------------------------------------------------------------ */
step(3, "Subir los archivos");

const files = collectFiles(root).sort((a, b) => a.rel.localeCompare(b.rel));
info(`${files.length} archivos a publicar (${(files.reduce((s, f) => s + f.size, 0) / 1024).toFixed(0)} KB)`);

// Comprobación de seguridad: nada sensible debe entrar
const leaks = files.filter(
  (f) =>
    f.rel === ".env.local" ||
    f.rel.endsWith("/.env.local") ||
    f.rel === ".env" ||
    f.rel.includes("service_role") ||
    f.rel.startsWith("supabase/apply-all.sql"),
);
if (leaks.length > 0) {
  bad("Se detectaron archivos que NO deben publicarse:");
  leaks.forEach((l) => console.log(`    ${l.rel}`));
  process.exit(1);
}
ok("Ningún archivo sensible en la lista");

const tree = [];
let uploaded = 0;

for (const file of files) {
  const content = readFileSync(file.abs);
  const base64 = content.toString("base64");

  if (DRY_RUN) {
    tree.push({
      path: file.rel,
      mode: "100644",
      type: "blob",
      sha: "0".repeat(40),
    });
    uploaded += 1;
    continue;
  }

  const res = await gh(`/repos/${OWNER}/${REPO}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content: base64, encoding: "base64" }),
  });

  if (!res.ok) {
    bad(`Falló la subida de ${file.rel} (HTTP ${res.status})`);
    console.log(`${C.dim}${JSON.stringify(res.body).slice(0, 400)}${C.reset}`);
    process.exit(1);
  }

  tree.push({ path: file.rel, mode: "100644", type: "blob", sha: res.body.sha });
  uploaded += 1;

  if (uploaded % 20 === 0) info(`${uploaded}/${files.length} archivos subidos…`);
}

ok(`${uploaded} archivos procesados`);

/* ------------------------------------------------------------------ */
/* Paso 4 — Construir el árbol y el commit                             */
/* ------------------------------------------------------------------ */
step(4, "Crear el commit");

const commitMessage = `Sitio de marca personal con centro de negociacion de contratos

Web profesional basada en el Manual de Identidad de Marca v3.0.

Sitio publico:
- Inicio con isotipo protagonista, servicios, proyectos y flujos
- Portafolio con busqueda, filtros y casos de estudio
- Servicios con precios, comparativa, metodologia y FAQ
- Hub de automatizaciones con metricas reales
- Sobre mi con trayectoria, principios y stack
- Manual de marca vivo con descarga del PDF original
- Formulario de contacto que registra leads en Supabase

Panel privado de administracion:
- Metricas de pipeline, valor firmado y horas automatizadas
- CRUD de proyectos, servicios y automatizaciones
- Bandeja de leads con estados y notas internas
- Centro de negociacion de contratos con versionado y PDF
- Ajustes del sitio y bitacora de auditoria

Identidad aplicada:
- Paleta oficial #0A0D14 / #38BDF8 / #818CF8 / #1E293B
- Orbitron, Plus Jakarta Sans y JetBrains Mono
- Isotipo [ J Z ] con la Z siempre en Cyan Energy

Backend:
- Next.js 15 con App Router y Server Actions
- Supabase PostgreSQL con RLS en las 10 tablas
- 4 plantillas de contrato con 18 clausulas cada una
- Generacion de PDF A4 con identidad de marca`;

if (DRY_RUN) {
  info("Se crearía un árbol con las entradas listadas y un commit en la rama " + BRANCH);
  info(`Mensaje del commit: «${commitMessage.split("\n")[0]}…»`);
} else {
  // Padre, si la rama ya existe
  let parents = [];
  const refRes = await gh(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  if (refRes.ok) {
    parents = [refRes.body.object.sha];
    info(`La rama ${BRANCH} ya existe. Se añadirá un commit nuevo encima.`);
  } else {
    info(`La rama ${BRANCH} está vacía. Será el commit inicial.`);
  }

  const treeRes = await gh(`/repos/${OWNER}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ tree }),
  });

  if (!treeRes.ok) {
    bad(`No se pudo crear el árbol (HTTP ${treeRes.status})`);
    console.log(`${C.dim}${JSON.stringify(treeRes.body).slice(0, 500)}${C.reset}`);
    process.exit(1);
  }
  ok(`Árbol creado: ${treeRes.body.sha.slice(0, 10)}`);

  const commitRes = await gh(`/repos/${OWNER}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: commitMessage,
      tree: treeRes.body.sha,
      parents,
    }),
  });

  if (!commitRes.ok) {
    bad(`No se pudo crear el commit (HTTP ${commitRes.status})`);
    console.log(`${C.dim}${JSON.stringify(commitRes.body).slice(0, 500)}${C.reset}`);
    process.exit(1);
  }
  ok(`Commit creado: ${commitRes.body.sha.slice(0, 10)}`);

  /* ---------------------------------------------------------------- */
  /* Paso 5 — Apuntar la rama al commit                               */
  /* ---------------------------------------------------------------- */
  step(5, "Publicar la rama");

  const refPath = `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`;

  let finalRes;
  if (parents.length > 0) {
    finalRes = await gh(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commitRes.body.sha, force: false }),
    });
  } else {
    finalRes = await gh(refPath, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha: commitRes.body.sha }),
    });
  }

  if (!finalRes.ok) {
    bad(`No se pudo publicar la rama (HTTP ${finalRes.status})`);
    console.log(`${C.dim}${JSON.stringify(finalRes.body).slice(0, 500)}${C.reset}`);
    process.exit(1);
  }
  ok(`Rama ${BRANCH} publicada`);
}

/* ------------------------------------------------------------------ */
/* Resumen                                                            */
/* ------------------------------------------------------------------ */
console.log(`\n${C.bold}${C.cyan}═══ RESULTADO ═══${C.reset}\n`);

if (DRY_RUN) {
  console.log(`${C.green}${C.bold}  Prueba superada.${C.reset}`);
  console.log(`  ${files.length} archivos listos para publicar en ${OWNER}/${REPO}.`);
  console.log(`  ${C.dim}Ejecuta sin --dry-run y con un token real para publicar.${C.reset}\n`);
} else {
  console.log(`${C.green}${C.bold}  Repositorio publicado.${C.reset}\n`);
  console.log(`  URL:  ${C.cyan}https://github.com/${OWNER}/${REPO}${C.reset}`);
  console.log(`  ${C.dim}Revisa que .env.local NO aparezca en la lista de archivos.${C.reset}\n`);
}
