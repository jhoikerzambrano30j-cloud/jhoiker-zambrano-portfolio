# ✅ YA ESTÁ EN MARCHA

**No tienes que hacer nada más. Tu web está publicada y funcionando.**

---

## 🌐 Tus enlaces

| Qué | Dirección |
|---|---|
| **Tu web** | **https://jhoiker-zambrano-portfolio.vercel.app** |
| **Tu panel privado** | https://jhoiker-zambrano-portfolio.vercel.app/acceso |
| **Tu repositorio** | https://github.com/jhoikerzambrano30j-cloud/jhoiker-zambrano-portfolio |
| **Tu base de datos** | https://supabase.com/dashboard/project/lgjynswvuxhmedffleih |

## 👤 Entra a tu panel

```
Correo:      jhoikerzambrano30j@gmail.com
Contraseña:  Jz-4BBZBVMwQZS4bHjh8BWpCA!7
```

Los accesos completos y los tokens están en **`TUS-ACCESOS.md`**
(ese archivo no se publica en internet).

---

## ¿Qué está funcionando ya?

- ✅ La web pública, con tus 6 proyectos, 4 servicios, 4 automatizaciones y tu
  manual de marca, leyendo datos reales de tu base de datos
- ✅ El panel privado con tu usuario administrador
- ✅ La base de datos con las 10 tablas y la seguridad activada
- ✅ El módulo de contratos con las 4 plantillas y 72 cláusulas
- ✅ El repositorio en GitHub con todo el código

---

## Para cambiar cosas en el futuro

### Opción A — desde tu panel (lo más fácil)

Entra a **/acceso** y desde ahí puedes editar proyectos, servicios,
automatizaciones, leads, contratos y los ajustes del sitio. Los cambios se ven
en la web al instante. **No necesitas tocar código.**

### Opción B — desde el código

```bash
pnpm dev      # probar en tu computador (http://localhost:3000)
pnpm push     # subir los cambios a GitHub
pnpm deploy   # publicarlos en internet
```

### Que Vercel publique automáticamente

Si quieres que cada `pnpm push` publique solo, actívalo una vez en:

**Vercel → tu proyecto → Settings → Git → Connect Git Repository**

---

## ⚠️ Importante: regenera tus tokens

Los tres tokens (GitHub, Vercel y Supabase) los pegaste en un chat, así que
quedaron escritos en el historial. **Te recomiendo regenerarlos** ahora que ya
está todo configurado:

| Servicio | Dónde |
|---|---|
| GitHub | https://github.com/settings/tokens |
| Vercel | https://vercel.com/account/tokens |
| Supabase | https://supabase.com/dashboard/account/tokens |

Después actualiza esas líneas en el archivo `.env.local` y listo.

> La web seguirá funcionando aunque los regeneres: las variables que usa en
> producción ya están guardadas en Vercel y no dependen de esos tokens.

---

## Dominio propio (opcional)

Si quieres usar algo como `jhoikerzambrano.com`:

1. Compra el dominio donde prefieras.
2. En **Vercel → tu proyecto → Settings → Domains → Add**, escribe tu dominio.
3. Vercel te dirá qué registros DNS configurar en tu proveedor.
4. Cuando propague (unos minutos), actualiza `NEXT_PUBLIC_SITE_URL` en Vercel
   con el nuevo dominio y vuelve a desplegar.

---

## Si algo se rompe

```bash
pnpm check       # 91 comprobaciones del proyecto
pnpm typecheck   # errores de tipos
pnpm db:check    # valida el SQL sin ejecutarlo
pnpm build       # comprueba que compila
```

Y siempre puedes volver a desplegar la última versión que funcionaba desde
**Vercel → Deployments → los tres puntos → Promote to Production**.
