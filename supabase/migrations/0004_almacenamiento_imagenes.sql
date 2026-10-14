-- ============================================================
--  Almacenamiento de imágenes de proyectos
--  Crea un bucket público de solo lectura donde el administrador
--  sube las portadas y galerías desde el panel.
--
--  Idempotente: puede ejecutarse varias veces.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Bucket público
--    Público significa que cualquiera puede VER las imágenes
--    (necesario para que se muestren en la web), pero solo el
--    administrador puede subirlas, cambiarlas o borrarlas.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  5242880, -- 5 MB por archivo
  array['image/jpeg','image/png','image/webp','image/avif','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ------------------------------------------------------------
-- 2. Políticas de acceso a los objetos
-- ------------------------------------------------------------

-- Lectura pública: cualquiera puede ver las imágenes del bucket.
drop policy if exists "project_images_lectura_publica" on storage.objects;
create policy "project_images_lectura_publica"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-images');

-- Subida: solo el administrador.
drop policy if exists "project_images_subida_admin" on storage.objects;
create policy "project_images_subida_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images' and public.is_admin());

-- Reemplazo: solo el administrador.
drop policy if exists "project_images_actualizacion_admin" on storage.objects;
create policy "project_images_actualizacion_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images' and public.is_admin())
  with check (bucket_id = 'project-images' and public.is_admin());

-- Borrado: solo el administrador.
drop policy if exists "project_images_borrado_admin" on storage.objects;
create policy "project_images_borrado_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images' and public.is_admin());

-- ------------------------------------------------------------
-- 3. Recargar la caché de la API
-- ------------------------------------------------------------
notify pgrst, 'reload schema';
