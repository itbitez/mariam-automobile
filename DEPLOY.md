# Deploying to Hostinger

The repository is **https://github.com/itbitez/mariam-automobile** (branch `main`).

This is a **Node.js** app, not a static site. It needs a Hostinger plan that runs
Node: **Business Web Hosting**, or any **Cloud** plan. Premium and Single shared
hosting will not work — they only serve static files and PHP.

Two routes below. Use the Git one; the ZIP route is kept as a fallback.

---

# Route A — deploy from GitHub (recommended)

Connect once, then every `git push` rebuilds and redeploys the live site
automatically.

> **Do not use hPanel's generic Git feature** (the one under *Advanced → Git*).
> That tool only copies files into a folder — it never runs `npm install` or
> `npm run build`, so a Next.js app deployed that way will not start. Hostinger
> documents it as unavailable for Node.js sites. Use the **Node.js web app**
> import flow described here instead.

## 1. Create the app from the repo

1. hPanel → **Websites → Add Website**
2. Choose **Node.js web app**
3. Choose **Import Git repository**, then **Connect with GitHub**
4. Install the **Hostinger GitHub App** and grant it access to
   `itbitez/mariam-automobile`
5. Select the repository

## 2. Confirm the build settings

Hostinger auto-detects most of this. Check it matches:

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Branch | `main` |
| Node.js version | 20 or 22 |
| Package manager | npm |
| Build command | `npm run build` |
| Output directory | `.next` |

## 3. Add the environment variables — *before* you click Deploy

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ciundvubddnvwpvnnjgi.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the anon key from your local `.env.local` |
| `NEXT_PUBLIC_SITE_URL` | `https://mariamautomobile.com` |

> **This is the step that breaks deployments.** `NEXT_PUBLIC_*` values are baked
> into the JavaScript at build time, not read at runtime. If they are missing
> when Hostinger builds, the site still compiles, but every car, price and stat
> comes back empty and `/admin` shows a "Supabase is not configured" notice
> instead of the login form. Adding the variables afterwards is **not enough** —
> you have to trigger a fresh **build**, not just restart the app.

The anon key is safe to put here; it ships inside the browser JavaScript by
design, and your Supabase row-level security policies are what actually protect
the data. It is not the same as the `service_role` key, which must never leave
your Supabase dashboard and is not used anywhere in this project.

## 4. Deploy

Click **Deploy** and watch the build log. A clean build ends with a route table
listing `/`, `/cars`, `/cars/[id]` and `/admin`.

## 5. Point the domain and enable SSL

Attach the domain in hPanel and turn on the free SSL certificate. The app sends
an HSTS header in production, so it should only ever be served over HTTPS.

## 6. Check it worked

- `https://mariamautomobile.com` — cars load from Supabase
- `/cars` — filters work
- `/admin` — the login form appears (**not** a "Supabase is not configured"
  notice; if you see that, step 3 was missed)
- Submit the homepage enquiry form, then confirm it lands in **Admin → Leads**

---

## Shipping changes after that

```bash
git add -A
git commit -m "describe the change"
git push
```

Hostinger's GitHub App gets the webhook, rebuilds, and swaps the site over. No
ZIP, no upload, no hPanel visit.

**Content** — cars, photos, prices, homepage text, calculator settings — is
edited in the admin panel and appears live within about a minute. That never
needs a deploy at all.

---

# Route B — manual ZIP upload (fallback)

Only if the GitHub connection is unavailable.

1. `npm run package` → produces `mariam-automobile-deploy.zip`
2. hPanel → **Websites → Add Website → Node.js web app**
3. Choose **Upload your website files** and select the ZIP
4. Same build settings and environment variables as Route A above

The package deliberately omits `node_modules`, `.next`, `.env.local` and the old
`legacy/` HTML — Hostinger installs dependencies and builds it there.

Every code change means a fresh `npm run package` and re-upload, which is why
Route A is better.

---

## Notes

- Supabase stays where it is. Hostinger only hosts the website.
- Uploaded car photos live in Supabase Storage, so they survive redeploys.
- `.env.local` is gitignored and never leaves your machine. The values live in
  hPanel's environment variables instead.
- If the build fails with an out-of-memory error, ask Hostinger support to raise
  the build memory limit.
