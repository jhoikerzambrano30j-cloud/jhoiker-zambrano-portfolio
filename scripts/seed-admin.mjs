#!/usr/bin/env node
/**
 * ============================================================================
 *  JHOIKER ZAMBRANO — Portafolio & Panel de administración
 *  scripts/seed-admin.mjs
 *
 *  Crea (o repara) el usuario administrador en Supabase Auth, lo promueve a
 *  rol 'admin' en public.profiles y deja configurado el correo del propietario
 *  en public.site_settings.
 *
 *  Uso:
 *    node scripts/seed-admin.mjs          (o: pnpm run db:seed)
 *
 *  Requiere en .env.local (o en el entorno):
 *    NEXT_PUBLIC_SUPABASE_URL
 *    SUPABASE_SERVICE_ROLE_KEY      ← solo servidor, nunca en el navegador
 *    ADMIN_EMAIL
 *    ADMIN_PASSWORD                 ← mínimo 8 caracteres
 *  Opcionales:
 *    ADMIN_NAME                     (por defecto: "Jhoiker Zambrano")
 *
 *  Este script NO usa RLS: se autentica con la service role key, que omite las
 *  políticas. Ejecútalo únicamente en tu máquina o en un pipeline confiable.
 * ============================================================================
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(HERE, '..');

// ---------------------------------------------------------------------------
//  Salida con colores ANSI simples (se desactivan solos si no hay TTY)
// ---------------------------------------------------------------------------
const COLOR_ENABLED = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

const paint = (code, text) => (COLOR_ENABLED ? `\u001b[${code}m${text}\u001b[0m` : String(text));
const green = (text) => paint('32', text);
const red = (text) => paint('31', text);
const yellow = (text) => paint('33', text);
const cyan = (text) => paint('36', text);
const dim = (text) => paint('2', text);
const bold = (text) => paint('1', text);

const OK = green('✔');
const FAIL = red('✖');
const WARN = yellow('!');
const ARROW = cyan('→');

const line = () => console.log(dim('─'.repeat(66)));
const title = (text) => {
  line();
  console.log(bold(`  ${text}`));
  line();
};

// ---------------------------------------------------------------------------
//  Lectura de .env.local / .env (parser simple KEY=value)
// ---------------------------------------------------------------------------
function parseEnvFile(filePath) {
  const values = {};
  if (!existsSync(filePath)) return values;

  const raw = readFileSync(filePath, 'utf8');

  for (const rawLine of raw.split(/\r?\n/)) {
    let trimmed = rawLine.trim();

    // Ignora líneas vacías y comentarios.
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Permite la sintaxis `export KEY=value`.
    if (trimmed.startsWith('export ')) trimmed = trimmed.slice(7).trim();

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    if (!key) continue;

    let value = trimmed.slice(separator + 1).trim();

    // Quita comentarios al final de la línea cuando el valor no está entre comillas.
    const isQuoted =
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1);

    if (!isQuoted) {
      const hash = value.indexOf(' #');
      if (hash !== -1) value = value.slice(0, hash).trim();
    } else {
      // Quita las comillas envolventes.
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function loadEnv() {
  const fromFiles = {
    ...parseEnvFile(join(PROJECT_ROOT, '.env')),
    ...parseEnvFile(join(PROJECT_ROOT, '.env.local')),
  };

  const merged = { ...process.env };
  for (const [key, value] of Object.entries(fromFiles)) {
    if (value !== undefined && value !== '') merged[key] = value;
  }

  const sources = ['.env.local', '.env'].filter((file) => existsSync(join(PROJECT_ROOT, file)));
  return { env: merged, sources };
}

// ---------------------------------------------------------------------------
//  Utilidades
// ---------------------------------------------------------------------------
function fail(message, hint) {
  console.error(`${FAIL} ${red(message)}`);
  if (hint) console.error(`  ${ARROW} ${hint}`);
  process.exitCode = 1;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isAlreadyRegistered(error) {
  if (!error) return false;
  const message = `${error.message ?? ''} ${error.code ?? ''}`.toLowerCase();
  return (
    message.includes('already been registered') ||
    message.includes('already registered') ||
    message.includes('already exists') ||
    message.includes('email address is already')
  );
}

async function findUserByEmail(supabase, email) {
  const target = email.trim().toLowerCase();
  const perPage = 200;

  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users ?? [];
    const found = users.find((user) => (user.email ?? '').toLowerCase() === target);
    if (found) return found;
    if (users.length < perPage) return null;
  }

  return null;
}

// ---------------------------------------------------------------------------
//  Programa principal
// ---------------------------------------------------------------------------
async function main() {
  title('JHOIKER ZAMBRANO · Creación del usuario administrador');

  const { env, sources } = loadEnv();
  if (sources.length > 0) {
    console.log(`  ${dim(`Variables cargadas desde: ${sources.join(', ')}`)}`);
  } else {
    console.log(`  ${WARN} ${yellow('No se encontró .env.local ni .env; se usa solo el entorno del proceso.')}`);
  }

  // ---- 1. Validación de variables -----------------------------------------
  const supabaseUrl = (env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const serviceRoleKey = (env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  const adminEmail = (env.ADMIN_EMAIL ?? '').trim();
  const adminPassword = env.ADMIN_PASSWORD ?? '';
  const adminName = (env.ADMIN_NAME ?? 'Jhoiker Zambrano').trim() || 'Jhoiker Zambrano';

  const missing = [];
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!adminEmail) missing.push('ADMIN_EMAIL');
  if (!adminPassword) missing.push('ADMIN_PASSWORD');

  if (missing.length > 0) {
    fail(
      `Faltan variables de entorno: ${missing.join(', ')}`,
      'Abre .env.local en la raíz del proyecto y completa esos valores. Usa .env.example como guía.',
    );
    return;
  }

  if (!/^https?:\/\/.+/i.test(supabaseUrl)) {
    fail(
      `NEXT_PUBLIC_SUPABASE_URL no parece una URL válida: ${supabaseUrl}`,
      'Debe verse así: https://xxxxxxxxxxxx.supabase.co (Project Settings → API).',
    );
    return;
  }

  if (serviceRoleKey === (env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()) {
    fail(
      'SUPABASE_SERVICE_ROLE_KEY es igual a la anon key.',
      'La service role key está en Project Settings → API → service_role. Sin ella no se puede crear el usuario.',
    );
    return;
  }

  if (!EMAIL_RE.test(adminEmail)) {
    fail(`ADMIN_EMAIL no parece un correo válido: ${adminEmail}`);
    return;
  }

  if (adminPassword.length < 8) {
    fail(
      'ADMIN_PASSWORD debe tener al menos 8 caracteres.',
      'Usa una contraseña larga y única: esta cuenta administra contratos y leads.',
    );
    return;
  }

  console.log(`  ${OK} Variables de entorno validadas`);
  console.log(`  ${dim('Proyecto:')} ${cyan(supabaseUrl)}`);
  console.log(`  ${dim('Admin:   ')} ${cyan(adminEmail)}`);
  console.log('');

  // ---- 2. Cliente con service role ----------------------------------------
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verificación temprana: ¿ya se ejecutaron las migraciones?
  const ping = await supabase.from('profiles').select('id').limit(1);
  if (ping.error) {
    fail(
      `No se pudo leer public.profiles: ${ping.error.message}`,
      'Ejecuta primero supabase/migrations/0001_init.sql y 0002_rls.sql en el SQL Editor de Supabase.',
    );
    return;
  }

  // ---- 3. Crear el usuario (o recuperarlo) --------------------------------
  let userId = null;
  let createdNow = false;
  let passwordReset = false;

  const created = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: adminName },
  });

  if (!created.error && created.data?.user) {
    userId = created.data.user.id;
    createdNow = true;
    console.log(`${OK} ${green('Usuario creado en Supabase Auth')} ${dim(`(${userId})`)}`);
  } else if (isAlreadyRegistered(created.error)) {
    console.log(`${WARN} ${yellow('El usuario ya existía. Se actualiza la contraseña y los metadatos.')}`);

    const existing = await findUserByEmail(supabase, adminEmail);
    if (!existing) {
      fail(
        'El proveedor reportó que el correo ya existe, pero no se encontró en auth.users.',
        'Revisa Authentication → Users en el dashboard de Supabase y elimina el registro duplicado.',
      );
      return;
    }

    userId = existing.id;

    const updated = await supabase.auth.admin.updateUserById(userId, {
      password: adminPassword,
      email_confirm: true,
      user_metadata: { ...(existing.user_metadata ?? {}), full_name: adminName },
    });

    if (updated.error) {
      fail(
        `No se pudo actualizar el usuario existente: ${updated.error.message}`,
        'Verifica que SUPABASE_SERVICE_ROLE_KEY sea la del proyecto correcto y que no haya rotado.',
      );
      return;
    }

    passwordReset = true;
    console.log(`${OK} ${green('Contraseña y metadatos actualizados')} ${dim(`(${userId})`)}`);
  } else {
    fail(
      `No se pudo crear el usuario: ${created.error?.message ?? 'error desconocido'}`,
      created.error?.status === 422
        ? 'Suele ser la contraseña: usa al menos 8 caracteres con mayúsculas, números y símbolos.'
        : 'Revisa la conexión, la URL del proyecto y que la service role key esté vigente.',
    );
    return;
  }

  // ---- 4. Promover a admin en public.profiles -----------------------------
  const profile = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        email: adminEmail,
        full_name: adminName,
        role: 'admin',
        headline: 'Ingeniería de Software & Arquitectura Digital',
      },
      { onConflict: 'id' },
    )
    .select('id, email, role')
    .single();

  if (profile.error) {
    fail(
      `El usuario existe, pero no se pudo escribir en public.profiles: ${profile.error.message}`,
      'Confirma que el rol admin de la base de datos tiene permisos sobre public.profiles (migración 0001_init.sql).',
    );
    return;
  }

  console.log(`${OK} ${green('Perfil promovido a rol admin')} ${dim(`(${profile.data.email})`)}`);

  // ---- 5. site_settings.owner_email --------------------------------------
  const setting = await supabase
    .from('site_settings')
    .upsert({ key: 'owner_email', value: adminEmail }, { onConflict: 'key' });

  if (setting.error) {
    console.log(`${WARN} ${yellow(`No se pudo actualizar site_settings.owner_email: ${setting.error.message}`)}`);
  } else {
    console.log(`${OK} ${green('site_settings.owner_email actualizado')}`);
  }

  // ---- 6. Resumen ---------------------------------------------------------
  console.log('');
  title(createdNow ? 'Administrador creado correctamente' : 'Administrador sincronizado correctamente');

  const rows = [
    ['URL del proyecto', supabaseUrl],
    ['Correo', adminEmail],
    ['Contraseña', passwordReset ? 'actualizada en este run' : 'definida en este run'],
    ['Nombre', adminName],
    ['Rol', 'admin'],
    ['ID de usuario', userId],
    ['Acción', createdNow ? 'usuario nuevo' : 'usuario existente reparado'],
  ];

  for (const [label, value] of rows) {
    console.log(`  ${dim(label.padEnd(16))} ${String(value)}`);
  }

  console.log('');
  console.log(`  ${ARROW} Ingresa al panel en ${cyan('/admin/login')} con ese correo y contraseña.`);
  console.log(`  ${ARROW} Si el seed de contenido está pendiente, ejecuta ${cyan('supabase/seed.sql')} en el SQL Editor.`);
  console.log('');

  process.exitCode = 0;
}

main().catch((error) => {
  fail(
    `Error inesperado: ${error?.message ?? String(error)}`,
    'Revisa tu conexión a internet, la URL del proyecto y que la service role key sea la correcta.',
  );
  if (error?.stack && process.env.DEBUG) console.error(dim(error.stack));
});
