# 🔐 TUS ACCESOS — Jhoiker Zambrano

> **Este archivo está excluido de Git y NO se publica.**
> Guárdalo en un gestor de contraseñas y luego puedes borrarlo.

---

## 🌐 Tus enlaces públicos

| Qué | Dirección |
|---|---|
| **Tu web** | https://jhoiker-zambrano-portfolio.vercel.app |
| **Tu panel privado** | https://jhoiker-zambrano-portfolio.vercel.app/acceso |
| **Tu repositorio** | https://github.com/jhoikerzambrano30j-cloud/jhoiker-zambrano-portfolio |
| **Tu base de datos** | https://supabase.com/dashboard/project/lgjynswvuxhmedffleih |
| **Tu Vercel** | https://vercel.com/jhoiker-zambrano/jhoiker-zambrano-portfolio |

---

## 👤 Tu usuario administrador

```
Correo:      jhoikerzambrano30j@gmail.com
Contraseña:  Jz-4BBZBVMwQZS4bHjh8BWpCA!7
Rol:         admin
```

Entra en **https://jhoiker-zambrano-portfolio.vercel.app/acceso** con esos datos.

> Puedes cambiar la contraseña desde el panel de Supabase:
> **Authentication → Users → tu usuario → Reset password**,
> o volviendo a poner otra en `ADMIN_PASSWORD` del archivo `.env.local`
> y ejecutando `pnpm db:seed`.

---

## 🔑 Tokens que creaste

Estos tokens son **llaves de acceso a tus cuentas**. Como los pegaste en el chat,
**te recomiendo regenerarlos** cuando termines de configurar todo:

| Servicio | Dónde regenerarlo |
|---|---|
| GitHub | https://github.com/settings/tokens |
| Vercel | https://vercel.com/account/tokens |
| Supabase | https://supabase.com/dashboard/account/tokens |

Después de regenerarlos, actualiza las líneas correspondientes en `.env.local`.

---

## ⚙️ Servicios conectados

| Servicio | Identificador |
|---|---|
| Supabase proyecto | `lgjynswvuxhmedffleih` (región `us-east-1`) |
| Vercel proyecto | `prj_kCqp90ZHG2sJy4978O9S1nWUytYW` |
| Vercel equipo | `jhoiker-zambrano` |
| GitHub usuario | `jhoikerzambrano30j-cloud` |
| GitHub repositorio | `jhoiker-zambrano-portfolio` |

---

## 📝 Cómo publicar cambios en el futuro

```bash
# 1. Haz tus cambios en el código
# 2. Súbelos a GitHub
pnpm push

# 3. Vuelve a desplegar en Vercel
pnpm deploy
```

Si prefieres que Vercel se despliegue **solo** cada vez que subes a GitHub,
actívalo en:
**Vercel → tu proyecto → Settings → Git → Connect Git Repository**

---

## 🗄️ Qué hay en tu base de datos

| Tabla | Registros | Quién puede verla |
|---|---|---|
| `projects` | 6 | Público (solo publicados) |
| `services` | 4 | Público (solo activos) |
| `skill_groups` | 5 | Público |
| `automations` | 4 | Público (solo activas) |
| `contract_templates` | 3 | Público (solo activas) |
| `contracts` | 1 | **Solo tú** |
| `leads` | 2 | **Solo tú** (el público puede escribir, no leer) |
| `site_settings` | 6 | **Solo tú** |
| `profiles` | 1 | Cada uno el suyo; tú todos |
| `audit_log` | 0 | **Solo tú** |

---

## 📄 Plantillas de contrato disponibles

En **Panel → Contratos → Nuevo contrato**:

| Plantilla | Cláusulas | Precio base | Plazo | Garantía |
|---|---|---|---|---|
| Desarrollo Web a Medida | 18 | $4.500.000 | 45 días | 90 días |
| Automatización de Procesos | 18 | $6.000.000 | 30 días | 60 días |
| Consultoría y Arquitectura Digital | 18 | $12.000.000 | 90 días | 120 días |
| Mantenimiento y Evolución Mensual | 18 | $1.800.000 | 30 días | 30 días |

**72 cláusulas en total.** Cada plantilla tiene 6 cláusulas bloqueadas
(propiedad intelectual, confidencialidad y Ley 1581, licencias, impuestos,
limitación de responsabilidad y ley aplicable) que el sistema no permite editar.
