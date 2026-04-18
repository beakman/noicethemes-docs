---
title: Contact Form
description: Configure the contact form to send emails — choose between Netlify Forms, Formspree, FormSubmit, or a custom Resend API route.
---

The contact form is controlled entirely from **`src/config/contact.ts`**. No component code needs to change — pick a backend, add a credential, and submissions start arriving in your inbox.

---

## Backends at a glance

| Backend | Cost | Setup | Best for |
|---------|------|-------|---------|
| Netlify Forms | Free (100 submissions/mo) | Zero — just deploy | Sites on Netlify |
| Formspree | Free (50 submissions/mo) | Create account, paste ID | Any host |
| FormSubmit | Free, unlimited | Paste email address | Quick setup, any host |
| Custom API route (Resend) | Pay-as-you-go | Create endpoint + API key | Full control, any host |

---

## Option 1 — Netlify Forms (default)

No code changes needed. Netlify detects the `data-netlify="true"` attribute at build time and wires up the submission pipeline automatically.

**What to do:**

1. Deploy the site on Netlify — no extra config required.
2. After the first deployment, go to **Netlify Dashboard → your site → Forms**.
3. Your form (`contact`) appears there automatically.
4. Enable email notifications: **Forms → contact → Form notifications → Add notification → Email notification**.

**Submission limit:** The free tier allows 100 submissions per month. Upgrade in your Netlify billing settings if you need more.

```ts
// src/config/contact.ts
export const CONTACT_FORM = {
  backend: "netlify",
  formName: "contact",   // matches the name shown in the Netlify dashboard
  // ...
};
```

:::note
Netlify Forms only works when deployed on Netlify. It will not work with Vercel, Cloudflare Pages, or local dev.
:::

---

## Option 2 — Formspree

[Formspree](https://formspree.io) sends submissions directly to your email and provides a dashboard with spam filtering and export.

**Setup:**

1. Sign up at formspree.io and create a new form.
2. Copy your form ID from the endpoint URL — it looks like `xpznkrjb`.
3. Update `src/config/contact.ts`:

```ts
export const CONTACT_FORM = {
  backend: "formspree",
  formspreeId: "xpznkrjb",   // ← your form ID here
  // ...
};
```

Formspree handles CORS and spam filtering for you. The free plan allows 50 submissions per month; paid plans start at $10/month for 1,000 submissions.

---

## Option 3 — FormSubmit

[FormSubmit](https://formsubmit.co) is a free, no-account service. Submissions are emailed directly to the address you configure.

**Setup:**

1. Update `src/config/contact.ts` with your email:

```ts
export const CONTACT_FORM = {
  backend: "formsubmit",
  formsubmitEmail: "hello@yourdomain.com",   // ← your email here
  // ...
};
```

2. Deploy and submit the form once. FormSubmit sends a **confirmation email** to your address — click the link to activate it.

After activation, all submissions are forwarded to your email automatically. There is no submission limit on the free tier.

:::tip
FormSubmit adds its own reCAPTCHA by default. The template disables it (`_captcha: false`) and relies on the honeypot field instead — less friction for users and no Google dependency.
:::

---

## Option 4 — Custom API route with Resend

For full control — custom email templates, CC/BCC, logging — create an Astro server endpoint that calls the [Resend](https://resend.com) API. This works on any host that supports server-side rendering (Vercel, Cloudflare Workers, Node.js).

### 1. Install Resend and add an SSR adapter

```bash
pnpm add resend
pnpm add @astrojs/vercel   # or @astrojs/cloudflare / @astrojs/node
```

Update `astro.config.mjs` to add the adapter:

```ts
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "hybrid",      // static by default, server for API routes
  adapter: vercel(),
  // ...
});
```

### 2. Create the API endpoint

Create `src/pages/api/contact.ts`:

```ts
import type { APIRoute } from "astro";
import { Resend } from "resend";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const name    = data.get("name")    as string;
  const email   = data.get("email")   as string;
  const service = data.get("service") as string;
  const message = data.get("message") as string;

  // Basic validation
  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await resend.emails.send({
    from:    "Contact Form <noreply@yourdomain.com>",
    to:      ["hello@yourdomain.com"],
    replyTo: email,
    subject: `New enquiry from ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Service:</strong> ${service || "—"}</p>
      <p><strong>Message:</strong></p>
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

### 3. Add your API key

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

Add the same variable in your hosting provider's dashboard (Vercel → Project → Settings → Environment Variables).

### 4. Switch the form to `static` backend and add a fetch handler

Set `backend: "static"` in `src/config/contact.ts`, then add a `<script>` to `src/sections/Contact.astro` (or the contact page) that intercepts the submit event:

```ts
// src/config/contact.ts
export const CONTACT_FORM = {
  backend: "static",
  // ...
};
```

```astro
<!-- at the bottom of src/sections/Contact.astro -->
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
      // Show success UI — e.g. replace the form with a thank-you message
    } else {
      alert("Something went wrong. Please try again.");
    }

    button.disabled = false;
  });
</script>
```

---

## Customizing form fields

All fields are toggled and labelled in `src/config/contact.ts`:

```ts
fields: {
  name:    { enabled: true,  label: "Name",    placeholder: "Jane Doe" },
  email:   { enabled: true,  label: "Email",   placeholder: "jane@example.com" },
  service: { enabled: true,  label: "Service" },
  artist:  { enabled: false, label: "Preferred Team Member" },  // ← disable if not needed
  message: { enabled: true,  label: "Tell us about your project", placeholder: "...", rows: 4 },
},

showServiceDropdown: true,   // shows/hides the service <select>
showArtistDropdown:  false,  // shows/hides the team member <select>

services: [
  "Brand Identity",
  "Web Design",
  "UI/UX Strategy",
],
```

The **artist dropdown** is populated automatically from the `team` array in `src/config.ts` — no duplication needed.

---

## Spam protection

The form includes a **honeypot field** — a hidden input that real users never see. Bots fill it in; submissions with a non-empty honeypot are discarded by the backend (Netlify/Formspree handle this automatically) or you can check it manually in the API route.

```ts
honeypotField: {
  enabled: true,
  name: "bot-field",
},
```

To check it in a custom API route:

```ts
const bot = data.get("bot-field");
if (bot) {
  // Silently succeed — don't tell bots they were caught
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
```
