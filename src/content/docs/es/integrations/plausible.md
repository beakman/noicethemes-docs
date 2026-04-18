---
title: Plausible Analytics
description: Añade analíticas que respetan la privacidad a tu sitio con Plausible — sin cookies, compatible con el RGPD, no requiere banner de consentimiento.
---

[Plausible](https://plausible.io) es una herramienta de analítica ligera y de código abierto. No usa cookies, no recopila datos personales y cumple totalmente con el RGPD / CCPA — lo que significa que **no necesitas un banner de consentimiento de cookies solo por usar Plausible**.

---

## 1. Configuración en la nube

Regístrate en [plausible.io](https://plausible.io) y añade tu dominio. Plausible te proporcionará un fragmento de script — solo necesitas el nombre de dominio, no el fragmento completo.

---

## 2. Añadir el script a `Layout.astro`

Abre `src/layouts/Layout.astro` y añade el script de Plausible en el `<head>`:

```astro
<head>
  <!-- ... etiquetas existentes ... -->

  <!-- Plausible Analytics — sin cookies, compatible con RGPD -->
  {import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN && (
    <script
      is:inline
      defer
      data-domain={import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN}
      src="https://plausible.io/js/script.js"
    />
  )}
</head>
```

La directiva `is:inline` garantiza que el script se renderice exactamente como está escrito (sin empaquetado de Astro). La condición `{import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN && ...}` significa que el script se omite en desarrollo — el seguimiento solo se activa en producción.

---

## 3. Definir la variable de entorno

```bash
# .env.local (desarrollo — omite para no registrar visitas locales)
# PUBLIC_PLAUSIBLE_DOMAIN=tudominio.com

# Producción: define en el panel de Vercel / Netlify / Cloudflare
PUBLIC_PLAUSIBLE_DOMAIN=tudominio.com
```

Las variables con el prefijo `PUBLIC_` son seguras para exponerlas en el navegador.

---

## 4. Registrar eventos personalizados

Plausible admite eventos personalizados para registrar clics en botones, envíos de formularios y otras interacciones.

```astro
---
// src/sections/Hero.astro
---
<Button
  href="/contact"
  onclick="plausible('CTA Click', {props: {button: 'Hero Primary'}})"
>
  Reservar una consulta
</Button>
```

O en un script del lado del cliente:

```ts
// en cualquier bloque <script>
function trackCTA(label: string) {
  if (typeof window.plausible === "function") {
    window.plausible("CTA Click", { props: { button: label } });
  }
}
```

Los eventos personalizados aparecen en Plausible bajo **Goals** — primero debes crear el objetivo en el panel (Plausible → tu sitio → Goals → + Goal → Custom event).

---

## 5. Auto-alojamiento (opcional)

Si prefieres alojar Plausible tú mismo:

```bash
# docker-compose.yml
version: "3.3"
services:
  plausible_db:
    image: postgres:15
    environment:
      POSTGRES_DB: plausible_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  plausible_events_db:
    image: clickhouse/clickhouse-server:23.3

  plausible:
    image: ghcr.io/plausible/community-edition:v2
    ports:
      - "8000:8000"
    environment:
      BASE_URL: https://analytics.tudominio.com
      SECRET_KEY_BASE: <genera con openssl rand -hex 64>
    depends_on:
      - plausible_db
      - plausible_events_db
```

Luego actualiza el `src` del script en `Layout.astro`:

```astro
src="https://analytics.tudominio.com/js/script.js"
```

---

## 6. Seguimiento de enlaces salientes

Para registrar los clics en enlaces externos, reemplaza el script estándar por la extensión `outbound-links`:

```astro
src="https://plausible.io/js/script.outbound-links.js"
```

No se necesitan otros cambios — Plausible registrará automáticamente los clics en enlaces salientes como eventos `Outbound Link: Click`.

---

## Notas sobre privacidad

- Plausible no usa cookies ni fingerprinting.
- No se almacenan datos personales (dirección IP, user agent).
- Todas las mediciones son agregadas — ves páginas vistas y eventos, no individuos.
- Esto significa que puedes usar Plausible sin un banner de consentimiento de cookies en la mayoría de jurisdicciones (UE, Reino Unido, EE. UU.).
- Si usas otras herramientas de seguimiento junto a Plausible que sí establecen cookies (p. ej. Meta Pixel, Google Ads), el banner de consentimiento de cookies de esta plantilla gestiona esos casos por separado.
