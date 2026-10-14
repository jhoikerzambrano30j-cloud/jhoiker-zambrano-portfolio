-- ============================================================================
--  JHOIKER ZAMBRANO — Portafolio & Panel de administración
--  0001_init.sql — Schema base
--
--  Espejo exacto de src/lib/types.ts (mismos nombres de tabla y de columna).
--  PostgreSQL 15+ / Supabase.
--
--  Decisiones de diseño:
--   * Los "enums" del dominio se modelan con `text` + `check` en lugar de tipos
--     ENUM de PostgreSQL: migrar un CHECK es trivial, migrar un ENUM no lo es.
--   * Los arrays y objetos del dominio se guardan como `jsonb` con default
--     '[]'::jsonb / '{}'::jsonb para que el cliente nunca reciba NULL donde el
--     tipo TypeScript espera un arreglo.
--   * Los dineros usan `numeric(14,2)` (COP no maneja centavos, pero numeric
--     evita sorpresas de redondeo con float).
--   * `profiles` no tiene `updated_at` porque el tipo Profile de types.ts no lo
--     expone: es un espejo, no una tabla nueva.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
--  Trigger reutilizable para mantener updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Asigna now() a NEW.updated_at. Se engancha con triggers BEFORE UPDATE.';


-- ============================================================================
--  1. profiles — usuarios del panel (extiende auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid()
                  references auth.users (id) on delete cascade,
  email         text not null,
  full_name     text not null,
  role          text not null default 'viewer'
                  check (role in ('admin', 'editor', 'viewer')),
  avatar_url    text,
  headline      text,
  bio           text,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

create unique index if not exists profiles_email_key on public.profiles (email);

comment on table public.profiles is
  'Perfil de cada usuario del panel. Una fila por usuario de auth.users con rol admin/editor/viewer.';


-- ============================================================================
--  2. projects — portafolio
-- ============================================================================
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  summary     text not null,
  description text,
  category    text not null
                check (category in ('Web', 'Automatización', 'App', 'IA', 'E-commerce', 'Arquitectura', 'Data')),
  status      text not null default 'borrador'
                check (status in ('publicado', 'borrador', 'archivado')),
  year        integer check (year is null or year between 1990 and 2200),
  client      text,
  role        text,
  cover_url   text,
  gallery     jsonb not null default '[]'::jsonb,
  stack       jsonb not null default '[]'::jsonb,
  metrics     jsonb not null default '[]'::jsonb,
  repo_url    text,
  live_url    text,
  featured    boolean not null default false,
  sort_order  integer not null default 0,
  tags        jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.projects.metrics is
  'Array de {label, value}: cifras de impacto mostradas en la tarjeta del proyecto.';
comment on column public.projects.stack is 'Array de strings con las tecnologías del proyecto.';


-- ============================================================================
--  3. services — servicios ofrecidos
-- ============================================================================
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  tagline     text not null,
  description text not null,
  tier        text not null default 'professional'
                check (tier in ('starter', 'professional', 'enterprise')),
  price_from  numeric(14, 2) check (price_from is null or price_from >= 0),
  currency    text not null default 'COP',
  duration    text,
  deliverables jsonb not null default '[]'::jsonb,
  features    jsonb not null default '[]'::jsonb,
  icon        text not null default 'boxes',
  featured    boolean not null default false,
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.services.icon is
  'Nombre kebab-case de un icono de lucide-react (ej. layout-template, code-2, workflow, boxes).';


-- ============================================================================
--  4. skill_groups — agrupaciones de habilidades
-- ============================================================================
create table if not exists public.skill_groups (
  id         uuid primary key default gen_random_uuid(),
  category   text not null,
  items      jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0
);

comment on column public.skill_groups.items is
  'Array de {name, level} con level entre 1 y 100.';
-- Sin updated_at: el tipo SkillGroup de types.ts no lo define.


-- ============================================================================
--  5. automations — flujos automatizados (vitrina técnica)
-- ============================================================================
create table if not exists public.automations (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  description       text not null,
  trigger_type      text not null default 'webhook',
  tools             jsonb not null default '[]'::jsonb,
  autonomy_level    text not null default 'semiautonomo'
                      check (autonomy_level in ('supervisado', 'semiautonomo', 'autonomo')),
  status            text not null default 'borrador'
                      check (status in ('activa', 'pausada', 'borrador', 'error')),
  runs_count        integer not null default 0 check (runs_count >= 0),
  success_rate      numeric(5, 2) check (success_rate is null or (success_rate >= 0 and success_rate <= 100)),
  saved_hours_month numeric(10, 2) check (saved_hours_month is null or saved_hours_month >= 0),
  workflow          jsonb not null default '[]'::jsonb,
  featured          boolean not null default false,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on column public.automations.workflow is
  'Array de {step, detail} con los pasos del flujo automatizado.';


-- ============================================================================
--  6. leads — prospectos del formulario público
-- ============================================================================
create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  company      text,
  phone        text,
  project_type text,
  budget_range text,
  timeline     text,
  message      text not null,
  status       text not null default 'nuevo'
                 check (status in ('nuevo', 'contactado', 'en_negociacion', 'ganado', 'perdido', 'archivado')),
  source       text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);


-- ============================================================================
--  7. contract_templates — plantillas del módulo de contratos
-- ============================================================================
create table if not exists public.contract_templates (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  description   text not null,
  category      text not null default 'Desarrollo',
  base_price    numeric(14, 2) not null default 0 check (base_price >= 0),
  duration_days integer not null default 30 check (duration_days > 0),
  warranty_days integer not null default 60 check (warranty_days >= 0),
  deliverables  jsonb not null default '[]'::jsonb,
  exclusions    jsonb not null default '[]'::jsonb,
  clauses       jsonb not null default '[]'::jsonb,
  payment_plan  jsonb not null default '[]'::jsonb,
  active        boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

comment on column public.contract_templates.clauses is
  'Array de {id, order, title, body, locked, category}. Las cláusulas con locked = true no deben editarse libremente.';
comment on column public.contract_templates.payment_plan is
  'Array de {milestone, percent, amount}; los percent deben sumar 100.';
-- Sin updated_at: el tipo ContractTemplate de types.ts no lo define.


-- ============================================================================
--  8. contracts — contratos generados (panel privado)
-- ============================================================================
create table if not exists public.contracts (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  title           text not null,
  status          text not null default 'borrador'
                    check (status in ('borrador', 'enviado', 'en_negociacion', 'aprobado', 'firmado', 'rechazado', 'cancelado', 'completado')),
  template_slug   text references public.contract_templates (slug) on delete set null,
  client_name     text not null,
  client_company  text,
  client_email    text,
  client_doc_id   text,
  client_address  text,
  scope           text not null default '',
  deliverables    jsonb not null default '[]'::jsonb,
  exclusions      jsonb not null default '[]'::jsonb,
  total           numeric(14, 2) not null default 0 check (total >= 0),
  currency        text not null default 'COP',
  payment_plan    jsonb not null default '[]'::jsonb,
  start_date      date,
  duration_days   integer check (duration_days is null or duration_days > 0),
  warranty_days   integer check (warranty_days is null or warranty_days >= 0),
  clauses         jsonb not null default '[]'::jsonb,
  negotiation_log jsonb not null default '[]'::jsonb,
  versions        jsonb not null default '[]'::jsonb,
  current_version integer not null default 1 check (current_version > 0),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on column public.contracts.negotiation_log is
  'Array de {at, actor, action, detail} con la trazabilidad de la negociación.';
comment on column public.contracts.versions is
  'Array de {version, created_at, author, note, total, clauses_count}.';
comment on column public.contracts.code is
  'Consecutivo legible JZ-CT-AAAA-NNNN. Se calcula con public.next_contract_seq().';


-- ============================================================================
--  9. site_settings — configuración editable del sitio (clave/valor)
-- ============================================================================
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);


-- ============================================================================
--  10. audit_log — bitácora de acciones del panel
-- ============================================================================
create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action      text not null,
  entity      text not null,
  entity_id   text,
  detail      jsonb,
  created_at  timestamptz not null default now()
);

comment on table public.audit_log is
  'Registro append-only de acciones administrativas. El detalle va en jsonb.';


-- ============================================================================
--  Índices
-- ============================================================================
create index if not exists projects_status_idx      on public.projects (status);
create index if not exists projects_featured_idx    on public.projects (featured);
create index if not exists projects_category_idx    on public.projects (category);

create index if not exists contracts_status_idx     on public.contracts (status);
-- contracts(code) ya queda indexado por la restricción UNIQUE (contracts_code_key).

create index if not exists leads_status_idx         on public.leads (status);
create index if not exists leads_created_at_idx     on public.leads (created_at desc);
create index if not exists automations_status_idx   on public.automations (status);
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);


-- ============================================================================
--  Triggers updated_at (todas las tablas que tienen la columna)
-- ============================================================================
drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists trg_services_updated_at on public.services;
create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

drop trigger if exists trg_automations_updated_at on public.automations;
create trigger trg_automations_updated_at
  before update on public.automations
  for each row execute function public.set_updated_at();

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

drop trigger if exists trg_contracts_updated_at on public.contracts;
create trigger trg_contracts_updated_at
  before update on public.contracts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();


-- ============================================================================
--  RPC: consecutivo de contratos del año en curso
-- ============================================================================
create or replace function public.next_contract_seq()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select (count(*) + 1)::integer
  from public.contracts
  where extract(year from created_at) = extract(year from now());
$$;

comment on function public.next_contract_seq() is
  'Devuelve el siguiente consecutivo entero para el año en curso: count(*) de contratos del año + 1. '
  'La app lo formatea como JZ-CT-AAAA-NNNN.';


-- ============================================================================
--  Vista: métricas del dashboard
--  security_invoker = true → la vista respeta las políticas RLS del usuario que
--  consulta (un anon solo contaría lo público; un admin cuenta todo).
-- ============================================================================
create or replace view public.dashboard_stats
with (security_invoker = true)
as
select
  (select count(*) from public.projects)::integer                                as "projects",
  (select count(*) from public.projects where status = 'publicado')::integer     as "publishedProjects",
  (select count(*) from public.services)::integer                                as "services",
  (select count(*) from public.automations)::integer                             as "automations",
  (select count(*) from public.automations where status = 'activa')::integer     as "activeAutomations",
  (select count(*) from public.leads)::integer                                   as "leads",
  (select count(*) from public.leads where status = 'nuevo')::integer            as "newLeads",
  (select count(*) from public.contracts)::integer                               as "contracts",
  (select count(*) from public.contracts where status = 'firmado')::integer      as "signedContracts",
  (select coalesce(sum(total), 0) from public.contracts
     where status in ('enviado', 'en_negociacion', 'aprobado'))::numeric         as "pipelineValue",
  (select coalesce(sum(total), 0) from public.contracts
     where status in ('firmado', 'completado'))::numeric                         as "signedValue",
  (select coalesce(sum(saved_hours_month), 0) from public.automations
     where status = 'activa')::numeric                                           as "savedHoursMonth";

comment on view public.dashboard_stats is
  'Contadores agregados para el dashboard del panel. Respeta RLS (security_invoker).';


-- ============================================================================
--  Permisos base (las políticas RLS de 0002_rls.sql son las que deciden)
-- ============================================================================
grant usage on schema public to anon, authenticated;

-- Contenido público de solo lectura.
grant select on public.projects, public.services, public.skill_groups,
                public.automations, public.contract_templates
  to anon, authenticated;

-- El formulario público de contacto debe poder insertar leads (nunca leerlos).
grant insert on public.leads to anon;

-- El panel autenticado opera sobre todo; RLS filtra fila por fila.
grant select, insert, update, delete on all tables in schema public to authenticated;

grant select on public.dashboard_stats to authenticated;
grant execute on function public.next_contract_seq() to authenticated;
