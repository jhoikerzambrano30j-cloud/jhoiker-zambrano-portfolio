-- IMPORTANTE (codificación):
-- Aplicar este archivo con una herramienta que lea UTF-8.
-- Si se lee con la codificación ANSI de Windows, los acentos se
-- corrompen y quedan como caracteres de reemplazo (U+FFFD) en la
-- base de datos. Aplícalo desde el SQL Editor de Supabase o con
-- Node (`fetch`), nunca leyéndolo con `Get-Content` de PowerShell.
-- ============================================================
--  Reenfoque del contenido: páginas web, diseño gráfico e
--  infraestructura. Elimina automatización y actualiza el
--  contenido a la nueva propuesta.
--
--  Idempotente: puede ejecutarse varias veces.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Categorías permitidas
--    Primero se retira la restricción para poder reclasificar las
--    filas existentes; al final del archivo se vuelve a crear con
--    las categorías nuevas.
-- ------------------------------------------------------------
alter table public.projects drop constraint if exists projects_category_check;


-- ------------------------------------------------------------
-- 1. Proyectos: nuevo enfoque
-- ------------------------------------------------------------
update public.projects set
  title = 'Sistema de Gestión Hotelera',
  summary = 'Plataforma web para hoteles: motor de reservas, check-in/out, housekeeping y reportería en tiempo real. Interfaz diseñada para usarse de pie, en recepción, sin manual.',
  category = 'Web',
  role = 'Diseño de interfaz y desarrollo full-stack',
  tags = '["Diseño de interfaz","PMS","Tiempo real","Responsive","Multisede"]'::jsonb,
  stack = '["Next.js 15","TypeScript","Supabase","PostgreSQL","Tailwind CSS","Realtime","Vercel"]'::jsonb,
  featured = true,
  sort_order = 1
where slug = 'sistema-gestion-hotelera';

-- El proyecto de n8n se convierte en una plataforma inmobiliaria
update public.projects set
  slug = 'plataforma-inmobiliaria',
  title = 'Plataforma Inmobiliaria',
  summary = 'Portal de búsqueda de inmuebles con filtros avanzados, mapas interactivos, tour guiado y contacto directo con el asesor. Diseño orientado a que el cliente encuentre y decida rápido.',
  description = 'La inmobiliaria dependía de portales de terceros y de un catálogo en PDF que se desactualizaba cada semana. Perdían la relación con el cliente en el momento exacto en que mostraba interés.' || chr(10) || chr(10) ||
    'Construí el portal completo: catálogo con búsqueda facetada por zona, precio, área y habitaciones, mapas interactivos con agrupación de marcadores, fichas de inmueble con galería, tour guiado, calculadora de financiación y captura de leads asignados automáticamente al asesor correspondiente. El inventario se sincroniza desde el CRM del negocio, así que ningún inmueble aparece dos veces ni con precios viejos.' || chr(10) || chr(10) ||
    'El trabajo de diseño gráfico se concentró en la ficha del inmueble: jerarquía tipográfica para que el dato decisivo (precio y área) domine la vista, retícula de imágenes consistente, estados de carga con marcadores de posición en lugar de pantallas vacías y un formulario de contacto reducido a tres campos. La inmobiliaria dejó de pagar portales y pasó a recibir consultas directas.',
  category = 'Web',
  year = 2026,
  client = 'Inmobiliaria regional',
  role = 'Diseño de producto y desarrollo full-stack',
  stack = '["Next.js","TypeScript","PostgreSQL","Mapbox","Tailwind CSS","Vercel","Resend"]'::jsonb,
  tags = '["Diseño de producto","Buscador","Mapas","Fichas","Conversión"]'::jsonb,
  metrics = '[{"label":"Consultas directas al mes","value":"+240"},{"label":"Tiempo medio de búsqueda","value":"-54%"},{"label":"Costo en portales","value":"$0"}]'::jsonb,
  featured = true,
  sort_order = 2
where slug = 'automatizacion-n8n';

-- La plataforma neuroeducativa se convierte en panel de analítica visual
update public.projects set
  slug = 'panel-analitica-visual',
  title = 'Panel de Analítica Visual',
  summary = 'Aplicación web de visualización de datos: tableros interactivos, comparación de períodos y exportación. Del dato crudo a una decisión en dos clics.',
  description = 'El equipo tomaba decisiones con reportes exportados a hojas de cálculo que llegaban tarde y nadie leía completos. El problema no era la falta de datos, sino que no había forma de mirarlos.' || chr(10) || chr(10) ||
    'Diseñé y desarrollé un panel de analítica sobre Next.js y PostgreSQL: consultas agregadas en el servidor, gráficos interactivos con filtro de período, comparación contra el año anterior, desglose por segmento y exportación a CSV. Todo el cálculo pesado ocurre en la base de datos, así que la interfaz responde al instante incluso con millones de filas.' || chr(10) || chr(10) ||
    'El diseño se apoyó en jerarquía y contraste: un indicador principal por pantalla, tipografía monoespaciada para las cifras —para que los dígitos se alineen y se comparen de un vistazo—, color reservado exclusivamente para señalar variación, y una paleta accesible que se distingue también en escala de grises y en casos de daltonismo.',
  category = 'Data',
  year = 2026,
  client = 'Equipo de operaciones',
  role = 'Diseño de la visualización y desarrollo full-stack',
  stack = '["Next.js","TypeScript","PostgreSQL","Recharts","Tailwind CSS","Vercel"]'::jsonb,
  tags = '["Visualización de datos","Accesibilidad","Jerarquía","Tableros"]'::jsonb,
  metrics = '[{"label":"Tiempo hasta la decisión","value":"-72%"},{"label":"Filas consultadas","value":"2,4 millones"},{"label":"Exportaciones manuales","value":"0"}]'::jsonb,
  featured = true,
  sort_order = 3
where slug = 'plataforma-neuroeducativa';

-- El análisis de viabilidad se convierte en infraestructura
update public.projects set
  slug = 'infraestructura-servidores',
  title = 'Infraestructura y Servidores en Producción',
  summary = 'Administración de servidores Linux, despliegue continuo, certificados SSL, respaldos automáticos y monitoreo con alertas. Disponibilidad sostenida por encima del 99,9%.',
  description = 'Necesitaban dejar de depender de una máquina única sin respaldos ni monitoreo, donde cualquier actualización era un riesgo y nadie sabía que el sitio se había caído hasta que un cliente llamaba.' || chr(10) || chr(10) ||
    'Diseñé e implementé la infraestructura completa: servidores Linux provisionados y bastionados con acceso únicamente por clave SSH, Nginx como proxy inverso y terminación TLS, Certbot renovando certificados automáticamente, contenedores Docker para aislar servicios, despliegue continuo desde el repositorio, respaldos cifrados diarios con verificación de restauración y monitoreo de disponibilidad, recursos y errores con alertas accionables por Telegram.' || chr(10) || chr(10) ||
    'El endurecimiento incluyó cortafuegos con lista blanca de puertos, fail2ban contra fuerza bruta, actualizaciones de seguridad automáticas, usuarios de servicio sin privilegios y rotación de secretos. La migración se hizo sin ventana de mantenimiento visible para los usuarios y quedó documentada como runbook para que cualquier persona del equipo pueda responder a una incidencia.',
  category = 'Infraestructura',
  year = 2026,
  client = 'Operación propia y clientes',
  role = 'Administración de sistemas e infraestructura',
  stack = '["Ubuntu Server","Nginx","Docker","Certbot","UFW","fail2ban","Grafana","Bash","Cloudflare"]'::jsonb,
  tags = '["Servidores Linux","Despliegue","SSL","Respaldos","Monitoreo","Seguridad"]'::jsonb,
  metrics = '[{"label":"Disponibilidad","value":"99,96%"},{"label":"Restauración probada","value":"cada mes"},{"label":"Incidencias no detectadas","value":"0"}]'::jsonb,
  featured = true,
  sort_order = 4
where slug = 'analisis-viabilidad-ia';

-- E-commerce: añadir diseño gráfico
update public.projects set
  summary = 'Tienda en línea de marca premium: catálogo sincronizado, checkout de un paso y pasarela de pagos local. LCP de 1,1 s en móvil.',
  role = 'Diseño de interfaz y desarrollo full-stack',
  tags = '["E-commerce","Retícula","Pagos","Rendimiento","Conversión"]'::jsonb,
  featured = false,
  sort_order = 5
where slug = 'ecommerce-premium';

-- Arquitectura digital se convierte en sistema de diseño y marca
update public.projects set
  slug = 'sistema-diseno-marca',
  title = 'Sistema de Diseño y Arquitectura de Marca',
  summary = 'Sistema de diseño completo: tokens de color y tipografía, retícula, componentes accesibles y documentación viva. Adoptado en cinco aplicaciones.',
  description = 'Cinco productos internos habían divergido en tipografía, espaciado, estados de formulario y accesibilidad. Cada equipo resolvía los mismos problemas por su cuenta y cada ajuste de marca significaba semanas de trabajo repetido.' || chr(10) || chr(10) ||
    'Diseñé el sistema completo partiendo de los fundamentos del diseño gráfico: escala tipográfica modular con interlineado derivado, retícula de 8 puntos para todo el espaciado, paleta con contraste verificado AA y AAA, jerarquía visual explícita por nivel de importancia y reglas de composición documentadas. Después lo convertí en código: tokens de color, tipografía y elevación, componentes accesibles documentados en Storybook, contratos de propiedades tipados y versionado en un monorepo.' || chr(10) || chr(10) ||
    'La adopción redujo el tiempo de maquetación un 55%, eliminó las decisiones de estilo duplicadas y dejó la marca consistente en las cinco aplicaciones, con los cambios de tema propagados desde un único punto.',
  category = 'Arquitectura',
  year = 2024,
  client = 'Equipo de producto interno',
  role = 'Diseño gráfico, arquitectura de componentes y dirección técnica',
  stack = '["TypeScript","React","Next.js","Tailwind CSS","Storybook","Turborepo","Figma","Vercel"]'::jsonb,
  tags = '["Diseño gráfico","Design System","Tipografía","Retícula","Accesibilidad"]'::jsonb,
  metrics = '[{"label":"Componentes documentados","value":"64"},{"label":"Tiempo de maquetación","value":"-55%"},{"label":"Contraste verificado","value":"AA / AAA"}]'::jsonb,
  featured = false,
  sort_order = 6
where slug = 'arquitectura-digital';

-- ------------------------------------------------------------
-- 2. Servicios: nuevo enfoque
-- ------------------------------------------------------------
update public.services set
  description = 'Diseño y desarrollo de una landing page de alto rendimiento orientada a un único objetivo: convertir visitas en conversaciones. Incluye jerarquía visual trabajada, copy estructurado, animaciones sobrias, formulario conectado a tu CRM y analítica lista para medir.',
  deliverables = '["Landing page responsive de una sola página","Diseño a medida alineado a tu marca","Jerarquía visual y llamadas a la acción definidas","Formulario conectado a correo y CRM","Optimización de rendimiento y SEO técnico","Analítica de conversión configurada"]'::jsonb,
  features = '["Carga inferior a 1,5 s","Diseño adaptado a móvil primero","Despliegue automático con SSL","1 ronda de ajustes incluida"]'::jsonb,
  sort_order = 1
where slug in ('landing-conversion','landing-de-conversion');

update public.services set
  description = 'Construcción de una aplicación web completa: autenticación, base de datos, roles y permisos, paneles administrativos y las integraciones que tu negocio necesite. Arquitectura pensada para crecer sin reescribirse, con una interfaz diseñada para que el equipo la use sin capacitación.',
  deliverables = '["Aplicación web full-stack en producción","Diseño de interfaz y flujos de usuario","Base de datos modelada y migrada","Autenticación y control de acceso por roles","Panel administrativo completo","Documentación técnica y capacitación"]'::jsonb,
  features = '["Arquitectura escalable y tipada","Diseño responsive y accesible","Pruebas y despliegue continuo","Código fuente en tu repositorio"]'::jsonb,
  sort_order = 2
where slug in ('aplicacion-web-medida','aplicacion-web-a-medida');

-- El servicio de automatización se convierte en servidores e infraestructura
update public.services set
  slug = 'servidores-infraestructura',
  name = 'Servidores e Infraestructura',
  tagline = 'Que tu web esté siempre en línea, y que lo sepas.',
  description = 'Montaje y administración de la infraestructura donde vive tu aplicación: servidores Linux, despliegue continuo, certificados SSL, respaldos verificados, monitoreo con alertas y endurecimiento de seguridad. Incluye documentación operativa para responder a cualquier incidencia.',
  tier = 'professional',
  price_from = 3000000,
  duration = '2 – 4 semanas',
  icon = 'server',
  deliverables = '["Servidor Linux provisionado y endurecido","Despliegue continuo desde tu repositorio","Dominio, DNS y certificados SSL automáticos","Respaldos cifrados con restauración probada","Monitoreo de disponibilidad y recursos con alertas","Runbook de operación e incidencias"]'::jsonb,
  features = '["Acceso solo por clave SSH","Cortafuegos y protección contra fuerza bruta","Actualizaciones de seguridad automáticas","Disponibilidad medida y reportada"]'::jsonb,
  featured = true,
  sort_order = 3
where slug in ('automatizacion-procesos','automatizacion-de-procesos');

-- La consultoría se convierte en diseño y marca aplicada
update public.services set
  slug = 'diseno-marca-aplicada',
  name = 'Diseño y Marca Aplicada',
  tagline = 'Principios de diseño gráfico llevados al código.',
  description = 'Acompañamiento de diseño para que tu producto se vea y se lea bien: fundamentos de color, tipografía y retícula, sistema de componentes reutilizables, accesibilidad verificada y documentación viva. Ideal si tienes varios productos o un equipo que necesita consistencia.',
  tier = 'enterprise',
  price_from = 6000000,
  duration = '6 – 12 semanas',
  icon = 'palette',
  deliverables = '["Fundamentos: escala tipográfica, retícula y paleta","Sistema de componentes accesible y documentado","Guías de uso, jerarquía y composición","Auditoría de accesibilidad y contraste","Capacitación al equipo interno","Documentación viva en Storybook"]'::jsonb,
  features = '["Contraste verificado AA y AAA","Decisiones visuales convertidas en tokens","Consistencia entre productos","Transferencia de conocimiento real"]'::jsonb,
  featured = false,
  sort_order = 4
where slug in ('arquitectura-consultoria','arquitectura-y-consultoria-tecnica');

-- ------------------------------------------------------------
-- 3. Grupos de habilidades: enfoque en diseño, web e infraestructura
-- ------------------------------------------------------------
delete from public.skill_groups;

insert into public.skill_groups (category, items, sort_order) values
('Diseño de interfaz', '[{"name":"Jerarquía visual","level":94},{"name":"Sistemas de color y contraste","level":91},{"name":"Tipografía y escalas","level":92},{"name":"Retícula y espaciado","level":93},{"name":"Diseño responsive","level":95},{"name":"Accesibilidad (WCAG)","level":88},{"name":"Prototipado en Figma","level":90}]'::jsonb, 1),
('Frontend', '[{"name":"React y Next.js","level":95},{"name":"TypeScript","level":92},{"name":"Tailwind CSS","level":94},{"name":"Animación web","level":82},{"name":"Rendimiento (Core Web Vitals)","level":90},{"name":"Componentes accesibles","level":87}]'::jsonb, 2),
('Backend y datos', '[{"name":"Node.js","level":90},{"name":"APIs REST y Server Actions","level":91},{"name":"PostgreSQL","level":90},{"name":"Supabase","level":93},{"name":"Modelado de datos","level":88},{"name":"Autenticación y permisos","level":89}]'::jsonb, 3),
('Servidores e infraestructura', '[{"name":"Linux (Ubuntu Server)","level":90},{"name":"Nginx y proxy inverso","level":88},{"name":"Docker","level":82},{"name":"DNS, dominios y SSL","level":91},{"name":"Respaldos y recuperación","level":89},{"name":"Monitoreo y alertas","level":86},{"name":"Endurecimiento y seguridad","level":85},{"name":"CI/CD y despliegue continuo","level":90}]'::jsonb, 4),
('Arquitectura y calidad', '[{"name":"Arquitectura de aplicaciones","level":90},{"name":"Design systems","level":92},{"name":"Git y control de versiones","level":91},{"name":"Pruebas automatizadas","level":82},{"name":"Documentación técnica","level":89},{"name":"Revisión de código","level":88}]'::jsonb, 5);

-- ------------------------------------------------------------
-- 4. Ajustes del sitio
-- ------------------------------------------------------------
insert into public.site_settings (key, value, updated_at) values
  ('hero_headline', '"JHOIKER ZAMBRANO"'::jsonb, now()),
  ('hero_subheadline', '"Páginas web, diseño gráfico e infraestructura"'::jsonb, now()),
  ('social_links', '{"github":"https://github.com/jhoikerzambrano30j-cloud","linkedin":null,"x":null}'::jsonb, now())
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ------------------------------------------------------------
-- 5. Eliminar los datos de automatización
--    (la tabla se deja por si se retoma el tema más adelante;
--     simplemente deja de usarse y de mostrarse)
-- ------------------------------------------------------------
delete from public.automations;

-- ------------------------------------------------------------
-- 6. Recrear la restricción con las categorías nuevas
-- ------------------------------------------------------------
alter table public.projects drop constraint if exists projects_category_check;
alter table public.projects add constraint projects_category_check
  check (category in ('Web','E-commerce','Data','Arquitectura','Infraestructura','App'));

-- ------------------------------------------------------------
-- 7. Recargar la caché de la API
-- ------------------------------------------------------------
notify pgrst, 'reload schema';
