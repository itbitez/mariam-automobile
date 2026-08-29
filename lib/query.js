import { getSupabase } from "./supabase";
import { CARS, HOME, SETTINGS, CALC, HOME_LIMIT, resolvePhoto } from "./data";

function normalizeCar(row) {
  const photos = Array.isArray(row.photos) ? row.photos : [];
  const features = Array.isArray(row.features) ? row.features : [];
  return {
    ...row,
    featured: !!row.featured,
    showHome: !!row.show_home,
    price: Number(row.price) || 0,
    photos: photos.map((p) => resolvePhoto(p)),
    features,
  };
}

export async function getCars() {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("cars")
        .select("*")
        .order("featured", { ascending: false })
        .order("year", { ascending: false });
      if (error) throw error;
      if (data && data.length) return data.map(normalizeCar);
    } catch (e) {
      console.warn("[data] Supabase cars unavailable, using local data:", e.message);
    }
  }
  return CARS;
}

export async function getListingCars() {
  const cars = await getCars();
  return cars.filter((c) => c.status !== "sold");
}

export async function getHomeCars() {
  const cars = await getCars();
  return cars.filter((c) => c.showHome && c.status === "available").slice(0, HOME_LIMIT);
}

export async function getCarById(id) {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("cars").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (data) return normalizeCar(data);
    } catch (e) {
      console.warn("[data] Supabase car lookup unavailable, using local data:", e.message);
    }
  }
  return CARS.find((c) => c.id === id) || null;
}

export async function getCarIds() {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("cars").select("id");
      if (error) throw error;
      if (data && data.length) return data.map((r) => r.id);
    } catch (e) {
      console.warn("[data] Supabase car ids unavailable, using local data:", e.message);
    }
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
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("home_content").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      if (data) {
        const { hero, trust, inventory, process, faq, cta, contact } = data;
        const merged = { ...HOME.hero, ...hero };
        return {
          hero: { ...merged, stats: fixStatSplit(merged.stats) },
          trust: Array.isArray(trust) ? trust : HOME.trust,
          inventory: { ...HOME.inventory, ...inventory },
          process: { ...HOME.process, ...(process || {}), steps: Array.isArray(process?.steps) && process.steps.length ? process.steps : HOME.process.steps },
          faq: { ...HOME.faq, ...(faq || {}), items: Array.isArray(faq?.items) && faq.items.length ? faq.items : HOME.faq.items },
          cta: { ...HOME.cta, ...cta },
          contact: { ...HOME.contact, ...contact },
          why: HOME.why,
          pillars: HOME.pillars,
        };
      }
    } catch (e) {
      console.warn("[data] Supabase home content unavailable, using local data:", e.message);
    }
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
    showRateSlider: row.show_rate_slider === undefined || row.show_rate_slider === null ? CALC.showRateSlider : !!row.show_rate_slider,
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
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("calc_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      if (data) return normalizeCalc(calcFromRow(data));
    } catch (e) {
      console.warn("[data] Supabase calculator settings unavailable, using local data:", e.message);
    }
  }
  return normalizeCalc(CALC);
}

/**
 * Delivery photos for /happy-customers.
 *
 * Returns [] rather than throwing when the table is missing, so the site still
 * builds if the migration has not been run yet — the page then shows its empty
 * state instead of failing the build.
 */
export async function getHappyCustomers() {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("happy_customers")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || [])
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
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      if (data) {
        return {
          phone: data.phone || SETTINGS.phone,
          whatsapp: data.whatsapp || SETTINGS.whatsapp,
          address: data.address || SETTINGS.address,
          hoursWeek: data.hours_week || SETTINGS.hoursWeek,
          hoursFri: data.hours_fri || SETTINGS.hoursFri,
          emergency: data.emergency || SETTINGS.emergency,
        };
      }
    } catch (e) {
      console.warn("[data] Supabase settings unavailable, using local data:", e.message);
    }
  }
  return SETTINGS;
}
