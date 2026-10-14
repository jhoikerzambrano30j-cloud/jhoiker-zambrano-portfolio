-- ============================================================================
--  JHOIKER ZAMBRANO — Portafolio & Panel de administración
--  seed.sql — Contenido inicial real (idempotente)
--
--  Ejecutar DESPUÉS de 0001_init.sql y 0002_rls.sql.
--  Todo el contenido está en español y es material real del portafolio.
--  Las sentencias usan ON CONFLICT DO NOTHING (o guardas NOT EXISTS) para
--  poder ejecutarse varias veces sin duplicar filas.
-- ============================================================================


-- ============================================================================
--  1. PROJECTS (6)
-- ============================================================================
insert into public.projects
  (slug, title, summary, description, category, status, year, client, role,
   cover_url, gallery, stack, metrics, repo_url, live_url, featured, sort_order, tags)
values
  (
    'sistema-gestion-hotelera',
    'Sistema de Gestión Hotelera',
    'PMS completo para reservas, check-in/check-out, housekeeping y facturación, con reportería en tiempo real y operación multi-sede.',
    'El hotel operaba con hojas de cálculo, un canal de reservas manual y un sistema de facturación aislado del inventario de habitaciones. Cada check-in tomaba en promedio once minutos, el estado real de las habitaciones se conocía por radio y la ocupación solo se consolidaba al cierre del día.\n\nDiseñé y desarrollé un PMS completo sobre Next.js 15 y Supabase: motor de reservas con control de disponibilidad por tipo de habitación y temporada, módulo de recepción con check-in y check-out, tablero de housekeeping en tiempo real con Supabase Realtime, facturación con numeración consecutiva y reportes operativos y financieros exportables.\n\nLa operación pasó a tener un único sistema de verdad: el check-in bajó a 3,5 minutos, la facturación dejó de cuadrarse a mano y la gerencia consulta ocupación, tarifa promedio y RevPAR en vivo desde cualquier dispositivo.',
    'Web', 'publicado', 2025, 'Grupo Hotelero del Caribe',
    'Arquitecto de software y desarrollador full-stack',
    null, '[]'::jsonb,
    $j$["Next.js 15","TypeScript","Supabase","PostgreSQL","Tailwind CSS","Zod","Supabase Realtime","Vercel"]$j$::jsonb,
    $j$[{"label":"Tiempo de check-in","value":"-68% (de 11 a 3,5 min)"},{"label":"Noches gestionadas el primer año","value":"12.480"},{"label":"Facturación cuadrada manualmente","value":"0 documentos"}]$j$::jsonb,
    null, null, true, 1,
    $j$["PMS","Multi-sede","Realtime","Housekeeping","Facturación"]$j$::jsonb
  ),
  (
    'automatizacion-n8n',
    'Hub de Automatización n8n',
    'Orquestación de flujos con n8n, Supabase y Vercel: sincronización de leads, notificaciones y reportes automáticos sin intervención manual.',
    'Este hub nació de un problema operativo repetido: los leads entraban por tres canales distintos y terminaban copiados a mano en hojas de cálculo, mientras los reportes semanales consumían medio día de trabajo.\n\nConstruí una capa de orquestación con n8n, Supabase y funciones serverless en Vercel: webhooks de entrada que normalizan y validan el payload, colas de reintento con backoff exponencial, sincronización bidireccional con el CRM, notificaciones segmentadas por Telegram y Slack y generación automática de reportes con envío programado.\n\nTodo el flujo quedó instrumentado con registros de ejecución y alertas de fallo, de modo que una ejecución fallida dispara una notificación con el contexto del error en lugar de perderse en silencio.',
    'Automatización', 'publicado', 2026, 'Operación propia y clientes de consultoría',
    'Diseño de la orquestación e implementación de flujos',
    null, '[]'::jsonb,
    $j$["n8n","Supabase","PostgreSQL","Next.js","TypeScript","Webhooks","Telegram API","Slack API","Vercel"]$j$::jsonb,
    $j$[{"label":"Flujos en producción","value":"24"},{"label":"Horas ahorradas al mes","value":"96 h"},{"label":"Tasa de éxito de ejecuciones","value":"99,2%"}]$j$::jsonb,
    null, null, true, 2,
    $j$["n8n","Orquestación","Webhooks","Alertas","Sin código repetido"]$j$::jsonb
  ),
  (
    'plataforma-neuroeducativa',
    'Plataforma Neuroeducativa',
    'Contenido adaptativo con IA para estudiantes neurodiversos: itinerarios personalizados, refuerzo espaciado y analítica pedagógica.',
    'El reto era pedagógico antes que técnico: un mismo contenido no funciona igual para un estudiante con TDAH, con dislexia o con altas capacidades. La plataforma debía adaptar ritmo, formato y refuerzo sin que el docente perdiera visibilidad del proceso.\n\nImplementé itinerarios adaptativos sobre Next.js y Supabase, con una capa de IA en Python que clasifica desempeño, ajusta la dificultad y genera variantes del mismo objetivo de aprendizaje en formato texto, audio o esquema visual. Los embeddings se almacenan en pgvector para recuperar material relacionado y el refuerzo espaciado se programa según la curva de olvido de cada estudiante.\n\nEl panel docente muestra progreso por competencia y sugiere intervenciones cuando el modelo detecta estancamiento, manteniendo siempre la decisión final en el profesor.',
    'IA', 'publicado', 2026, 'Institución educativa privada',
    'Arquitectura de la solución y desarrollo de la capa de IA',
    null, '[]'::jsonb,
    $j$["Next.js","TypeScript","OpenAI API","Supabase","PostgreSQL","pgvector","Python","Tailwind CSS","Vercel"]$j$::jsonb,
    $j$[{"label":"Sesiones adaptativas servidas","value":"38.400"},{"label":"Retención de contenido","value":"+41%"},{"label":"Perfiles neurodiversos cubiertos","value":"6"}]$j$::jsonb,
    null, null, true, 3,
    $j$["IA aplicada","Aprendizaje adaptativo","pgvector","Neurodiversidad","Analítica"]$j$::jsonb
  ),
  (
    'analisis-viabilidad-ia',
    'Análisis de Viabilidad IA — Bitty & Freddy AI',
    'Modelo de viabilidad operativa y financiera para un producto de IA: costo por token, escenarios de demanda, punto de equilibrio y sensibilidad.',
    'Bitty & Freddy AI necesitaba una respuesta honesta: con qué volumen de uso el producto dejaba de quemar caja. El equipo tenía intuiciones sobre los costos de inferencia, pero ninguna cifra defendible frente a inversionistas.\n\nModelé la estructura de costos por token, latencia y almacenamiento, cruzé escenarios de adopción con la estructura de precios y construí un modelo de viabilidad en Python con análisis de sensibilidad sobre las variables críticas. El resultado se materializó en un tablero conectado a PostgreSQL con dieciocho escenarios navegables.\n\nEl análisis identificó el punto de equilibrio, los tres supuestos que más mueven el resultado y un plan de reducción de costo operativo del 32% basado en caché de respuestas y enrutamiento por complejidad.',
    'Data', 'publicado', 2025, 'Bitty & Freddy AI',
    'Modelado financiero y análisis de datos',
    null, '[]'::jsonb,
    $j$["Python","pandas","numpy","scikit-learn","PostgreSQL","Supabase","Jupyter","Metabase"]$j$::jsonb,
    $j$[{"label":"Escenarios modelados","value":"18"},{"label":"Desviación del modelo de costos","value":"±4,5%"},{"label":"Reducción proyectada de costo operativo","value":"32%"}]$j$::jsonb,
    null, null, false, 4,
    $j$["Viabilidad","Unit economics","Análisis de sensibilidad","IA","Data"]$j$::jsonb
  ),
  (
    'ecommerce-premium',
    'E-commerce Premium',
    'Tienda de marca premium con catálogo sincronizado, checkout optimizado y pasarela de pagos local; LCP de 1,1 s en móvil.',
    'La marca vendía por redes sociales con un catálogo desactualizado y un checkout que perdía clientes en cada paso. El objetivo era una tienda que sostuviera precios premium: impecable en móvil, rápida y con pagos locales sin fricción.\n\nDesarrollé la tienda sobre Next.js con renderizado híbrido, catálogo sincronizado con Supabase, búsqueda instantánea, variantes y stock en tiempo real y checkout integrado con la pasarela de pagos local. El trabajo de rendimiento incluyó optimización de imágenes, presupuesto de JavaScript por ruta y caché por segmento.\n\nEl resultado fue un LCP de 1,1 segundos en móvil, un incremento de 2,8 puntos porcentuales en conversión y un catálogo de 1.850 SKUs que ya no depende de actualizaciones manuales.',
    'E-commerce', 'publicado', 2025, 'Marca de consumo premium',
    'Desarrollo full-stack y optimización de rendimiento',
    null, '[]'::jsonb,
    $j$["Next.js","TypeScript","Supabase","PostgreSQL","Tailwind CSS","Wompi","Resend","Vercel"]$j$::jsonb,
    $j$[{"label":"Tasa de conversión","value":"+2,8 pp"},{"label":"LCP en móvil","value":"1,1 s"},{"label":"SKUs sincronizados","value":"1.850"}]$j$::jsonb,
    null, null, true, 5,
    $j$["E-commerce","Core Web Vitals","Pagos","Catálogo","Conversión"]$j$::jsonb
  ),
  (
    'arquitectura-digital',
    'Arquitectura Digital & Design System',
    'Sistema de diseño y arquitectura de componentes reutilizables: tokens de marca, documentación viva y adopción en cinco aplicaciones.',
    'Cinco productos internos habían divergido en tipografía, espaciado, estados de formulario y accesibilidad. Cada equipo resolvía los mismos problemas por su cuenta y cada ajuste de marca significaba semanas de trabajo repetido.\n\nDiseñé el sistema de diseño y la arquitectura de componentes: tokens de color, tipografía y elevación alineados a la identidad de marca, componentes accesibles documentados en Storybook, contratos de propiedades tipados y versionado dentro de un monorepo con Turborepo.\n\nLa adopción redujo el tiempo de maquetación un 55%, eliminó las decisiones de estilo duplicadas y dejó la marca consistente en las cinco aplicaciones, con los cambios de tema propagados desde un único punto.',
    'Arquitectura', 'publicado', 2024, 'Equipo de producto interno',
    'Arquitecto de componentes y mantenedor del sistema de diseño',
    null, '[]'::jsonb,
    $j$["TypeScript","React","Next.js","Tailwind CSS","Storybook","Turborepo","pnpm","Vercel"]$j$::jsonb,
    $j$[{"label":"Componentes documentados","value":"64"},{"label":"Tiempo de maquetación","value":"-55%"},{"label":"Aplicaciones consumidoras","value":"5"}]$j$::jsonb,
    null, null, false, 6,
    $j$["Design System","Monorepo","Accesibilidad","Tokens","Escalabilidad"]$j$::jsonb
  )
on conflict (slug) do nothing;


-- ============================================================================
--  2. SERVICES (4) — starter / professional x2 / enterprise
-- ============================================================================
insert into public.services
  (slug, name, tagline, description, tier, price_from, currency, duration,
   deliverables, features, icon, featured, active, sort_order)
values
  (
    'landing-de-conversion',
    'Landing de Conversión',
    'Una sola página, una sola acción: convertir visitantes en conversaciones.',
    'Diseño y desarrollo una landing enfocada en un objetivo comercial concreto, con jerarquía visual clara, mensaje orientado al beneficio y formulario conectado directamente a tu base de datos y a tus notificaciones. Incluye analítica de eventos para saber en qué punto se pierde cada visitante y optimización de rendimiento para que cargue rápido en móvil.',
    'starter', 1500000, 'COP', '2 a 3 semanas',
    $j$["Diseño en Figma de la landing completa","Desarrollo responsive y accesible","Formulario conectado a Supabase con notificación por correo","Analítica de eventos y medición de conversión","Despliegue en Vercel con dominio y certificado SSL"]$j$::jsonb,
    $j$["Estructura de mensaje y jerarquía visual","SEO técnico y metadatos para redes","Optimización de Core Web Vitals","Hasta 3 rondas de ajustes"]$j$::jsonb,
    'layout-template', true, true, 1
  ),
  (
    'aplicacion-web-a-medida',
    'Aplicación Web a Medida',
    'Software que se adapta a tu operación, no tu operación al software.',
    'Levanto aplicaciones web completas desde el modelo de datos hasta el despliegue: autenticación, roles y permisos, paneles administrativos, integraciones con servicios externos y reportería. Trabajo por hitos verificables con entregas funcionales cada dos semanas, para que puedas ver y validar el avance sin esperar al final del proyecto.',
    'professional', 4500000, 'COP', '6 a 10 semanas',
    $j$["Arquitectura de la solución y modelo de datos documentado","Diseño de interfaz de las pantallas principales","Aplicación funcional con autenticación y roles","Panel administrativo y reportería","Documentación técnica y manual de operación","Despliegue en producción con monitoreo"]$j$::jsonb,
    $j$["Next.js, TypeScript y PostgreSQL","Row Level Security por rol","Entregas funcionales cada dos semanas","Pruebas de regresión en los flujos críticos","90 días de garantía sobre defectos"]$j$::jsonb,
    'code-2', true, true, 2
  ),
  (
    'automatizacion-de-procesos',
    'Automatización de Procesos',
    'Menos tareas repetitivas, más criterio humano.',
    'Mapeo el proceso actual, identifico los puntos donde se pierde tiempo o se cometen errores y construyo los flujos automatizados con n8n y Supabase. Cada automatización queda instrumentada con registros de ejecución, alertas de fallo y reintentos, y documentada para que tu equipo pueda operarla y ajustarla sin depender de mí.',
    'professional', 6000000, 'COP', '3 a 5 semanas',
    $j$["Mapa del proceso actual y del proceso automatizado","Flujos implementados en n8n con manejo de errores","Integraciones con tus herramientas actuales (CRM, correo, mensajería)","Panel de monitoreo de ejecuciones","Documentación y sesión de transferencia al equipo"]$j$::jsonb,
    $j$["Webhooks, colas y reintentos con backoff","Sincronización bidireccional de datos","Notificaciones segmentadas por canal","Medición de horas ahorradas por flujo"]$j$::jsonb,
    'workflow', true, true, 3
  ),
  (
    'arquitectura-y-consultoria-tecnica',
    'Arquitectura y Consultoría Técnica',
    'Decisiones de arquitectura que sostienen los próximos tres años.',
    'Acompaño a equipos y empresas que necesitan ordenar su arquitectura antes de escalar: diagnóstico técnico, diseño de la arquitectura objetivo, estándares de código y datos, sistema de diseño y hoja de ruta de implementación. Entrego documentos ejecutables, no presentaciones abstractas, y trabajo junto a tu equipo para que la adopción ocurra desde dentro.',
    'enterprise', 12000000, 'COP', '8 a 12 semanas',
    $j$["Diagnóstico técnico con hallazgos priorizados","Documento de arquitectura objetivo y registro de decisiones (ADR)","Sistema de diseño con componentes reutilizables","Hoja de ruta de implementación por trimestres","Talleres de transferencia con el equipo interno","Acompañamiento durante la implementación inicial"]$j$::jsonb,
    $j$["Auditoría de código, datos y despliegue","Estándares y convenciones para el equipo","Estrategia de migración sin detener la operación","120 días de acompañamiento posterior"]$j$::jsonb,
    'boxes', false, true, 4
  )
on conflict (slug) do nothing;


-- ============================================================================
--  3. SKILL_GROUPS (5) — idempotente por guarda NOT EXISTS (no hay clave única)
-- ============================================================================
insert into public.skill_groups (category, items, sort_order)
select v.category, v.items, v.sort_order
from (values
  (
    'Frontend', 1,
    $j$[{"name":"Next.js 15","level":95},{"name":"React 19","level":95},{"name":"TypeScript","level":93},{"name":"Tailwind CSS","level":92},{"name":"Accesibilidad y Core Web Vitals","level":85},{"name":"Framer Motion","level":82},{"name":"Storybook","level":80}]$j$::jsonb
  ),
  (
    'Backend', 2,
    $j$[{"name":"Supabase","level":93},{"name":"Node.js","level":92},{"name":"PostgreSQL","level":90},{"name":"APIs REST y webhooks","level":90},{"name":"Zod y validación de contratos","level":88},{"name":"Server Actions","level":87},{"name":"Python","level":80}]$j$::jsonb
  ),
  (
    'Bases de Datos', 3,
    $j$[{"name":"PostgreSQL","level":90},{"name":"Row Level Security","level":90},{"name":"Modelado relacional","level":88},{"name":"Índices y optimización de consultas","level":85},{"name":"pgvector y búsqueda semántica","level":82},{"name":"Respaldos y recuperación","level":80}]$j$::jsonb
  ),
  (
    'Automatización & DevOps', 4,
    $j$[{"name":"n8n","level":92},{"name":"Vercel","level":90},{"name":"Webhooks y colas de reintento","level":88},{"name":"GitHub Actions","level":85},{"name":"CI/CD","level":84},{"name":"Monitoreo y alertas","level":80},{"name":"Docker","level":78}]$j$::jsonb
  ),
  (
    'IA & Data', 5,
    $j$[{"name":"OpenAI API","level":88},{"name":"Prompt engineering y evaluación","level":86},{"name":"Python para datos","level":85},{"name":"pandas y numpy","level":84},{"name":"Embeddings y RAG","level":82},{"name":"Visualización de datos","level":80},{"name":"scikit-learn","level":76}]$j$::jsonb
  )
) as v(category, sort_order, items)
where not exists (
  select 1 from public.skill_groups sg where sg.category = v.category
);


-- ============================================================================
--  4. AUTOMATIONS (4)
-- ============================================================================
insert into public.automations
  (slug, name, description, trigger_type, tools, autonomy_level, status,
   runs_count, success_rate, saved_hours_month, workflow, featured, sort_order)
values
  (
    'captura-calificacion-leads',
    'Captura y calificación de leads',
    'Todo lead que entra por el formulario, WhatsApp o LinkedIn se normaliza, se valida contra el CRM y se califica por tipo de proyecto, presupuesto y urgencia. Los que cumplen el perfil ideal llegan al panel marcados como prioritarios con un resumen generado automáticamente.',
    'webhook',
    $j$["n8n","Supabase","OpenAI API","Telegram API"]$j$::jsonb,
    'semiautonomo', 'activa', 3480, 99.20, 24.00,
    $j$[{"step":"Recepción","detail":"El webhook del formulario, WhatsApp Business y LinkedIn captura el payload sin importar el canal de origen."},{"step":"Normalización y validación","detail":"Se limpian los campos, se valida el correo, se detectan duplicados por dominio y se descarta el spam."},{"step":"Calificación","detail":"Un modelo puntúa el lead por tipo de proyecto, presupuesto declarado y urgencia del cronograma."},{"step":"Enrutamiento","detail":"Los leads que superan el umbral entran a Supabase como prioritarios; el resto pasa a nutrición programada."},{"step":"Notificación","detail":"Se envía una alerta a Telegram con el resumen del lead y el enlace directo al panel."}]$j$::jsonb,
    true, 1
  ),
  (
    'sincronizacion-crm-supabase',
    'Sincronización CRM ↔ Supabase',
    'Mantiene el CRM y la base de datos interna en el mismo estado sin intervención manual: altas, cambios de etapa y notas viajan en ambos sentidos con resolución de conflictos por marca de tiempo y cola de reintento ante caídas del proveedor.',
    'evento de base de datos',
    $j$["n8n","Supabase","PostgreSQL","PostgREST"]$j$::jsonb,
    'autonomo', 'activa', 12640, 99.60, 32.00,
    $j$[{"step":"Detección de cambio","detail":"Un trigger de PostgreSQL publica el cambio en la cola de sincronización."},{"step":"Resolución de conflictos","detail":"Se compara la marca de tiempo updated_at y se registra la decisión en la bitácora."},{"step":"Escritura en destino","detail":"Se llama la API del CRM con control de tasa y reintentos con backoff exponencial."},{"step":"Verificación","detail":"Se relee el registro remoto y se compara un resumen de campos para confirmar la consistencia."},{"step":"Auditoría","detail":"Cada sincronización queda registrada con su resultado y su duración."}]$j$::jsonb,
    true, 2
  ),
  (
    'reportes-semanales',
    'Reportes semanales automáticos',
    'Cada lunes a las 6:00 a. m. se consolidan las métricas de proyectos, el pipeline de contratos y la actividad comercial en un informe PDF que llega por correo, con comparativo frente a la semana anterior y variaciones resaltadas.',
    'cron',
    $j$["n8n","Supabase","pdf-lib","Resend"]$j$::jsonb,
    'autonomo', 'activa', 168, 100.00, 8.00,
    $j$[{"step":"Extracción de métricas","detail":"Se consultan los agregados de la vista dashboard_stats y el detalle de las últimas cuatro semanas."},{"step":"Cálculo de variaciones","detail":"Se comparan los indicadores contra el período anterior y se marcan las desviaciones relevantes."},{"step":"Generación del PDF","detail":"Se renderiza el informe con la plantilla de marca, tablas y gráficos de tendencia."},{"step":"Envío y archivo","detail":"Se envía por correo y se guarda una copia en el almacenamiento del proyecto."}]$j$::jsonb,
    false, 3
  ),
  (
    'onboarding-clientes',
    'Onboarding de clientes',
    'Cuando un contrato pasa a firmado se crea el espacio de trabajo, se generan las carpetas del proyecto, se agenda el kickoff, se asignan las tareas iniciales y se envía al cliente el paquete de bienvenida con accesos y cronograma.',
    'evento de base de datos',
    $j$["n8n","Supabase","Google Calendar API","Resend","Notion API"]$j$::jsonb,
    'supervisado', 'activa', 42, 97.60, 6.00,
    $j$[{"step":"Disparador","detail":"El cambio de estado del contrato a firmado inicia el flujo de aprovisionamiento."},{"step":"Aprovisionamiento","detail":"Se crean las carpetas, el tablero de tareas y el repositorio del proyecto."},{"step":"Agendamiento","detail":"Se envía la invitación del kickoff contemplando la zona horaria de las partes."},{"step":"Comunicación","detail":"Se remite al cliente el paquete de bienvenida con accesos, cronograma y canales de contacto."},{"step":"Seguimiento","detail":"Un checklist programa recordatorios a las 48 horas y a los 7 días del kickoff."}]$j$::jsonb,
    false, 4
  )
on conflict (slug) do nothing;


-- ============================================================================
--  5. CONTRACT_TEMPLATES (3) — 16 cláusulas cada una
--     locked = true en las cláusulas legales no negociables
--     (propiedad intelectual, confidencialidad y ley aplicable).
-- ============================================================================
insert into public.contract_templates
  (slug, name, description, category, base_price, duration_days, warranty_days,
   deliverables, exclusions, clauses, payment_plan, active, sort_order)
values
  (
    'desarrollo-web',
    'Contrato de Desarrollo Web a Medida',
    'Plantilla base para proyectos de diseño y desarrollo de aplicaciones web a la medida, con hitos de aceptación, garantía de 90 días y cesión de derechos una vez pagado el precio.',
    'Desarrollo',
    4500000, 45, 90,
    $j$["Diseño de interfaz en Figma de las pantallas del alcance","Desarrollo frontend y backend con código fuente en repositorio propio","Modelo de base de datos en PostgreSQL con políticas de acceso","Integración con los servicios de terceros definidos en el alcance","Pruebas funcionales de los flujos críticos","Despliegue en producción, documentación técnica y manual de operación"]$j$::jsonb,
    $j$["Producción de contenido, fotografía y material audiovisual","Compra de dominios, licencias y servicios de terceros","Migración de datos históricos sin documentación previa","Mantenimiento evolutivo posterior al período de garantía","Adecuaciones derivadas de cambios normativos posteriores a la firma"]$j$::jsonb,
    $j$[
      {"id":"dw-01","order":1,"title":"Objeto del Contrato","body":"El presente Contrato de Desarrollo Web a Medida tiene por objeto la prestación de servicios profesionales de diseño, desarrollo, implementación y puesta en producción de una solución web a la medida por parte de JHOIKER ZAMBRANO, en adelante EL CONTRATISTA, a favor de {{cliente}}, en adelante EL CLIENTE, conforme al alcance detallado en la cláusula segunda. La relación contractual se rige por las disposiciones del Código Civil y del Código de Comercio colombianos y se ejecuta en la ciudad de {{ciudad}}.","locked":false,"category":"general"},
      {"id":"dw-02","order":2,"title":"Alcance del Proyecto y Entregables","body":"EL CONTRATISTA ejecutará el proyecto conforme al documento de alcance aprobado por las partes, que comprende arquitectura de información, diseño de interfaz, desarrollo frontend y backend, integración con base de datos PostgreSQL, pruebas funcionales y despliegue en infraestructura en la nube. Los entregables se relacionan en el anexo técnico e incluyen el repositorio de código fuente, los componentes reutilizables, la documentación técnica, el manual de operación y los accesos a los entornos de producción y pruebas. Toda funcionalidad no listada expresamente en el alcance se entiende fuera de este contrato.","locked":false,"category":"tecnico"},
      {"id":"dw-03","order":3,"title":"Exclusiones","body":"No forman parte del alcance: la producción de contenido editorial, fotografía o material audiovisual; la compra de dominios, licencias de terceros y servicios de infraestructura distintos de los acordados; la migración de datos históricos no documentada; la integración con sistemas legados cuya documentación no sea entregada por EL CLIENTE; el mantenimiento evolutivo posterior al período de garantía; y las adecuaciones derivadas de cambios normativos posteriores a la firma. Estos servicios podrán cotizarse por separado mediante orden de cambio.","locked":false,"category":"tecnico"},
      {"id":"dw-04","order":4,"title":"Obligaciones del Contratista","body":"EL CONTRATISTA se obliga a: (a) ejecutar los servicios con la diligencia, idoneidad técnica y calidad propias de su profesión; (b) asignar el equipo necesario y mantener comunicación periódica de avance; (c) entregar los hitos en las fechas acordadas, salvo retrasos imputables a EL CLIENTE o a causas de fuerza mayor; (d) corregir sin costo los defectos imputables a su labor durante el período de garantía; (e) guardar reserva sobre la información recibida; y (f) informar oportunamente cualquier riesgo que pueda afectar el cronograma, el presupuesto o la seguridad de la solución.","locked":false,"category":"general"},
      {"id":"dw-05","order":5,"title":"Obligaciones del Cliente","body":"EL CLIENTE se obliga a: (a) suministrar oportunamente la información, los accesos, las credenciales y los contenidos requeridos; (b) designar un interlocutor único con capacidad de decisión; (c) revisar y pronunciarse sobre cada entregable dentro de los cinco (5) días hábiles siguientes a su entrega; (d) pagar el valor pactado en los plazos de la cláusula séptima; (e) contar con las licencias de software de terceros que resulten necesarias; y (f) abstenerse de interferir en la ejecución técnica del proyecto. El silencio del cliente frente a un entregable dentro del término indicado se entenderá como aceptación tácita.","locked":false,"category":"general"},
      {"id":"dw-06","order":6,"title":"Cronograma, Hitos y Aceptación","body":"El plazo de ejecución será de {{plazo}}, contado a partir de la firma del acta de inicio y del pago del anticipo. El proyecto se ejecutará por hitos conforme al cronograma anexo, cada uno con entregables verificables. EL CLIENTE dispondrá de cinco (5) días hábiles para aceptar el hito o formular por escrito observaciones objetivas; subsanadas estas, se suscribirá el acta de aceptación. Los retrasos atribuibles a la revisión, a la entrega de insumos o a decisiones pendientes de EL CLIENTE ampliarán el plazo en igual proporción, sin que ello genere penalidad alguna para EL CONTRATISTA.","locked":false,"category":"tecnico"},
      {"id":"dw-07","order":7,"title":"Valor y Forma de Pago","body":"El valor total del contrato es de {{valor}} más los impuestos aplicables, pagadero conforme al plan de pagos por hitos aprobado por las partes. Las facturas se emiten una vez aceptado el hito correspondiente y su pago deberá realizarse dentro de los quince (15) días calendario siguientes a la radicación. Los valores no incluyen IVA, impuestos ni contribuciones distintas de las expresamente señaladas. El inicio de los trabajos está condicionado al pago del anticipo pactado.","locked":false,"category":"economico"},
      {"id":"dw-08","order":8,"title":"Retención en la Fuente e Impuestos","body":"EL CLIENTE practicará la retención en la fuente que corresponda según la naturaleza de los servicios y la normativa tributaria vigente, y entregará los certificados respectivos. EL CONTRATISTA es responsable de cumplir sus obligaciones tributarias, de seguridad social y parafiscales, y acreditará su estado cuando le sea requerido. Todo impuesto creado con posterioridad a la firma que grave el objeto contractual será asumido por la parte a quien legalmente corresponda. Los precios pactados se entienden expresados en pesos colombianos (COP) salvo pacto escrito en contrario.","locked":false,"category":"economico"},
      {"id":"dw-09","order":9,"title":"Propiedad Intelectual y Cesión de Derechos","body":"Una vez pagada la totalidad del precio, EL CONTRATISTA cede a EL CLIENTE los derechos patrimoniales de explotación sobre el código fuente, el diseño de interfaz y la documentación desarrollados específicamente para este proyecto, por el término legal y para el territorio nacional y el extranjero. Se exceptúan las herramientas, librerías de código abierto, componentes preexistentes y metodologías propias de EL CONTRATISTA, sobre las cuales conserva la titularidad y otorga una licencia de uso no exclusiva, perpetua y libre de regalías para el funcionamiento de la solución entregada. Los derechos morales son inalienables conforme al artículo 30 de la Ley 23 de 1982.","locked":true,"category":"propiedad"},
      {"id":"dw-10","order":10,"title":"Confidencialidad y Protección de Datos Personales","body":"Las partes se obligan a mantener en estricta reserva la información técnica, comercial, financiera y estratégica conocida con ocasión del contrato, obligación que subsiste por cinco (5) años después de su terminación. El tratamiento de datos personales se sujetará a la Ley 1581 de 2012 y al Decreto 1377 de 2013: EL CONTRATISTA actuará como encargado del tratamiento, los utilizará únicamente para las finalidades del contrato, implementará medidas de seguridad razonables y guardará confidencialidad. EL CLIENTE, como responsable, garantiza haber obtenido las autorizaciones de los titulares y atenderá las consultas y reclamos a que haya lugar.","locked":true,"category":"legal"},
      {"id":"dw-11","order":11,"title":"Garantía y Soporte","body":"EL CONTRATISTA otorga una garantía de noventa (90) días calendario contados desde la aceptación final, durante la cual corregirá sin costo los defectos de funcionamiento imputables al desarrollo. La garantía no cubre errores derivados de modificaciones realizadas por terceros, uso indebido, fallas de infraestructura o de servicios de terceros, ni nuevas funcionalidades. Vencido el período de garantía, el soporte se prestará mediante acuerdo de niveles de servicio cotizado por separado.","locked":false,"category":"tecnico"},
      {"id":"dw-12","order":12,"title":"Modificaciones y Control de Cambios","body":"Toda modificación del alcance, del cronograma o del valor deberá constar por escrito en una orden de cambio suscrita por ambas partes, en la que se precisen el impacto técnico, el efecto en el plazo y el valor adicional. Las solicitudes que alteren el alcance no suspenden por sí mismas la ejecución de los trabajos ya aprobados. Sin orden de cambio, ninguna variación se entiende incorporada al contrato ni genera obligación de pago.","locked":false,"category":"general"},
      {"id":"dw-13","order":13,"title":"Terminación Anticipada","body":"El contrato podrá terminarse de mutuo acuerdo en cualquier momento, o unilateralmente por la parte cumplida cuando la otra incurra en incumplimiento grave y no lo subsane dentro de los diez (10) días hábiles siguientes al requerimiento escrito. EL CLIENTE podrá terminar sin justa causa con treinta (30) días de aviso, pagando los trabajos ejecutados y aceptados hasta esa fecha, los costos comprometidos con terceros y el valor correspondiente al hito en curso. La terminación no afecta las obligaciones de confidencialidad, propiedad intelectual ni las laborales ya causadas.","locked":false,"category":"legal"},
      {"id":"dw-14","order":14,"title":"Incumplimiento y Penalidades","body":"El retardo injustificado de EL CONTRATISTA en la entrega de un hito dará lugar a una penalidad del uno por ciento (1%) del valor del hito por cada semana de retraso, sin exceder el diez por ciento (10%) del valor total del contrato. El retardo en el pago por parte de EL CLIENTE generará intereses moratorios a la tasa máxima legal permitida, además de la facultad de suspender los trabajos previo aviso de cinco (5) días. Las penalidades se harán efectivas mediante descuento en la facturación o cobro directo, sin perjuicio de la indemnización de perjuicios probados.","locked":false,"category":"legal"},
      {"id":"dw-15","order":15,"title":"Fuerza Mayor y Caso Fortuito","body":"Ninguna de las partes será responsable por el incumplimiento derivado de fuerza mayor o caso fortuito, entendidos conforme al artículo 64 del Código Civil. La parte afectada informará el hecho dentro de los cinco (5) días siguientes a su ocurrencia, lo acreditará y adoptará medidas de mitigación razonables. Si el evento persiste por más de sesenta (60) días, cualquiera de las partes podrá terminar el contrato, liquidando las prestaciones ejecutadas hasta esa fecha.","locked":false,"category":"legal"},
      {"id":"dw-16","order":16,"title":"Solución de Controversias y Ley Aplicable","body":"Las controversias derivadas de la celebración, ejecución o liquidación de este contrato se resolverán en primer lugar mediante arreglo directo entre las partes, dentro de los quince (15) días hábiles siguientes a la comunicación escrita del desacuerdo. Agotada esa etapa, las partes acudirán a la justicia ordinaria colombiana, renunciando a cualquier otro fuero. Este contrato se rige por las leyes de la República de Colombia. Las comunicaciones relacionadas con su ejecución se entenderán surtidas en las direcciones y correos electrónicos registrados por las partes. Se firma en {{ciudad}} el {{fecha}}.","locked":true,"category":"legal"}
    ]$j$::jsonb,
    $j$[{"milestone":"Anticipo a la firma","percent":40,"amount":1800000},{"milestone":"Aprobación del diseño y la maquetación","percent":30,"amount":1350000},{"milestone":"Entrega final y despliegue","percent":30,"amount":1350000}]$j$::jsonb,
    true, 1
  ),
  (
    'automatizacion-procesos',
    'Contrato de Automatización de Procesos',
    'Plantilla para proyectos de automatización con n8n y Supabase: mapeo de procesos, flujos instrumentados con alertas, garantía de 60 días y responsabilidad del cliente sobre licencias y consumos de terceros.',
    'Automatización',
    6000000, 30, 60,
    $j$["Mapa del proceso actual y del proceso automatizado","Flujos implementados en n8n con manejo de errores y reintentos","Integraciones con las herramientas del cliente (CRM, correo, mensajería)","Panel de monitoreo de ejecuciones con alertas de fallo","Documentación operativa y sesión de transferencia al equipo"]$j$::jsonb,
    $j$["Licencias y planes de las plataformas de terceros utilizadas","Consumo facturado por APIs externas (modelos de IA, mensajería, almacenamiento)","Rediseño de los procesos de negocio del cliente","Depuración o migración de datos históricos inconsistentes","Operación diaria, soporte evolutivo y capacitación masiva"]$j$::jsonb,
    $j$[
      {"id":"ap-01","order":1,"title":"Objeto del Contrato","body":"El presente Contrato de Automatización de Procesos tiene por objeto la prestación de servicios profesionales de análisis, diseño, implementación y puesta en producción de flujos automatizados por parte de JHOIKER ZAMBRANO, en adelante EL CONTRATISTA, a favor de {{cliente}}, en adelante EL CLIENTE, conforme al alcance de la cláusula segunda. La relación se rige por el Código Civil y el Código de Comercio colombianos y se ejecuta en la ciudad de {{ciudad}}.","locked":false,"category":"general"},
      {"id":"ap-02","order":2,"title":"Alcance y Entregables","body":"EL CONTRATISTA levantará el mapa del proceso actual, diseñará el proceso automatizado, implementará los flujos en las plataformas acordadas, integrará los sistemas de EL CLIENTE mediante sus interfaces de programación y dejará la solución instrumentada con registros de ejecución y alertas de fallo. Los entregables se detallan en el anexo técnico e incluyen la documentación operativa y una sesión de transferencia al equipo. Toda actividad no descrita expresamente en el alcance se entiende excluida y podrá cotizarse mediante orden de cambio.","locked":false,"category":"tecnico"},
      {"id":"ap-03","order":3,"title":"Exclusiones","body":"No forman parte del alcance: las licencias y planes de las plataformas de terceros; el consumo facturado por APIs externas; el rediseño de los procesos de negocio; la depuración o migración de datos históricos inconsistentes; la operación diaria y el soporte evolutivo posterior a la garantía; y la capacitación masiva de usuarios finales. EL CLIENTE mantiene la titularidad y el pago de sus propias cuentas y suscripciones, así como la responsabilidad sobre los cambios que realice en sus sistemas de origen.","locked":false,"category":"tecnico"},
      {"id":"ap-04","order":4,"title":"Obligaciones del Contratista","body":"EL CONTRATISTA se obliga a: (a) ejecutar los servicios con la idoneidad técnica y la diligencia profesional propias de su actividad; (b) documentar los flujos y sus puntos de fallo; (c) implementar mecanismos de reintento y alertas ante errores de ejecución; (d) informar oportunamente los riesgos identificados; (e) mantener reserva sobre la información de EL CLIENTE; y (f) corregir sin costo, durante el período de garantía, los defectos imputables a su labor.","locked":false,"category":"general"},
      {"id":"ap-05","order":5,"title":"Obligaciones del Cliente","body":"EL CLIENTE se obliga a: (a) entregar oportunamente las credenciales, los accesos y la documentación de las interfaces requeridas; (b) habilitar un ambiente de pruebas representativo de su operación; (c) designar un interlocutor técnico con capacidad de decisión; (d) validar cada hito dentro de los cinco (5) días hábiles siguientes a su entrega; (e) asumir el costo de licencias y consumos de terceros; y (f) mantener actualizados sus sistemas de origen. El silencio frente a un entregable dentro del término indicado se entenderá como aceptación tácita.","locked":false,"category":"general"},
      {"id":"ap-06","order":6,"title":"Cronograma, Hitos y Aceptación","body":"El plazo de ejecución será de {{plazo}}, contado desde la firma del acta de inicio y el pago del anticipo. El proyecto se ejecutará por hitos conforme al cronograma anexo. EL CLIENTE dispondrá de cinco (5) días hábiles para aceptar el hito o presentar por escrito observaciones objetivas; subsanadas estas, se suscribirá el acta de aceptación. Los retrasos atribuibles a la entrega de accesos, a las validaciones o a decisiones pendientes de EL CLIENTE ampliarán el plazo en igual proporción, sin penalidad alguna para EL CONTRATISTA.","locked":false,"category":"tecnico"},
      {"id":"ap-07","order":7,"title":"Valor y Forma de Pago","body":"El valor total del contrato es de {{valor}} más los impuestos aplicables, pagadero conforme al plan de pagos por hitos aprobado por las partes. Las facturas se emiten una vez aceptado el hito correspondiente y se pagan dentro de los quince (15) días calendario siguientes a su radicación. El valor no incluye licencias, suscripciones ni consumos de APIs de terceros, que serán asumidos directamente por EL CLIENTE. El inicio de los trabajos está condicionado al pago del anticipo pactado.","locked":false,"category":"economico"},
      {"id":"ap-08","order":8,"title":"Retención en la Fuente e Impuestos","body":"EL CLIENTE practicará la retención en la fuente que corresponda según la naturaleza de los servicios y la normativa tributaria vigente, y expedirá los certificados respectivos. EL CONTRATISTA es responsable del cumplimiento de sus obligaciones tributarias, de seguridad social y parafiscales, y acreditará su estado cuando le sea requerido. Los precios se entienden expresados en pesos colombianos (COP) y cualquier impuesto creado con posterioridad a la firma será asumido por la parte a quien legalmente corresponda.","locked":false,"category":"economico"},
      {"id":"ap-09","order":9,"title":"Propiedad Intelectual y Cesión de Derechos","body":"Una vez pagada la totalidad del precio, EL CONTRATISTA cede a EL CLIENTE los derechos patrimoniales de explotación sobre los flujos, plantillas de automatización, scripts y documentación desarrollados específicamente para este proyecto. Se exceptúan las herramientas, componentes, librerías de código abierto y metodologías preexistentes de EL CONTRATISTA, sobre las cuales conserva la titularidad y otorga una licencia de uso no exclusiva, perpetua y libre de regalías para la operación de la solución entregada. Las credenciales y cuentas de terceros de EL CLIENTE son y seguirán siendo de su exclusiva propiedad.","locked":true,"category":"propiedad"},
      {"id":"ap-10","order":10,"title":"Confidencialidad y Protección de Datos Personales","body":"Las partes mantendrán en estricta reserva la información técnica, comercial y financiera conocida con ocasión del contrato, obligación que subsiste por cinco (5) años después de su terminación. El tratamiento de datos personales se sujetará a la Ley 1581 de 2012 y al Decreto 1377 de 2013: EL CONTRATISTA actúa como encargado del tratamiento, los usará únicamente para las finalidades del contrato, aplicará medidas de seguridad razonables y guardará confidencialidad. EL CLIENTE, como responsable, garantiza contar con las autorizaciones de los titulares y atenderá las consultas y reclamos correspondientes.","locked":true,"category":"legal"},
      {"id":"ap-11","order":11,"title":"Garantía y Soporte","body":"EL CONTRATISTA otorga una garantía de sesenta (60) días calendario contados desde la aceptación final, durante la cual corregirá sin costo los defectos imputables al diseño o a la implementación de los flujos. La garantía no cubre fallas originadas en cambios de las APIs de terceros, modificaciones realizadas por EL CLIENTE u otros proveedores, suspensión o cambio de plan de las plataformas utilizadas, ni nuevas automatizaciones. Vencido el término, el soporte se prestará mediante acuerdo de niveles de servicio cotizado por separado.","locked":false,"category":"tecnico"},
      {"id":"ap-12","order":12,"title":"Modificaciones y Control de Cambios","body":"Toda modificación del alcance, del cronograma o del valor deberá constar por escrito en una orden de cambio suscrita por ambas partes, indicando el impacto técnico, el efecto en el plazo y el valor adicional. Ninguna solicitud verbal se entiende incorporada al contrato. Si una modificación afecta flujos ya aceptados, EL CONTRATISTA podrá suspender los trabajos afectados hasta la aprobación escrita de la orden de cambio, sin que ello constituya incumplimiento.","locked":false,"category":"general"},
      {"id":"ap-13","order":13,"title":"Terminación Anticipada","body":"El contrato podrá terminarse de mutuo acuerdo en cualquier momento, o unilateralmente por la parte cumplida cuando la otra incurra en incumplimiento grave y no lo subsane dentro de los diez (10) días hábiles siguientes al requerimiento escrito. EL CLIENTE podrá terminar sin justa causa con treinta (30) días de aviso previo, pagando los trabajos ejecutados y aceptados, los costos ya comprometidos con terceros y el hito en curso. La terminación no afecta las obligaciones de confidencialidad y propiedad intelectual pactadas.","locked":false,"category":"legal"},
      {"id":"ap-14","order":14,"title":"Incumplimiento y Penalidades","body":"El retardo injustificado de EL CONTRATISTA en la entrega de un hito dará lugar a una penalidad del uno por ciento (1%) del valor del hito por cada semana de retraso, sin exceder el diez por ciento (10%) del valor total del contrato. El retardo en el pago faculta a EL CONTRATISTA para cobrar intereses moratorios a la tasa máxima legal permitida y para suspender los trabajos previo aviso de cinco (5) días. Las penalidades se harán efectivas mediante descuento en la facturación, sin perjuicio de la indemnización de perjuicios probados.","locked":false,"category":"legal"},
      {"id":"ap-15","order":15,"title":"Fuerza Mayor y Caso Fortuito","body":"Ninguna de las partes será responsable por los incumplimientos derivados de fuerza mayor o caso fortuito, conforme al artículo 64 del Código Civil. La parte afectada informará el hecho dentro de los cinco (5) días siguientes a su ocurrencia, lo acreditará y adoptará medidas razonables de mitigación. Si el evento persiste por más de sesenta (60) días, cualquiera de las partes podrá terminar el contrato, liquidando las prestaciones ejecutadas hasta esa fecha.","locked":false,"category":"legal"},
      {"id":"ap-16","order":16,"title":"Solución de Controversias y Ley Aplicable","body":"Las controversias derivadas de la celebración, ejecución o liquidación de este contrato se resolverán en primer lugar mediante arreglo directo entre las partes, dentro de los quince (15) días hábiles siguientes a la comunicación escrita del desacuerdo. Agotada esa etapa, las partes acudirán a la justicia ordinaria colombiana, renunciando a cualquier otro fuero. Este contrato se rige por las leyes de la República de Colombia. Se firma en {{ciudad}} el {{fecha}}.","locked":true,"category":"legal"}
    ]$j$::jsonb,
    $j$[{"milestone":"Anticipo a la firma","percent":50,"amount":3000000},{"milestone":"Aprobación de los flujos en ambiente de pruebas","percent":30,"amount":1800000},{"milestone":"Puesta en producción y documentación","percent":20,"amount":1200000}]$j$::jsonb,
    true, 2
  ),
  (
    'consultoria-arquitectura',
    'Contrato de Consultoría y Arquitectura Digital',
    'Plantilla de servicios de consultoría: diagnóstico, arquitectura objetivo, estándares y hoja de ruta, con 120 días de acompañamiento y exclusión expresa de la implementación completa.',
    'Consultoría',
    12000000, 90, 120,
    $j$["Diagnóstico técnico con hallazgos priorizados por impacto","Documento de arquitectura objetivo y registro de decisiones (ADR)","Sistema de diseño con tokens y componentes reutilizables","Hoja de ruta de implementación por trimestres","Talleres de transferencia con el equipo interno","Acompañamiento técnico durante la implementación inicial"]$j$::jsonb,
    $j$["Implementación completa de la arquitectura propuesta (salvo pruebas de concepto acordadas)","Licencias de herramientas de diseño, monitoreo o infraestructura","Contratación de personal o gestión de proveedores","Auditorías legales, contables o de seguridad ofensiva","Operación, soporte y mantenimiento posteriores al acompañamiento"]$j$::jsonb,
    $j$[
      {"id":"ca-01","order":1,"title":"Objeto del Contrato","body":"El presente Contrato de Consultoría y Arquitectura Digital tiene por objeto la prestación de servicios profesionales de diagnóstico, diseño de arquitectura, definición de estándares y acompañamiento técnico por parte de JHOIKER ZAMBRANO, en adelante EL CONTRATISTA, a favor de {{cliente}}, en adelante EL CLIENTE, conforme al alcance de la cláusula segunda. Es un contrato de prestación de servicios con autonomía técnica y administrativa de EL CONTRATISTA, regido por el Código Civil y el Código de Comercio colombianos, ejecutado en la ciudad de {{ciudad}}.","locked":false,"category":"general"},
      {"id":"ca-02","order":2,"title":"Alcance y Entregables","body":"EL CONTRATISTA realizará un diagnóstico técnico del estado actual de la plataforma, el equipo y los procesos; propondrá la arquitectura objetivo con sus decisiones registradas; definirá estándares de código, datos y despliegue; construirá el sistema de diseño y sus componentes reutilizables; y entregará una hoja de ruta de implementación priorizada. El trabajo incluye talleres con el equipo de EL CLIENTE y acompañamiento durante la fase inicial de implementación. El detalle de entregables consta en el anexo técnico y toda actividad no descrita se entiende excluida.","locked":false,"category":"tecnico"},
      {"id":"ca-03","order":3,"title":"Exclusiones","body":"No forman parte del alcance: la implementación completa de la arquitectura propuesta, salvo las pruebas de concepto expresamente acordadas; la compra de licencias, herramientas o infraestructura; la contratación, selección o gestión de personal; las auditorías legales, contables o de seguridad ofensiva; la operación y el soporte posteriores al acompañamiento; y la corrección de la deuda técnica acumulada que no haya sido priorizada en la hoja de ruta.","locked":false,"category":"tecnico"},
      {"id":"ca-04","order":4,"title":"Obligaciones del Contratista","body":"EL CONTRATISTA se obliga a: (a) prestar los servicios con autonomía técnica y la idoneidad propia de su profesión; (b) sustentar técnicamente sus recomendaciones y explicitar los supuestos y riesgos asociados; (c) entregar los documentos y artefactos comprometidos en los plazos acordados; (d) transferir conocimiento al equipo de EL CLIENTE; (e) mantener reserva sobre la información conocida; y (f) advertir por escrito cualquier decisión que, a su juicio, comprometa la sostenibilidad, la seguridad o el costo de la plataforma.","locked":false,"category":"general"},
      {"id":"ca-05","order":5,"title":"Obligaciones del Cliente","body":"EL CLIENTE se obliga a: (a) facilitar el acceso a repositorios, documentación, ambientes e infraestructura; (b) permitir las entrevistas con las áreas involucradas; (c) designar un interlocutor con capacidad de decisión; (d) revisar y aprobar cada entregable dentro de los cinco (5) días hábiles siguientes a su entrega; (e) pagar el valor pactado en los plazos de la cláusula séptima; y (f) implementar, bajo su propia responsabilidad operativa, las decisiones que apruebe. El silencio frente a un entregable dentro del término indicado se entenderá como aceptación tácita.","locked":false,"category":"general"},
      {"id":"ca-06","order":6,"title":"Cronograma, Hitos y Aceptación","body":"El plazo de ejecución será de {{plazo}}, contado desde la firma del acta de inicio y el pago del anticipo. Los servicios se prestarán por fases conforme al cronograma anexo, cada una con entregables verificables. EL CLIENTE dispondrá de cinco (5) días hábiles para aceptar la fase o formular por escrito observaciones objetivas. Las interrupciones atribuibles a la disponibilidad del equipo de EL CLIENTE, a la entrega de accesos o a decisiones pendientes ampliarán el plazo en igual proporción, sin penalidad alguna para EL CONTRATISTA.","locked":false,"category":"tecnico"},
      {"id":"ca-07","order":7,"title":"Valor y Forma de Pago","body":"El valor total del contrato es de {{valor}} más los impuestos aplicables, pagadero conforme al plan de pagos por hitos aprobado por las partes. Las facturas se emiten una vez aceptado el hito correspondiente y se pagan dentro de los quince (15) días calendario siguientes a su radicación. El valor corresponde exclusivamente a servicios profesionales de consultoría y no incluye licencias, infraestructura ni consumos de terceros. El inicio de los trabajos está condicionado al pago del anticipo pactado.","locked":false,"category":"economico"},
      {"id":"ca-08","order":8,"title":"Retención en la Fuente e Impuestos","body":"EL CLIENTE practicará la retención en la fuente que corresponda según la naturaleza de los servicios y la normativa tributaria vigente, y entregará los certificados respectivos. EL CONTRATISTA responderá por sus obligaciones tributarias, de seguridad social y parafiscales, y acreditará su estado cuando sea requerido. Los honorarios se entienden expresados en pesos colombianos (COP). Todo tributo creado con posterioridad a la firma que grave el objeto contractual será asumido por la parte a quien legalmente corresponda.","locked":false,"category":"economico"},
      {"id":"ca-09","order":9,"title":"Propiedad Intelectual y Cesión de Derechos","body":"Una vez pagada la totalidad del precio, EL CONTRATISTA cede a EL CLIENTE los derechos patrimoniales de explotación sobre los documentos, diagramas, hojas de ruta y componentes del sistema de diseño desarrollados específicamente para este proyecto. Se exceptúan las metodologías, marcos de trabajo, plantillas, librerías y componentes preexistentes o de uso genérico de EL CONTRATISTA, sobre los cuales conserva la titularidad y otorga una licencia de uso no exclusiva, perpetua y libre de regalías. El código fuente preexistente de EL CLIENTE y sus credenciales permanecen en su exclusiva titularidad.","locked":true,"category":"propiedad"},
      {"id":"ca-10","order":10,"title":"Confidencialidad y Protección de Datos Personales","body":"Las partes mantendrán en estricta reserva la información técnica, comercial, financiera y estratégica conocida con ocasión del contrato, obligación que subsiste por cinco (5) años después de su terminación. El tratamiento de datos personales se sujetará a la Ley 1581 de 2012 y al Decreto 1377 de 2013: EL CONTRATISTA actuará como encargado del tratamiento, los usará solo para las finalidades del contrato, aplicará medidas de seguridad razonables y guardará confidencialidad. EL CLIENTE, como responsable, garantiza contar con las autorizaciones de los titulares y atenderá las consultas y reclamos.","locked":true,"category":"legal"},
      {"id":"ca-11","order":11,"title":"Garantía y Acompañamiento","body":"EL CONTRATISTA otorga un acompañamiento de ciento veinte (120) días calendario contados desde la aceptación final, durante el cual atenderá consultas sobre la implementación de la arquitectura propuesta y ajustará los documentos entregados cuando aparezcan hallazgos nuevos. Este acompañamiento no incluye desarrollo de software, operación de la plataforma ni corrección de defectos preexistentes ajenos al alcance. Vencido el término, podrá prorrogarse mediante acuerdo escrito entre las partes.","locked":false,"category":"tecnico"},
      {"id":"ca-12","order":12,"title":"Modificaciones y Control de Cambios","body":"Toda modificación del alcance, del cronograma o del valor deberá constar por escrito en una orden de cambio suscrita por ambas partes, indicando el impacto técnico, el efecto en el plazo y el valor adicional. Ninguna solicitud verbal se entiende incorporada al contrato. Las asesorías sobre frentes distintos de los contratados se cotizarán por separado y no suspenderán la ejecución de los frentes ya aprobados.","locked":false,"category":"general"},
      {"id":"ca-13","order":13,"title":"Terminación Anticipada","body":"El contrato podrá terminarse de mutuo acuerdo, o unilateralmente por la parte cumplida cuando la otra incurra en incumplimiento grave y no lo subsane dentro de los diez (10) días hábiles siguientes al requerimiento escrito. EL CLIENTE podrá terminar sin justa causa con treinta (30) días de aviso previo, pagando los servicios prestados y aceptados hasta esa fecha y el valor proporcional del hito en curso. La terminación no afecta las obligaciones de confidencialidad y propiedad intelectual pactadas.","locked":false,"category":"legal"},
      {"id":"ca-14","order":14,"title":"Incumplimiento y Penalidades","body":"El retardo injustificado de EL CONTRATISTA en la entrega de una fase dará lugar a una penalidad del uno por ciento (1%) del valor de la fase por cada semana de retraso, sin exceder el diez por ciento (10%) del valor total del contrato. El retardo en el pago faculta a EL CONTRATISTA para cobrar intereses moratorios a la tasa máxima legal permitida y para suspender los servicios previo aviso de cinco (5) días. Las penalidades se descontarán de la facturación, sin perjuicio de la indemnización de perjuicios probados.","locked":false,"category":"legal"},
      {"id":"ca-15","order":15,"title":"Fuerza Mayor y Caso Fortuito","body":"Ninguna de las partes será responsable por los incumplimientos derivados de fuerza mayor o caso fortuito, conforme al artículo 64 del Código Civil. La parte afectada informará el hecho dentro de los cinco (5) días siguientes a su ocurrencia, lo acreditará y adoptará medidas razonables de mitigación. Si el evento persiste por más de sesenta (60) días, cualquiera de las partes podrá terminar el contrato, liquidando las prestaciones ejecutadas hasta esa fecha.","locked":false,"category":"legal"},
      {"id":"ca-16","order":16,"title":"Solución de Controversias y Ley Aplicable","body":"Las controversias derivadas de la celebración, ejecución o liquidación de este contrato se resolverán en primer lugar mediante arreglo directo entre las partes, dentro de los quince (15) días hábiles siguientes a la comunicación escrita del desacuerdo. Agotada esa etapa, las partes acudirán a la justicia ordinaria colombiana, renunciando a cualquier otro fuero. Este contrato se rige por las leyes de la República de Colombia. Se firma en {{ciudad}} el {{fecha}}.","locked":true,"category":"legal"}
    ]$j$::jsonb,
    $j$[{"milestone":"Anticipo a la firma","percent":30,"amount":3600000},{"milestone":"Entrega del diagnóstico y la arquitectura objetivo","percent":30,"amount":3600000},{"milestone":"Entrega del sistema de diseño y la hoja de ruta","percent":25,"amount":3000000},{"milestone":"Cierre del acompañamiento","percent":15,"amount":1800000}]$j$::jsonb,
    true, 3
  )
on conflict (slug) do nothing;


-- ============================================================================
--  6. LEADS (2) — idempotente por guarda NOT EXISTS sobre el correo
-- ============================================================================
insert into public.leads
  (name, email, company, phone, project_type, budget_range, timeline, message, status, source, notes)
select v.name, v.email, v.company, v.phone, v.project_type, v.budget_range, v.timeline,
       v.message, v.status, v.source, v.notes
from (values
  (
    'María Fernanda Gómez', 'mf.gomez@cafeandino.co', 'Café Andino S.A.S.', '+57 310 555 0198',
    'Aplicación Web a Medida', '5.000.000 - 10.000.000 COP', '1 a 2 meses',
    'Tenemos tres puntos de venta y hoy los pedidos mayoristas se toman por WhatsApp y se consolidan en Excel. Necesitamos una plataforma donde el cliente vea el catálogo con precios por volumen, haga el pedido y nosotros veamos el estado de producción. También necesitamos reportes de ventas por punto y por producto.',
    'nuevo', 'formulario-web', null
  ),
  (
    'Andrés Felipe Ramírez', 'andres.ramirez@logiscol.com', 'Logiscol', '+57 315 442 7781',
    'Automatización de Procesos', '5.000.000 - 10.000.000 COP', 'Menos de 1 mes',
    'Recibimos alrededor de 400 solicitudes de cotización al mes por correo y facturación electrónica. Dos personas las transcriben al CRM y a la hoja de costos, y siempre se nos cuelan errores. Queremos automatizar la lectura, el registro y el envío de la cotización, con alerta cuando algo falle para revisarlo a mano.',
    'contactado', 'whatsapp',
    'Se agendó llamada de diagnóstico para el 21 de octubre a las 10:00 a. m. Se envió el cuestionario previo de procesos.'
  )
) as v(name, email, company, phone, project_type, budget_range, timeline, message, status, source, notes)
where not exists (
  select 1 from public.leads l where l.email = v.email
);


-- ============================================================================
--  7. CONTRACTS (1) — ejemplo ya creado, en negociación
--     Las cláusulas se copian de la plantilla (snapshot), tal como lo hace la
--     aplicación al generar un contrato nuevo.
--     created_at se fija en 2026 para que coincida con el consecutivo del código
--     y con next_contract_seq().
-- ============================================================================
insert into public.contracts
  (code, title, status, template_slug, client_name, client_company, client_email,
   client_doc_id, client_address, scope, deliverables, exclusions, total, currency,
   payment_plan, start_date, duration_days, warranty_days, clauses,
   negotiation_log, versions, current_version, notes, created_at, updated_at)
select
  'JZ-CT-2026-0001',
  'Desarrollo de plataforma de pedidos mayoristas — Café Andino',
  'en_negociacion',
  t.slug,
  'María Fernanda Gómez',
  'Café Andino S.A.S.',
  'mf.gomez@cafeandino.co',
  'NIT 901.455.872-3',
  'Calle 45 # 12-30, Bogotá D.C.',
  'Diseño y desarrollo de una plataforma web a la medida para la gestión de pedidos mayoristas: catálogo con precios por volumen, carrito de pedido, panel administrativo con estados de producción y reportes de ventas por punto y por producto, sobre Next.js, TypeScript y Supabase.',
  t.deliverables,
  t.exclusions,
  5850000,
  'COP',
  $j$[{"milestone":"Anticipo a la firma","percent":40,"amount":2340000},{"milestone":"Aprobación del diseño y el catálogo","percent":30,"amount":1755000},{"milestone":"Entrega final y despliegue","percent":30,"amount":1755000}]$j$::jsonb,
  '2026-02-23',
  50,
  90,
  t.clauses,
  $j$[{"at":"2026-02-18T09:12:00-05:00","actor":"Jhoiker Zambrano","action":"contrato_creado","detail":"Se generó el contrato a partir de la plantilla de desarrollo web con el alcance acordado en la reunión del 12 de febrero."},{"at":"2026-02-20T16:40:00-05:00","actor":"María Fernanda Gómez","action":"ajuste_alcance","detail":"El cliente solicitó incluir la integración con su proveedor de facturación electrónica. Se cotizó como orden de cambio por COP 1.350.000 y se amplió el plazo en 5 días."},{"at":"2026-02-23T11:05:00-05:00","actor":"Jhoiker Zambrano","action":"version_2","detail":"Se emitió la versión 2 con el alcance ampliado, el ajuste del plan de pagos y las cláusulas marcadas como no negociables sin cambios."}]$j$::jsonb,
  $j$[{"version":1,"created_at":"2026-02-18T09:12:00-05:00","author":"Jhoiker Zambrano","note":"Versión inicial generada desde la plantilla de desarrollo web.","total":4500000,"clauses_count":16},{"version":2,"created_at":"2026-02-23T11:05:00-05:00","author":"Jhoiker Zambrano","note":"Incluye la integración con facturación electrónica y el plan de pagos ajustado a 40/30/30.","total":5850000,"clauses_count":16}]$j$::jsonb,
  2,
  'Pendiente la firma del cliente y el pago del anticipo del 40% para dar inicio el 23 de febrero de 2026.',
  '2026-02-18T09:12:00-05:00',
  '2026-02-23T11:05:00-05:00'
from public.contract_templates t
where t.slug = 'desarrollo-web'
on conflict (code) do nothing;


-- ============================================================================
--  8. SITE_SETTINGS — configuración del sitio
-- ============================================================================
insert into public.site_settings (key, value)
values
  ('contact_email',    $j$"contacto@jhoikerzambrano.com"$j$::jsonb),
  ('whatsapp',         $j$"+57 320 451 8890"$j$::jsonb),
  ('availability',     $j$"Disponible para nuevos proyectos a partir de noviembre de 2026"$j$::jsonb),
  ('hero_headline',    $j$"Ingeniería de Software & Arquitectura Digital"$j$::jsonb),
  ('hero_subheadline', $j$"Diseño y construyo sistemas web, automatizaciones e integraciones de IA que reducen el trabajo manual y escalan con tu operación."$j$::jsonb),
  ('social_links',     $j${"github":"https://github.com/jhoikerzambrano","linkedin":"https://www.linkedin.com/in/jhoikerzambrano","x":"https://x.com/jhoikerdev"}$j$::jsonb)
on conflict (key) do nothing;


-- ============================================================================
--  9. PERFIL ADMINISTRADOR
--     Si el usuario ya existe en auth.users (creado con scripts/seed-admin.mjs
--     o desde el dashboard), se promueve a admin automáticamente.
--     Si auth.users está vacío, esta sentencia no inserta nada: el perfil se
--     crea al ejecutar `node scripts/seed-admin.mjs`.
-- ============================================================================
insert into public.profiles (id, email, full_name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', 'Jhoiker Zambrano'),
  'admin'
from auth.users u
where u.email is not null
on conflict (id) do update set role = 'admin';
