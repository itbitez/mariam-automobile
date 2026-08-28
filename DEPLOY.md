# Deploying to Hostinger (manual file upload)

This is a **Node.js** app, not a static site. It needs a Hostinger plan that runs
Node: **Business Web Hosting**, or any **Cloud** plan. Premium and Single shared
hosting will not work — they only serve static files and PHP.

---

## 1. Build the upload package

Run this in the project folder:

```bash
npm run package
```

That produces **`mariam-automobile-deploy.zip`** in the project root.

It deliberately leaves out `node_modules`, `.next`, `.env.local` and the old
`legacy/` HTML — Hostinger installs dependencies and runs the build itself.

---

## 2. Upload it

1. Log in to **hPanel**
2. **Websites → Add Website → Deploy Web App**
3. Choose **Upload your website files**
4. Select `mariam-automobile-deploy.zip`
5. Hostinger detects Next.js. Confirm the build settings:

   | Setting | Value |
   | --- | --- |
   | Framework | Next.js |
   | Build command | `npm run build` |
   | Start command | `npm start` |
   | Output directory | `.next` |
   | Node version | 20 or newer |

---

## 3. Set the environment variables — do this *before* the first build

In hPanel, open the app's **Environment variables** section and add:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |

Copy the first two from your local `.env.local`.

> **Do this before you start the build, not after.** `NEXT_PUBLIC_*` values are
> baked into the JavaScript at build time, not read at runtime. If they are
> missing when Hostinger builds, the site still compiles, but every car, price
> and stat comes back empty and `/admin` shows a "Supabase is not configured"
> notice instead of the login form. Adding the variables afterwards is not
> enough — you have to trigger a fresh **build**, not just restart the app.

The anon key is safe to expose; it is designed for browsers and your Supabase
row-level security policies are what actually protect the data.

`NEXT_PUBLIC_SITE_URL` only affects canonical tags, `sitemap.xml` and social
share previews — but set it, or those will point at `localhost`.

---

## 4. Point the domain and enable SSL

Attach your domain in hPanel and turn on the free SSL certificate. The app sends
an HSTS header in production, so it should only ever be served over HTTPS.

---

## 5. Check it worked

- `https://yourdomain.com` — cars load from Supabase
- `https://yourdomain.com/cars` — filters work
- `https://yourdomain.com/admin` — you can sign in
- Submit the homepage enquiry form, then confirm it appears in **Admin → Leads**

---

## Updating the site later

**Content** — cars, photos, prices, homepage text, calculator settings — is
edited in the admin panel and appears on the live site within about a minute.
No redeploy needed.

**Code changes** need a fresh `npm run package` and re-upload.

---

## Notes

- Supabase stays where it is. Hostinger only hosts the website.
- Uploaded car photos live in Supabase Storage, so they survive redeploys.
- If the build fails with an out-of-memory error, ask Hostinger support to raise
  the build memory limit, or build locally and upload `.next` alongside the
  source (remove it from `.deployignore` first).
