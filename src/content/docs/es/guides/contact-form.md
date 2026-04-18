---
title: Formulario de Contacto
description: Configura el formulario de contacto para enviar emails — elige entre Netlify Forms, Formspree, FormSubmit o una ruta API personalizada con Resend.
---

El formulario de contacto se controla completamente desde **`src/config/contact.ts`**. No es necesario tocar el código del componente — elige un backend, añade una credencial y las respuestas empezarán a llegar a tu bandeja de entrada.

---

## Backends de un vistazo

| Backend | Coste | Configuración | Ideal para |
|---------|-------|---------------|------------|
| Netlify Forms | Gratis (100 envíos/mes) | Ninguna — solo despliega | Sitios en Netlify |
| Formspree | Gratis (50 envíos/mes) | Crea cuenta, pega el ID | Cualquier host |
| FormSubmit | Gratis, ilimitado | Pega tu email | Configuración rápida, cualquier host |
| Ruta API personalizada (Resend) | Pago por uso | Crea endpoint + API key | Control total, cualquier host |

---

## Opción 1 — Netlify Forms (predeterminado)

No se necesitan cambios en el código. Netlify detecta el atributo `data-netlify="true"` durante la compilación y configura el flujo de envíos automáticamente.

**Qué hacer:**

1. Despliega el sitio en Netlify — no se necesita ninguna configuración adicional.
2. Tras el primer despliegue, ve a **Netlify Dashboard → tu sitio → Forms**.
3. Tu formulario (`contact`) aparece allí automáticamente.
4. Activa las notificaciones por email: **Forms → contact → Form notifications → Add notification → Email notification**.

**Límite de envíos:** El plan gratuito permite 100 envíos al mes. Actualiza tu plan en la configuración de facturación de Netlify si necesitas más.

```ts
// src/config/contact.ts
export const CONTACT_FORM = {
  backend: "netlify",
  formName: "contact",   // coincide con el nombre que aparece en el panel de Netlify
  // ...
};
```

:::note
Netlify Forms solo funciona cuando se despliega en Netlify. No funcionará con Vercel, Cloudflare Pages o en desarrollo local.
:::

---

## Opción 2 — Formspree

[Formspree](https://formspree.io) envía los envíos directamente a tu email y ofrece un panel con filtrado de spam y exportación.

**Configuración:**

1. Regístrate en formspree.io y crea un nuevo formulario.
2. Copia el ID del formulario desde la URL del endpoint — tiene este aspecto: `xpznkrjb`.
3. Actualiza `src/config/contact.ts`:

```ts
export const CONTACT_FORM = {
  backend: "formspree",
  formspreeId: "xpznkrjb",   // ← tu ID de formulario aquí
  // ...
};
```

Formspree gestiona CORS y el filtrado de spam por ti. El plan gratuito permite 50 envíos al mes; los planes de pago comienzan en $10/mes para 1.000 envíos.

---

## Opción 3 — FormSubmit

[FormSubmit](https://formsubmit.co) es un servicio gratuito sin registro. Los envíos se reenvían por email directamente a la dirección que configures.

**Configuración:**

1. Actualiza `src/config/contact.ts` con tu email:

```ts
export const CONTACT_FORM = {
  backend: "formsubmit",
  formsubmitEmail: "hola@tudominio.com",   // ← tu email aquí
  // ...
};
```

2. Despliega el sitio y envía el formulario una vez. FormSubmit enviará un **email de confirmación** a tu dirección — haz clic en el enlace para activarlo.

Tras la activación, todos los envíos se reenviarán a tu email automáticamente. No hay límite de envíos en el plan gratuito.

:::tip
FormSubmit añade su propio reCAPTCHA por defecto. La plantilla lo desactiva (`_captcha: false`) y usa el campo honeypot en su lugar — menos fricción para los usuarios y sin dependencia de Google.
:::

---

## Opción 4 — Ruta API personalizada con Resend

Para control total — plantillas de email personalizadas, CC/CCO, registros — crea un endpoint de servidor en Astro que llame a la API de [Resend](https://resend.com). Funciona en cualquier host que admita renderizado del lado del servidor (Vercel, Cloudflare Workers, Node.js).

### 1. Instala Resend y añade un adaptador SSR

```bash
pnpm add resend
pnpm add @astrojs/vercel   # o @astrojs/cloudflare / @astrojs/node
```

Actualiza `astro.config.mjs` para añadir el adaptador:

```ts
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "hybrid",      // estático por defecto, servidor para rutas API
  adapter: vercel(),
  // ...
});
```

### 2. Crea el endpoint API

Crea `src/pages/api/contact.ts`:

```ts
import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data    = await request.formData();
  const name    = data.get("name")    as string;
  const email   = data.get("email")   as string;
  const service = data.get("service") as string;
  const message = data.get("message") as string;

  // Validación básica
  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await resend.emails.send({
    from:    "Formulario de Contacto <noreply@tudominio.com>",
    to:      ["hola@tudominio.com"],
    replyTo: email,
    subject: `Nueva consulta de ${name}`,
    html: `
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Servicio:</strong> ${service || "—"}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
```

### 3. Añade tu API key

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

Añade la misma variable en el panel de tu proveedor de hosting (Vercel → Project → Settings → Environment Variables).

### 4. Cambia el formulario al backend `static` y añade un manejador fetch

Establece `backend: "static"` en `src/config/contact.ts`, luego añade un `<script>` a `src/sections/Contact.astro` (o a la página de contacto) que intercepte el evento de envío:

```ts
// src/config/contact.ts
export const CONTACT_FORM = {
  backend: "static",
  // ...
};
```

```astro
<!-- al final de src/sections/Contact.astro -->
<script>
  const form = document.querySelector("form") as HTMLFormElement;

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = form.querySelector("[type=submit]") as HTMLButtonElement;
    button.disabled = true;

    const res  = await fetch("/api/contact", { method: "POST", body: new FormData(form) });
    const json = await res.json();

    if (json.ok) {
      form.reset();
      // Muestra la UI de éxito — p.ej. reemplaza el formulario con un mensaje de agradecimiento
    } else {
      alert("Algo salió mal. Por favor, inténtalo de nuevo.");
    }

    button.disabled = false;
  });
</script>
```

---

## Personalizar los campos del formulario

Todos los campos se activan y etiquetan en `src/config/contact.ts`:

```ts
fields: {
  name:    { enabled: true,  label: "Nombre",    placeholder: "Ana García" },
  email:   { enabled: true,  label: "Email",     placeholder: "ana@ejemplo.com" },
  service: { enabled: true,  label: "Servicio" },
  artist:  { enabled: false, label: "Miembro del equipo preferido" },  // ← desactiva si no es necesario
  message: { enabled: true,  label: "Cuéntanos tu proyecto", placeholder: "...", rows: 4 },
},

showServiceDropdown: true,   // muestra/oculta el <select> de servicio
showArtistDropdown:  false,  // muestra/oculta el <select> de miembro del equipo

services: [
  "Identidad de Marca",
  "Diseño Web",
  "Estrategia UI/UX",
],
```

El **desplegable de artista** se rellena automáticamente con el array `team` de `src/config.ts` — no hay duplicación de datos.

---

## Protección contra spam

El formulario incluye un **campo honeypot** — un campo oculto que los usuarios reales nunca ven. Los bots lo rellenan; los envíos con el honeypot no vacío son descartados por el backend (Netlify/Formspree lo gestionan automáticamente) o puedes comprobarlo manualmente en la ruta API.

```ts
honeypotField: {
  enabled: true,
  name: "bot-field",
},
```

Para comprobarlo en una ruta API personalizada:

```ts
const bot = data.get("bot-field");
if (bot) {
  // Responde con éxito silencioso — no le digas al bot que fue detectado
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
```
