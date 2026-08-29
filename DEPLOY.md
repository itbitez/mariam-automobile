# Deploying to Hostinger

Repository: **https://github.com/itbitez/mariam-automobile** (branch `main`).

This is a **Node.js** app backed by **MySQL**. It needs a Hostinger plan that
runs Node: **Business Web Hosting**, or any **Cloud** plan.

There is no Supabase. Data lives in your Hostinger MySQL database, images live
on disk, and admin login is handled by the app itself.

---

## 1. Create the database tables

hPanel → **phpMyAdmin** → SQL tab → paste [mysql/01-schema.sql](mysql/01-schema.sql) → **Go**.

Safe to run more than once — it only creates what is missing.

## 2. Create your admin login

From your computer, with `.env.local` filled in:

```bash
npm run admin:create -- you@example.com "a-strong-password"
```

Run it again any time to change the password.

## 3. Deploy the app

1. hPanel → **Websites → Add Website → Node.js web app**
2. **Import Git repository → Connect with GitHub**, grant access to `mariam-automobile`
3. Confirm: branch `main`, Node 20 or 22, build `npm run build`, output `.next`

## 4. Environment variables — set these *before* the first build

| Name | Value |
| --- | --- |
| `MYSQL_HOST` | the **database server** hostname, e.g. `srvNNN.hstgr.io` — **not** your website domain. hPanel shows it on the Remote MySQL page |
| `MYSQL_PORT` | `3306` |
| `MYSQL_DATABASE` | your database name |
| `MYSQL_USER` | your database user |
| `MYSQL_PASSWORD` | your database password |
| `UPLOAD_DIR` | an absolute path **outside** the app folder (see below) |
| `NEXT_PUBLIC_SITE_URL` | `https://mariamautomobile.com` |

> **`UPLOAD_DIR` is the one that will bite you.** Deploying replaces the app
> directory. Anything stored inside it — including every photo your customers
> uploaded — is destroyed on release. Point `UPLOAD_DIR` at a path that survives
> a deploy, such as `/home/uXXXXXXXX/mariam-uploads`. Verify it in
> **Admin → Database setup**, which reports the resolved path and whether it is
> writable.
>
> Unlike the old Supabase keys, the MySQL settings are read on the server at
> runtime, so they are *not* baked into the JavaScript bundle. Changing them
> only needs a restart, not a rebuild.

## 5. Point the domain and enable SSL

Attach the domain in hPanel and turn on the free SSL certificate. The app sends
HSTS in production, so it should only ever be served over HTTPS.

## 6. Check it worked

- `/` — cars load
- `/cars` — filters work
- `/happy-customers` — gallery or its empty state
- `/admin` — you can sign in
- **Admin → Database setup** — all tables green, upload folder writable
- Submit the homepage enquiry form and confirm it appears in **Admin → Leads**

---

## Shipping changes

```bash
git add -A
git commit -m "describe the change"
git push
```

Hostinger rebuilds automatically. Content edits made in the admin panel appear
on the live site within about a minute and never need a deploy.

---

## Local development

`.env.local` holds the same variables. To reach the Hostinger database from your
own machine, add your IP under **hPanel → Databases → Remote MySQL** first, then:

```bash
npm run db:ping      # confirms the connection and lists the tables
npm run dev
```

Useful scripts:

| Command | What it does |
| --- | --- |
| `npm run db:ping` | Connection check and table list |
| `npm run db:verify` | Prints rows as the site will read them |
| `npm run migrate:import` | Loads `mysql/data/*.json` into MySQL |
| `npm run admin:create` | Creates or updates an admin login |
| `npm run package` | Builds the manual-upload ZIP (fallback to Git deploy) |

---

## Notes

- Uploaded photos are served by `/api/uploads/...`, not from `public/`, because
  they live outside the app directory.
- `mysql/data/` holds the one-off export taken from the old Supabase project.
  Keep it as a backup; it is not read at runtime.
- Every admin API route checks the session cookie server side. There is no row
  level security behind it any more, so that check is the only thing protecting
  the database.
