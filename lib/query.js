import "server-only";
import { q, q1, readJson } from "./db";
import { CARS, HOME, SETTINGS, CALC, HOME_LIMIT, resolvePhoto } from "./data";
import { byAvailability } from "./car-status";

/**
 * Server-side reads for the public site.
 *
 * Every function keeps the same shape it had on Supabase: try the database,
 * and fall back to the bundled seed data in lib/data.js if it is unreachable.
 * That fallback is what lets the site build before the MySQL schema exists.
 */

function normalizeCar(row) {
  const photos = readJson(row.photos, []);
  const features = readJson(row.features, []);
  return {
    ...row,
    featured: !!row.featured,
    showHome: !!row.show_home,
    price: Number(row.price) || 0,
    photos: (Array.isArray(photos) ? photos : []).map((p) => resolvePhoto(p)),
    features: Array.isArray(features) ? features : [],
  };
}

export async function getCars() {
  try {
    const rows = await q("SELECT * FROM cars ORDER BY featured DESC, year DESC");
    if (rows.length) return rows.map(normalizeCar);
  } catch (e) {
    console.warn("[data] MySQL cars unavailable, using local data:", e.message);
  }
  return CARS;
}

/**
 * Everything in the showroom, sold cars included.
 *
 * They used to be filtered out, so marking a car sold silently deleted it from
 * the site: a bookmarked link died and the grid just got shorter with no
 * explanation. They stay listed with a Sold badge instead (lib/car-status.js),
 * sorted below anything still for sale.
 */
export async function getListingCars() {
  const cars = await getCars();
  return [...cars].sort(byAvailability);
}

export async function getHomeCars() {
  const cars = await getCars();
  // Status no longer gates this, only the owner's own show-on-home flag. The
  // sort means cars for sale claim the limited slots first, so a reserved or
  // sold one reaches the home page only when there is room left over.
  return cars
    .filter((c) => c.showHome)
    .sort(byAvailability)
    .slice(0, HOME_LIMIT);
}

export async function getCarById(id) {
  try {
    const row = await q1("SELECT * FROM cars WHERE id = ?", [id]);
    if (row) return normalizeCar(row);
  } catch (e) {
    console.warn("[data] MySQL car lookup unavailable, using local data:", e.message);
  }
  return CARS.find((c) => c.id === id) || null;
}

export async function getCarIds() {
  try {
    const rows = await q("SELECT id FROM cars");
    if (rows.length) return rows.map((r) => r.id);
  } catch (e) {
    console.warn("[data] MySQL car ids unavailable, using local data:", e.message);
  }
  return CARS.map((c) => c.id);
}

/**
 * The seeded stats rail split "24/7" across two fields — suffix "/" with the
 * label "7 Customer Support" — so it rendered as "24/" above "7 Customer
 * Support". Fold a leading number back onto the suffix so it reads "24/7".
 */
function fixStatSplit(stats) {
  if (!Array.isArray(stats)) return stats;
  return stats.map((s) => {
    const lead = /^(\d+)\s+(.+)$/.exec(String(s?.label ?? ""));
    if (lead && String(s.suffix ?? "").trim() === "/") {
      return { ...s, suffix: "/" + lead[1], label: lead[2] };
    }
    return s;
  });
}

export async function getHome() {
  try {
    const row = await q1("SELECT * FROM home_content WHERE id = 1");
    if (row) {
      const hero = readJson(row.hero, {});
      const trust = readJson(row.trust, null);
      const inventory = readJson(row.inventory, {});
      const process = readJson(row.process, {});
      const faq = readJson(row.faq, {});
      const cta = readJson(row.cta, {});
      const contact = readJson(row.contact, {});

      const merged = { ...HOME.hero, ...hero };
      return {
        hero: { ...merged, stats: fixStatSplit(merged.stats) },
        trust: Array.isArray(trust) ? trust : HOME.trust,
        inventory: { ...HOME.inventory, ...inventory },
        process: {
          ...HOME.process,
          ...process,
          steps: Array.isArray(process?.steps) && process.steps.length ? process.steps : HOME.process.steps,
        },
        faq: {
          ...HOME.faq,
          ...faq,
          items: Array.isArray(faq?.items) && faq.items.length ? faq.items : HOME.faq.items,
        },
        cta: { ...HOME.cta, ...cta },
        contact: { ...HOME.contact, ...contact },
        why: HOME.why,
        pillars: HOME.pillars,
      };
    }
  } catch (e) {
    console.warn("[data] MySQL home content unavailable, using local data:", e.message);
  }
  return HOME;
}

/** Row column names are snake_case; the app uses camelCase. */
export function calcFromRow(row) {
  const num = (v, fallback) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? fallback : Number(v));
  return {
    priceMin: num(row.price_min, CALC.priceMin),
    priceMax: num(row.price_max, CALC.priceMax),
    priceStep: num(row.price_step, CALC.priceStep),
    priceDefault: num(row.price_default, CALC.priceDefault),
    downMin: num(row.down_min, CALC.downMin),
    downMax: num(row.down_max, CALC.downMax),
    downStep: num(row.down_step, CALC.downStep),
    downDefault: num(row.down_default, CALC.downDefault),
    termMin: num(row.term_min, CALC.termMin),
    termMax: num(row.term_max, CALC.termMax),
    termStep: num(row.term_step, CALC.termStep),
    termDefault: num(row.term_default, CALC.termDefault),
    rateMin: num(row.rate_min, CALC.rateMin),
    rateMax: num(row.rate_max, CALC.rateMax),
    rateStep: num(row.rate_step, CALC.rateStep),
    rateDefault: num(row.rate_default, CALC.rateDefault),
    showRateSlider:
      row.show_rate_slider === undefined || row.show_rate_slider === null
        ? CALC.showRateSlider
        : !!row.show_rate_slider,
    carPageRate: num(row.car_page_rate, CALC.carPageRate),
    heading: row.heading || CALC.heading,
    intro: row.intro || CALC.intro,
    disclaimer: row.disclaimer || CALC.disclaimer,
  };
}

/**
 * Clamps the stored config so a bad min/max pair can never render a broken
 * slider (max below min, a default outside the range, a zero/negative step).
 */
export function normalizeCalc(c) {
  const out = { ...c };
  const fix = (key) => {
    const min = Number(out[key + "Min"]);
    let max = Number(out[key + "Max"]);
    let step = Number(out[key + "Step"]);
    if (!(max > min)) max = min + (step > 0 ? step : 1);
    if (!(step > 0)) step = 1;
    let def = Number(out[key + "Default"]);
    if (isNaN(def)) def = min;
    out[key + "Min"] = min;
    out[key + "Max"] = max;
    out[key + "Step"] = step;
    out[key + "Default"] = Math.min(max, Math.max(min, def));
  };
  ["price", "down", "term", "rate"].forEach(fix);
  return out;
}

export async function getCalc() {
  try {
    const row = await q1("SELECT * FROM calc_settings WHERE id = 1");
    if (row) return normalizeCalc(calcFromRow(row));
  } catch (e) {
    console.warn("[data] MySQL calculator settings unavailable, using local data:", e.message);
  }
  return normalizeCalc(CALC);
}

/**
 * Delivery photos for /happy-customers.
 *
 * Returns [] rather than throwing when the table is missing, so the site still
 * builds before the schema has been created — the page shows its empty state.
 */
export async function getHappyCustomers() {
  try {
    const rows = await q(
      "SELECT id, image_url, caption FROM happy_customers ORDER BY sort_order ASC, created_at DESC"
    );
    return rows
      .filter((r) => r.image_url)
      .map((r) => ({
        id: r.id,
        url: resolvePhoto(r.image_url),
        caption: (r.caption || "").trim(),
      }));
  } catch (e) {
    console.warn("[data] Happy customers unavailable:", e.message);
    return [];
  }
}

export async function getSettings() {
  try {
    const row = await q1("SELECT * FROM site_settings WHERE id = 1");
    if (row) {
      return {
        phone: row.phone || SETTINGS.phone,
        whatsapp: row.whatsapp || SETTINGS.whatsapp,
        address: row.address || SETTINGS.address,
        hoursWeek: row.hours_week || SETTINGS.hoursWeek,
        hoursFri: row.hours_fri || SETTINGS.hoursFri,
        emergency: row.emergency || SETTINGS.emergency,
      };
    }
  } catch (e) {
    console.warn("[data] MySQL settings unavailable, using local data:", e.message);
  }
  return SETTINGS;
}
