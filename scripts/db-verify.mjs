/** Sanity-checks that the MySQL rows deserialize the way the site expects. */
import { loadEnv, getConfig } from "./db-env.mjs";
import mysql from "mysql2/promise";
loadEnv();
const c = await mysql.createConnection({ ...getConfig(), connectTimeout: 15000 });

const [cars] = await c.query("SELECT id, price, featured, show_home, photos, features FROM cars ORDER BY featured DESC, year DESC");
console.log("cars:", cars.length);
for (const r of cars) {
  const photos = typeof r.photos === "string" ? JSON.parse(r.photos) : r.photos;
  const feats = typeof r.features === "string" ? JSON.parse(r.features) : r.features;
  console.log(`  ${r.id.padEnd(24)} price=${r.price} featured=${r.featured} home=${r.show_home} photos=${photos.length} features=${feats.length}`);
}
const [[home]] = await c.query("SELECT hero FROM home_content WHERE id=1");
const hero = typeof home.hero === "string" ? JSON.parse(home.hero) : home.hero;
console.log("\nhero.stats:", JSON.stringify(hero.stats));
const [[s]] = await c.query("SELECT phone, whatsapp FROM site_settings WHERE id=1");
console.log("settings:", s.phone, "/", s.whatsapp);
const [[calc]] = await c.query("SELECT price_default, rate_default, show_rate_slider FROM calc_settings WHERE id=1");
console.log("calc:", JSON.stringify(calc));
await c.end();
