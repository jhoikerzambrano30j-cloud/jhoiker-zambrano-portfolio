-- ============================================================================
--  JHOIKER ZAMBRANO — Portafolio & Panel de administración
--  0002_rls.sql — Row Level Security
--
--  Modelo de acceso:
--   * PÚBLICO   (anon + authenticated, solo lectura y solo si está publicado):
--       projects, services, skill_groups, automations, contract_templates
--   * PÚBLICO DE ESCRITURA CIEGA: leads (anon puede INSERT, nunca SELECT)
--   * PRIVADO   (solo is_admin()): leads*, contracts, audit_log, site_settings
--       (* los leads los puede crear cualquiera, pero solo el admin los lee)
--   * profiles: cada usuario su fila + el admin todas
--
--  IMPORTANTE: los contratos son material de panel privado. Ni siquiera un
--  usuario autenticado que no sea admin puede verlos.
-- ============================================================================

-- ----------------------------------------------------------------------------
--  Helper: ¿el usuario autenticado es admin?
--  SECURITY DEFINER para poder leer profiles sin volver a disparar sus propias
--  políticas (evita la recursión infinita 42P17 al usarlo dentro de las
--  políticas de la tabla profiles).
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'true si auth.uid() tiene role = admin en public.profiles. SECURITY DEFINER.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- ============================================================================
--  RLS ON en TODAS las tablas
-- ============================================================================
alter table public.profiles            enable row level security;
alter table public.projects            enable row level security;
alter table public.services            enable row level security;
alter table public.skill_groups        enable row level security;
alter table public.automations         enable row level security;
alter table public.leads               enable row level security;
alter table public.contracts           enable row level security;
alter table public.contract_templates  enable row level security;
alter table public.site_settings       enable row level security;
alter table public.audit_log           enable row level security;


-- ============================================================================
--  1. profiles — cada quien su fila; el admin todas
-- ============================================================================
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own_or_admin" on public.profiles;
create policy "profiles_insert_own_or_admin"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- Un usuario no puede auto-promoverse: solo un admin cambia roles.
-- Si no hay usuario autenticado en el contexto (service role key, SQL Editor,
-- migraciones o scripts de administración) el cambio sí se permite: ese acceso
-- ya exige las credenciales de servicio del proyecto.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar el rol de un perfil.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_protect_role on public.profiles;
create trigger trg_profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();


-- ============================================================================
--  2. projects — público solo lo publicado
-- ============================================================================
drop policy if exists "projects_select_public" on public.projects;
create policy "projects_select_public"
  on public.projects for select
  to anon, authenticated
  using (status = 'publicado');

drop policy if exists "projects_select_admin" on public.projects;
create policy "projects_select_admin"
  on public.projects for select
  to authenticated
  using (public.is_admin());

drop policy if exists "projects_insert_admin" on public.projects;
create policy "projects_insert_admin"
  on public.projects for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "projects_update_admin" on public.projects;
create policy "projects_update_admin"
  on public.projects for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "projects_delete_admin" on public.projects;
create policy "projects_delete_admin"
  on public.projects for delete
  to authenticated
  using (public.is_admin());


-- ============================================================================
--  3. services — público solo los activos
-- ============================================================================
drop policy if exists "services_select_public" on public.services;
create policy "services_select_public"
  on public.services for select
  to anon, authenticated
  using (active = true);

drop policy if exists "services_select_admin" on public.services;
create policy "services_select_admin"
  on public.services for select
  to authenticated
  using (public.is_admin());

drop policy if exists "services_insert_admin" on public.services;
create policy "services_insert_admin"
  on public.services for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "services_update_admin" on public.services;
create policy "services_update_admin"
  on public.services for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "services_delete_admin" on public.services;
create policy "services_delete_admin"
  on public.services for delete
  to authenticated
  using (public.is_admin());


-- ============================================================================
--  4. skill_groups — contenido público de vitrina (no tiene flag de estado)
-- ============================================================================
drop policy if exists "skill_groups_select_public" on public.skill_groups;
create policy "skill_groups_select_public"
  on public.skill_groups for select
  to anon, authenticated
  using (true);

drop policy if exists "skill_groups_insert_admin" on public.skill_groups;
create policy "skill_groups_insert_admin"
  on public.skill_groups for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "skill_groups_update_admin" on public.skill_groups;
create policy "skill_groups_update_admin"
  on public.skill_groups for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "skill_groups_delete_admin" on public.skill_groups;
create policy "skill_groups_delete_admin"
  on public.skill_groups for delete
  to authenticated
  using (public.is_admin());


-- ============================================================================
--  5. automations — público solo las activas
-- ============================================================================
drop policy if exists "automations_select_public" on public.automations;
create policy "automations_select_public"
  on public.automations for select
  to anon, authenticated
  using (status = 'activa');

drop policy if exists "automations_select_admin" on public.automations;
create policy "automations_select_admin"
  on public.automations for select
  to authenticated
  using (public.is_admin());

drop policy if exists "automations_insert_admin" on public.automations;
create policy "automations_insert_admin"
  on public.automations for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "automations_update_admin" on public.automations;
create policy "automations_update_admin"
  on public.automations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "automations_delete_admin" on public.automations;
create policy "automations_delete_admin"
  on public.automations for delete
  to authenticated
  using (public.is_admin());


-- ============================================================================
--  6. contract_templates — público solo las activas (el editor de contratos
--     las consume desde el panel, pero su contenido legal es de libre consulta)
-- ============================================================================
drop policy if exists "contract_templates_select_public" on public.contract_templates;
create policy "contract_templates_select_public"
  on public.contract_templates for select
  to anon, authenticated
  using (active = true);

drop policy if exists "contract_templates_select_admin" on public.contract_templates;
create policy "contract_templates_select_admin"
  on public.contract_templates for select
  to authenticated
  using (public.is_admin());

drop policy if exists "contract_templates_insert_admin" on public.contract_templates;
create policy "contract_templates_insert_admin"
  on public.contract_templates for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "contract_templates_update_admin" on public.contract_templates;
create policy "contract_templates_update_admin"
  on public.contract_templates for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "contract_templates_delete_admin" on public.contract_templates;
create policy "contract_templates_delete_admin"
  on public.contract_templates for delete
  to authenticated
  using (public.is_admin());


-- ============================================================================
--  7. leads — anon puede INSERTAR (formulario de contacto) y NUNCA leer;
--     el admin gestiona todo el ciclo de vida del prospecto.
-- ============================================================================
drop policy if exists "leads_insert_anon" on public.leads;
create policy "leads_insert_anon"
  on public.leads for insert
  to anon
  with check (status = 'nuevo');

-- No existe ninguna política de SELECT para anon: los leads son ilegibles
-- desde el navegador público incluso con la anon key.

drop policy if exists "leads_select_admin" on public.leads;
create policy "leads_select_admin"
  on public.leads for select
  to authenticated
  using (public.is_admin());

drop policy if exists "leads_insert_admin" on public.leads;
create policy "leads_insert_admin"
  on public.leads for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "leads_update_admin" on public.leads;
create policy "leads_update_admin"
  on public.leads for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "leads_delete_admin" on public.leads;
create policy "leads_delete_admin"
  on public.leads for delete
  to authenticated
  using (public.is_admin());


-- ============================================================================
--  8. contracts — panel privado. Solo el admin.
-- ============================================================================
drop policy if exists "contracts_select_admin" on public.contracts;
create policy "contracts_select_admin"
  on public.contracts for select
  to authenticated
  using (public.is_admin());

drop policy if exists "contracts_insert_admin" on public.contracts;
create policy "contracts_insert_admin"
  on public.contracts for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "contracts_update_admin" on public.contracts;
create policy "contracts_update_admin"
  on public.contracts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "contracts_delete_admin" on public.contracts;
create policy "contracts_delete_admin"
  on public.contracts for delete
  to authenticated
  using (public.is_admin());


-- ============================================================================
--  9. site_settings — configuración privada (la lee el servidor con la
--     service role key, nunca el navegador con la anon key).
-- ============================================================================
drop policy if exists "site_settings_select_admin" on public.site_settings;
create policy "site_settings_select_admin"
  on public.site_settings for select
  to authenticated
  using (public.is_admin());

drop policy if exists "site_settings_insert_admin" on public.site_settings;
create policy "site_settings_insert_admin"
  on public.site_settings for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "site_settings_update_admin" on public.site_settings;
create policy "site_settings_update_admin"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "site_settings_delete_admin" on public.site_settings;
create policy "site_settings_delete_admin"
  on public.site_settings for delete
  to authenticated
  using (public.is_admin());


-- ============================================================================
--  10. audit_log — bitácora privada. El admin lee y escribe; nadie más.
--      (No se permite update/delete por diseño: es append-only.)
-- ============================================================================
drop policy if exists "audit_log_select_admin" on public.audit_log;
create policy "audit_log_select_admin"
  on public.audit_log for select
  to authenticated
  using (public.is_admin());

drop policy if exists "audit_log_insert_admin" on public.audit_log;
create policy "audit_log_insert_admin"
  on public.audit_log for insert
  to authenticated
  with check (public.is_admin());
