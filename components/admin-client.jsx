"use client";

import { useEffect, useRef, useState } from "react";
import { HOME, CALC, HOME_LIMIT } from "@/lib/data";
import { lakh, slugify } from "@/lib/format";
import { LOGO } from "@/lib/site";
import { auth, cars as carsApi, content as contentApi, leads as leadsApi } from "@/lib/admin-api";
import { MediaBrowser } from "@/components/media-library";
import PhotoManager from "@/components/photo-manager";
import CalcView from "@/components/calc-view";
import SetupView from "@/components/setup-view";
import HappyView from "@/components/happy-view";
import "./admin.css";


const IC = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
      <rect x="3" y="11" width="18" height="7" rx="2" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  ext: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  save: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  ),
  photo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6" />
      <path d="M12 16h.01" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.9 17.9A10.5 10.5 0 0 1 12 20c-7 0-11-8-11-8a19 19 0 0 1 5.1-6" />
      <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a19 19 0 0 1-2.9 4.1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M2 2l20 20" />
    </svg>
  ),
  calc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8" />
      <path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h4" />
    </svg>
  ),
  media: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="7" y="3" width="14" height="14" rx="2" />
      <path d="M3 7v12a2 2 0 0 0 2 2h12" />
      <circle cx="11.5" cy="7.5" r="1.5" />
      <path d="M21 12l-4-4-6 6" />
    </svg>
  ),
  db: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
    </svg>
  ),
  inbox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z" />
    </svg>
  ),
};

const STATUS_META = {
  available: { pill: "ok", label: "Available" },
  reserved: { pill: "warn", label: "Reserved" },
  sold: { pill: "bad", label: "Sold" },
};

/* calc_settings uses snake_case columns; the UI works in camelCase. */
const CALC_KEYS = [
  ["priceMin", "price_min"], ["priceMax", "price_max"], ["priceStep", "price_step"], ["priceDefault", "price_default"],
  ["downMin", "down_min"], ["downMax", "down_max"], ["downStep", "down_step"], ["downDefault", "down_default"],
  ["termMin", "term_min"], ["termMax", "term_max"], ["termStep", "term_step"], ["termDefault", "term_default"],
  ["rateMin", "rate_min"], ["rateMax", "rate_max"], ["rateStep", "rate_step"], ["rateDefault", "rate_default"],
  ["carPageRate", "car_page_rate"],
];

function calcFromRow(row) {
  const out = { ...CALC };
  CALC_KEYS.forEach(([camel, snake]) => {
    const v = row[snake];
    if (v !== null && v !== undefined && v !== "" && !isNaN(Number(v))) out[camel] = Number(v);
  });
  if (row.show_rate_slider !== null && row.show_rate_slider !== undefined) out.showRateSlider = !!row.show_rate_slider;
  if (row.heading) out.heading = row.heading;
  if (row.intro) out.intro = row.intro;
  if (row.disclaimer) out.disclaimer = row.disclaimer;
  return out;
}

function calcToRow(c) {
  const row = { id: 1, updated_at: new Date().toISOString() };
  CALC_KEYS.forEach(([camel, snake]) => {
    row[snake] = Number(c[camel]) || 0;
  });
  row.show_rate_slider = !!c.showRateSlider;
  row.heading = c.heading || "";
  row.intro = c.intro || "";
  row.disclaimer = c.disclaimer || "";
  return row;
}

function Thumb({ car }) {
  const p = (car.photos && car.photos[0]) || "";
  const useImg = /^(\/|https?:\/\/|data:)/.test(p);
  return (
    <span className="thumb">
      {useImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p} alt="" />
      ) : (
        <svg viewBox="0 0 56 42" aria-hidden="true">
          <rect width="56" height="42" fill="#DCE3EC" />
          <text x="28" y="25" fill="#6B7280" fontFamily="sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">
            {car.brand}
          </text>
        </svg>
      )}
    </span>
  );
}

/** Cover photo for a homepage slot card, with a graceful fallback. */
function SlotShot({ car }) {
  const src = (car.photos && car.photos.find((p) => String(p).trim())) || "";
  const [broken, setBroken] = useState(!src);
  const ref = useRef(null);

  useEffect(() => {
    setBroken(!src);
    const el = ref.current;
    if (src && el && el.complete && el.naturalWidth === 0) setBroken(true);
  }, [src]);

  if (broken) return <span className="fallback">{IC.photo}</span>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={src} alt="" loading="lazy" onError={() => setBroken(true)} />
  );
}

function RowLine({ value, placeholder, onChange, onRemove, label }) {
  return (
    <div className="row-line">
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      <button type="button" className="ibtn danger row-rm" aria-label="Remove" onClick={onRemove}>
        {IC.x}
      </button>
    </div>
  );
}

/* ============ login ============ */
// Facts worth knowing before you start, not a feature pitch. Whoever is
// signing in already owns the thing.
const AUTH_POINTS = [
  "Edits appear on the site within a minute",
  "Sold cars leave the listings but stay in the archive",
  "Photos upload straight from your phone",
];

function Login({ onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const { data, error } = await auth.signIn(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Supabase used to broadcast this through onAuthStateChange. Nothing
    // broadcasts now — the session is an httpOnly cookie the browser cannot
    // observe — so hand the signed-in admin straight to the parent. Without
    // this the cookie is set but the panel stays on the login form until the
    // page is reloaded.
    onSignedIn(data.admin);
  }

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <span className="a-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="Mariam Automobile" />
        </span>

        <div>
          <h2>
            The showroom,
            <br />
            behind the scenes.
          </h2>
          <p className="a-lede">
            Stock, photos, prices and the words on every page — all of it is edited from here.
          </p>
          <div className="a-list">
            {AUTH_POINTS.map((p) => (
              <div key={p}>
                {IC.check}
                {p}
              </div>
            ))}
          </div>
        </div>

        <div className="a-foot">Terokhadia · Rajshahi</div>
      </aside>

      <div className="auth-main">
        <form className="auth-card" onSubmit={submit}>
          <span className="m-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Mariam Automobile" />
          </span>

          <h1>Welcome back</h1>
          <p className="sub">Sign in to manage cars and site content.</p>

          {error && (
            <div className="auth-err" role="alert">
              {IC.alert}
              <span>{error}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="a-email">Email address</label>
            <input
              id="a-email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="a-pass">Password</label>
            <div className="pw-wrap">
              <input
                id="a-pass"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="pw-toggle"
                aria-label={showPw ? "Hide password" : "Show password"}
                title={showPw ? "Hide password" : "Show password"}
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? IC.eyeOff : IC.eye}
              </button>
            </div>
          </div>

          <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>
            {busy && <span className="spin" />}
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <a className="auth-back" href="/">
            {IC.back}Back to website
          </a>
        </form>
      </div>
    </div>
  );
}

/* ============ main ============ */
export default function AdminClient() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [db, setDb] = useState({ cars: [], home: HOME, settings: null, calc: CALC });
  const [dataLoading, setDataLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const editingRef = useRef(null);

  useEffect(() => {
    editingRef.current = editingId;
  }, [editingId]);

  useEffect(() => {
    let alive = true;
    // There is no onAuthStateChange equivalent — the session lives in an
    // httpOnly cookie the browser cannot observe. One check on mount is enough;
    // any later expiry surfaces as a 401 from whichever request hits it.
    auth.session().then(({ data }) => {
      if (!alive) return;
      setSession(data?.admin || null);
      setAuthLoading(false);
    });

    // Any request that comes back 401 means the cookie is gone or expired.
    const onExpired = () => {
      setSession(null);
      setToast({ msg: "Your session expired. Please sign in again.", type: "err" });
    };
    window.addEventListener("admin-unauthorized", onExpired);

    return () => {
      alive = false;
      window.removeEventListener("admin-unauthorized", onExpired);
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    setDataLoading(true);
    (async () => {
      const [c, h, s, k] = await Promise.all([
        carsApi.list(),
        contentApi.get("home"),
        contentApi.get("settings"),
        contentApi.get("calc"),
      ]);
      if (!alive) return;
      // MySQL JSON columns arrive parsed on some driver versions and as a
      // string on others, so normalise both.
      const asArray = (v) => {
        if (Array.isArray(v)) return v;
        if (typeof v === "string") { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
        return [];
      };
      const cars = (c.data?.cars || []).map((row) => ({
        ...row,
        showHome: !!row.show_home,
        featured: !!row.featured,
        price: Number(row.price) || 0,
        photos: asArray(row.photos),
        features: asArray(row.features),
      }));
      const hrow = h.data?.home || {};
      const home = {
        hero: { ...HOME.hero, ...(hrow.hero || {}) },
        trust: Array.isArray(hrow.trust) && hrow.trust.length ? hrow.trust : HOME.trust,
        inventory: { ...HOME.inventory, ...(hrow.inventory || {}) },
        process: {
          ...HOME.process,
          ...(hrow.process || {}),
          steps: hrow.process && Array.isArray(hrow.process.steps) && hrow.process.steps.length ? hrow.process.steps : HOME.process.steps,
        },
        faq: {
          ...HOME.faq,
          ...(hrow.faq || {}),
          items: hrow.faq && Array.isArray(hrow.faq.items) && hrow.faq.items.length ? hrow.faq.items : HOME.faq.items,
        },
        cta: { ...HOME.cta, ...(hrow.cta || {}) },
        contact: { ...HOME.contact, ...(hrow.contact || {}) },
        why: HOME.why,
        pillars: HOME.pillars,
      };
      // The API wraps each payload: { ok, settings } / { ok, calc }. Reading
      // s.data directly gave undefined for every field, so the form rendered
      // blank — and saving that blank form would have overwritten the real
      // contact details with empty strings.
      const srow = s.data?.settings || {};
      const settings = {
        phone: srow.phone || "",
        wa: srow.whatsapp || "",
        address: srow.address || "",
        hoursWeek: srow.hours_week || "",
        hoursFri: srow.hours_fri || "",
        emergency: srow.emergency || "",
      };
      // calc_settings may not exist yet if the schema has not been run —
      // fall back to the shipped defaults rather than blanking the screen.
      const calc = k.data?.calc ? calcFromRow(k.data.calc) : { ...CALC };

      setDb({ cars, home, settings, calc });
      setDataLoading(false);
    })().catch(() => {
      if (!alive) return;
      setDataLoading(false);
      setToast({ msg: "Could not load data from the database.", type: "err" });
    });
    return () => {
      alive = false;
    };
  }, [session]);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace("#", "") || "dashboard";
      if (h === "carform" && !editingRef.current) {
        setView("cars");
      } else {
        setView(
          ["dashboard", "cars", "carform", "leads", "media", "happy", "home", "calc", "settings", "setup"].includes(h)
            ? h
            : "dashboard"
        );
      }
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function nav(name) {
    window.location.hash = name;
    setView(name);
  }

  function toRow(car) {
    return {
      id: car.id,
      title: car.title,
      brand: car.brand,
      model: car.model,
      grade: car.grade || "",
      year: Number(car.year) || new Date().getFullYear(),
      body: car.body || "SUV",
      fuel: car.fuel || "Hybrid",
      transmission: car.transmission || "Automatic",
      drive: car.drive || "2WD",
      engine: car.engine || "",
      mileage: car.mileage || "",
      seats: Number(car.seats) || 5,
      color: car.color || "",
      condition: car.condition || "Recondition",
      auction: car.auction || "",
      reg: car.reg || "",
      price: Number(car.price) || 0,
      featured: !!car.featured,
      status: car.status || "available",
      show_home: !!car.showHome,
      photos: Array.isArray(car.photos) ? car.photos : [],
      tagline: car.tagline || "",
      about: car.about || "",
      features: Array.isArray(car.features) ? car.features : [],
    };
  }

  async function addCar(car) {
    const { error } = await carsApi.save({ ...car, showHome: car.showHome });
    if (error) throw error;
    setDb((d) => ({ ...d, cars: [...d.cars, { ...car, show_home: car.showHome }] }));
  }

  async function updateCar(id, car) {
    const { error } = await carsApi.save({ ...car, id, showHome: car.showHome });
    if (error) throw error;
    setDb((d) => ({ ...d, cars: d.cars.map((c) => (c.id === id ? { ...c, ...toRow(car), showHome: car.showHome } : c)) }));
  }

  async function deleteCar(id) {
    const { error } = await carsApi.remove(id);
    if (error) throw error;
    setDb((d) => ({ ...d, cars: d.cars.filter((c) => c.id !== id) }));
  }

  function toggleHome(id, force) {
    const car = db.cars.find((c) => c.id === id);
    if (!car) return false;
    const want = force === undefined ? !car.showHome : force;
    if (want) {
      const n = db.cars.filter((c) => c.showHome).length;
      if (n >= HOME_LIMIT) {
        setToast({ msg: `Homepage is limited to ${HOME_LIMIT} cars. Turn one off first.`, type: "err" });
        return false;
      }
    }
    updateCar(id, { ...car, showHome: want }).catch((e) => setToast({ msg: "Save failed: " + e.message, type: "err" }));
    return true;
  }

  function startAdd() {
    setEditingId(null);
    nav("carform");
  }

  function startEdit(id) {
    setEditingId(id);
    nav("carform");
  }

  async function saveHome(h) {
    const { error } = await contentApi.put("home", {
      home: {
        hero: h.hero,
        trust: h.trust,
        inventory: h.inventory,
        process: { kicker: h.process.kicker, title: h.process.title, sub: h.process.sub, steps: h.process.steps },
        faq: { kicker: h.faq.kicker, title: h.faq.title, items: h.faq.items },
        cta: h.cta,
        contact: h.contact,
      },
    });
    if (error) throw error;
    setDb((d) => ({ ...d, home: h }));
  }

  async function saveSettings(s) {
    const { error } = await contentApi.put("settings", {
      settings: {
        phone: s.phone,
        whatsapp: s.wa,
        address: s.address,
        hoursWeek: s.hoursWeek,
        hoursFri: s.hoursFri,
        emergency: s.emergency,
      },
    });
    if (error) throw error;
    setDb((d) => ({ ...d, settings: s }));
  }

  async function saveCalc(c) {
    const { error } = await contentApi.put("calc", { calc: calcToRow(c) });
    if (error) throw error;
    setDb((d) => ({ ...d, calc: c }));
  }

  // The old build-time "Supabase is not configured" screen is gone: MySQL
  // credentials are read on the server at runtime, so there is nothing that can
  // be missing from the JavaScript bundle. A connection problem now surfaces as
  // a normal error from whichever request hit it.
  if (authLoading) return <div className="auth-boot">Checking your session…</div>;

  if (!session) return <Login onSignedIn={setSession} />;

  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" onClick={(e) => { e.preventDefault(); nav("dashboard"); }}>
          <span className="mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="" />
          </span>
          <span className="txt">
            <b>Mariam Automobile</b>
            <span>Admin panel</span>
          </span>
        </a>

        <nav className="nav">
          <span className="lbl">Manage</span>
          <a href="#dashboard" className={view === "dashboard" ? "active" : ""} onClick={(e) => { e.preventDefault(); nav("dashboard"); }}>
            {IC.grid}Dashboard
          </a>
          <a href="#cars" className={view === "cars" || view === "carform" ? "active" : ""} onClick={(e) => { e.preventDefault(); nav("cars"); }}>
            {IC.car}Cars
          </a>
          <a href="#leads" className={view === "leads" ? "active" : ""} onClick={(e) => { e.preventDefault(); nav("leads"); }}>
            {IC.inbox}Leads
          </a>
          <a href="#media" className={view === "media" ? "active" : ""} onClick={(e) => { e.preventDefault(); nav("media"); }}>
            {IC.media}Media library
          </a>
          <span className="lbl">Site content</span>
          <a href="#happy" className={view === "happy" ? "active" : ""} onClick={(e) => { e.preventDefault(); nav("happy"); }}>
            {IC.photo}Happy Customers
          </a>
          <a href="#home" className={view === "home" ? "active" : ""} onClick={(e) => { e.preventDefault(); nav("home"); }}>
            {IC.home}Homepage
          </a>
          <a href="#calc" className={view === "calc" ? "active" : ""} onClick={(e) => { e.preventDefault(); nav("calc"); }}>
            {IC.calc}Calculator
          </a>
          <a href="#settings" className={view === "settings" ? "active" : ""} onClick={(e) => { e.preventDefault(); nav("settings"); }}>
            {IC.settings}Settings
          </a>
          <a href="#setup" className={view === "setup" ? "active" : ""} onClick={(e) => { e.preventDefault(); nav("setup"); }}>
            {IC.db}Database setup
          </a>
        </nav>

        <div className="side-foot">
          {session?.user?.email && (
            <div className="side-user">
              <span className="av">{session.user.email.slice(0, 2)}</span>
              <span className="who">
                <b>{session.user.email}</b>
                Signed in
              </span>
            </div>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer">
            {IC.ext}View site
          </a>
          <button
            type="button"
            onClick={async () => {
              await auth.signOut();
              setSession(null);
            }}
          >
            {IC.logout}Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        {dataLoading && <div className="card"><p style={{ color: "var(--text-3)" }}>Loading data…</p></div>}
        {!dataLoading && view === "dashboard" && (
          <Dashboard db={db} nav={nav} startAdd={startAdd} startEdit={startEdit} />
        )}
        {!dataLoading && view === "cars" && (
          <CarsView db={db} startAdd={startAdd} startEdit={startEdit} toggleHome={toggleHome} deleteCar={deleteCar} toast={setToast} />
        )}
        {!dataLoading && view === "leads" && <LeadsView toast={setToast} />}
        {!dataLoading && view === "setup" && <SetupView toast={setToast} />}
        {!dataLoading && view === "media" && <MediaView toast={setToast} />}
        {!dataLoading && view === "happy" && <HappyView toast={setToast} />}
        {!dataLoading && view === "carform" && (
          <CarFormView
            db={db}
            editingId={editingId}
            onNotify={setToast}
            onCancel={() => nav("cars")}
            onSave={async (car) => {
              try {
                if (editingId) {
                  await updateCar(editingId, car);
                  setToast({ msg: "Car saved: " + car.title, type: "ok" });
                } else {
                  await addCar(car);
                  setToast({ msg: "Car added: " + car.title, type: "ok" });
                }
                setEditingId(null);
                nav("cars");
              } catch (e) {
                setToast({ msg: "Save failed: " + e.message, type: "err" });
              }
            }}
          />
        )}
        {!dataLoading && view === "home" && (
          <HomeView
            home={db.home}
            onSave={async (h) => {
              try {
                await saveHome(h);
                setToast({ msg: "Homepage content saved.", type: "ok" });
              } catch (e) {
                setToast({ msg: "Save failed: " + e.message, type: "err" });
              }
            }}
          />
        )}
        {!dataLoading && view === "calc" && (
          <CalcView
            calc={db.calc}
            onSave={async (c) => {
              try {
                await saveCalc(c);
                setToast({ msg: "Calculator settings saved.", type: "ok" });
              } catch (e) {
                setToast({
                  msg:
                    /relation .* does not exist/i.test(e.message)
                      ? "Table missing — run mysql/01-schema.sql in phpMyAdmin first."
                      : "Save failed: " + e.message,
                  type: "err",
                });
              }
            }}
          />
        )}
        {!dataLoading && view === "settings" && (
          <SettingsView
            settings={db.settings}
            onSave={async (s) => {
              try {
                await saveSettings(s);
                setToast({ msg: "Settings saved.", type: "ok" });
              } catch (e) {
                setToast({ msg: "Save failed: " + e.message, type: "err" });
              }
            }}
          />
        )}
      </main>

      {toast && (
        <div className={"toast show " + toast.type} role="status" aria-live="polite">
          <span className="dot" />
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ============ media library page ============ */
function MediaView({ toast }) {
  return (
    <section>
      <div className="topbar">
        <div>
          <h1>Media library</h1>
          <div className="crumb">
            Every photo you have uploaded. Drop new images here, then pick them from any car&apos;s photo section.
          </div>
        </div>
      </div>

      <div className="note">
        {IC.info}
        <span>
          Click any image to see it full size, copy its link, or delete it. Deleting is permanent — if a car is still
          using that photo, its picture will break, so remove it from the car first.
        </span>
      </div>

      <div className="card">
        <MediaBrowser selectable={false} onNotify={toast} />
      </div>
    </section>
  );
}

/* ============ dashboard ============ */
function Dashboard({ db, nav, startAdd, startEdit }) {
  const total = db.cars.length;
  const avail = db.cars.filter((c) => c.status === "available").length;
  const sold = total - avail;
  const onHome = db.cars.filter((c) => c.showHome);
  const recent = db.cars.slice(-4).reverse();
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <section>
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <div className="crumb">{today}</div>
        </div>
        <div className="top-actions">
          <a className="btn" href="/" target="_blank" rel="noopener noreferrer">
            {IC.ext}View site
          </a>
        </div>
      </div>

      <div className="cards">
        <div className="card stat accent">
          <span className="sic">{IC.car}</span>
          <div>
            <div className="n">{total}</div>
            <div className="l">Total cars</div>
          </div>
        </div>
        <div className="card stat ok">
          <span className="sic">{IC.check}</span>
          <div>
            <div className="n">{avail}</div>
            <div className="l">Available now</div>
          </div>
        </div>
        <div className="card stat warn">
          <span className="sic">{IC.alert}</span>
          <div>
            <div className="n">{sold}</div>
            <div className="l">Sold / reserved</div>
          </div>
        </div>
        <div className="card stat">
          <span className="sic">{IC.home}</span>
          <div>
            <div className="n">
              {onHome.length}
              <small>/{HOME_LIMIT}</small>
            </div>
            <div className="l">Homepage slots used</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Homepage slots</h2>
            <p>The homepage shows exactly 6 cars. Turn visibility on or off from the Cars page.</p>
          </div>
          <button className="btn btn-sm" onClick={() => nav("cars")}>
            Manage cars
          </button>
        </div>
        <div className="slots">
          {Array.from({ length: HOME_LIMIT }, (_, i) => {
            const c = onHome[i];
            if (!c)
              return (
                <div className="slot empty" key={i}>
                  <span className="ph">{IC.plus}</span>
                  <span className="no">Slot 0{i + 1}</span>
                  <em>Empty — turn on &quot;Home&quot; for a car</em>
                </div>
              );
            return (
              <a
                className="slot filled"
                href="#cars"
                key={c.id}
                title={`${c.title} — ${c.brand} ${c.model} ${c.year}`}
                onClick={(e) => { e.preventDefault(); startEdit(c.id); }}
              >
                <span className="shot">
                  <span className="no">Slot 0{i + 1}</span>
                  <SlotShot car={c} />
                </span>
                <span className="meta">
                  <b>{c.title}</b>
                  <span>
                    {c.brand} · {c.year}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Quick actions</h2>
              <p>Shortcuts.</p>
            </div>
          </div>
          <div className="quick-grid" style={{ gridTemplateColumns: "1fr" }}>
            <button className="quick" onClick={startAdd}>
              <span className="ic">{IC.plus}</span>
              <span>
                Add a new car<span>Opens the full car form</span>
              </span>
            </button>
            <button className="quick" onClick={() => nav("media")}>
              <span className="ic">{IC.media}</span>
              <span>
                Upload photos<span>Media library for every car</span>
              </span>
            </button>
            <button className="quick" onClick={() => nav("home")}>
              <span className="ic">{IC.home}</span>
              <span>
                Edit homepage content<span>Hero, sections, FAQ</span>
              </span>
            </button>
            <button className="quick" onClick={() => nav("calc")}>
              <span className="ic">{IC.calc}</span>
              <span>
                Finance calculator<span>Rates, terms and slider ranges</span>
              </span>
            </button>
            <button className="quick" onClick={() => nav("settings")}>
              <span className="ic">{IC.settings}</span>
              <span>
                Site settings<span>Phone, WhatsApp, hours</span>
              </span>
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Recently added</h2>
              <p>Most recently added or edited.</p>
            </div>
          </div>
          <div className="recent-list">
            {recent.length === 0 && <p style={{ color: "var(--text-3)", fontSize: 13 }}>No cars yet — add your first one.</p>}
            {recent.map((c) => {
              const s = STATUS_META[c.status] || STATUS_META.available;
              return (
                <a className="recent-item" href="#cars" key={c.id} onClick={(e) => { e.preventDefault(); nav("cars"); }}>
                  <Thumb car={c} />
                  <span style={{ flex: 1 }}>
                    <b>{c.title}</b>
                    <span>
                      {c.brand} {c.model} · {c.year}
                    </span>
                  </span>
                  <span className={"pill " + s.pill}>{s.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ cars ============ */
function CarsView({ db, startAdd, startEdit, toggleHome, deleteCar, toast }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [busy, setBusy] = useState(null);

  const list = db.cars.filter((c) => {
    if (f && c.status !== f) return false;
    if (q) {
      const hay = (c.title + " " + c.brand + " " + c.model + " " + c.grade).toLowerCase();
      if (hay.indexOf(q.toLowerCase()) < 0) return false;
    }
    return true;
  });

  const onHome = db.cars.filter((c) => c.showHome).length;

  async function handleDelete(id) {
    if (confirmId !== id) {
      setConfirmId(id);
      setTimeout(() => setConfirmId((cur) => (cur === id ? null : cur)), 3000);
      return;
    }
    setBusy(id);
    try {
      await deleteCar(id);
      toast({ msg: "Car deleted.", type: "ok" });
    } catch (e) {
      toast({ msg: "Delete failed: " + e.message, type: "err" });
    }
    setBusy(null);
    setConfirmId(null);
  }

  return (
    <section>
      <div className="topbar">
        <div>
          <h1>Cars</h1>
          <div className="crumb">Add, edit, delete and control homepage visibility of every car.</div>
        </div>
        <div className="top-actions">
          <button className="btn btn-primary" onClick={startAdd}>
            {IC.plus}Add car
          </button>
        </div>
      </div>

      <div className="note">
        {IC.info}
        <span>
          The cars page shows <b>every</b> car automatically, with filters built from model, body type, year and price.
          The homepage shows only cars with the &quot;Home&quot; switch on (max {HOME_LIMIT}).
        </span>
      </div>

      <div className="toolbar">
        <div className="left">
          <div className="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input type="search" placeholder="Search by name, brand, model…" aria-label="Search cars" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="inline" aria-label="Filter by status" value={f} onChange={(e) => setF(e.target.value)}>
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <span className="home-count">
          <b>{onHome}</b>/{HOME_LIMIT} on homepage
        </span>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Car</th>
                <th>Year</th>
                <th>Price</th>
                <th>Status</th>
                <th>Featured</th>
                <th style={{ textAlign: "center" }}>Home</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const s = STATUS_META[c.status] || STATUS_META.available;
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="car-cell">
                        <Thumb car={c} />
                        <span>
                          <b>{c.title}</b>
                          <span>
                            {c.brand} {c.model} · {c.grade}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>{c.year}</td>
                    <td className="price">{lakh(c.price)}</td>
                    <td>
                      <span className={"pill " + s.pill}>{s.label}</span>
                    </td>
                    <td>{c.featured ? <span className="pill info">Our pick</span> : <span style={{ color: "var(--text-3)" }}>—</span>}</td>
                    <td style={{ textAlign: "center" }}>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={!!c.showHome}
                          disabled={c.status === "sold"}
                          onChange={(e) => {
                            const ok = toggleHome(c.id, e.target.checked);
                            if (ok) toast({ msg: "Homepage visibility updated.", type: "ok" });
                          }}
                        />
                        <span className="track"></span>
                      </label>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="ibtn" aria-label={`Edit ${c.title}`} title="Edit" onClick={() => startEdit(c.id)}>
                          {IC.edit}
                        </button>
                        <button
                          className={"ibtn danger" + (confirmId === c.id ? " confirm" : "")}
                          aria-label={`Delete ${c.title}`}
                          title={confirmId === c.id ? "Click again to confirm delete" : "Delete"}
                          disabled={busy === c.id}
                          onClick={() => handleDelete(c.id)}
                        >
                          {confirmId === c.id ? IC.x : IC.trash}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {list.length === 0 && (
          <div className="empty">
            <h3>No cars match</h3>
            <p>Nothing matches that search. Clear the filters, or add a car.</p>
            <button className="btn btn-primary" onClick={startAdd}>
              Add car
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============ car form ============ */
const EMPTY_CAR = {
  id: "",
  title: "",
  brand: "",
  model: "",
  grade: "",
  year: new Date().getFullYear(),
  body: "SUV",
  fuel: "Hybrid",
  transmission: "Automatic",
  drive: "2WD",
  engine: "",
  mileage: "",
  seats: 5,
  color: "",
  condition: "Recondition",
  auction: "",
  reg: "Fresh registration",
  price: "",
  featured: false,
  status: "available",
  showHome: false,
  photos: [],
  tagline: "",
  about: "",
  features: [""],
};

function CarFormView({ db, editingId, onCancel, onSave, onNotify }) {
  const existing = editingId ? db.cars.find((c) => c.id === editingId) : null;
  const [form, setForm] = useState(existing ? JSON.parse(JSON.stringify(existing)) : EMPTY_CAR);

  const photoCount = (form.photos || []).filter((p) => String(p).trim()).length;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setNum = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setBool = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.checked }));

  function setListItem(arr, i, v) {
    setForm((f) => {
      const a = f[arr].slice();
      a[i] = v;
      return { ...f, [arr]: a };
    });
  }
  function addListItem(arr) {
    setForm((f) => ({ ...f, [arr]: [...f[arr], ""] }));
  }
  function removeListItem(arr, i) {
    setForm((f) => {
      const a = f[arr].slice();
      a.splice(i, 1);
      if (!a.length) a.push("");
      return { ...f, [arr]: a };
    });
  }

  function save() {
    if (!form.title.trim()) return alert("Display title is required.");
    if (!form.brand.trim()) return alert("Brand is required.");
    if (!form.model.trim()) return alert("Model is required.");
    if (!form.year) return alert("Registration year is required.");
    const price = parseInt(form.price, 10);
    if (isNaN(price)) return alert("Price is required.");

    const wantHome = form.showHome && form.status !== "sold";
    let showHome = wantHome;
    if (wantHome && !editingId) {
      const n = db.cars.filter((c) => c.showHome).length;
      if (n >= HOME_LIMIT) showHome = false;
    }

    const id = (form.id || "").trim() || slugify(form.brand + " " + form.title + " " + form.year);
    if (!editingId && db.cars.some((c) => c.id === id)) {
      return alert("That URL slug already exists — change the title or set a custom slug.");
    }

    onSave({
      ...form,
      id,
      year: parseInt(form.year, 10),
      price,
      seats: parseInt(form.seats, 10) || 5,
      showHome,
      photos: form.photos.map((p) => p.trim()).filter(Boolean),
      features: form.features.map((p) => p.trim()).filter(Boolean),
      featured: !!form.featured,
    });
  }

  return (
    <section>
      <a className="back-link" href="#cars" onClick={(e) => { e.preventDefault(); onCancel(); }}>
        {IC.back}Back to cars
      </a>

      <div className="topbar" style={{ marginBottom: 24 }}>
        <div>
          <h1>{editingId ? "Edit — " + form.title : "Add car"}</h1>
          <div className="crumb">
            Fields marked <span style={{ color: "var(--danger)" }}>*</span> are required. Everything else is optional.
          </div>
        </div>
        <div className="top-actions">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            {IC.save}Save car
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Identity</h2>
            <p>What this car is called on the site.</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="f-title">
              Display title <span className="req">*</span>
            </label>
            <input id="f-title" type="text" placeholder="e.g. Corolla Cross Z" value={form.title} onChange={set("title")} />
            <div className="hint">Shown as the heading on the car page.</div>
          </div>
          <div className="field">
            <label htmlFor="f-brand">
              Brand <span className="req">*</span>
            </label>
            <input id="f-brand" type="text" placeholder="Toyota" value={form.brand} onChange={set("brand")} />
          </div>
          <div className="field">
            <label htmlFor="f-model">
              Model <span className="req">*</span>
            </label>
            <input id="f-model" type="text" placeholder="Corolla Cross" value={form.model} onChange={set("model")} />
            <div className="hint">Used by the search box and filters.</div>
          </div>
          <div className="field">
            <label htmlFor="f-grade">Grade / package</label>
            <input id="f-grade" type="text" placeholder="Z Package" value={form.grade} onChange={set("grade")} />
          </div>
          <div className="field">
            <label htmlFor="f-year">
              Registration year <span className="req">*</span>
            </label>
            <input id="f-year" type="number" min="1990" max="2030" value={form.year} onChange={setNum("year")} />
          </div>
          <div className="field">
            <label htmlFor="f-slug">URL slug</label>
            <input id="f-slug" type="text" placeholder="corolla-cross-z-2023" value={form.id} onChange={set("id")} />
            <div className="hint">Generated automatically — leave blank when adding.</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Specifications</h2>
            <p>Shown in the key-spec cards and the full spec table.</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="f-body">Body type</label>
            <select id="f-body" value={form.body} onChange={set("body")}>
              {["SUV", "Sedan", "Hatchback", "MPV", "Pickup", "Coupe"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-fuel">Fuel type</label>
            <select id="f-fuel" value={form.fuel} onChange={set("fuel")}>
              {["Hybrid", "Petrol", "Diesel", "Electric"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-trans">Transmission</label>
            <select id="f-trans" value={form.transmission} onChange={set("transmission")}>
              {["Automatic", "CVT", "Manual"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-drive">Drivetrain</label>
            <select id="f-drive" value={form.drive} onChange={set("drive")}>
              {["2WD", "4WD"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-engine">Engine</label>
            <input id="f-engine" type="text" placeholder="1798 cc" value={form.engine} onChange={set("engine")} />
          </div>
          <div className="field">
            <label htmlFor="f-mileage">Mileage</label>
            <input id="f-mileage" type="text" placeholder="12,400 km" value={form.mileage} onChange={set("mileage")} />
          </div>
          <div className="field">
            <label htmlFor="f-seats">Seats</label>
            <input id="f-seats" type="number" min="2" max="12" value={form.seats} onChange={setNum("seats")} />
          </div>
          <div className="field">
            <label htmlFor="f-color">Colour</label>
            <input id="f-color" type="text" placeholder="Platinum White Pearl" value={form.color} onChange={set("color")} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Sourcing &amp; condition</h2>
            <p>Everything about the auction sheet and registration.</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="f-condition">Condition</label>
            <select id="f-condition" value={form.condition} onChange={set("condition")}>
              {["Recondition", "New"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-auction">Auction grade</label>
            <input id="f-auction" type="text" placeholder="Grade 4.5 / B" value={form.auction} onChange={set("auction")} />
          </div>
          <div className="field full">
            <label htmlFor="f-reg">Registration status</label>
            <input id="f-reg" type="text" placeholder="Fresh registration" value={form.reg} onChange={set("reg")} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Pricing &amp; visibility</h2>
            <p>Where this car appears across the site.</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="f-price">
              Price in Taka <span className="req">*</span>
            </label>
            <input id="f-price" type="number" min="0" step="50000" placeholder="4850000" value={form.price} onChange={setNum("price")} />
            <div className="hint">Formatted as lakhs automatically (৳ 48,50,000).</div>
          </div>
          <div className="field">
            <label htmlFor="f-status">Status</label>
            <select id="f-status" value={form.status} onChange={set("status")}>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
            <div className="hint">Sold cars stay in the archive and disappear from listings.</div>
          </div>
          <div className="field full">
            <label className="check-row">
              <input type="checkbox" checked={!!form.featured} onChange={setBool("featured")} />
              <span className="grow">
                Featured — &quot;Our pick&quot;
                <span className="sub">Shows the red &quot;Our pick&quot; badge and sorts this car first.</span>
              </span>
            </label>
          </div>
          <div className="field full">
            <label className="check-row">
              <span className="switch">
                <input
                  type="checkbox"
                  checked={!!form.showHome}
                  disabled={form.status === "sold"}
                  onChange={(e) => setForm((f) => ({ ...f, showHome: e.target.checked }))}
                />
                <span className="track"></span>
              </span>
              <span className="grow">
                Show on homepage
                <span className="sub">The homepage has {HOME_LIMIT} slots. You can enable a maximum of {HOME_LIMIT} cars.</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Photos</h2>
            <p>
              {photoCount === 0
                ? "No photos yet — the first one you add becomes the cover."
                : `${photoCount} photo${photoCount > 1 ? "s" : ""}. The first is the cover; drag order with the arrows.`}
            </p>
          </div>
        </div>
        <PhotoManager
          photos={form.photos}
          onChange={(next) => setForm((f) => ({ ...f, photos: next }))}
          onNotify={onNotify}
        />
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Content</h2>
            <p>What buyers read on the card and the detail page.</p>
          </div>
        </div>
        <div className="field">
          <label htmlFor="f-tagline">Tagline (card subtitle)</label>
          <textarea id="f-tagline" placeholder="One or two lines shown under the title on the cars page." value={form.tagline} onChange={set("tagline")} />
        </div>
        <div className="field">
          <label htmlFor="f-about">About this car</label>
          <textarea id="f-about" style={{ minHeight: 120 }} placeholder="The full description on the car detail page." value={form.about} onChange={set("about")} />
        </div>
        <div className="field">
          <label>Equipment / features</label>
          <div className="rows">
            {form.features.map((p, i) => (
              <RowLine
                key={i}
                value={p}
                placeholder="e.g. Panoramic glass roof"
                label={"Feature " + (i + 1)}
                onChange={(v) => setListItem("features", i, v)}
                onRemove={() => removeListItem("features", i)}
              />
            ))}
          </div>
          <button type="button" className="add-row" style={{ marginTop: 12 }} onClick={() => addListItem("features")}>
            {IC.plus}Add feature
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============ homepage ============ */
function HomeView({ home, onSave }) {
  const [h, setH] = useState(null);

  useEffect(() => {
    setH(JSON.parse(JSON.stringify(home)));
  }, [home]);

  if (!h) return <section />;

  const setF = (path, value) => {
    setH((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let t = next;
      for (let i = 0; i < parts.length - 1; i++) t = t[parts[i]];
      t[parts[parts.length - 1]] = value;
      return next;
    });
  };

  function listSet(path, i, patch) {
    setH((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let t = next;
      for (let i = 0; i < parts.length - 1; i++) t = t[parts[i]];
      t[parts[parts.length - 1]][i] = patch;
      return next;
    });
  }
  function listAdd(path, item) {
    setH((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let t = next;
      for (let i = 0; i < parts.length - 1; i++) t = t[parts[i]];
      t[parts[parts.length - 1]].push(item);
      return next;
    });
  }
  function listRemove(path, i) {
    setH((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let t = next;
      for (let i = 0; i < parts.length - 1; i++) t = t[parts[i]];
      t[parts[parts.length - 1]].splice(i, 1);
      return next;
    });
  }

  const TextInput = ({ label, path, area }) => (
    <div className={"field" + (area ? " full" : "")}>
      <label>{label}</label>
      {area ? (
        <textarea value={path.split(".").reduce((o, k) => o[k], h) || ""} onChange={(e) => setF(path, e.target.value)} />
      ) : (
        <input type="text" value={path.split(".").reduce((o, k) => o[k], h) || ""} onChange={(e) => setF(path, e.target.value)} />
      )}
    </div>
  );

  return (
    <section>
      <div className="topbar">
        <div>
          <h1>Homepage content</h1>
          <div className="crumb">Text blocks shown on the home page. Changes go live within a minute.</div>
        </div>
        <div className="top-actions">
          <button className="btn btn-primary" onClick={() => onSave(h)}>
            {IC.save}Save homepage
          </button>
        </div>
      </div>

      {/* hero */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Hero</h2>
            <p>The first screen visitors see.</p>
          </div>
        </div>
        <div className="form-grid">
          <TextInput label="Kicker" path="hero.kicker" />
          <TextInput label="Title line 1" path="hero.line1" />
          <TextInput label="Title line 2" path="hero.line2" />
          <TextInput label="Title line 3" path="hero.line3" />
          <TextInput label="Intro paragraph" path="hero.lede" area />
          <TextInput label="Primary button label" path="hero.cta1" />
          <TextInput label="Secondary button label" path="hero.cta2" />
          <div className="field full">
            <label>Assurance points (checkmarks under the buttons)</label>
            <div className="rows">
              {h.hero.assures.map((a, i) => (
                <RowLine key={i} value={a} label={"Assurance point " + (i + 1)} onChange={(v) => listSet("hero.assures", i, v)} onRemove={() => listRemove("hero.assures", i)} />
              ))}
            </div>
            <button type="button" className="add-row" style={{ marginTop: 12 }} onClick={() => listAdd("hero.assures", "")}>
              {IC.plus}Add point
            </button>
          </div>
          <TextInput label="Lead form heading" path="hero.leadTitle" />
          <TextInput label="Lead form subtitle" path="hero.leadSub" />
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <label>Stats rail (4 cells under the hero)</label>
          <div className="rows">
            {h.hero.stats.map((s, i) => (
              <div className="row-box" key={i}>
                <div className="meta">Stat {i + 1}</div>
                <div className="row-line">
                  <input type="text" style={{ maxWidth: 90 }} aria-label="Number" value={s.n} onChange={(e) => listSet("hero.stats", i, { ...s, n: e.target.value })} />
                  <input type="text" style={{ maxWidth: 70 }} aria-label="Suffix" value={s.suffix} onChange={(e) => listSet("hero.stats", i, { ...s, suffix: e.target.value })} />
                  <input type="text" aria-label="Label" value={s.label} onChange={(e) => listSet("hero.stats", i, { ...s, label: e.target.value })} />
                  <button type="button" className="ibtn danger" aria-label="Remove stat" onClick={() => listRemove("hero.stats", i)}>
                    {IC.x}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="add-row" style={{ marginTop: 12 }} onClick={() => listAdd("hero.stats", { n: "", suffix: "", label: "" })}>
            {IC.plus}Add stat
          </button>
        </div>
      </div>

      {/* trust strip */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Trust strip</h2>
            <p>The scrolling ribbon directly under the hero.</p>
          </div>
        </div>
        <div className="rows">
          {h.trust.map((a, i) => (
            <RowLine key={i} value={a} label={"Trust item " + (i + 1)} onChange={(v) => listSet("trust", i, v)} onRemove={() => listRemove("trust", i)} />
          ))}
        </div>
        <button type="button" className="add-row" style={{ marginTop: 12 }} onClick={() => listAdd("trust", "")}>
          {IC.plus}Add item
        </button>
      </div>

      {/* inventory */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Inventory section</h2>
            <p>Heading above the {HOME_LIMIT} homepage cars. The car count updates automatically.</p>
          </div>
        </div>
        <div className="form-grid">
          <TextInput label="Kicker" path="inventory.kicker" />
          <TextInput label="Heading" path="inventory.title" />
          <TextInput label="Intro paragraph" path="inventory.sub" area />
          <TextInput label="Bottom note heading" path="inventory.noteTitle" />
          <TextInput label="Bottom note button" path="inventory.noteBtn" />
          <TextInput label="Bottom note text" path="inventory.noteText" area />
        </div>
      </div>

      {/* process */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>How it works (4 steps)</h2>
            <p>The scroll-driven road journey section.</p>
          </div>
        </div>
        <div className="form-grid">
          <TextInput label="Kicker" path="process.kicker" />
          <TextInput label="Heading" path="process.title" />
          <TextInput label="Intro paragraph" path="process.sub" area />
        </div>
        <div className="rows">
          {h.process.steps.map((s, i) => (
            <div className="row-box" key={i}>
              <div className="meta">Step 0{i + 1}</div>
              <input type="text" aria-label="Step title" value={s.title} onChange={(e) => listSet("process.steps", i, { ...s, title: e.target.value })} />
              <textarea aria-label="Step text" value={s.text} onChange={(e) => listSet("process.steps", i, { ...s, text: e.target.value })} />
            </div>
          ))}
        </div>
      </div>

      {/* faq */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>FAQ</h2>
            <p>Questions and answers shown in the accordion.</p>
          </div>
        </div>
        <div className="form-grid">
          <TextInput label="Kicker" path="faq.kicker" />
          <TextInput label="Heading" path="faq.title" />
        </div>
        <div className="rows">
          {h.faq.items.map((f, i) => (
            <div className="row-box" key={i}>
              <div className="meta">Question {i + 1}</div>
              <input type="text" aria-label="Question" value={f.q} onChange={(e) => listSet("faq.items", i, { ...f, q: e.target.value })} />
              <textarea aria-label="Answer" value={f.a} onChange={(e) => listSet("faq.items", i, { ...f, a: e.target.value })} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" className="ibtn danger" aria-label="Remove question" onClick={() => listRemove("faq.items", i)}>
                  {IC.x}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="add-row" style={{ marginTop: 12 }} onClick={() => listAdd("faq.items", { q: "", a: "" })}>
          {IC.plus}Add question
        </button>
      </div>

      {/* cta band */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Call-to-action band</h2>
            <p>The dark &quot;ready when you are&quot; section before the footer.</p>
          </div>
        </div>
        <div className="form-grid">
          <TextInput label="Kicker" path="cta.kicker" />
          <TextInput label="Heading" path="cta.title" />
          <TextInput label="Primary button" path="cta.btn1" />
          <TextInput label="Secondary button" path="cta.btn2" />
          <TextInput label="Paragraph" path="cta.text" area />
        </div>
      </div>

      {/* contact */}
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Contact section</h2>
            <p>Heading block of the contact card. Phone, address and hours live in Settings.</p>
          </div>
        </div>
        <div className="form-grid">
          <TextInput label="Kicker" path="contact.kicker" />
          <TextInput label="Heading" path="contact.title" />
          <TextInput label="Intro paragraph" path="contact.intro" area />
          <TextInput label="Open-now status text" path="contact.status" />
        </div>
      </div>
    </section>
  );
}

/* ============ settings ============ */
function SettingsView({ settings, onSave }) {
  const [s, setS] = useState(null);

  useEffect(() => {
    setS({ ...settings });
  }, [settings]);

  if (!s) return <section />;

  const set = (k) => (e) => setS((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <section>
      <div className="topbar">
        <div>
          <h1>Settings</h1>
          <div className="crumb">Shared across every page: nav, footer, WhatsApp buttons.</div>
        </div>
        <div className="top-actions">
          <button className="btn btn-primary" onClick={() => onSave(s)}>
            {IC.save}Save settings
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Contact details</h2>
            <p>Used in the navigation bar, footer, contact section and every WhatsApp button.</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="s-phone">Phone number</label>
            <input id="s-phone" type="text" placeholder="01944755111" value={s.phone} onChange={set("phone")} />
          </div>
          <div className="field">
            <label htmlFor="s-wa">WhatsApp number</label>
            <input id="s-wa" type="text" placeholder="8801944755111" value={s.wa} onChange={set("wa")} />
            <div className="hint">International format, no + sign.</div>
          </div>
          <div className="field full">
            <label htmlFor="s-address">Showroom address</label>
            <input id="s-address" type="text" value={s.address} onChange={set("address")} />
          </div>
          <div className="field">
            <label htmlFor="s-h-week">Business hours — Sat to Thu</label>
            <input id="s-h-week" type="text" placeholder="9:00 AM – 8:00 PM" value={s.hoursWeek} onChange={set("hoursWeek")} />
          </div>
          <div className="field">
            <label htmlFor="s-h-fri">Business hours — Friday</label>
            <input id="s-h-fri" type="text" placeholder="2:00 PM – 8:00 PM" value={s.hoursFri} onChange={set("hoursFri")} />
          </div>
          <div className="field full">
            <label htmlFor="s-emergency">Emergency note</label>
            <input id="s-emergency" type="text" value={s.emergency} onChange={set("emergency")} />
          </div>
        </div>
      </div>

    </section>
  );
}

/* ============ leads ============ */
function LeadsView({ toast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error: err } = await leadsApi.list();
      if (!alive) return;
      if (err) setError(err.message);
      else setRows(data?.leads || []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function setStatus(id, status) {
    setBusy(id);
    const { error: err } = await leadsApi.setStatus(id, status);
    setBusy(null);
    if (err) return toast({ msg: "Update failed: " + err.message, type: "err" });
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  async function remove(id) {
    if (confirmId !== id) {
      setConfirmId(id);
      setTimeout(() => setConfirmId((c) => (c === id ? null : c)), 3000);
      return;
    }
    setConfirmId(null);
    setBusy(id);
    const { error: err } = await leadsApi.remove(id);
    setBusy(null);
    if (err) return toast({ msg: "Delete failed: " + err.message, type: "err" });
    setRows((r) => r.filter((x) => x.id !== id));
    toast({ msg: "Lead deleted.", type: "ok" });
  }

  const list = rows.filter((r) => {
    if (filter && r.status !== filter) return false;
    return true;
  });

  const newCount = rows.filter((r) => r.status === "new").length;

  const stamp = (iso) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return { date: "—", time: "" };
    return {
      date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }),
      time: d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Dhaka" }),
    };
  };

  return (
    <section>
      <div className="topbar">
        <div>
          <h1>Leads</h1>
          <div className="crumb">
            Everyone who filled in the homepage enquiry form, newest first. Times are Bangladesh time.
          </div>
        </div>
        <div className="top-actions">
          <span className="home-count">
            <b>{newCount}</b> new
          </span>
        </div>
      </div>

      {error && (
        <div className="auth-err" style={{ marginBottom: 20 }}>
          {IC.alert}
          <span>
            {/relation .* does not exist|Could not find the table/i.test(error)
              ? "Table missing — run mysql/01-schema.sql in phpMyAdmin first."
              : error}
          </span>
        </div>
      )}

      <div className="toolbar">
        <div className="left">
          <select className="inline" aria-label="Filter by status" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="up-progress">
            <span className="spin" />
            Loading leads…
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="empty">
          <h3>No leads yet</h3>
          <p>When someone submits the homepage form, it will appear here with the date and time.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Contact</th>
                  <th>Looking for</th>
                  <th>Budget / payment</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => {
                  const t = stamp(r.created_at);
                  const wa = String(r.phone || "").replace(/[^0-9]/g, "");
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="when">
                          <b>{t.date}</b>
                          <span>{t.time}</span>
                        </div>
                      </td>
                      <td>
                        <div className="car-cell" style={{ minWidth: 0 }}>
                          <span>
                            <b>{r.name || "—"}</b>
                            <span>{r.phone || "—"}</span>
                          </span>
                        </div>
                      </td>
                      <td>{r.car || <span style={{ color: "var(--text-3)" }}>—</span>}</td>
                      <td>
                        <div className="when">
                          <b style={{ fontWeight: 600 }}>{r.budget || "—"}</b>
                          <span>{r.payment || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          className="inline"
                          style={{ minWidth: 128 }}
                          aria-label={`Status for ${r.name}`}
                          value={r.status}
                          disabled={busy === r.id}
                          onChange={(e) => setStatus(r.id, e.target.value)}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td>
                        <div className="actions">
                          {wa && (
                            <a
                              className="ibtn"
                              title="Reply on WhatsApp"
                              aria-label={`WhatsApp ${r.name}`}
                              href={`https://wa.me/88${wa.replace(/^88/, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {IC.ext}
                            </a>
                          )}
                          <button
                            className={"ibtn danger" + (confirmId === r.id ? " confirm" : "")}
                            title={confirmId === r.id ? "Click again to confirm" : "Delete"}
                            aria-label={`Delete lead from ${r.name}`}
                            disabled={busy === r.id}
                            onClick={() => remove(r.id)}
                          >
                            {confirmId === r.id ? IC.x : IC.trash}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
