/**
 * Loads mysql/data/*.json (produced by migrate:export) into MySQL.
 *
 *   npm run migrate:import
 *
 * Idempotent: rows are upserted by primary key, so running it twice is safe and
 * re-running after a fix does not duplicate anything.
 */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";
import { loadEnv, getConfig } from "./db-env.mjs";

loadEnv();
const c = await mysql.createConnection({ ...getConfig(), connectTimeout: 15000 });

const DIR = path.resolve("mysql/data");
const read = (name) => {
  const p = path.join(DIR, `${name}.json`);
  if (!fs.existsSync(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) || [];
  } catch {
    return [];
  }
};

/** Postgres timestamptz -> MySQL DATETIME (UTC, no zone suffix). */
const dt = (v) => (v ? new Date(v).toISOString().slice(0, 19).replace("T", " ") : null);
const json = (v, fallback) => JSON.stringify(v ?? fallback);
const bool = (v) => (v ? 1 : 0);

let report = [];

/* ---------- cars ---------- */
{
  const rows = read("cars");
  for (const r of rows) {
    await c.execute(
      `INSERT INTO cars
         (id,title,brand,model,grade,year,body,fuel,transmission,drive,engine,mileage,seats,color,
          \`condition\`,auction,reg,price,featured,status,show_home,photos,tagline,about,features,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         title=VALUES(title), brand=VALUES(brand), model=VALUES(model), grade=VALUES(grade),
         year=VALUES(year), body=VALUES(body), fuel=VALUES(fuel), transmission=VALUES(transmission),
         drive=VALUES(drive), engine=VALUES(engine), mileage=VALUES(mileage), seats=VALUES(seats),
         color=VALUES(color), \`condition\`=VALUES(\`condition\`), auction=VALUES(auction), reg=VALUES(reg),
         price=VALUES(price), featured=VALUES(featured), status=VALUES(status), show_home=VALUES(show_home),
         photos=VALUES(photos), tagline=VALUES(tagline), about=VALUES(about), features=VALUES(features)`,
      [
        r.id, r.title ?? "", r.brand ?? "", r.model ?? "", r.grade ?? "", Number(r.year) || 0,
        r.body ?? "SUV", r.fuel ?? "Hybrid", r.transmission ?? "Automatic", r.drive ?? "2WD",
        r.engine ?? "", r.mileage ?? "", Number(r.seats) || 5, r.color ?? "",
        r.condition ?? "Recondition", r.auction ?? "", r.reg ?? "", Number(r.price) || 0,
        bool(r.featured), r.status ?? "available", bool(r.show_home),
        json(r.photos, []), r.tagline ?? "", r.about ?? "", json(r.features, []),
        dt(r.created_at) || dt(new Date()), dt(r.updated_at) || dt(new Date()),
      ]
    );
  }
  report.push(["cars", rows.length]);
}

/* ---------- home_content ---------- */
{
  const rows = read("home_content");
  for (const r of rows) {
    await c.execute(
      `INSERT INTO home_content (id,hero,trust,inventory,process,faq,cta,contact)
       VALUES (1,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         hero=VALUES(hero), trust=VALUES(trust), inventory=VALUES(inventory),
         process=VALUES(process), faq=VALUES(faq), cta=VALUES(cta), contact=VALUES(contact)`,
      [
        json(r.hero, {}), json(r.trust, []), json(r.inventory, {}),
        json(r.process, {}), json(r.faq, {}), json(r.cta, {}), json(r.contact, {}),
      ]
    );
  }
  report.push(["home_content", rows.length]);
}

/* ---------- site_settings ---------- */
{
  const rows = read("site_settings");
  for (const r of rows) {
    await c.execute(
      `INSERT INTO site_settings (id,phone,whatsapp,address,hours_week,hours_fri,emergency)
       VALUES (1,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         phone=VALUES(phone), whatsapp=VALUES(whatsapp), address=VALUES(address),
         hours_week=VALUES(hours_week), hours_fri=VALUES(hours_fri), emergency=VALUES(emergency)`,
      [r.phone ?? "", r.whatsapp ?? "", r.address ?? "", r.hours_week ?? "", r.hours_fri ?? "", r.emergency ?? ""]
    );
  }
  report.push(["site_settings", rows.length]);
}

/* ---------- calc_settings ---------- */
{
  const rows = read("calc_settings");
  const COLS = [
    "price_min", "price_max", "price_step", "price_default",
    "down_min", "down_max", "down_step", "down_default",
    "term_min", "term_max", "term_step", "term_default",
    "rate_min", "rate_max", "rate_step", "rate_default",
    "car_page_rate",
  ];
  for (const r of rows) {
    const nums = COLS.map((k) => Number(r[k]) || 0);
    await c.execute(
      `INSERT INTO calc_settings
         (id,${COLS.join(",")},show_rate_slider,heading,intro,disclaimer)
       VALUES (1,${COLS.map(() => "?").join(",")},?,?,?,?)
       ON DUPLICATE KEY UPDATE
         ${COLS.map((k) => `${k}=VALUES(${k})`).join(", ")},
         show_rate_slider=VALUES(show_rate_slider), heading=VALUES(heading),
         intro=VALUES(intro), disclaimer=VALUES(disclaimer)`,
      [...nums, bool(r.show_rate_slider), r.heading ?? "", r.intro ?? "", r.disclaimer ?? ""]
    );
  }
  report.push(["calc_settings", rows.length]);
}

/* ---------- happy_customers ---------- */
{
  const rows = read("happy_customers");
  for (const r of rows) {
    await c.execute(
      `INSERT INTO happy_customers (id,image_url,caption,sort_order,created_at)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         image_url=VALUES(image_url), caption=VALUES(caption), sort_order=VALUES(sort_order)`,
      [r.id || randomUUID(), r.image_url, r.caption ?? "", Number(r.sort_order) || 0, dt(r.created_at) || dt(new Date())]
    );
  }
  report.push(["happy_customers", rows.length]);
}

/* ---------- leads ---------- */
{
  const rows = read("leads");
  for (const r of rows) {
    await c.execute(
      `INSERT INTO leads (id,name,phone,car,budget,payment,message,source,status,user_agent,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE status=VALUES(status)`,
      [
        r.id || randomUUID(), r.name ?? "", r.phone ?? "", r.car ?? "", r.budget ?? "",
        r.payment ?? "", r.message ?? "", r.source ?? "homepage", r.status ?? "new",
        (r.user_agent ?? "").slice(0, 500), dt(r.created_at) || dt(new Date()),
      ]
    );
  }
  report.push(["leads", rows.length]);
}

console.log("Imported:");
for (const [t, n] of report) console.log(`  ${t.padEnd(18)} ${n}`);

console.log("\nRow counts now in MySQL:");
for (const [t] of report) {
  const [[{ n }]] = await c.query(`SELECT COUNT(*) AS n FROM \`${t}\``);
  console.log(`  ${t.padEnd(18)} ${n}`);
}

await c.end();
