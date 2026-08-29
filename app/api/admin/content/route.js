import { q1, exec, readJson } from "@/lib/db";
import { ok, fail, guard, readBody, str, num, bit } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * The three single-row settings tables share one route because they are all
 * "read the row with id = 1, write the row with id = 1". `?part=` selects which.
 */

const HOME_KEYS = ["hero", "trust", "inventory", "process", "faq", "cta", "contact"];

const CALC_NUM = [
  "price_min", "price_max", "price_step", "price_default",
  "down_min", "down_max", "down_step", "down_default",
  "term_min", "term_max", "term_step", "term_default",
  "rate_min", "rate_max", "rate_step", "rate_default",
  "car_page_rate",
];

// The admin panel speaks camelCase; the columns are snake_case.
const CALC_MAP = {
  price_min: "priceMin", price_max: "priceMax", price_step: "priceStep", price_default: "priceDefault",
  down_min: "downMin", down_max: "downMax", down_step: "downStep", down_default: "downDefault",
  term_min: "termMin", term_max: "termMax", term_step: "termStep", term_default: "termDefault",
  rate_min: "rateMin", rate_max: "rateMax", rate_step: "rateStep", rate_default: "rateDefault",
  car_page_rate: "carPageRate",
};

export const GET = guard(async (req) => {
  const part = new URL(req.url).searchParams.get("part");

  if (part === "home") {
    const row = await q1("SELECT * FROM home_content WHERE id = 1");
    if (!row) return ok({ home: null });
    const home = {};
    for (const k of HOME_KEYS) home[k] = readJson(row[k], k === "trust" ? [] : {});
    return ok({ home });
  }

  if (part === "settings") {
    const row = await q1("SELECT * FROM site_settings WHERE id = 1");
    return ok({ settings: row || null });
  }

  if (part === "calc") {
    const row = await q1("SELECT * FROM calc_settings WHERE id = 1");
    return ok({ calc: row || null });
  }

  return fail("Unknown part", 400);
});

export const PUT = guard(async (req) => {
  const part = new URL(req.url).searchParams.get("part");
  const body = await readBody(req);

  if (part === "home") {
    const h = body.home || {};
    await exec(
      `INSERT INTO home_content (id,hero,trust,inventory,process,faq,cta,contact)
       VALUES (1,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         hero=VALUES(hero), trust=VALUES(trust), inventory=VALUES(inventory),
         process=VALUES(process), faq=VALUES(faq), cta=VALUES(cta), contact=VALUES(contact)`,
      HOME_KEYS.map((k) => JSON.stringify(h[k] ?? (k === "trust" ? [] : {})))
    );
    return ok();
  }

  if (part === "settings") {
    const s = body.settings || {};
    await exec(
      `INSERT INTO site_settings (id,phone,whatsapp,address,hours_week,hours_fri,emergency)
       VALUES (1,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         phone=VALUES(phone), whatsapp=VALUES(whatsapp), address=VALUES(address),
         hours_week=VALUES(hours_week), hours_fri=VALUES(hours_fri), emergency=VALUES(emergency)`,
      [
        str(s.phone, 60), str(s.whatsapp, 60), str(s.address, 255),
        str(s.hoursWeek ?? s.hours_week, 120), str(s.hoursFri ?? s.hours_fri, 120), str(s.emergency, 120),
      ]
    );
    return ok();
  }

  if (part === "calc") {
    const c = body.calc || {};
    // Accept either casing so the admin panel can send whichever it holds.
    const value = (col) => num(c[col] ?? c[CALC_MAP[col]], 0);
    await exec(
      `INSERT INTO calc_settings (id,${CALC_NUM.join(",")},show_rate_slider,heading,intro,disclaimer)
       VALUES (1,${CALC_NUM.map(() => "?").join(",")},?,?,?,?)
       ON DUPLICATE KEY UPDATE
         ${CALC_NUM.map((k) => `${k}=VALUES(${k})`).join(", ")},
         show_rate_slider=VALUES(show_rate_slider), heading=VALUES(heading),
         intro=VALUES(intro), disclaimer=VALUES(disclaimer)`,
      [
        ...CALC_NUM.map(value),
        bit(c.showRateSlider ?? c.show_rate_slider),
        str(c.heading, 255), str(c.intro, 5000), str(c.disclaimer, 5000),
      ]
    );
    return ok();
  }

  return fail("Unknown part", 400);
});
