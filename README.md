# JHOIKER ZAMBRANO — WEB DE MARCA PERSONAL

Sitio web profesional de marca personal construido desde el **Manual de Identidad
de Marca v3.0**, con portafolio de proyectos, catálogo de servicios, hub de
automatizaciones, manual de marca vivo y un **centro privado de negociación de
contratos** con generación de PDF.

> «Marca personal futurista y cercana. Eficiencia técnica absoluta donde el
> trabajo habla por sí mismo y cada solución cuenta con un estándar de
> excelencia impecable.»

**En producción:** <https://jhoiker-zambrano-portfolio.vercel.app>

| Recurso | Dónde |
|---|---|
| Web pública | <https://jhoiker-zambrano-portfolio.vercel.app> |
| Panel privado | `/acceso` |
| Repositorio | <https://github.com/jhoikerzambrano30j-cloud/jhoiker-zambrano-portfolio> |

---

## Índice

1. [Inicio rápido](#inicio-rápido)
2. [Identidad de marca aplicada](#identidad-de-marca-aplicada)
3. [Qué incluye](#qué-incluye)
4. [Stack técnico](#stack-técnico)
5. [Empezar en local](#empezar-en-local)
6. [Puesta en marcha: Supabase](#puesta-en-marcha-supabase)
7. [Crear el usuario administrador](#crear-el-usuario-administrador)
8. [Publicar en GitHub](#publicar-en-github)
9. [Desplegar en Vercel](#desplegar-en-vercel)
10. [Estructura del proyecto](#estructura-del-proyecto)
11. [El módulo de contratos](#el-módulo-de-contratos)
12. [Seguridad](#seguridad)
13. [Solución de problemas](#solución-de-problemas)

---

## Inicio rápido

Si ya tienes tu proyecto de Supabase creado y un token de GitHub, son **tres
comandos**:

```bash
pnpm install              # 1. dependencias
pnpm db:setup             # 2. crea tablas, contenido y tu usuario admin
pnpm push                 # 3. publica el repositorio en GitHub
```

Todo lo demás está automatizado:

| Comando | Qué hace |
|---|---|
| `pnpm aceptacion` | **Prueba de aceptación contra los servicios reales**: las 10 rutas públicas, la seguridad del panel, el contenido de la base de datos, el aislamiento por RLS, el login del administrador y las 4 plantillas de contrato (42 comprobaciones) |
| `pnpm check` | 90 comprobaciones estáticas: archivos clave, rutas, identidad de marca exacta y que no se filtren secretos |
| `pnpm sync:plantillas` | Comprueba que las plantillas de contrato en la base de datos coincidan con el código (añade `--aplicar` para sincronizarlas) |
| `pnpm db:setup` | Valida las claves, aplica el esquema completo vía Management API, verifica el contenido y crea tu usuario administrador |
| `pnpm db:check` | Analiza el SQL sin ejecutarlo: balance de bloques, coherencia esquema ↔ tipos y reglas de seguridad |
| `pnpm db:sql --write` | Genera `supabase/apply-all.sql` con las migraciones concatenadas, para pegar en el SQL Editor |
| `pnpm push` | Crea el repositorio en GitHub y sube los archivos con la API REST (no requiere Git instalado) |
| `pnpm push:test` | Modo de prueba: valida el proceso sin publicar nada |

Antes de ejecutarlos, rellena `.env.local` (sigue las instrucciones dentro del
archivo). Después, [despliega en Vercel](#desplegar-en-vercel).

---

## Identidad de marca aplicada

Todo el sistema visual se deriva del manual. No hay colores ni tipografías
inventadas.

### Paleta cromática oficial

| Nombre | Rol | HEX | RGB | Uso |
|---|---|---|---|---|
| **Obsidian Deep** | Fondo Base | `#0A0D14` | 10, 13, 20 | Fondo general, reduce la fatiga visual |
| **Cyan Energy** | Acento Principal / Neón | `#38BDF8` | 56, 189, 248 | Llamadas a la acción, isotipo, bordes activos |
| **Indigo Automation** | Secundario | `#818CF8` | 129, 140, 248 | Tarjetas secundarias, separadores, flujos |
| **Slate Surface** | Contenedores | `#1E293B` | 30, 41, 59 | Tarjetas de servicios, cajas de contratos |

Proporción de uso: **70%** Obsidian Deep · **18%** Slate Surface · **9%** Cyan
Energy · **3%** Indigo Automation.

### Sistema tipográfico oficial

| Orden | Familia | Pesos | Alcance |
|---|---|---|---|
| 01 | **Orbitron** | Bold / Black | Titulares, encabezados e isotipo |
| 02 | **Plus Jakarta Sans** | Regular / SemiBold | Cuerpo de texto, contratos y catálogos |
| 03 | **JetBrains Mono** | Regular | Bloques de código, precios y variables técnicas |

### Isotipo

El monograma cibernético **`[ J Z ]`** flanqueado por corchetes de desarrollo.
La «Z» siempre en Cyan Energy. Los corchetes simbolizan contención, seguridad y
estructuración lógica.

Los tokens viven en dos lugares y son la fuente única de verdad:

- `src/lib/brand.ts` → datos de marca consumibles desde TypeScript
- `src/app/globals.css` → tokens CSS (`@theme`) que generan las utilidades

La página **`/marca`** es el manual vivo: muestra isotipo, tipografías, paleta,
componentes, voz y tono, y permite descargar el PDF original.

---

## Qué incluye

### Sitio público

| Ruta | Contenido |
|---|---|
| `/` | Hero con el isotipo protagonista, servicios, proyectos destacados, flujos de automatización, stack, principios y manifiesto |
| `/proyectos` | Portafolio con búsqueda, filtro por categoría y ordenamiento |
| `/proyectos/[slug]` | Caso de estudio: ficha técnica, métricas, narrativa y relacionados |
| `/servicios` | Catálogo con precios desde, tabla comparativa, metodología de 5 fases y FAQ |
| `/automatizaciones` | Flujos con disparador, pasos, métricas y niveles de autonomía |
| `/sobre-mi` | Historia, trayectoria, principios y stack con niveles reales |
| `/marca` | Manual de identidad vivo + descarga del PDF |
| `/contacto` | Formulario que guarda el lead en Supabase + canales directos + FAQ |
| `/acceso` | Login del panel privado |

### Panel privado (`/admin`)

Solo accesible para el rol `admin`. Doble verificación: middleware + validación de
rol en el servidor.

| Sección | Funciones |
|---|---|
| **Panel** | Métricas: pipeline, valor firmado, horas automatizadas, contratos por estado, leads recientes |
| **Proyectos** | CRUD completo, destacar, publicar/archivar, stack y etiquetas |
| **Servicios** | CRUD completo, precios, entregables, activar/desactivar |
| **Automatizaciones** | CRUD, pausar/activar flujos, métricas de ejecución |
| **Leads** | Bandeja con filtros por estado, notas internas, cambio de estado, respuesta directa |
| **Contratos** | Crear desde plantilla, negociar cláusula por cláusula, versionar, exportar PDF |
| **Ajustes** | Datos públicos del sitio, redes, bitácora de auditoría |

### Detalles de experiencia

- Paleta de comandos **⌘K / Ctrl+K** con navegación instantánea
- Barra de progreso de lectura
- Animaciones de entrada con `IntersectionObserver` (respetan
  `prefers-reduced-motion`)
- Fondos de rejilla técnica y halos de marca
- Metadatos SEO, Open Graph, `sitemap.xml` y `robots.txt`
- Accesibilidad: foco visible, `aria-*`, contraste alto, navegación por teclado

---

## Stack técnico

- **Next.js 15.5** (App Router, Server Components, Server Actions)
- **React 19** + **TypeScript** en modo `strict`
- **Tailwind CSS 4** con tokens de marca en `@theme`
- **Supabase** (PostgreSQL + Auth + Row Level Security)
- **pdf-lib** para generar contratos en PDF
- **Zod** para validación de formularios y acciones
- **lucide-react** para iconografía
- **Vercel** para despliegue continuo

---

## Empezar en local

Requisitos: **Node.js 20+**.

```bash
pnpm install
cp .env.example .env.local   # y rellena los valores
pnpm dev                     # http://localhost:3000
```

El sitio funciona **sin Supabase configurado**: usa el contenido de respaldo de
`src/lib/content.ts`, de modo que nunca se ve vacío mientras configuras la base
de datos.

Comandos disponibles:

```bash
pnpm dev          # servidor de desarrollo
pnpm build        # compilación de producción
pnpm start        # servir la compilación
pnpm typecheck    # verificación de tipos
pnpm lint         # análisis estático
pnpm db:setup     # Supabase: esquema + contenido + usuario administrador
pnpm db:check     # valida el SQL sin ejecutarlo
pnpm db:seed      # solo el usuario administrador
pnpm db:sql       # imprime el SQL de migraciones + seed
pnpm db:sql --write   # lo escribe en supabase/apply-all.sql
pnpm push         # publica el repositorio en GitHub
pnpm push:test    # prueba el push sin publicar nada
```

---

## Puesta en marcha: Supabase

### 1. Crear el proyecto

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Nombre: `jhoiker-zambrano-portfolio`
3. Región: la más cercana (por ejemplo `East US` o `South America`)
4. Guarda la **contraseña de base de datos** que te pida

### 2. Ejecutar el esquema

**Automático** — añade a `.env.local` el token de
[supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
como `SUPABASE_ACCESS_TOKEN` y ejecuta:

```bash
pnpm db:setup
```

El script aplica las 3 migraciones, verifica que las 8 tablas respondan y crea tu
usuario administrador, todo de una vez.

**Manual** — si prefieres hacerlo a mano, en **SQL Editor** ejecuta en orden:

1. `supabase/migrations/0001_init.sql` — 10 tablas, triggers, índices, RPC y vista
2. `supabase/migrations/0002_rls.sql` — Row Level Security en todas las tablas
3. `supabase/seed.sql` — contenido real: 6 proyectos, 4 servicios, 5 grupos de
   habilidades, 4 automatizaciones, 3 plantillas de contrato con 16 cláusulas
   cada una, 2 leads y 1 contrato de ejemplo

> Atajo: `pnpm db:sql --write` genera `supabase/apply-all.sql` con los tres
> archivos concatenados. Puedes pegar ese único archivo completo de una vez.

### 3. Copiar las claves

En **Project Settings → API** copia:

| Variable | Dónde está | ¿Se expone al navegador? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Sí (es pública) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` | Sí (protegida por RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` `secret` | **NO — solo servidor** |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` **nunca** debe llevar el prefijo `NEXT_PUBLIC_`
> ni subirse al repositorio. Salta todas las políticas de RLS.

---

## Crear el usuario administrador

Añade a `.env.local`:

```env
ADMIN_EMAIL=tu-correo@ejemplo.com
ADMIN_PASSWORD=una-contraseña-larga-y-segura
ADMIN_NAME=Jhoiker Zambrano
```

Y ejecuta:

```bash
pnpm db:setup     # hace esto y además aplica el esquema completo
# o solo el administrador:
pnpm db:seed
```

El script crea el usuario en Supabase Auth (correo ya confirmado), lo promueve a
`role = 'admin'` en `profiles` y actualiza `site_settings`. Si el usuario ya
existe, le restablece la contraseña y le reafirma el rol. **Es idempotente**:
puedes ejecutarlo tantas veces como quieras.

Después entra a `/acceso` con ese correo y esa contraseña.

### Roles disponibles

| Rol | Permisos |
|---|---|
| `admin` | Acceso total al panel |
| `editor` | (reservado) lectura del contenido |
| `viewer` | (reservado) solo lectura de su propio perfil |

El rol por defecto de cualquier usuario nuevo es `viewer`. Un trigger impide que
un usuario se auto-promocione desde el navegador.

---

## Publicar en GitHub

### Opción A — automatizado (recomendada)

Rellena en `.env.local`:

```env
GITHUB_TOKEN=ghp_...        # https://github.com/settings/tokens  → casilla «repo»
GITHUB_OWNER=tu-usuario
GITHUB_REPO=jhoiker-zambrano-portfolio
```

Y ejecuta:

```bash
pnpm push:test    # opcional: comprueba el proceso sin publicar
pnpm push         # crea el repositorio y sube todo
```

El script crea el repositorio si no existe, sube los ~100 archivos mediante la
API REST de GitHub, y **verifica antes de subir que `.env.local`, `.env` y
`node_modules` no estén en la lista**. No requiere tener Git instalado.

### Opción B — con Git

```bash
git init
git add .
git commit -m "Sitio de marca personal con centro de contratos"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/jhoiker-zambrano-portfolio.git
git push -u origin main
```

El archivo `.gitignore` ya excluye `.env.local`, `.next/` y `node_modules/`.

---

## Desplegar en Vercel

### Opción A — desde el panel (recomendada)

1. [vercel.com/new](https://vercel.com/new) → importa el repositorio
2. Framework detectado: **Next.js** (sin configuración extra)
3. En **Environment Variables** añade las 6 variables de `.env.example`
4. **Deploy**

Cada `git push` a `main` desplegará automáticamente.

### Opción B — desde la terminal

```bash
pnpm dlx vercel link
pnpm dlx vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... repetir con cada variable
pnpm dlx vercel --prod
```

### Dominio

Vercel asigna `jhoiker-zambrano-portfolio.vercel.app`. Para un dominio propio:
**Settings → Domains → Add**, y apunta el DNS según indique Vercel (SSL
automático).

Actualiza `NEXT_PUBLIC_SITE_URL` con el dominio final para que el `sitemap.xml`
y las etiquetas Open Graph apunten al lugar correcto.

---

## Estructura del proyecto

```
jhoiker-zambrano-portfolio/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx              Tipografías, metadatos, nav, footer
│  │  ├─ page.tsx                Página de inicio
│  │  ├─ globals.css             Tokens de marca + utilidades
│  │  ├─ proyectos/              Portafolio y casos de estudio
│  │  ├─ servicios/              Catálogo con precios
│  │  ├─ automatizaciones/       Hub de flujos
│  │  ├─ sobre-mi/               Historia y stack
│  │  ├─ marca/                  Manual de identidad vivo
│  │  ├─ contacto/               Formulario + Server Action
│  │  ├─ acceso/                 Login del panel
│  │  └─ admin/                  Panel privado
│  │     ├─ proyectos/           CRUD de proyectos
│  │     ├─ servicios/           CRUD de servicios
│  │     ├─ automatizaciones/    CRUD de flujos
│  │     ├─ leads/               Bandeja de clientes potenciales
│  │     ├─ contratos/           Centro de negociación de contratos
│  │     └─ ajustes/             Configuración y auditoría
│  ├─ components/
│  │  ├─ brand/Logo.tsx          Isotipo, logotipo e isotipo horizontal
│  │  ├─ layout/                 Nav, Footer, CommandPalette, GridBackdrop
│  │  ├─ sections/               Tarjetas, exploradores, timeline, FAQ, formularios
│  │  ├─ admin/                  Gestores del panel
│  │  └─ ui/                     Primitivas (Card, Badge, SectionHeading…)
│  ├─ lib/
│  │  ├─ brand.ts                Fuente de verdad de la marca
│  │  ├─ types.ts                Tipos del dominio
│  │  ├─ utils.ts                Utilidades (formato, slug, número a letras)
│  │  ├─ nav.ts                  Enlaces de navegación compartidos
│  │  ├─ content.ts              Contenido de respaldo
│  │  ├─ data.ts                 Acceso a datos del sitio público
│  │  ├─ admin.ts                Acceso a datos del panel
│  │  ├─ auth.ts                 Sesión y verificación de administrador
│  │  ├─ supabase/               Clientes browser / servidor / service role
│  │  └─ contracts/
│  │     ├─ templates.ts         4 plantillas con 18 cláusulas cada una
│  │     ├─ engine.ts            Motor puro de contratos
│  │     └─ pdf.ts               Generación del PDF de marca
│  └─ middleware.ts              Refresco de sesión + protección de /admin
├─ supabase/
│  ├─ migrations/0001_init.sql   Esquema
│  ├─ migrations/0002_rls.sql    Políticas de acceso
│  ├─ seed.sql                   Contenido real
│  └─ README.md                  Guía de base de datos
└─ scripts/seed-admin.mjs        Creador del usuario administrador
```

---

## El módulo de contratos

El corazón del panel. Vive en `/admin/contratos`.

### Plantillas predefinidas

| Plantilla | Cláusulas | Precio base | Plazo | Garantía | Plan de pagos |
|---|---|---|---|---|---|
| Desarrollo Web a Medida | 18 | $4.500.000 | 45 días | 90 días | 40/20/20/20 |
| Automatización de Procesos | 18 | $6.000.000 | 30 días | 60 días | 40/30/30 |
| Consultoría y Arquitectura Digital | 18 | $12.000.000 | 90 días | 120 días | 30/30/40 |
| Mantenimiento y Evolución Mensual | 18 | $1.800.000 | 30 días | 30 días | 40/30/30 |

Cada plantilla cubre: objeto, alcance, entregables, exclusiones, obligaciones de
ambas partes, cronograma, valor y pago, retención en la fuente e IVA, propiedad
intelectual y cesión de derechos, licencias y software open source,
confidencialidad y habeas data (Ley 1581 de 2012), garantía, control de cambios,
terminación anticipada, incumplimiento y cláusula penal, limitación de
responsabilidad, fuerza mayor, y solución de controversias.

### Cláusulas negociables y bloqueadas

- **12 negociables** — alcance, cronograma, forma de pago, garantía, control de
  cambios. Se editan desde el panel.
- **6 bloqueadas** — impuestos, propiedad intelectual, licencias,
  confidencialidad, limitación de responsabilidad y ley aplicable. Son
  jurídicamente sensibles y el motor rechaza cualquier intento de edición.

### Flujo de negociación

1. **Crear** desde una plantilla: se resuelven automáticamente los marcadores
   (`{{cliente}}`, `{{valor}}`, `{{valor_letras}}`, `{{plazo}}`, `{{fecha_inicio}}`,
   `{{fecha_fin}}`, `{{garantia}}`…) y se calcula el plan de pagos.
2. **Negociar** cláusula por cláusula. Cada guardado genera una **versión nueva**
   con autor, nota, número de cláusulas y valor.
3. **Cambiar condiciones** — valor, plazo y garantía recalculan los montos de
   cada hito repartiendo el residuo de redondeo en el último.
4. **Registrar el estado** — borrador → enviado → en negociación → aprobado →
   firmado → completado. Cada cambio queda en la bitácora.
5. **Exportar** — PDF A4 de marca con cabecera en cada página, partes, objeto,
   tabla económica, plan de pagos, cláusulas justificadas, firmas y numeración
   `Página X de Y`. También permite imprimir y copiar en texto plano.

### Previsualizar los contratos sin Supabase

Para revisar cómo queda un contrato antes de tener la base de datos conectada,
añade esta línea a `.env.local` y reinicia el servidor:

```env
ENABLE_SAMPLE_CONTRACTS=true
```

Después puedes abrir en el navegador:

| Dirección | Resultado |
|---|---|
| `/api/muestra-contrato?plantilla=desarrollo-web` | PDF del contrato de ejemplo |
| `/api/muestra-contrato?plantilla=automatizacion-procesos&formato=texto` | El mismo contrato en texto plano |
| `/api/diagnostico-contratos` | Informe JSON: marcadores sin resolver, cláusulas y plan de pagos de las 4 plantillas |

Las plantillas disponibles son `desarrollo-web`, `automatizacion-procesos`,
`consultoria-arquitectura` y `mantenimiento-evolutivo`.

> Estas dos rutas responden **404** mientras `ENABLE_SAMPLE_CONTRACTS` no sea
> exactamente `true`, así que pueden quedarse en el código sin riesgo en
> producción. Quita la variable cuando termines de revisar.

---

## Seguridad

- **Row Level Security activo en las 10 tablas.** El contenido público solo se
  lee cuando está publicado/activo.
- **`leads` y `contracts` son privados.** `anon` puede insertar un lead (para que
  el formulario funcione) pero **no puede leerlos**. Los contratos solo los ve un
  administrador.
- **`site_settings` y `audit_log`** son de acceso exclusivo del administrador.
- **El cliente con `service_role`** solo se importa en el servidor, y toda ruta
  que lo usa valida antes la sesión de administrador.
- **Doble barrera en `/admin`** — el middleware redirige a `/acceso` sin sesión, y
  el layout vuelve a comprobar el rol contra la base de datos. Un usuario
  autenticado pero sin rol `admin` no entra.
- **Auditoría** — cada acción del panel se registra con actor, acción, entidad y
  fecha.
- **Contraseñas con contraseña fuerte** — la del administrador se define en
  `.env.local`, que está en `.gitignore`.

---

## Solución de problemas

**El panel muestra «Base de datos no inicializada»**
No se ejecutaron las migraciones. Corre los tres archivos de
`supabase/migrations/` y `supabase/seed.sql` en el SQL Editor.

**No puedo entrar a `/acceso`**
Verifica que `ADMIN_EMAIL` y `ADMIN_PASSWORD` estén definidos y que hayas
ejecutado `pnpm db:seed`. Comprueba en Supabase → Authentication → Users que el
usuario exista y esté confirmado, y en `profiles` que su rol sea `admin`.

**El formulario de contacto responde que no está conectado**
Faltan `NEXT_PUBLIC_SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY`. Ambos deben
estar configurados también en Vercel.

**Los cambios en el sitio no aparecen en producción**
El contenido público se revalida cada 5 minutos, y las acciones del panel
invalidadan la caché automáticamente. Si acabas de desplegar, espera a que
termine la compilación en Vercel.

**El PDF sale con caracteres raros**
El generador sanitiza las comillas tipográficas y los guiones largos antes de
dibujar, porque las fuentes estándar usan codificación WinAnsi. Si añades texto
con emojis, se eliminarán del PDF.

---

**Propietario:** Jhoiker Zambrano · Ingeniería de Software & Arquitectura Digital
**Manual de Identidad de Marca:** v3.0 · Octubre 2026
