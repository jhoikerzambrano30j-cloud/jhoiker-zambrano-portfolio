# Supabase — Base de datos del portafolio

Esquema, seguridad y datos iniciales del portafolio de **Jhoiker Zambrano**.
El schema es un **espejo exacto** de los tipos definidos en [`src/lib/types.ts`](../src/lib/types.ts):
mismos nombres de tabla y de columna.

```
supabase/
├── migrations/
│   ├── 0001_init.sql   # tablas, índices, triggers, RPC y vista del dashboard
│   └── 0002_rls.sql    # Row Level Security: quién puede ver y escribir qué
├── seed.sql            # contenido real (proyectos, servicios, plantillas de contrato…)
└── README.md
```

---

## 1. Requisitos previos

| Cosa | Dónde se obtiene |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (**solo servidor**) |

Copia `.env.example` a `.env.local` y completa los valores antes de continuar.

---

## 2. Ejecutar las migraciones

### Opción A — SQL Editor del dashboard (recomendada la primera vez)

1. Entra al proyecto en <https://supabase.com/dashboard> → **SQL Editor** → *New query*.
2. Pega **todo** el contenido de `migrations/0001_init.sql` y pulsa **Run**.
3. Repite con `migrations/0002_rls.sql`.

El orden importa: `0002` crea las políticas sobre las tablas de `0001`.

### Opción B — Supabase CLI

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

La CLI aplica los archivos de `supabase/migrations/` en orden alfabético.

### Opción C — psql

```bash
psql "postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres" \
  -f supabase/migrations/0001_init.sql \
  -f supabase/migrations/0002_rls.sql
```

### Verificación rápida

```sql
-- Deben aparecer 10 tablas
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;

-- La vista del panel debe responder
select * from public.dashboard_stats;
```

---

## 3. Cargar el contenido inicial (seed)

En el **SQL Editor**, pega el contenido de `supabase/seed.sql` y pulsa **Run**.

El seed es **idempotente**: usa `on conflict (slug|code|key) do nothing` y guardas
`not exists`, así que puedes ejecutarlo varias veces sin duplicar filas. Incluye:

- 6 proyectos del portafolio, 4 servicios, 5 grupos de habilidades y 4 automatizaciones.
- 3 plantillas de contrato (16 cláusulas cada una) para el módulo de contratos.
- 2 leads de ejemplo y 1 contrato en negociación (`JZ-CT-2026-0001`).
- La configuración del sitio (`site_settings`) y, si el usuario ya existe en
  `auth.users`, su promoción a `admin`.

---

## 4. Crear el usuario administrador

El administrador vive en **Supabase Auth**, no en el SQL. El script se encarga de
crearlo, confirmar el correo, promoverlo a `admin` en `public.profiles` y dejar
`site_settings.owner_email` configurado.

```bash
pnpm run db:seed
# equivalente a: node scripts/seed-admin.mjs
```

Variables que usa (en `.env.local` o en el entorno):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
ADMIN_EMAIL=tu-correo@dominio.com
ADMIN_PASSWORD=una-contraseña-larga-y-única
ADMIN_NAME=Jhoiker Zambrano        # opcional
```

Qué hace exactamente:

1. Lee `.env.local` (y `.env`) con un parser propio y cae a `process.env`.
2. Valida que las variables existan y que la URL y la contraseña sean razonables.
3. `auth.admin.createUser({ email, password, email_confirm: true })`.
4. Si el correo **ya está registrado**, lo busca con `auth.admin.listUsers()` y
   actualiza su contraseña con `auth.admin.updateUserById()`.
5. Hace `upsert` en `public.profiles` con `role: 'admin'`.
6. Actualiza `site_settings.owner_email`.
7. Imprime un resumen en español (verde = éxito, rojo = error) y termina con
   `process.exitCode` en `0` o `1`.

> **Nunca** expongas `SUPABASE_SERVICE_ROLE_KEY` al navegador: solo se usa en el
> script y en el código de servidor de Next.js.

---

## 5. Tablas y nivel de acceso

| Tabla | Contenido | `anon` (público) | `authenticated` | `admin` (`is_admin()`) |
| --- | --- | --- | --- | --- |
| `projects` | Portafolio | `select` solo si `status = 'publicado'` | igual que `anon` | CRUD total |
| `services` | Servicios | `select` solo si `active = true` | igual que `anon` | CRUD total |
| `skill_groups` | Habilidades | `select` de todo el contenido | igual que `anon` | CRUD total |
| `automations` | Automatizaciones | `select` solo si `status = 'activa'` | igual que `anon` | CRUD total |
| `contract_templates` | Plantillas de contrato | `select` solo si `active = true` | igual que `anon` | CRUD total |
| `leads` | Prospectos | **solo `insert`** (formulario de contacto), nunca `select` | sin acceso | CRUD total |
| `contracts` | Contratos | sin acceso | sin acceso | CRUD total |
| `site_settings` | Configuración del sitio | sin acceso | sin acceso | CRUD total |
| `audit_log` | Bitácora | sin acceso | sin acceso | `select` + `insert` (append-only) |
| `profiles` | Usuarios del panel | sin acceso | su propia fila (`select`/`insert`/`update`) | todas las filas |

Reglas que conviene tener presentes:

- **Los contratos son privados incluso para usuarios autenticados**: solo un
  `admin` los ve. Es el material más sensible del panel.
- **Un `anon` nunca puede leer leads.** Puede insertarlos (con `status = 'nuevo'`),
  nada más. Así el formulario público funciona sin exponer la base de prospectos.
- **Los usuarios no pueden auto-promoverse**: el trigger `protect_profile_role`
  bloquea cualquier cambio de rol hecho desde el navegador que no venga de un
  administrador. El acceso con la service role key (script de admin, SQL Editor,
  migraciones) sí puede otorgar roles, porque ya exige credenciales de servicio.
- **`site_settings` es privado.** El sitio público debe leerlo desde el servidor
  (Server Component / Route Handler con la service role key), no desde el navegador.

---

## 6. Piezas reutilizables del schema

| Objeto | Tipo | Para qué sirve |
| --- | --- | --- |
| `set_updated_at()` | función + triggers | Mantiene `updated_at` en cada `update` de las tablas que tienen la columna. |
| `is_admin()` | función `security definer` | `true` si `auth.uid()` tiene `role = 'admin'`. Base de todas las políticas privadas. |
| `next_contract_seq()` | RPC `security definer` | Siguiente consecutivo entero del año: `count(*)` de contratos del año + 1. La app lo formatea como `JZ-CT-AAAA-NNNN`. |
| `dashboard_stats` | vista `security_invoker` | Contadores del panel (proyectos, pipeline, valor firmado, horas ahorradas…). Al ser `security_invoker`, respeta las políticas RLS del usuario que consulta. |

Ejemplo de uso del consecutivo desde el cliente:

```ts
const { data: seq } = await supabase.rpc('next_contract_seq');
const code = `JZ-CT-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;
```

---

## 7. Preguntas frecuentes

**¿Por qué `text` + `check` y no tipos `ENUM`?**
Los union types de TypeScript cambian con frecuencia. Migrar un `check` es un
`alter table`; migrar un `ENUM` de PostgreSQL obliga a recrear el tipo y sus usos.

**¿Por qué los arrays son `jsonb` y no tablas aparte?**
Son listas pequeñas que siempre se leen y escriben completas con su registro
(`stack`, `metrics`, `deliverables`, `clauses`…). `jsonb` evita decenas de joins y
mantiene la forma exacta del tipo TypeScript.

**El seed no insertó el perfil admin.**
Es lo esperado si `auth.users` está vacío: ejecuta antes
`node scripts/seed-admin.mjs`. Después vuelve a correr `seed.sql` (es idempotente)
o simplemente el script, que hace el `upsert` del perfil por su cuenta.

**¿Cómo creo un segundo usuario editor?**
Créalo desde Authentication → Users y luego inserta su fila en `profiles` con
`role = 'editor'` (solo un admin puede otorgar roles distintos de `viewer`).
