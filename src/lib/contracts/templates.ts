import type { ContractClause, ContractTemplate } from "@/lib/types";

/**
 * Librería de plantillas de contrato — Jhoiker Zambrano.
 *
 * Contenido jurídico redactado para el ordenamiento colombiano (Código Civil,
 * Código de Comercio, Ley 23 de 1982, Ley 527 de 1999, Ley 1581 de 2012,
 * Ley 1480 de 2011 y Estatuto Tributario).
 *
 * Los `body` son texto plano con marcadores reemplazables del tipo `{{clave}}`
 * que resuelve `renderTemplate()` en `./engine`. Las cláusulas legalmente
 * sensibles van con `locked: true` y no deben editarse libremente; las
 * negociables van con `locked: false`.
 *
 * Módulo puro y determinista: no usa `Date` ni dependencias de red, React o base
 * de datos. La fecha de creación es una constante ISO fija.
 */

/** Fecha fija de creación de las plantillas (determinista). */
const TEMPLATE_CREATED_AT = "2026-10-14T00:00:00.000Z";

/** Categorías de cláusula disponibles para la edición asistida. */
export const CLAUSE_CATEGORIES: {
  value: ContractClause["category"];
  label: string;
  description: string;
}[] = [
  {
    value: "general",
    label: "General",
    description:
      "Partes, objeto, obligaciones generales, control de cambios y estructura del contrato.",
  },
  {
    value: "tecnico",
    label: "Técnico",
    description:
      "Alcance, entregables, criterios de aceptación, cronograma, garantía y soporte.",
  },
  {
    value: "legal",
    label: "Legal",
    description:
      "Confidencialidad, habeas data, terminación, responsabilidad, fuerza mayor y ley aplicable.",
  },
  {
    value: "economico",
    label: "Económico",
    description:
      "Valor, forma de pago por hitos, retención en la fuente, IVA y cláusula penal.",
  },
  {
    value: "propiedad",
    label: "Propiedad intelectual",
    description:
      "Titularidad, cesión de derechos patrimoniales, licencias de terceros y activos digitales.",
  },
];

/** Plan de pagos del desarrollo web a medida (4 hitos, suma 100%). */
const PLAN_DESARROLLO_WEB: { milestone: string; percent: number }[] = [
  { milestone: "Anticipo — inicio del proyecto", percent: 40 },
  { milestone: "Aprobación de diseño UI/UX", percent: 20 },
  { milestone: "Entrega de build de staging", percent: 20 },
  { milestone: "Entrega final y despliegue en producción", percent: 20 },
];

/** Plan de pagos de automatización de procesos (3 hitos, suma 100%). */
const PLAN_AUTOMATIZACION: { milestone: string; percent: number }[] = [
  { milestone: "Anticipo — inicio del proyecto", percent: 40 },
  { milestone: "Entrega del diseño de flujos aprobado", percent: 30 },
  { milestone: "Puesta en producción y capacitación", percent: 30 },
];

/** Plan de pagos de consultoría y arquitectura (3 hitos, suma 100%). */
const PLAN_CONSULTORIA: { milestone: string; percent: number }[] = [
  { milestone: "Anticipo — inicio de la consultoría", percent: 30 },
  { milestone: "Entrega del diagnóstico y hallazgos", percent: 30 },
  { milestone: "Entrega de arquitectura objetivo y hoja de ruta", percent: 40 },
];

/** Plan de pagos del mantenimiento mensual (3 hitos dentro de cada ciclo). */
const PLAN_MANTENIMIENTO: { milestone: string; percent: number }[] = [
  { milestone: "Anticipo del ciclo mensual — inicio del mes", percent: 40 },
  { milestone: "Informe de avance quincenal", percent: 30 },
  { milestone: "Cierre de ciclo y entrega de informe mensual", percent: 30 },
];

/**
 * Porcentajes de pago por plantilla, sin monto, para recalcular el plan de pagos
 * de un contrato concreto a partir de su `total`.
 */
export const DEFAULT_PAYMENT_PLANS: Record<
  string,
  { milestone: string; percent: number }[]
> = {
  "desarrollo-web": PLAN_DESARROLLO_WEB,
  "automatizacion-procesos": PLAN_AUTOMATIZACION,
  "consultoria-arquitectura": PLAN_CONSULTORIA,
  "mantenimiento-evolutivo": PLAN_MANTENIMIENTO,
};

/** Constructor de cláusulas con valores por defecto explícitos. */
function clause(
  order: number,
  id: string,
  title: string,
  body: string,
  category: ContractClause["category"],
  locked: boolean,
): ContractClause {
  return { id, order, title, body, locked, category };
}

/** Reparte un precio base entre los hitos ajustando el residuo en el último. */
function planWithAmounts(
  basePrice: number,
  plan: { milestone: string; percent: number }[],
): { milestone: string; percent: number; amount: number }[] {
  const amounts = plan.map((item) => Math.round((basePrice * item.percent) / 100));
  const assigned = amounts.reduce((sum, amount) => sum + amount, 0);
  const last = amounts.length - 1;
  if (last >= 0) {
    amounts[last] = amounts[last] + (basePrice - assigned);
  }
  return plan.map((item, index) => ({
    milestone: item.milestone,
    percent: item.percent,
    amount: amounts[index],
  }));
}

/* ------------------------------------------------------------------ *
 * Cláusulas legales compartidas (sensibles: `locked: true`)
 * ------------------------------------------------------------------ */

const SHARED_IMPUESTOS =
  "El valor pactado de {{valor}} se entiende expresado en pesos colombianos (COP) y no incluye el Impuesto sobre las Ventas (IVA). {{contratista}} informará oportunamente su condición frente al IVA y, cuando el servicio se encuentre gravado, expedirá la factura electrónica de venta con el IVA a la tarifa legal vigente.\n\n{{cliente}} practicará la retención en la fuente por servicios a que haya lugar conforme a los artículos 383 y siguientes del Estatuto Tributario y a los conceptos vigentes de la Dirección de Impuestos y Aduanas Nacionales (DIAN), así como las retenciones de industria y comercio y estampilla cuando resulten aplicables según el municipio o departamento.\n\n{{contratista}} se encuentra inscrito en el Registro Único Tributario (RUT) y se obliga a entregar copia del mismo, de su documento de identidad y del certificado de existencia y representación legal cuando actúe por medio de sociedad, así como a expedir factura electrónica válida con el lleno de los requisitos de los artículos 615 y 617 del Estatuto Tributario.\n\nCada parte asumirá los impuestos, tasas y contribuciones que la ley ponga a su cargo con ocasión de la celebración, ejecución y pago de este contrato. Las sanciones e intereses moratorios de origen tributario causados por información o gestión atribuible a una parte serán de su exclusiva cuenta.\n\nLa facturación electrónica se remitirá a {{email_cliente}} y el pago se realizará contra la aceptación expresa de la factura en el sistema de recepción dispuesto por la DIAN.";

const SHARED_PI =
  "Derechos patrimoniales sobre los entregables. {{cliente}} será titular de los derechos patrimoniales de autor sobre los entregables desarrollados de manera específica y remunerada para este contrato, una vez haya pagado la totalidad del valor pactado. La cesión se entiende celebrada de forma total, permanente y sin limitación territorial, en los términos de los artículos 183 a 188 de la Ley 23 de 1982 y de la Decisión Andina 351 de 1993. {{contratista}} conserva los derechos morales, que son inalienables, irrenunciables e imprescriptibles conforme al artículo 30 de la Ley 23 de 1982.\n\nObras preexistentes y componentes reutilizables. Se excluyen de la cesión los frameworks, librerías, plantillas base, utilidades, componentes y conocimientos técnicos que {{contratista}} hubiere creado con anterioridad o con independencia del proyecto. Sobre ellos se otorga a {{cliente}} una licencia de uso perpetua, no exclusiva, no transferible y limitada al funcionamiento y explotación de los entregables.\n\nObra por encargo y derechos de terceros. Cuando en el proyecto participen terceros contratados por {{contratista}}, este garantiza que contará con las autorizaciones y cesiones necesarias para transmitir a {{cliente}} los derechos aquí pactados y responderá por cualquier reclamación de titularidad que se presentare.\n\nPortafolio y referencias. {{contratista}} podrá mencionar el proyecto y exhibir capturas no confidenciales en su portafolio profesional, salvo que {{cliente}} manifieste por escrito su oposición dentro de los treinta (30) días siguientes a la firma. En ningún caso se divulgará código fuente, datos personales ni información sujeta a reserva.\n\nUso de signos distintivos. Ninguna de las partes podrá usar las marcas, nombres comerciales o signos distintivos de la otra con fines publicitarios distintos de los aquí autorizados, sin consentimiento previo y escrito.";

const SHARED_OPEN_SOURCE =
  "Componentes de terceros. Los entregables podrán incorporar librerías, frameworks, componentes y servicios de terceros, incluidos proyectos de código abierto. {{contratista}} relacionará en la documentación técnica las dependencias relevantes con su versión y su licencia, y procurará utilizar componentes con licencias permisivas como MIT, Apache 2.0 o BSD.\n\nCumplimiento de licencias. {{contratista}} respetará las condiciones de atribución, los avisos de copyright y los demás requisitos de cada licencia. Cuando un componente exija licenciamiento comercial, suscripción o pago de regalías, ello se informará previamente a {{cliente}} y su costo no estará incluido en {{valor}}, salvo pacto escrito en contrario.\n\nComponentes copyleft. No se incorporarán componentes bajo licencias copyleft fuerte, como GPL o AGPL, dentro del código propietario de {{cliente}} sin su autorización previa y escrita, otorgada con conocimiento de sus implicaciones.\n\nGarantía de titularidad. {{contratista}} declara que el uso de los componentes de terceros no vulnera derechos de autor, patentes, marcas ni secretos empresariales, y se obliga a sustituir cualquier componente cuya licencia resulte incompatible con el uso previsto en este contrato.\n\nServicios y cuentas de terceros. Las cuentas, dominios, licencias de software propietario, planes de infraestructura y consumos de nube son de titularidad y costo de {{cliente}}, salvo que expresamente se pacte lo contrario en el alcance.";

const SHARED_CONFIDENCIALIDAD =
  "Información confidencial. Cada parte se obliga a mantener en reserva la información técnica, comercial, financiera, operativa y de negocio de la otra a la que tuviere acceso con ocasión de este contrato, y a utilizarla exclusivamente para su ejecución. Esta obligación subsiste durante la vigencia del contrato y por cinco (5) años contados a partir de su terminación.\n\nExcepciones. No es confidencial la información que sea de dominio público, la que la parte ya poseyera legítimamente antes de su entrega, la que sea recibida de un tercero sin deber de reserva o la que deba revelarse por orden de autoridad competente, caso en el cual se informará previamente a la otra parte cuando ello sea legalmente posible.\n\nDatos personales y habeas data. Las partes tratarán los datos personales conforme a la Ley 1581 de 2012, el Decreto 1074 de 2015 y las instrucciones de la Superintendencia de Industria y Comercio. {{contratista}} actúa como encargado del tratamiento y solo tratará los datos personales siguiendo las instrucciones de {{cliente}}, quien actúa como responsable.\n\nMedidas de seguridad y finalidad. Los datos personales serán tratados únicamente para las finalidades propias del contrato, esto es, desarrollo, soporte, pruebas y facturación, aplicando medidas técnicas y administrativas razonables de seguridad. No se transferirán a terceros ni a otros países sin autorización del titular o sin las garantías exigidas por la normativa aplicable.\n\nDerechos del titular y devolución. {{cliente}} atenderá las consultas, reclamos y solicitudes de acceso, corrección, supresión o revocatoria de los titulares, quienes podrán dirigirlas a {{email_cliente}}. Terminado el contrato, cada parte devolverá o eliminará la información y los datos personales recibidos, salvo aquellos que deba conservar por mandato legal o contable.";

const SHARED_LIMITACION =
  "Riesgo asumido. La responsabilidad total de {{contratista}} derivada de este contrato, sea contractual o extracontractual, se limita al valor efectivamente pagado por {{cliente}} en los doce (12) meses anteriores al hecho que la origine y, en todo caso, no excederá el valor total pactado de {{valor}}.\n\nDaño indirecto. Ninguna de las partes responderá por lucro cesante, pérdida de oportunidad, pérdida de datos no respaldados, afectación reputacional, sanciones de terceros ni daños indirectos o consecuenciales, aun cuando hubiere sido advertida de su posibilidad.\n\nDatos y respaldos. {{cliente}} es responsable de mantener copias de seguridad independientes de su información y de aprobar la liberación de cada entrega a producción. {{contratista}} no responderá por pérdidas derivadas de accesos, credenciales o infraestructura administrados por {{cliente}} o por terceros ajenos al alcance.\n\nDependencias externas. {{contratista}} no responde por la indisponibilidad, los cambios de interfaz, los bloqueos, las modificaciones de precio o la terminación de servicios de terceros, tales como nube, pasarelas de pago, mensajería, APIs gubernamentales o proveedores de inteligencia artificial, ni por las consecuencias de su descontinuación.\n\nExclusión de garantías implícitas. Salvo la garantía expresamente pactada, los entregables se suministran sin garantías implícitas de comerciabilidad o idoneidad para un propósito particular. {{contratista}} no garantiza resultados comerciales, tráfico, posicionamiento ni niveles de conversión.";

const SHARED_FUERZA_MAYOR =
  "Eximente de responsabilidad. Ninguna de las partes será responsable por el incumplimiento o por la mora en el cumplimiento de sus obligaciones cuando ello obedezca a caso fortuito o fuerza mayor, entendido como el hecho imprevisible e irresistible ajeno a su voluntad, conforme al artículo 64 del Código Civil colombiano.\n\nEventos comprendidos. Se consideran, entre otros, catástrofes naturales, sismos, inundaciones, incendios, pandemia o emergencia sanitaria declarada por autoridad competente, actos de guerra, terrorismo, conmoción interior, huelgas generales, cortes prolongados de energía o de telecomunicaciones, ciberataques de gran escala y decisiones de autoridad que impidan la ejecución.\n\nAviso y mitigación. La parte afectada informará a la otra dentro de los cinco (5) días siguientes a la ocurrencia del hecho, describirá sus efectos sobre el cronograma y adoptará medidas razonables de mitigación. La falta injustificada de aviso generará responsabilidad por los perjuicios que esa omisión cause.\n\nEfectos sobre el plazo. Los plazos se suspenderán por el tiempo que dure el impedimento. Si el evento persiste por más de sesenta (60) días calendario, cualquiera de las partes podrá terminar el contrato sin penalidad, reconociendo a {{contratista}} el valor de los trabajos efectivamente ejecutados y aceptados a la fecha.";

const SHARED_CONTROVERSIAS =
  "Ley aplicable. Este contrato se rige por las leyes de la República de Colombia, en particular por el Código Civil, el Código de Comercio, la Ley 23 de 1982, la Ley 527 de 1999, la Ley 1581 de 2012 y la Ley 1480 de 2011 en lo pertinente.\n\nArreglo directo. Las partes intentarán resolver de buena fe cualquier diferencia mediante comunicación escrita dirigida a la otra parte dentro de los diez (10) días hábiles siguientes a su surgimiento, sin que ello suspenda el cumplimiento de las obligaciones no controvertidas.\n\nConciliación y jurisdicción. Agotado el arreglo directo sin acuerdo, las partes podrán acudir a conciliación ante un centro de conciliación legalmente autorizado en {{ciudad}}. Si el conflicto persiste, será resuelto por los jueces competentes de {{ciudad}}, a cuya jurisdicción las partes se someten de manera expresa.\n\nNotificaciones. Las comunicaciones relacionadas con este contrato se enviarán por escrito a la dirección o al correo electrónico registrado por cada parte: por {{cliente}}, a {{email_cliente}}; por {{contratista}}, a la dirección y al correo informados en el encabezado. El correo electrónico se reconoce como medio válido de notificación entre las partes conforme a la Ley 527 de 1999.\n\nIntegridad del acuerdo. Este documento, junto con sus anexos, cotizaciones aceptadas y actas de cambio firmadas, constituye el acuerdo íntegro entre las partes y reemplaza toda negociación anterior. Las modificaciones solo serán válidas si constan por escrito y están firmadas por ambas partes.";

/* ------------------------------------------------------------------ *
 * Plantilla 1 — Desarrollo Web a Medida
 * ------------------------------------------------------------------ */

const DW_OBJETO =
  "{{contratista}}, profesional independiente en ingeniería de software y arquitectura digital, y {{cliente}} celebran el presente contrato de prestación de servicios profesionales para el diseño, desarrollo, pruebas, despliegue y entrega de un sitio web a medida.\n\nDatos de la parte contratante: {{cliente}}, {{empresa}}, con documento de identidad o NIT {{doc_id}}, correo electrónico {{email_cliente}} y domicilio en {{ciudad}}.\n\nEl contrato se pacta bajo la modalidad de obra por encargo con precio fijo global y plena autonomía técnica, administrativa y financiera de {{contratista}}, quien actúa como contratista independiente y no genera relación laboral alguna con {{cliente}}. {{contratista}} responderá por sus propios aportes al Sistema de Seguridad Social conforme a la Ley 100 de 1993 y a la normativa aplicable a los trabajadores independientes.\n\nEl servicio comprende el sitio web, su panel administrativo y las integraciones descritas en el alcance, conforme a los entregables, el cronograma y las exclusiones pactadas en este documento.\n\nEste contrato se rige por los artículos 1495 y siguientes del Código Civil, los artículos 968 y siguientes del Código de Comercio, la Ley 23 de 1982, la Ley 527 de 1999, la Ley 1581 de 2012 y la Ley 1480 de 2011 en lo pertinente.";

const DW_ALCANCE =
  "El alcance del proyecto es el siguiente: {{alcance}}\n\nEl alcance se limita expresamente a lo descrito en el párrafo anterior y en la cláusula de entregables. Toda actividad, módulo, integración o funcionalidad no relacionada allí requerirá control de cambios y podrá implicar ajuste de valor y de plazo.\n\nSe incluyen hasta dos (2) rondas de revisión por cada etapa entregable. Se entiende por ronda un envío consolidado de observaciones escritas; las observaciones presentadas por fuera del plazo de revisión se tramitarán como trabajo adicional.\n\n{{contratista}} definirá la arquitectura técnica, la estructura de datos, las herramientas y el proceso de desarrollo, y podrá sustituir componentes técnicos por equivalentes siempre que se mantengan la funcionalidad y los entregables pactados.\n\nEl sitio se desarrollará con estándares de accesibilidad y diseño responsivo, y será compatible con las dos versiones más recientes de los navegadores de mayor uso, según el alcance aprobado.";

const DW_ENTREGABLES =
  "Los entregables del proyecto son los siguientes:\n{{entregables}}\n\nCriterios de aceptación. Un entregable se entiende aceptado cuando cumple lo descrito en el alcance, supera las pruebas funcionales pactadas y no presenta defectos de severidad crítica o alta conforme a la cláusula de garantía.\n\nProcedimiento de aceptación. {{cliente}} dispondrá de cinco (5) días hábiles contados desde la notificación de entrega para revisar y pronunciarse por escrito. Si no se pronuncia en ese término, el entregable se tendrá por aceptado, sin perjuicio de la garantía pactada.\n\nRechazo motivado. Si {{cliente}} objeta el entregable, detallará por escrito las no conformidades y {{contratista}} contará con diez (10) días hábiles para corregirlas y remitir una nueva versión, sin costo adicional cuando las no conformidades estén dentro del alcance.";

const DW_EXCLUSIONES =
  "No forman parte del alcance ni del valor del contrato:\n{{exclusiones}}\n\nLas exclusiones anteriores limitan expresamente la obligación de {{contratista}}. Cualquiera de ellas podrá ser asumida mediante cotización y acta de cambio aprobada por {{cliente}}.\n\n{{cliente}} reconoce que los servicios de terceros, tales como dominios, hosting, nube, pasarelas de pago y proveedores de inteligencia artificial, se rigen por sus propios términos, condiciones, políticas de uso y niveles de disponibilidad, y que {{contratista}} no responde por sus decisiones comerciales ni por sus interrupciones.";

const DW_CONTRATISTA =
  "{{contratista}} se obliga a: (i) ejecutar los servicios con la diligencia, idoneidad técnica y calidad propias de su actividad; (ii) entregar los productos en los plazos pactados; (iii) informar oportunamente avances, riesgos y bloqueos; (iv) mantener comunicación por los canales acordados; (v) guardar la confidencialidad de la información; y (vi) cumplir con sus obligaciones tributarias, de seguridad social y de protección de datos.\n\n{{contratista}} ejecutará el proyecto con personal propio o con colaboradores bajo su exclusiva subordinación y responsabilidad, sin que ello genere vínculo alguno entre ellos y {{cliente}}, y responderá por la idoneidad de dichos colaboradores.\n\n{{contratista}} mantendrá el código fuente en un repositorio versionado al que {{cliente}} tendrá acceso de lectura, y entregará la documentación técnica y las credenciales necesarias al cierre del proyecto.\n\n{{contratista}} no responde por retrasos atribuibles a la falta de información, aprobaciones, contenidos, accesos o decisiones de {{cliente}}, ni por la indisponibilidad de servicios de terceros.";

const DW_CLIENTE =
  "{{cliente}} se obliga a: (i) pagar el valor pactado en los plazos y porcentajes acordados; (ii) designar un interlocutor único con capacidad de decisión; (iii) entregar oportunamente la información, contenidos, accesos, credenciales y aprobaciones requeridas; (iv) revisar y pronunciarse sobre los entregables dentro de los plazos pactados; y (v) garantizar que los contenidos, imágenes, marcas y datos que entregue a {{contratista}} son lícitos y no vulneran derechos de terceros.\n\n{{cliente}} responderá por la veracidad y legalidad de la información que suministre y mantendrá indemne a {{contratista}} frente a reclamaciones de terceros derivadas de los contenidos, marcas o datos aportados por {{cliente}}.\n\n{{cliente}} dispondrá la infraestructura, licencias, cuentas y servicios de terceros necesarios para el proyecto, así como los ambientes de pruebas y producción cuando sean de su titularidad.\n\nLa mora de {{cliente}} en cualquiera de estas obligaciones suspende los plazos a favor de {{contratista}} por el tiempo que dure, sin que ello constituya incumplimiento de {{contratista}}.";

const DW_CRONOGRAMA =
  "El plazo de ejecución es de {{plazo}}, contado a partir del {{fecha_inicio}} y con fecha estimada de terminación el {{fecha_fin}}, siempre que {{cliente}} cumpla oportunamente con sus obligaciones de información, contenidos y aprobaciones.\n\nHitos. El proyecto se ejecutará por etapas sucesivas asociadas al plan de pagos: inicio y levantamiento, diseño, desarrollo, pruebas y despliegue final. Cada etapa inicia una vez aceptada la anterior y recibido el pago correspondiente.\n\nSuspensiones. Los plazos se suspenderán por la mora de {{cliente}} en pagos, aprobaciones o entrega de insumos, por los cambios de alcance aprobados y por caso fortuito o fuerza mayor. La suspensión se documentará por escrito mediante correo electrónico o acta.\n\nReuniones de seguimiento. Se realizará una reunión de avance al menos cada quince (15) días calendario, con acta breve de compromisos, riesgos y decisiones.";

const DW_PAGO =
  "El valor total del contrato es de {{valor}} ({{valor_letras}}), suma que no incluye IVA ni los costos de terceros señalados en las exclusiones, y que se pagará conforme al siguiente plan de pagos por hitos: cuarenta por ciento (40%) como anticipo a la firma; veinte por ciento (20%) con la aprobación del diseño UI/UX; veinte por ciento (20%) con la entrega del build de staging; y veinte por ciento (20%) con la entrega final y el despliegue en producción.\n\nLas facturas se pagarán dentro de los diez (10) días calendario siguientes a su aceptación. El pago de cada hito es condición para el inicio del siguiente y para la entrega o transferencia de los componentes correspondientes.\n\nMora en el pago. El retardo superior a quince (15) días calendario causará intereses moratorios a la tasa máxima legal permitida y facultará a {{contratista}} para suspender el servicio, sin que ello constituya incumplimiento.\n\nAjuste de costos de terceros. Los incrementos en dominios, infraestructura, licencias o servicios externos que deba asumir {{contratista}} por instrucción escrita de {{cliente}} se facturarán por separado con su soporte documental.\n\nLos gastos de desplazamiento y viáticos, si se requieren y son autorizados previamente por {{cliente}}, se reconocerán con los soportes correspondientes.";

const DW_GARANTIA =
  "{{contratista}} garantiza que los entregables funcionarán conforme a lo pactado por un término de {{garantia}} contados a partir de la aceptación final. Durante ese período corregirá sin costo los defectos reproducibles imputables al desarrollo.\n\nLa garantía cubre errores de programación, fallas de integración incluidas en el alcance y desviaciones respecto de las especificaciones aprobadas. Incluye soporte por correo electrónico en horario hábil y atención de incidentes críticos en un término objetivo de veinticuatro (24) horas.\n\nLa garantía no cubre: cambios de alcance o nuevas funcionalidades; fallas originadas en modificaciones hechas por terceros o por {{cliente}}; problemas de infraestructura, red, hosting, dominios o servicios de terceros; actualizaciones de plataformas, navegadores o APIs que alteren el funcionamiento; ni el uso indebido del sistema o la pérdida de datos por falta de respaldos.\n\nVencido el término de garantía, cualquier soporte, corrección o evolución se prestará bajo un nuevo acuerdo de mantenimiento o mediante cotización específica.";

const DW_CAMBIOS =
  "Toda modificación del alcance, de los entregables, del cronograma o del valor deberá tramitarse mediante solicitud escrita de cambio, en la que se describa la necesidad, el impacto técnico, el efecto en el plazo y el costo estimado.\n\n{{contratista}} evaluará la solicitud dentro de los tres (3) días hábiles siguientes y presentará la propuesta. El cambio solo será obligatorio cuando {{cliente}} lo apruebe por escrito, por correo electrónico o acta firmada; hasta entonces no se ejecutará ni suspenderá el trabajo ya contratado.\n\nLos trabajos adicionales aprobados se facturarán por horas a la tarifa vigente de {{contratista}} o por precio fijo según la propuesta, y podrán ampliar el plazo en proporción al trabajo adicional.\n\nAjustes menores. Las correcciones de estilo, textos, imágenes o detalles que no alteren la arquitectura ni la lógica del sistema y que se realicen dentro de las rondas de revisión pactadas no constituyen cambio de alcance.\n\nRegistro. Todo cambio aprobado se incorporará al expediente del contrato y se reflejará en una nueva versión del documento.";

const DW_TERMINACION =
  "Terminación por mutuo acuerdo. Las partes podrán terminar el contrato en cualquier momento mediante acuerdo escrito, liquidando los trabajos ejecutados y aceptados a la fecha y los costos comprometidos con terceros.\n\nTerminación por incumplimiento. Cualquiera de las partes podrá terminar el contrato si la otra incumple gravemente sus obligaciones y no subsana el incumplimiento dentro de los diez (10) días hábiles siguientes al requerimiento escrito. {{cliente}} podrá además terminar por la falta de corrección de los defectos cubiertos por la garantía, y {{contratista}} por la mora superior a treinta (30) días calendario en el pago.\n\nTerminación unilateral por conveniencia. {{cliente}} podrá terminar el contrato sin justa causa avisando por escrito con quince (15) días calendario de anticipación. En ese caso pagará los hitos y trabajos ejecutados hasta la fecha, los costos no reembolsables comprometidos con terceros y un diez por ciento (10%) del valor de la etapa en curso a título de indemnización.\n\nCláusula penal. El incumplimiento de los plazos de pago o de entrega causará, a favor de la parte cumplida, una sanción equivalente al uno por ciento (1%) del valor del hito incumplido por cada semana de retardo, sin exceder el diez por ciento (10%) del valor total del contrato. Esta sanción se aplicará sin perjuicio del cobro de los perjuicios que excedan su monto.\n\nEfectos de la terminación. Terminado el contrato, {{contratista}} entregará el estado del código, la documentación y las credenciales disponibles, y {{cliente}} pagará los valores pendientes dentro de los quince (15) días siguientes a la liquidación.";

function desarrolloWebClauses(): ContractClause[] {
  return [
    clause(1, "c01", "Objeto del contrato", DW_OBJETO, "general", false),
    clause(2, "c02", "Alcance de los servicios", DW_ALCANCE, "tecnico", false),
    clause(3, "c03", "Entregables y criterios de aceptación", DW_ENTREGABLES, "tecnico", false),
    clause(4, "c04", "Exclusiones y servicios no incluidos", DW_EXCLUSIONES, "tecnico", false),
    clause(5, "c05", "Obligaciones del contratista", DW_CONTRATISTA, "general", false),
    clause(6, "c06", "Obligaciones del cliente", DW_CLIENTE, "general", false),
    clause(7, "c07", "Plazo, cronograma e hitos", DW_CRONOGRAMA, "tecnico", false),
    clause(8, "c08", "Valor del contrato y forma de pago", DW_PAGO, "economico", false),
    clause(9, "c09", "Retención en la fuente, IVA y obligaciones tributarias", SHARED_IMPUESTOS, "economico", true),
    clause(10, "c10", "Garantía, soporte y corrección de errores", DW_GARANTIA, "tecnico", false),
    clause(11, "c11", "Propiedad intelectual y cesión de derechos patrimoniales", SHARED_PI, "propiedad", true),
    clause(12, "c12", "Licencias de terceros y componentes open source", SHARED_OPEN_SOURCE, "propiedad", true),
    clause(13, "c13", "Confidencialidad, datos personales y habeas data", SHARED_CONFIDENCIALIDAD, "legal", true),
    clause(14, "c14", "Control de cambios y alcance adicional", DW_CAMBIOS, "general", false),
    clause(15, "c15", "Terminación anticipada, incumplimiento y cláusula penal", DW_TERMINACION, "legal", false),
    clause(16, "c16", "Limitación de responsabilidad", SHARED_LIMITACION, "legal", true),
    clause(17, "c17", "Fuerza mayor o caso fortuito", SHARED_FUERZA_MAYOR, "legal", false),
    clause(18, "c18", "Solución de controversias, ley aplicable y notificaciones", SHARED_CONTROVERSIAS, "legal", true),
  ];
}

/* ------------------------------------------------------------------ *
 * Plantilla 2 — Automatización de Procesos
 * ------------------------------------------------------------------ */

const AU_OBJETO =
  "{{contratista}}, profesional independiente en ingeniería de software y automatización, y {{cliente}} celebran el presente contrato de prestación de servicios profesionales para el diagnóstico, diseño, construcción, pruebas y puesta en producción de automatizaciones de procesos de negocio de {{cliente}}.\n\nDatos de la parte contratante: {{cliente}}, {{empresa}}, con documento de identidad o NIT {{doc_id}}, correo electrónico {{email_cliente}} y domicilio en {{ciudad}}.\n\nEl contrato se pacta bajo la modalidad de obra por encargo con precio fijo global y plena autonomía técnica, administrativa y financiera de {{contratista}}, quien actúa como contratista independiente y responde por sus propios aportes al Sistema de Seguridad Social.\n\nLa automatización se apoyará en las plataformas y herramientas que {{cliente}} ya utiliza o en las que las partes acuerden por escrito; la adquisición de licencias, planes y consumos corresponde a {{cliente}}.\n\nEste contrato se rige por el Código Civil colombiano, el Código de Comercio, la Ley 527 de 1999, la Ley 1581 de 2012 y la Ley 1480 de 2011 en lo pertinente.";

const AU_ALCANCE =
  "El alcance del proyecto es el siguiente: {{alcance}}\n\nEl alcance comprende la automatización de hasta tres (3) procesos, cada uno con un máximo de ocho (8) pasos o reglas de negocio, y la integración con hasta cuatro (4) herramientas de {{cliente}} mediante API, webhooks, conectores o intercambio de archivos.\n\nCada automatización incluirá el flujo objetivo documentado, la configuración de disparadores y condiciones, el manejo de errores y excepciones, las notificaciones al responsable y el registro de ejecuciones para auditoría.\n\nNo se modificarán el código fuente, los esquemas de base de datos ni la configuración de los sistemas de terceros sin autorización escrita de {{cliente}} y del proveedor correspondiente.\n\n{{contratista}} podrá proponer mejoras en los procesos analizados, sin que ello lo obligue a ejecutar actividades por fuera del alcance pactado.";

const AU_ENTREGABLES =
  "Los entregables del proyecto son los siguientes:\n{{entregables}}\n\nCriterios de aceptación. Una automatización se entiende aceptada cuando ejecuta el flujo aprobado sin intervención manual, procesa correctamente los casos de prueba acordados, incluidos los casos de error, y registra la trazabilidad de cada ejecución.\n\nPruebas y validación. {{contratista}} entregará el plan de pruebas con los escenarios definidos y {{cliente}} dispondrá de cinco (5) días hábiles para validarlos por escrito. El silencio se entenderá como aceptación.\n\nCorrección de no conformidades. Si {{cliente}} objeta el entregable, detallará por escrito las no conformidades y {{contratista}} contará con diez (10) días hábiles para corregirlas y remitir una nueva versión, sin costo adicional dentro del alcance.";

const AU_EXCLUSIONES =
  "No forman parte del alcance ni del valor del contrato:\n{{exclusiones}}\n\n{{cliente}} reconoce que las plataformas de automatización, los proveedores de servicios y las APIs se rigen por sus propios términos, cuotas de uso, límites de ejecuciones y políticas de cambio, y que {{contratista}} no controla dichos factores.\n\nEl soporte posterior a la garantía, la incorporación de nuevos procesos y el ajuste de los flujos frente a cambios de las plataformas se atenderán mediante control de cambios o un nuevo acuerdo de mantenimiento.";

const AU_CONTRATISTA =
  "{{contratista}} se obliga a: (i) ejecutar el proyecto con idoneidad técnica y buenas prácticas de ingeniería; (ii) levantar el diagnóstico de procesos y proponer la priorización de oportunidades; (iii) construir, probar y documentar las automatizaciones pactadas; (iv) informar avances, riesgos y dependencias de terceros; y (v) capacitar al equipo de {{cliente}} en el uso y el mantenimiento básico de los flujos.\n\n{{contratista}} mantendrá los flujos y las credenciales utilizadas en el proyecto bajo medidas razonables de seguridad, con acceso restringido al personal que los requiera.\n\n{{contratista}} no responde por los cambios de interfaz, cuotas, precios o condiciones que las plataformas de terceros implementen con posterioridad a la entrega, ni por las interrupciones originadas en ellas.\n\n{{contratista}} responderá por la idoneidad de sus colaboradores y podrá apoyarse en terceros bajo su exclusiva responsabilidad, sin generar vínculo alguno con {{cliente}}.";

const AU_CLIENTE =
  "{{cliente}} se obliga a: (i) pagar el valor pactado en los plazos y porcentajes acordados; (ii) entregar las credenciales y accesos necesarios con permisos suficientes, incluidos los accesos de administrador cuando sean indispensables; (iii) designar un responsable de los procesos con capacidad de decisión; (iv) validar los flujos y resultados dentro de los plazos pactados; y (v) cumplir con los términos de uso y las cuotas de las plataformas utilizadas.\n\n{{cliente}} garantiza que cuenta con las autorizaciones y bases legales necesarias para tratar los datos personales que fluyan por las automatizaciones y que su uso es lícito y acorde con su política de tratamiento de datos.\n\n{{cliente}} asumirá los costos de licencias, planes, consumos y cuotas de las plataformas, así como los de cualquier ajuste derivado del cambio de condiciones de un proveedor.\n\nLa mora de {{cliente}} en la entrega de accesos, insumos o aprobaciones suspende los plazos a favor de {{contratista}} por el tiempo que dure.";

const AU_CRONOGRAMA =
  "El plazo de ejecución es de {{plazo}}, contado a partir del {{fecha_inicio}} y con terminación estimada el {{fecha_fin}}, siempre que {{cliente}} entregue oportunamente los accesos, la información y las validaciones requeridas.\n\nFases. El proyecto se ejecuta en tres fases: diagnóstico y diseño de flujos; construcción y pruebas de las automatizaciones; y puesta en producción, monitoreo y capacitación.\n\nSeguimiento. Se realizará una reunión semanal de avance por medios virtuales, con registro de compromisos, riesgos y decisiones técnicas.\n\nSuspensiones. Los plazos se suspenden por la mora de {{cliente}}, por la indisponibilidad de las plataformas o APIs de terceros, por los cambios de alcance aprobados y por caso fortuito o fuerza mayor. La suspensión se documentará por escrito.";

const AU_PAGO =
  "El valor total del contrato es de {{valor}} ({{valor_letras}}), suma que no incluye IVA ni los costos de terceros señalados en las exclusiones, y que se pagará así: cuarenta por ciento (40%) como anticipo a la firma del contrato; treinta por ciento (30%) contra la entrega del diseño de los flujos aprobado por {{cliente}}; y treinta por ciento (30%) contra la puesta en producción y la capacitación.\n\nLas facturas se pagarán dentro de los diez (10) días calendario siguientes a su aceptación. El anticipo es condición para el inicio de las actividades.\n\nMora en el pago. El retardo superior a quince (15) días calendario causará intereses moratorios a la tasa máxima legal permitida y facultará a {{contratista}} para suspender la ejecución o abstenerse de poner en producción los flujos.\n\nCostos de terceros. Los planes, licencias y consumos de las plataformas de automatización son a cargo de {{cliente}} y podrán facturarse por separado cuando {{contratista}} los adquiera por instrucción escrita de {{cliente}}.\n\nLos gastos de desplazamiento y viáticos, si se requieren y son autorizados previamente, se reconocerán con los soportes correspondientes.";

const AU_GARANTIA =
  "{{contratista}} garantiza el correcto funcionamiento de las automatizaciones entregadas por un término de {{garantia}} contados a partir de la aceptación de la puesta en producción.\n\nLa garantía cubre errores de configuración, fallas en el flujo, manejo inadecuado de excepciones y desviaciones frente al diseño aprobado. Incluye soporte por correo electrónico y atención de fallas críticas en un término objetivo de veinticuatro (24) horas hábiles.\n\nLa garantía no cubre: cambios de alcance o nuevos procesos; fallas por modificaciones realizadas por {{cliente}} o por terceros; cambios de interfaz, cuotas o condiciones de las plataformas y APIs; vencimiento de credenciales o tokens; ni errores en los datos de origen suministrados por {{cliente}} o por sus sistemas.\n\nVencido el término de garantía, el ajuste y la evolución de los flujos se atenderán mediante un acuerdo de mantenimiento o por cotización específica.";

const AU_CAMBIOS =
  "Toda modificación del alcance, de los flujos, de las integraciones o del cronograma deberá solicitarse por escrito, describiendo la necesidad, el resultado esperado y la prioridad.\n\n{{contratista}} evaluará la solicitud dentro de los tres (3) días hábiles siguientes, indicará el impacto técnico, el efecto en el plazo y el costo estimado, y la ejecutará únicamente cuando {{cliente}} la apruebe por escrito.\n\nLos trabajos adicionales aprobados se facturarán por horas a la tarifa vigente de {{contratista}} o por precio fijo según la propuesta, y podrán ampliar el plazo en proporción al trabajo adicional.\n\nAjustes menores. Los cambios de nombres de campos, textos de notificaciones, correos de destino y parámetros de configuración que no alteren la lógica del flujo no constituyen cambio de alcance.\n\nLos cambios aprobados se registrarán en el expediente del contrato y podrán reflejarse en una nueva versión del documento.";

const AU_TERMINACION =
  "Terminación por mutuo acuerdo. Las partes podrán terminar el contrato en cualquier momento mediante acuerdo escrito, liquidando los trabajos ejecutados y aceptados a la fecha y los costos comprometidos con terceros.\n\nTerminación por incumplimiento. Cualquiera de las partes podrá terminar el contrato si la otra incumple gravemente sus obligaciones y no subsana el incumplimiento dentro de los diez (10) días hábiles siguientes al requerimiento escrito.\n\nTerminación por conveniencia. {{cliente}} podrá terminar el contrato sin justa causa avisando por escrito con quince (15) días calendario de anticipación, caso en el cual pagará los trabajos ejecutados, los costos no reembolsables comprometidos con terceros y un diez por ciento (10%) del valor de la fase en curso.\n\nCláusula penal. El incumplimiento de los plazos de pago o de entrega causará, a favor de la parte cumplida, una sanción equivalente al uno por ciento (1%) del valor del hito incumplido por cada semana de retardo, sin exceder el diez por ciento (10%) del valor total del contrato, sin perjuicio del cobro de los perjuicios que excedan ese monto.\n\nEfectos de la terminación. Terminado el contrato, {{contratista}} entregará la documentación, los flujos y las credenciales disponibles, y {{cliente}} pagará los valores pendientes dentro de los quince (15) días siguientes a la liquidación.";

function automatizacionClauses(): ContractClause[] {
  return [
    clause(1, "c01", "Objeto del contrato", AU_OBJETO, "general", false),
    clause(2, "c02", "Alcance de los servicios", AU_ALCANCE, "tecnico", false),
    clause(3, "c03", "Entregables y criterios de aceptación", AU_ENTREGABLES, "tecnico", false),
    clause(4, "c04", "Exclusiones y servicios no incluidos", AU_EXCLUSIONES, "tecnico", false),
    clause(5, "c05", "Obligaciones del contratista", AU_CONTRATISTA, "general", false),
    clause(6, "c06", "Obligaciones del cliente", AU_CLIENTE, "general", false),
    clause(7, "c07", "Plazo, cronograma e hitos", AU_CRONOGRAMA, "tecnico", false),
    clause(8, "c08", "Valor del contrato y forma de pago", AU_PAGO, "economico", false),
    clause(9, "c09", "Retención en la fuente, IVA y obligaciones tributarias", SHARED_IMPUESTOS, "economico", true),
    clause(10, "c10", "Garantía, soporte y corrección de errores", AU_GARANTIA, "tecnico", false),
    clause(11, "c11", "Propiedad intelectual y cesión de derechos patrimoniales", SHARED_PI, "propiedad", true),
    clause(12, "c12", "Licencias de terceros y componentes open source", SHARED_OPEN_SOURCE, "propiedad", true),
    clause(13, "c13", "Confidencialidad, datos personales y habeas data", SHARED_CONFIDENCIALIDAD, "legal", true),
    clause(14, "c14", "Control de cambios y alcance adicional", AU_CAMBIOS, "general", false),
    clause(15, "c15", "Terminación anticipada, incumplimiento y cláusula penal", AU_TERMINACION, "legal", false),
    clause(16, "c16", "Limitación de responsabilidad", SHARED_LIMITACION, "legal", true),
    clause(17, "c17", "Fuerza mayor o caso fortuito", SHARED_FUERZA_MAYOR, "legal", false),
    clause(18, "c18", "Solución de controversias, ley aplicable y notificaciones", SHARED_CONTROVERSIAS, "legal", true),
  ];
}

/* ------------------------------------------------------------------ *
 * Plantilla 3 — Consultoría y Arquitectura Digital
 * ------------------------------------------------------------------ */

const CO_OBJETO =
  "{{contratista}}, profesional independiente en ingeniería de software y arquitectura digital, y {{cliente}} celebran el presente contrato de prestación de servicios profesionales de consultoría, cuyo objeto es el diagnóstico técnico, la definición de la arquitectura objetivo y la estructuración de la hoja de ruta de modernización de los sistemas de {{cliente}}.\n\nDatos de la parte contratante: {{cliente}}, {{empresa}}, con documento de identidad o NIT {{doc_id}}, correo electrónico {{email_cliente}} y domicilio en {{ciudad}}.\n\nLa consultoría se presta bajo la modalidad de obligación de medio: {{contratista}} se compromete a aplicar la diligencia, el método y la idoneidad profesional propias de su actividad, sin que sus recomendaciones garanticen por sí mismas resultados comerciales, técnicos o financieros determinados.\n\n{{contratista}} actúa como contratista independiente con autonomía técnica y administrativa, y responderá por sus propios aportes al Sistema de Seguridad Social conforme a la normativa aplicable a los trabajadores independientes.\n\nEste contrato se rige por el Código Civil colombiano, el Código de Comercio, la Ley 23 de 1982, la Ley 527 de 1999 y la Ley 1581 de 2012.";

const CO_ALCANCE =
  "El alcance de la consultoría es el siguiente: {{alcance}}\n\nLa consultoría comprende el levantamiento de información con las áreas involucradas, la revisión del código, la infraestructura y los procesos existentes, la identificación de riesgos y deuda técnica, y la formulación de la arquitectura objetivo con sus decisiones, impactos y estimaciones.\n\nSe incluyen hasta seis (6) sesiones de trabajo o mentoría con el equipo de {{cliente}}, de dos (2) horas cada una, dentro del plazo del contrato, y una presentación ejecutiva para el comité directivo.\n\n{{contratista}} definirá el método, las herramientas y las fuentes de información que utilizará, y podrá solicitar entrevistas, accesos de lectura y documentación técnica para fundamentar sus conclusiones.\n\nLas recomendaciones son de carácter consultivo y su implementación es responsabilidad de {{cliente}}, salvo que las partes suscriban un contrato adicional para su ejecución.";

const CO_ENTREGABLES =
  "Los entregables de la consultoría son los siguientes:\n{{entregables}}\n\nCriterios de aceptación. Un entregable se entiende aceptado cuando aborda el alcance definido, contiene las fuentes o evidencias utilizadas y permite la toma de decisiones técnicas por parte de {{cliente}}.\n\nRevisiones. {{cliente}} dispondrá de diez (10) días hábiles desde la entrega de cada documento para formular observaciones escritas. {{contratista}} ajustará el documento dentro de los diez (10) días hábiles siguientes, sin costo adicional cuando las observaciones se refieran al alcance pactado.\n\nFormato de entrega. Los documentos se entregarán en formato digital editable, con versiones identificadas y numeradas, y acompañados de las presentaciones utilizadas en las sesiones de trabajo.";

const CO_EXCLUSIONES =
  "No forman parte del alcance ni del valor del contrato:\n{{exclusiones}}\n\nLas recomendaciones de arquitectura son propuestas técnicas sujetas a la validación y decisión de {{cliente}}. {{contratista}} no asume responsabilidad por las consecuencias de decisiones adoptadas en contra de sus recomendaciones.\n\n{{cliente}} reconoce que la consultoría no comprende la ejecución de obra, la operación de sistemas en producción ni la asunción de las funciones de un área de tecnología, y que la implementación de la hoja de ruta requiere recursos y contratos adicionales.";

const CO_CONTRATISTA =
  "{{contratista}} se obliga a: (i) ejecutar la consultoría con independencia, idoneidad y rigor técnico; (ii) entregar los informes y documentos en los plazos pactados; (iii) sustentar sus conclusiones con evidencia técnica verificable; (iv) informar oportunamente los hallazgos de riesgo relevante; y (v) mantener la confidencialidad de la información conocida.\n\n{{contratista}} declarará por escrito cualquier conflicto de interés que surja durante la ejecución del contrato, en particular su relación con proveedores tecnológicos recomendados o utilizados.\n\n{{contratista}} prestará los servicios con personal idóneo y podrá apoyarse en colaboradores bajo su responsabilidad, sin generar vínculo alguno con {{cliente}}.\n\n{{contratista}} no está obligado a ejecutar las recomendaciones, a implementar la arquitectura propuesta ni a asumir la operación de los sistemas de {{cliente}}.";

const CO_CLIENTE =
  "{{cliente}} se obliga a: (i) pagar el valor pactado en los plazos y porcentajes acordados; (ii) designar un interlocutor único con capacidad de decisión y facilitar el acceso al equipo técnico y a las áreas involucradas; (iii) permitir el acceso de solo lectura a repositorios, infraestructura, métricas y documentación; (iv) entregar la información necesaria de forma completa y oportuna; y (v) adoptar las decisiones técnicas que le correspondan dentro del plazo del contrato.\n\n{{cliente}} garantiza que cuenta con las autorizaciones necesarias para compartir con {{contratista}} la información técnica y los datos que le entregue, incluidos los datos personales, respecto de los cuales conservará la calidad de responsable del tratamiento.\n\nLa falta de acceso a la información o la ausencia de decisiones de {{cliente}} podrá dar lugar al cierre de la consultoría con las conclusiones disponibles a la fecha, sin que ello constituya incumplimiento de {{contratista}}.";

const CO_CRONOGRAMA =
  "El plazo de la consultoría es de {{plazo}}, contado a partir del {{fecha_inicio}} y con fecha estimada de terminación el {{fecha_fin}}, sujeto al suministro oportuno de la información y de los accesos.\n\nFases. La consultoría se ejecuta en tres fases de treinta (30) días calendario cada una, aproximadamente: diagnóstico y levantamiento; diseño de la arquitectura objetivo; y hoja de ruta, modelo de gobierno y presentación ejecutiva.\n\nReuniones. Se realizará una reunión de seguimiento cada quince (15) días calendario, con acta de hallazgos, decisiones y compromisos de cada parte.\n\nSuspensiones. Los plazos se suspenden por la mora de {{cliente}} en la entrega de información o accesos, por los cambios de alcance aprobados y por caso fortuito o fuerza mayor, mediante comunicación escrita.";

const CO_PAGO =
  "El valor total de la consultoría es de {{valor}} ({{valor_letras}}), suma que no incluye IVA ni los costos de terceros señalados en las exclusiones, y que se pagará así: treinta por ciento (30%) como anticipo a la firma; treinta por ciento (30%) contra la entrega del diagnóstico y los hallazgos; y cuarenta por ciento (40%) contra la entrega de la arquitectura objetivo, la hoja de ruta y la presentación ejecutiva.\n\nLas facturas se pagarán dentro de los quince (15) días calendario siguientes a su aceptación. El anticipo es condición para el inicio de las actividades.\n\nMora en el pago. El retardo superior a quince (15) días calendario causará intereses moratorios a la tasa máxima legal permitida y facultará a {{contratista}} para suspender la consultoría y abstenerse de entregar los productos pendientes.\n\nEntregas condicionadas. La entrega de los documentos finales queda condicionada al pago de los hitos correspondientes; {{cliente}} podrá usar internamente los borradores entregados durante la vigencia del contrato.\n\nLos gastos de desplazamiento, si se requieren y son autorizados previamente por escrito, se reconocerán con los soportes correspondientes.";

const CO_GARANTIA =
  "{{contratista}} garantiza la calidad técnica de los documentos entregados por un término de {{garantia}} contados a partir de la aceptación final, y corregirá sin costo los errores, inconsistencias o vacíos imputables a su labor.\n\nLa garantía comprende la revisión y el ajuste de los entregables cuando se presenten cambios relevantes en el contexto técnico de {{cliente}} dentro del término pactado, siempre que no impliquen un nuevo levantamiento de información ni la ampliación del alcance.\n\nLa garantía no cubre: la implementación de las recomendaciones; los resultados derivados de decisiones adoptadas contra las recomendaciones de {{contratista}}; los cambios normativos, de plataforma o de proveedor posteriores a la entrega; ni la actualización de los análisis por nuevas funcionalidades desarrolladas después del cierre de la consultoría.\n\nVencido el término de garantía, cualquier actualización, ampliación o acompañamiento adicional se atenderá mediante un nuevo contrato o por horas a la tarifa vigente de {{contratista}}.";

const CO_CAMBIOS =
  "Toda ampliación del alcance, nuevo análisis, revisión adicional o acompañamiento no previsto deberá solicitarse por escrito, indicando el objetivo, la extensión esperada y la fecha requerida.\n\n{{contratista}} evaluará la solicitud dentro de los cinco (5) días hábiles siguientes e informará el impacto en el plazo, en el valor y en la disponibilidad de su equipo. La ejecución requiere aprobación escrita de {{cliente}}.\n\nLos trabajos adicionales se facturarán por horas a la tarifa vigente de {{contratista}} o por precio fijo según la propuesta aprobada, y podrán ampliar el plazo del contrato.\n\nAjustes menores. Las precisiones, correcciones de forma y aclaraciones que no alteren las conclusiones ni el alcance se atenderán dentro del término de garantía sin costo adicional.\n\nLos cambios aprobados se documentarán en el expediente del contrato y podrán reflejarse en una nueva versión del documento.";

const CO_TERMINACION =
  "Terminación por mutuo acuerdo. Las partes podrán terminar el contrato en cualquier momento mediante acuerdo escrito, liquidando los trabajos ejecutados y aceptados a la fecha.\n\nTerminación por incumplimiento. Cualquiera de las partes podrá terminar el contrato si la otra incumple gravemente sus obligaciones y no subsana el incumplimiento dentro de los diez (10) días hábiles siguientes al requerimiento escrito.\n\nTerminación por conveniencia. Cualquiera de las partes podrá terminar el contrato sin justa causa avisando por escrito con treinta (30) días calendario de anticipación. {{cliente}} pagará los hitos y trabajos ejecutados hasta la fecha, los costos no reembolsables comprometidos con terceros y un diez por ciento (10%) del valor del hito en curso a título de indemnización.\n\nCláusula penal. El incumplimiento de los plazos de pago o de entrega causará, a favor de la parte cumplida, una sanción equivalente al uno por ciento (1%) del valor del hito incumplido por cada semana de retardo, sin exceder el diez por ciento (10%) del valor total del contrato, sin perjuicio del cobro de los perjuicios que excedan ese monto.\n\nEfectos de la terminación. Terminado el contrato, {{contratista}} entregará los documentos y hallazgos disponibles a la fecha, y {{cliente}} pagará los valores pendientes dentro de los quince (15) días siguientes a la liquidación.";

function consultoriaClauses(): ContractClause[] {
  return [
    clause(1, "c01", "Objeto del contrato", CO_OBJETO, "general", false),
    clause(2, "c02", "Alcance de los servicios", CO_ALCANCE, "tecnico", false),
    clause(3, "c03", "Entregables y criterios de aceptación", CO_ENTREGABLES, "tecnico", false),
    clause(4, "c04", "Exclusiones y servicios no incluidos", CO_EXCLUSIONES, "tecnico", false),
    clause(5, "c05", "Obligaciones del contratista", CO_CONTRATISTA, "general", false),
    clause(6, "c06", "Obligaciones del cliente", CO_CLIENTE, "general", false),
    clause(7, "c07", "Plazo, cronograma e hitos", CO_CRONOGRAMA, "tecnico", false),
    clause(8, "c08", "Valor del contrato y forma de pago", CO_PAGO, "economico", false),
    clause(9, "c09", "Retención en la fuente, IVA y obligaciones tributarias", SHARED_IMPUESTOS, "economico", true),
    clause(10, "c10", "Garantía, soporte y corrección de errores", CO_GARANTIA, "tecnico", false),
    clause(11, "c11", "Propiedad intelectual y cesión de derechos patrimoniales", SHARED_PI, "propiedad", true),
    clause(12, "c12", "Licencias de terceros y componentes open source", SHARED_OPEN_SOURCE, "propiedad", true),
    clause(13, "c13", "Confidencialidad, datos personales y habeas data", SHARED_CONFIDENCIALIDAD, "legal", true),
    clause(14, "c14", "Control de cambios y alcance adicional", CO_CAMBIOS, "general", false),
    clause(15, "c15", "Terminación anticipada, incumplimiento y cláusula penal", CO_TERMINACION, "legal", false),
    clause(16, "c16", "Limitación de responsabilidad", SHARED_LIMITACION, "legal", true),
    clause(17, "c17", "Fuerza mayor o caso fortuito", SHARED_FUERZA_MAYOR, "legal", false),
    clause(18, "c18", "Solución de controversias, ley aplicable y notificaciones", SHARED_CONTROVERSIAS, "legal", true),
  ];
}

/* ------------------------------------------------------------------ *
 * Plantilla 4 — Mantenimiento y Evolución Mensual
 * ------------------------------------------------------------------ */

const ME_OBJETO =
  "{{contratista}}, profesional independiente en ingeniería de software y arquitectura digital, y {{cliente}} celebran el presente contrato de prestación de servicios de mantenimiento y evolución de software, de tracto sucesivo y prestaciones periódicas, sobre los sistemas y aplicaciones inventariados en el anexo técnico.\n\nDatos de la parte contratante: {{cliente}}, {{empresa}}, con documento de identidad o NIT {{doc_id}}, correo electrónico {{email_cliente}} y domicilio en {{ciudad}}.\n\nEl servicio comprende una bolsa mensual de horas de ingeniería para mantenimiento correctivo, adaptativo, perfectivo y evolutivo, así como la atención de incidentes conforme a los niveles de servicio objetivo pactados.\n\nEl contrato se celebra por el término de {{plazo}}, contado desde el {{fecha_inicio}} hasta el {{fecha_fin}}, y se prorrogará automáticamente por períodos iguales salvo que cualquiera de las partes manifieste por escrito su voluntad de no prorrogar con al menos quince (15) días calendario de anticipación.\n\n{{contratista}} actúa como contratista independiente, con autonomía técnica y administrativa, sin que exista relación laboral con {{cliente}} ni con los usuarios finales de los sistemas.";

const ME_ALCANCE =
  "El alcance del servicio es el siguiente: {{alcance}}\n\nLa bolsa incluye hasta cuarenta (40) horas mensuales de trabajo de ingeniería, que se distribuirán según la priorización acordada en la reunión mensual. Las horas no consumidas en el mes no son acumulables, reembolsables ni canjeables, salvo pacto escrito en contrario.\n\nNiveles de servicio objetivo. Incidente crítico: respuesta en cuatro (4) horas hábiles y solución o mitigación en un (1) día hábil. Incidente alto: respuesta en un (1) día hábil y solución en tres (3) días hábiles. Incidente medio: cinco (5) días hábiles. Incidente bajo: diez (10) días hábiles.\n\nEl servicio se presta de forma remota en horario hábil, de lunes a viernes entre las 8:00 y las 18:00 horas, salvo emergencias autorizadas por escrito.\n\nLas mejoras o nuevos desarrollos que superen ocho (8) horas de trabajo o que modifiquen la arquitectura se cotizarán por separado antes de su ejecución.";

const ME_ENTREGABLES =
  "Los entregables de cada ciclo mensual son los siguientes:\n{{entregables}}\n\nCriterios de aceptación. Cada intervención se entiende aceptada cuando queda desplegada en el ambiente correspondiente, documentada en el ticket y verificada por el responsable designado por {{cliente}}.\n\nInforme mensual. {{contratista}} entregará, dentro de los cinco (5) días hábiles siguientes al cierre de cada ciclo, un informe con las horas consumidas, los tickets atendidos, el estado de los sistemas, los riesgos identificados y las recomendaciones.\n\nSilencio positivo. Si {{cliente}} no formula observaciones dentro de los cinco (5) días hábiles siguientes a la entrega del informe, este se tendrá por aceptado.";

const ME_EXCLUSIONES =
  "No forman parte del alcance ni del valor mensual:\n{{exclusiones}}\n\nEl inventario de sistemas, versiones, repositorios, ambientes y responsables forma parte integral de este contrato como anexo técnico. Cualquier sistema no inventariado se incorporará mediante acta de cambio.\n\n{{contratista}} no asume obligación de resultado sobre sistemas desarrollados por terceros, sobre componentes sin documentación ni sobre software que haya alcanzado el fin de su vida útil, casos en los que podrá recomendar su reemplazo o modernización.";

const ME_CONTRATISTA =
  "{{contratista}} se obliga a: (i) prestar el servicio con personal idóneo y con la diligencia técnica propia de su actividad; (ii) atender los incidentes dentro de los niveles de servicio objetivo; (iii) documentar cada intervención en el sistema de tickets; (iv) informar oportunamente los riesgos, las dependencias y los bloqueos; (v) mantener actualizado el inventario técnico; y (vi) entregar el informe mensual.\n\n{{contratista}} dispondrá un canal único de atención y mantendrá registro de todas las solicitudes, con su severidad, tiempo de respuesta y tiempo de solución, para efectos de seguimiento y auditoría.\n\n{{contratista}} podrá utilizar herramientas de monitoreo, automatización y agentes de inteligencia artificial para la atención y clasificación de incidentes, sin que ello lo exima de la responsabilidad sobre el resultado del servicio.\n\n{{contratista}} no responderá por fallas en infraestructura, conectividad o servicios de terceros que no estén bajo su administración, ni por las modificaciones que {{cliente}} o terceros realicen sobre los sistemas intervenidos.";

const ME_CLIENTE =
  "{{cliente}} se obliga a: (i) pagar la mensualidad de forma anticipada; (ii) reportar los incidentes por el canal único dispuesto y con la información suficiente para su reproducción; (iii) mantener vigentes las licencias, los servicios de nube, los dominios y los certificados; (iv) mantener respaldos verificados de su información; y (v) designar un responsable del contrato con capacidad de decisión y de priorización.\n\n{{cliente}} se abstendrá de modificar los sistemas, las bases de datos o las configuraciones intervenidas sin informar previamente a {{contratista}}, y responderá por los efectos de dichas modificaciones.\n\n{{cliente}} autorizará los accesos necesarios con los permisos mínimos requeridos, los mantendrá vigentes durante la ejecución del contrato y los revocará a su terminación.\n\nLa falta de pago de la mensualidad faculta a {{contratista}} para suspender el servicio previo aviso de cinco (5) días hábiles, sin que ello genere responsabilidad a su cargo.";

const ME_CRONOGRAMA =
  "El plazo es de {{plazo}}, contado desde el {{fecha_inicio}} y con terminación el {{fecha_fin}}. El contrato se ejecuta por ciclos mensuales que inician el primer día calendario de cada mes.\n\nDistribución del ciclo. Durante los primeros cinco (5) días hábiles se realiza la reunión de priorización del backlog; durante las semanas siguientes se ejecutan las intervenciones; y al cierre se entrega el informe mensual y se verifica el consumo de horas.\n\nSuspensiones. Los plazos y los niveles de servicio se suspenden por la mora de {{cliente}} en el pago o en el suministro de accesos e información, por los cambios de alcance aprobados y por caso fortuito o fuerza mayor.\n\nReuniones. Se realizará una reunión mensual de seguimiento y una reunión semanal breve de coordinación operativa, ambas por medios virtuales, con acta de compromisos.";

const ME_PAGO =
  "El valor mensual del servicio es de {{valor}} ({{valor_letras}}), suma que no incluye IVA ni los costos de terceros señalados en las exclusiones, y que se pagará dentro de cada ciclo así: cuarenta por ciento (40%) como anticipo al inicio del mes; treinta por ciento (30%) contra el informe de avance quincenal; y treinta por ciento (30%) contra el informe de cierre del ciclo.\n\nLas facturas se radicarán por vía electrónica y se pagarán dentro de los diez (10) días calendario siguientes a su aceptación. El anticipo debe estar recibido antes de iniciar las labores del ciclo.\n\nMora en el pago. El retardo superior a diez (10) días calendario causará intereses moratorios a la tasa máxima legal permitida y facultará a {{contratista}} para suspender el servicio.\n\nReajuste anual. El valor mensual se reajustará anualmente en el porcentaje del índice de precios al consumidor (IPC) certificado por el DANE, o en el porcentaje que las partes acuerden por escrito.\n\nTrabajos adicionales. Las horas que excedan la bolsa mensual se facturarán a la tarifa por hora vigente de {{contratista}}, previa autorización escrita de {{cliente}}.";

const ME_GARANTIA =
  "{{contratista}} garantiza las correcciones, los ajustes y los desarrollos entregados bajo este contrato por un término de {{garantia}} contados a partir de la puesta en producción de cada intervención.\n\nDurante ese término {{contratista}} corregirá sin costo, dentro de la bolsa mensual vigente, los defectos reproducibles imputables a su trabajo. Si el contrato no se encontrare vigente, la corrección se atenderá bajo las condiciones de un nuevo ciclo o mediante cotización.\n\nLa garantía no cubre: nuevas funcionalidades o cambios de alcance; fallas derivadas de modificaciones realizadas por {{cliente}} o por terceros; actualizaciones de plataformas, librerías o servicios de terceros; problemas de infraestructura, conectividad, licencias o consumos; ni la pérdida de información por fallas en los respaldos de {{cliente}}.\n\nLos tiempos de atención de la garantía se computan dentro de los niveles de servicio objetivo y no suspenden el consumo de la bolsa de horas cuando la causa sea ajena a {{contratista}}.";

const ME_CAMBIOS =
  "Toda solicitud de cambio, mejora o nuevo desarrollo se registrará como ticket o solicitud escrita con su descripción, prioridad y resultado esperado.\n\n{{contratista}} estimará el esfuerzo en horas o en valor fijo dentro de los tres (3) días hábiles siguientes. El trabajo solo se ejecutará cuando {{cliente}} apruebe la estimación por escrito y exista disponibilidad en la bolsa de horas o autorización de horas adicionales.\n\nCuando las solicitudes pendientes excedan la capacidad mensual contratada, {{contratista}} propondrá un orden de prioridad y {{cliente}} decidirá cuáles se atienden en el ciclo, sin que ello genere incumplimiento.\n\nAjustes menores. Las correcciones de texto, los ajustes de estilo, las configuraciones y los cambios que no alteren la arquitectura y no superen dos (2) horas de trabajo se atenderán dentro de la bolsa sin trámite de cambio.\n\nLos cambios aprobados se documentarán en el expediente del contrato y podrán reflejarse en una nueva versión del documento.";

const ME_TERMINACION =
  "Terminación por mutuo acuerdo. Las partes podrán terminar el contrato en cualquier momento mediante acuerdo escrito, liquidando el ciclo en curso a prorrata de las horas ejecutadas.\n\nTerminación por incumplimiento. Cualquiera de las partes podrá terminar el contrato si la otra incumple gravemente sus obligaciones y no subsana el incumplimiento dentro de los diez (10) días hábiles siguientes al requerimiento escrito. Se consideran incumplimientos graves la falta de pago de una mensualidad, el uso no autorizado de los entregables y la violación de la confidencialidad.\n\nTerminación sin justa causa. Cualquiera de las partes podrá terminar el contrato sin justa causa avisando por escrito con treinta (30) días calendario de anticipación; no habrá lugar a indemnización cuando el aviso se dé en ese término.\n\nCláusula penal. El incumplimiento de las obligaciones de pago o de los niveles de servicio causará, a favor de la parte cumplida, una sanción equivalente al uno por ciento (1%) del valor mensual por cada semana de retardo, sin exceder el diez por ciento (10%) del valor del ciclo incumplido, sin perjuicio del cobro de los perjuicios que excedan ese monto.\n\nEfectos de la terminación. {{contratista}} entregará el estado de los tickets abiertos, la documentación y las credenciales, y {{cliente}} pagará las horas ejecutadas y los valores pendientes dentro de los quince (15) días siguientes a la liquidación.";

function mantenimientoClauses(): ContractClause[] {
  return [
    clause(1, "c01", "Objeto del contrato", ME_OBJETO, "general", false),
    clause(2, "c02", "Alcance de los servicios", ME_ALCANCE, "tecnico", false),
    clause(3, "c03", "Entregables y criterios de aceptación", ME_ENTREGABLES, "tecnico", false),
    clause(4, "c04", "Exclusiones y servicios no incluidos", ME_EXCLUSIONES, "tecnico", false),
    clause(5, "c05", "Obligaciones del contratista", ME_CONTRATISTA, "general", false),
    clause(6, "c06", "Obligaciones del cliente", ME_CLIENTE, "general", false),
    clause(7, "c07", "Plazo, cronograma e hitos", ME_CRONOGRAMA, "tecnico", false),
    clause(8, "c08", "Valor del contrato y forma de pago", ME_PAGO, "economico", false),
    clause(9, "c09", "Retención en la fuente, IVA y obligaciones tributarias", SHARED_IMPUESTOS, "economico", true),
    clause(10, "c10", "Garantía, soporte y corrección de errores", ME_GARANTIA, "tecnico", false),
    clause(11, "c11", "Propiedad intelectual y cesión de derechos patrimoniales", SHARED_PI, "propiedad", true),
    clause(12, "c12", "Licencias de terceros y componentes open source", SHARED_OPEN_SOURCE, "propiedad", true),
    clause(13, "c13", "Confidencialidad, datos personales y habeas data", SHARED_CONFIDENCIALIDAD, "legal", true),
    clause(14, "c14", "Control de cambios y alcance adicional", ME_CAMBIOS, "general", false),
    clause(15, "c15", "Terminación anticipada, incumplimiento y cláusula penal", ME_TERMINACION, "legal", false),
    clause(16, "c16", "Limitación de responsabilidad", SHARED_LIMITACION, "legal", true),
    clause(17, "c17", "Fuerza mayor o caso fortuito", SHARED_FUERZA_MAYOR, "legal", false),
    clause(18, "c18", "Solución de controversias, ley aplicable y notificaciones", SHARED_CONTROVERSIAS, "legal", true),
  ];
}

/* ------------------------------------------------------------------ *
 * Catálogo exportado
 * ------------------------------------------------------------------ */

/** Catálogo completo de plantillas de contrato de Jhoiker Zambrano. */
export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "tpl-desarrollo-web",
    slug: "desarrollo-web",
    name: "Desarrollo Web a Medida",
    description:
      "Diseño, desarrollo, pruebas y despliegue de un sitio web a medida con panel administrativo, integraciones, optimización de rendimiento y capacitación. Precio fijo global con pagos por hitos.",
    category: "Desarrollo Web",
    base_price: 4500000,
    duration_days: 45,
    warranty_days: 90,
    deliverables: [
      "Documento de alcance funcional y arquitectura de información aprobado.",
      "Diseño UI/UX responsivo en Figma para las plantillas principales, hasta ocho (8) pantallas únicas.",
      "Implementación del frontend en Next.js 15 con TypeScript y Tailwind CSS.",
      "Backend, API, modelo de datos y panel administrativo con autenticación.",
      "Integración con hasta tres (3) servicios externos: pasarela de pago, CRM, analítica o correo.",
      "Optimización de rendimiento (Core Web Vitals) y SEO técnico básico.",
      "Despliegue en producción con dominio, certificado SSL y variables de entorno configuradas.",
      "Manual de uso, credenciales de acceso y capacitación virtual de dos (2) horas con grabación.",
      "Repositorio Git con historial de cambios y README técnico.",
    ],
    exclusions: [
      "Redacción, traducción y licenciamiento de contenidos, textos e imágenes.",
      "Sesiones fotográficas, ilustraciones o piezas gráficas originales no descritas en el alcance.",
      "Costos de dominios, hosting, licencias de software propietario, planes de nube y pasarelas de pago.",
      "Migración de datos históricos desde sistemas anteriores.",
      "Aplicaciones móviles nativas para iOS o Android.",
      "Soporte y mantenimiento posteriores al período de garantía.",
      "Consultoría legal, tributaria o de propiedad intelectual sobre el negocio del Cliente.",
      "Funcionalidades no listadas en los entregables, que se atenderán como control de cambios.",
    ],
    clauses: desarrolloWebClauses(),
    payment_plan: planWithAmounts(4500000, PLAN_DESARROLLO_WEB),
    active: true,
    sort_order: 1,
    created_at: TEMPLATE_CREATED_AT,
  },
  {
    id: "tpl-automatizacion-procesos",
    slug: "automatizacion-procesos",
    name: "Automatización de Procesos",
    description:
      "Diagnóstico de procesos, diseño de flujos, construcción y puesta en producción de automatizaciones que conectan las herramientas del cliente, eliminan tareas manuales repetitivas y reducen errores operativos.",
    category: "Automatización",
    base_price: 6000000,
    duration_days: 30,
    warranty_days: 60,
    deliverables: [
      "Diagnóstico de procesos y matriz de oportunidades de automatización priorizada.",
      "Diseño del flujo objetivo (BPMN o diagrama equivalente) aprobado por el Cliente.",
      "Automatización de hasta tres (3) procesos, cada uno con hasta ocho (8) pasos o reglas de negocio.",
      "Integración con hasta cuatro (4) herramientas mediante API, webhooks o conectores.",
      "Panel de monitoreo con registro de ejecuciones, errores y alertas de falla.",
      "Manejo de excepciones, reintentos y notificaciones al responsable del proceso.",
      "Documentación funcional y técnica, diccionario de datos y matriz de credenciales.",
      "Capacitación virtual de tres (3) horas al equipo del Cliente, con grabación.",
      "Puesta en producción y acompañamiento durante los primeros quince (15) días.",
    ],
    exclusions: [
      "Licencias, planes y consumos de las plataformas de automatización utilizadas.",
      "Cambios en el core, la base de datos o el código de los sistemas del Cliente o de sus proveedores.",
      "Compra, configuración o soporte de hardware, servidores, redes o equipos de cómputo.",
      "Migración, depuración o carga masiva de datos históricos.",
      "Desarrollo de aplicaciones móviles o software a medida no descrito en los entregables.",
      "Procesos que dependan de sistemas sin API, sin exportación de datos ni acceso autorizado.",
      "Modelos de inteligencia artificial entrenados con datos propios del Cliente.",
      "Auditoría de seguridad informática, pruebas de penetración o cumplimiento normativo sectorial.",
    ],
    clauses: automatizacionClauses(),
    payment_plan: planWithAmounts(6000000, PLAN_AUTOMATIZACION),
    active: true,
    sort_order: 2,
    created_at: TEMPLATE_CREATED_AT,
  },
  {
    id: "tpl-consultoria-arquitectura",
    slug: "consultoria-arquitectura",
    name: "Consultoría y Arquitectura Digital",
    description:
      "Diagnóstico técnico del estado actual, definición de la arquitectura objetivo, plan de modernización, modelo de gobierno técnico y acompañamiento a los equipos del cliente mediante sesiones de mentoría.",
    category: "Consultoría",
    base_price: 12000000,
    duration_days: 90,
    warranty_days: 120,
    deliverables: [
      "Diagnóstico técnico y funcional del estado actual: código, infraestructura, procesos y equipo.",
      "Informe de hallazgos con riesgos, deuda técnica priorizada y oportunidades de mejora inmediata.",
      "Documento de arquitectura objetivo (modelo C4 o equivalente) con decisiones y registros ADR.",
      "Modelo de datos, mapa de integraciones y estrategia de APIs.",
      "Hoja de ruta de modernización por fases con estimación de esfuerzo y costo.",
      "Plan de calidad, seguridad, observabilidad y DevOps.",
      "Modelo de gobierno técnico, roles y métricas de ingeniería (DORA).",
      "Hasta seis (6) sesiones de acompañamiento o mentoría con el equipo del Cliente.",
      "Presentación ejecutiva para el comité directivo del Cliente.",
    ],
    exclusions: [
      "Implementación, codificación y despliegue de las soluciones recomendadas, que requiere contrato aparte.",
      "Licenciamiento de herramientas de arquitectura, monitoreo, nube o seguridad.",
      "Auditoría de seguridad ofensiva, pruebas de penetración o análisis forense.",
      "Certificaciones, acreditaciones o trámites regulatorios ante entidades públicas.",
      "Soporte técnico de sistemas en producción durante la consultoría.",
      "Migración de datos, reescritura de software o contratación de personal para el Cliente.",
      "Conceptos legales, tributarios o laborales sobre la operación del Cliente.",
      "Capacitación formal certificable distinta de las sesiones de acompañamiento pactadas.",
    ],
    clauses: consultoriaClauses(),
    payment_plan: planWithAmounts(12000000, PLAN_CONSULTORIA),
    active: true,
    sort_order: 3,
    created_at: TEMPLATE_CREATED_AT,
  },
  {
    id: "tpl-mantenimiento-evolutivo",
    slug: "mantenimiento-evolutivo",
    name: "Mantenimiento y Evolución Mensual",
    description:
      "Bolsa mensual de horas de ingeniería para mantenimiento correctivo, adaptativo, perfectivo y evolutivo de los sistemas existentes, con atención de incidentes por niveles de servicio, monitoreo, respaldos e informes mensuales.",
    category: "Mantenimiento",
    base_price: 1800000,
    duration_days: 30,
    warranty_days: 30,
    deliverables: [
      "Bolsa de cuarenta (40) horas mensuales de ingeniería para mantenimiento y mejoras menores.",
      "Atención de incidentes con tiempos objetivo según severidad: crítica 4 horas, alta 1 día, media 3 días y baja 5 días hábiles.",
      "Corrección de errores y ajustes menores sobre las funcionalidades existentes.",
      "Actualizaciones de seguridad y de dependencias críticas.",
      "Monitoreo básico de disponibilidad, errores y rendimiento.",
      "Respaldos verificados y plan de recuperación documentado.",
      "Informe mensual de horas consumidas, incidentes atendidos y recomendaciones.",
      "Reunión mensual de seguimiento y priorización del backlog.",
      "Canal único de reporte de incidentes con registro y trazabilidad de tickets.",
    ],
    exclusions: [
      "Nuevos desarrollos, módulos o funcionalidades que superen ocho (8) horas de trabajo, que se cotizan aparte.",
      "Horas no consumidas en el mes, que no son acumulables ni reembolsables salvo pacto escrito.",
      "Costos de infraestructura, licencias, dominios, certificados y consumos de nube.",
      "Soporte a sistemas, módulos o integraciones no inventariados en el anexo técnico.",
      "Atención en horario nocturno, dominical o festivo, salvo emergencias acordadas por escrito.",
      "Recuperación de datos perdidos por causas ajenas al servicio o por falta de respaldos.",
      "Migraciones de plataforma, reescritura de software o cambios de proveedor.",
      "Soporte presencial en sitio fuera de la ciudad de {{ciudad}}.",
    ],
    clauses: mantenimientoClauses(),
    payment_plan: planWithAmounts(1800000, PLAN_MANTENIMIENTO),
    active: true,
    sort_order: 4,
    created_at: TEMPLATE_CREATED_AT,
  },
];

/** Busca una plantilla por su slug. */
export function getTemplate(slug: string): ContractTemplate | undefined {
  return CONTRACT_TEMPLATES.find((template) => template.slug === slug);
}

/** Alias de `getTemplate` para lecturas más explícitas. */
export const getTemplateBySlug = getTemplate;
