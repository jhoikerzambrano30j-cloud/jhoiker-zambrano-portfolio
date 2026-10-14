# 🚀 PONER EN MARCHA — 3 pasos

Tu web ya está **construida, probada y funcionando**. Solo faltan 3 cosas que
necesitan tus cuentas. Sigue el orden.

---

## ✅ Antes de empezar: mírala funcionando

Abre en tu navegador:

```
http://127.0.0.1:3417
```

Recorre todas las pestañas. Está hecha al 100% con tu manual de marca:
tu paleta, tus tipografías y tu isotipo `[ J Z ]` como protagonista.

---

## PASO 1 — Crea tu base de datos en Supabase (2 minutos)

1. Entra a **https://supabase.com/dashboard** y crea una cuenta (gratis).
2. Pulsa **New project**.
3. Rellena:
   - **Name:** `jhoiker-zambrano-portfolio`
   - **Database Password:** una contraseña (guárdala)
   - **Region:** la más cercana, por ejemplo `East US`
4. Pulsa **Create new project** y espera ~2 minutos a que termine.

### Ahora copia 3 valores

Ve a **Project Settings** (el engranaje) → **API** y copia:

| En la pantalla se llama | Va en `.env.local` como |
|---|---|
| **Project URL** (`https://xxxx.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon** / **public** (empieza `eyJ...`) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** / **secret** (empieza `eyJ...`) | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ La clave **service_role** es privada. Nunca la compartas ni la subas a
> GitHub. El sistema ya está configurado para no exponerla.

### Y un token para que yo haga todo lo demás

1. Entra a **https://supabase.com/dashboard/account/tokens**
2. Pulsa **Generate new token**, ponle nombre `setup`, y cópialo.
3. Ese valor va en `SUPABASE_ACCESS_TOKEN`.

---

## PASO 2 — Rellena el archivo `.env.local`

Abre el archivo **`.env.local`** que está en la carpeta
`jhoiker-zambrano-portfolio` con el Bloc de notas y rellena estas líneas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (la clave anon)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (la clave service_role)
SUPABASE_ACCESS_TOKEN=sbp_... (el token del paso anterior)

ADMIN_EMAIL=tu-correo@ejemplo.com
ADMIN_PASSWORD=una-contraseña-larga-que-recuerdes
ADMIN_NAME=Jhoiker Zambrano
```

Guarda el archivo.

---

## PASO 3 — Ejecuta un comando

Abre esta carpeta en una terminal y escribe:

```bash
pnpm db:setup
```

Ese único comando hace **todo** esto por ti:

- ✅ Crea las 10 tablas en Supabase
- ✅ Activa la seguridad (RLS) en todas
- ✅ Carga tus 6 proyectos, 4 servicios, 4 automatizaciones y 5 grupos de habilidades
- ✅ Carga las 4 plantillas de contrato con **18 cláusulas cada una**
- ✅ **Crea tu usuario administrador**

Cuando termine, verás un mensaje verde con tu correo y la dirección del panel.

### Y luego arranca tu web

```bash
pnpm dev
```

Abre:

| Qué | Dirección |
|---|---|
| Tu web | http://localhost:3000 |
| Tu panel privado | http://localhost:3000/acceso |

Entra con el **ADMIN_EMAIL** y **ADMIN_PASSWORD** que pusiste.

---

## PASO 4 (opcional) — Publícala en internet

Cuando quieras que esté online, haz esto:

### 4.1 Token de GitHub

1. Entra a **https://github.com/settings/tokens**
2. **Generate new token (classic)**
3. Marca la casilla **`repo`** (la primera)
4. Genera y copia el token (empieza por `ghp_`)
5. Añádelo a `.env.local`:

```env
GITHUB_TOKEN=ghp_tu_token
GITHUB_OWNER=tu-usuario-de-github
```

### 4.2 Sube el código

```bash
pnpm push
```

Ese comando crea el repositorio en tu GitHub y sube los 101 archivos.
Antes de subir **verifica que no se filtre ningún secreto**.

### 4.3 Publícala en Vercel

1. Entra a **https://vercel.com/new** e inicia sesión con GitHub.
2. Importa el repositorio `jhoiker-zambrano-portfolio`.
3. En **Environment Variables** añade las mismas 5 variables del `.env.local`
   (menos `ADMIN_*`, `SUPABASE_ACCESS_TOKEN` y `GITHUB_*`).
4. Pulsa **Deploy**.

En ~2 minutos tendrás tu web en
`https://jhoiker-zambrano-portfolio.vercel.app`

---

## 🆘 Si algo falla

**«Falta NEXT_PUBLIC_SUPABASE_URL»**
No guardaste el `.env.local`. Vuelve al Paso 2.

**«El token fue rechazado»**
El token se copió mal o caducó. Genera uno nuevo.

**«El esquema aún no existe»**
Es normal en la primera ejecución. Vuelve a correr `pnpm db:setup`.

**Prefiero no usar tokens**
Puedo darte el SQL para pegar a mano:
```bash
pnpm db:sql --write
```
Eso genera `supabase/apply-all.sql`. Cópialo entero y pégalo en
**Supabase → SQL Editor → Run**. Después ejecuta `pnpm db:seed`.

**Quiero comprobar que todo está bien**
```bash
pnpm check      # 91 verificaciones del proyecto
pnpm db:check   # valida el SQL sin ejecutarlo
```

---

## 📋 Resumen de lo que ya está hecho

| | |
|---|---|
| Archivos | 101 |
| Líneas de código | ~15.700 |
| Rutas | 23 (9 públicas + 8 del panel + sistema) |
| Tablas en la base de datos | 10, todas con RLS |
| Plantillas de contrato | 4 × 18 cláusulas = **72 cláusulas** |
| Cláusulas bloqueadas (no editables) | 6 por plantilla |
| Compilación | ✅ sin errores |
| Verificación automatizada | ✅ 91 comprobaciones |

**Todo lo que falta son los 3 pasos de arriba, y solo porque necesitan tus
cuentas.** En cuanto tengas las claves, `pnpm db:setup` hace el resto.
