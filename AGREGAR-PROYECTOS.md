# 📸 Cómo agregar tus proyectos con fotos y enlaces

Ya puedes hacerlo tú mismo, sin tocar código y sin ayuda de nadie.
Esta guía es para ti.

---

## Entrar a tu panel

1. Abre **https://jhoiker-zambrano-portfolio.vercel.app/acceso**
2. Escribe tu correo y tu contraseña
3. En el menú de la izquierda, elige **Proyectos**

> Tu correo y contraseña están en `TUS-ACCESOS.md`.

---

## Las 4 cosas que puedes ponerle a un proyecto

### 1️⃣ La información básica

| Campo | Para qué sirve |
|---|---|
| **Título** | El nombre del proyecto |
| **Slug** | La dirección web. Déjalo vacío y se genera solo desde el título |
| **Categoría** | Web · E-commerce · Data · Arquitectura · Infraestructura · App |
| **Estado** | `publicado` lo muestra en la web · `borrador` lo guarda sin publicar · `archivado` lo retira |
| **Resumen** | Una o dos frases. Es lo que se ve en la tarjeta del portafolio |
| **Descripción** | El caso completo. Separa los párrafos con una línea en blanco |
| **Año**, **Cliente**, **Mi rol** | Datos de la ficha técnica |
| **Stack** | Una tecnología por línea |
| **Etiquetas** | Una por línea, sin el `#` |
| **Destacar en la página de inicio** | Lo pone en la portada |

### 2️⃣ Las fotos — esto es nuevo

En el formulario verás dos bloques:

**Imagen de portada**
Es la imagen grande que encabeza el proyecto y la que aparece en la tarjeta del portafolio.

Tienes dos formas de ponerla, con los botones **Subir** y **Enlace**:

- **Subir** → pulsa «Elegir imagen» y selecciona un archivo de tu computador. Se sube sola y ves la vista previa al instante.
- **Enlace** → si la imagen ya está publicada en otro sitio, pega su dirección web.

**Galería de imágenes**
Aquí puedes subir **varias fotos a la vez**. Se muestran en el proyecto con su numeración.

- Pasa el cursor sobre una imagen: aparecen **←** **→** para cambiarle el orden y **✕** para quitarla.

**Si no subes ninguna foto**, el sistema genera automáticamente un visual geométrico con tu isotipo `[ J Z ]` en el color de la categoría. **No queda vacío ni se ve roto.**

### 3️⃣ Los enlaces de acceso

| Campo | Qué poner |
|---|---|
| **URL en vivo** | El enlace al sitio funcionando, por ejemplo `https://midominio.com` |
| **URL del repositorio** | El enlace a GitHub, por ejemplo `https://github.com/usuario/proyecto` |

Si los dejas vacíos, esos botones simplemente no aparecen. Si los pones, el proyecto muestra los botones **«Ver en vivo»** y **«Repositorio»**.

### 4️⃣ Las métricas

En el panel todavía **no hay un campo para las métricas** (los números tipo «-68% en tiempo de check-in»). Si quieres añadirlas, pídeme que agregue ese campo al formulario: es un cambio de unos minutos.

---

## 📐 Cómo deben ser las fotos

| | |
|---|---|
| **Formatos** | JPG, PNG, WebP, AVIF o GIF |
| **Peso máximo** | 5 MB por imagen |
| **Portada — tamaño ideal** | 1600 × 1000 px (proporción 16:10) |
| **Galería — tamaño ideal** | 1600 × 1000 px |
| **Recomendación** | Si una foto pesa más de 500 KB, comprímela antes en [squoosh.app](https://squoosh.app) — es gratis y no necesita registro |

> El sistema las optimiza y las sirve en el formato más liviano que entienda el navegador del visitante, así que tu web no se pondrá lenta.

---

## Paso a paso: agregar un proyecto nuevo

1. Entra a **Panel → Proyectos**
2. Pulsa **«Nuevo proyecto»** (arriba a la derecha)
3. Se abre el formulario a la derecha de la pantalla
4. Rellena **Título**, **Resumen** y **Descripción**
5. Elige **Categoría** y pon el estado en **borrador** mientras lo preparas
6. En **Imagen de portada**, pulsa «Elegir imagen» y sube tu foto
7. En **Galería de imágenes**, pulsa «Añadir imágenes» y sube las que quieras
8. Pega la **URL en vivo** y la **URL del repositorio**
9. Cuando esté listo, cambia el estado a **publicado**
10. Pulsa **Guardar**

Aparecerá en tu web en segundos.

---

## Para editar o borrar un proyecto

- **Editar:** pulsa el **lápiz** en la tarjeta del proyecto
- **Destacar:** pulsa la **estrella** (lo pone o lo quita de la portada)
- **Eliminar:** pulsa la **papelera**. Te pedirá confirmación antes de borrar

---

## Preguntas rápidas

**¿Puedo subir fotos desde el celular?**
Sí. La cámara del teléfono guarda en JPG, que está permitido. Si la foto pesa más de 5 MB, el sistema te avisa y no la sube.

**¿Las fotos quedan guardadas en mi Supabase?**
Sí, en un espacio llamado `project-images`. Está configurado para que **cualquiera pueda verlas** (son parte de tu web) pero **solo tú puedas subir, cambiar o borrar**. Lo verifiqué: sin tu sesión, la subida se rechaza.

**¿Qué pasa si borro un proyecto?**
Se borra el proyecto, pero **las fotos quedan** en el almacenamiento. Si quieres borrarlas también, pídemelo.

**¿Cuántas fotos puedo subir?**
No hay un límite definido. Con 4 o 5 por proyecto vas bien: más que eso nadie las mira.

**¿Puedo poner un video?**
Todavía no, solo imágenes. Si lo necesitas, se puede agregar.

---

## Si algo no funciona

1. Recarga la página con `Ctrl + F5`
2. Verifica que la imagen pese menos de 5 MB y sea JPG, PNG, WebP, AVIF o GIF
3. Si el mensaje de error menciona «sesión» o «permiso», cierra sesión y vuelve a entrar
4. Si sigue fallando, dime qué hiciste y qué mensaje apareció

---

**Resumen:** entra a `/acceso` → **Proyectos** → **Nuevo proyecto**. Rellena los datos, sube las fotos con el botón, pega los enlaces y guarda. Nada más.
