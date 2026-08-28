import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PLACEHOLDER_IMG } from "@/lib/data";
import { SITE, waLink, telLink, mapsLink } from "@/lib/site";
import { lakh } from "@/lib/format";
import { getCarById, getCarIds, getListingCars, getSettings, getCalc } from "@/lib/query";
import CarGallery from "@/components/car-gallery";
import EmiCalc from "@/components/emi-calc";
import DetailChrome from "@/components/detail-chrome";
import SimilarCard from "@/components/similar-card";
import BookViewing from "@/components/book-viewing";
import WaGlyph from "@/components/wa-glyph";
import SiteFooter from "@/components/site-footer";
import "./car.css";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const ids = await getCarIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) return { title: "Car not found" };
  const name = `${car.brand} ${car.title} ${car.year}`;
  return {
    title: `${name} — ${lakh(car.price)}`,
    description: car.tagline || car.about,
    alternates: { canonical: `/cars/${car.id}` },
    openGraph: {
      title: `${name} — Mariam Automobile, Rajshahi`,
      description: car.tagline || car.about,
      images: [{ url: car.photos[0] || PLACEHOLDER_IMG }],
    },
  };
}

const IMG = {
  logoLight: "/img/logo-light.webp",
  logoDark: "/img/logo-dark.webp",
  logoFooter: "/img/logo-light.webp",
  headBg: "https://images.unsplash.com/photo-1565376901308-37344a4b06ea?fm=jpg&q=72&w=2200&auto=format&fit=crop",
};

const PHONE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const PIN_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ARROW = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const KEY_ICONS = {
  fuel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15M3 20h12M16 8l3 3v7a2 2 0 0 1-4 0" />
    </svg>
  ),
  km: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12l4-3" />
    </svg>
  ),
  engine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 9h3l2-2h5l2 2h2v6h-2l-2 2H10l-2-2H5z" />
      <path d="M12 5V3" />
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 4v16M18 4v16M6 12h12M12 4v8" />
    </svg>
  ),
  seat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 4v9a2 2 0 0 0 2 2h6M7 19h11" />
    </svg>
  ),
  paint: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8h13v5H4zM17 10h3v9a2 2 0 0 1-4 0v-4" />
      <path d="M4 8V5h13v3" />
    </svg>
  ),
  drive: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" />
    </svg>
  ),
  grade: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

export default async function CarPage({ params }) {
  const { id } = await params;
  const [car, settings, listing, calc] = await Promise.all([
    getCarById(id),
    getSettings(),
    getListingCars(),
    getCalc(),
  ]);
  if (!car) notFound();
  const site = { ...SITE, ...settings };

  const name = `${car.brand} ${car.title} ${car.year}`;
  const waAsk = waLink(
    `Hi Mariam Automobile, I'm interested in the ${name} listed at ${lakh(car.price)}. Is it still available?`,
    site
  );
  const sim = listing
    .filter((c) => c.id !== car.id)
    .sort((a, b) => {
      const sa = (a.body === car.body ? 2 : 0) + (a.brand === car.brand ? 1 : 0) - Math.abs(a.price - car.price) / 10000000;
      const sb = (b.body === car.body ? 2 : 0) + (b.brand === car.brand ? 1 : 0) - Math.abs(b.price - car.price) / 10000000;
      return sb - sa;
    })
    .slice(0, 3);

  const keys = [
    { i: "fuel", t: "Fuel", v: car.fuel },
    { i: "km", t: "Mileage", v: car.mileage },
    { i: "engine", t: "Engine", v: car.engine },
    { i: "gear", t: "Transmission", v: car.transmission },
    { i: "seat", t: "Seats", v: car.seats + " seats" },
    { i: "paint", t: "Colour", v: car.color },
    { i: "drive", t: "Drivetrain", v: car.drive },
    { i: "grade", t: "Auction grade", v: car.auction },
  ];

  const specRows = [
    ["Brand", car.brand],
    ["Model", car.model],
    ["Grade / package", car.grade],
    ["Registration year", car.year],
    ["Body type", car.body],
    ["Engine capacity", car.engine],
    ["Fuel type", car.fuel],
    ["Transmission", car.transmission],
    ["Drivetrain", car.drive],
    ["Seating", car.seats + " seats"],
    ["Exterior colour", car.color],
    ["Recorded mileage", car.mileage],
    ["Condition", car.condition],
    ["Auction grade", car.auction],
    ["Registration status", car.reg],
  ];

  return (
    <>
      <div className="progress" id="progress"></div>

      {/* NAV */}
      <nav id="nav">
        <a className="logo-link" href="/">
          <img className="logo logo-light" src={IMG.logoLight} width={400} height={178} alt="Mariam Automobile" />
          <img className="logo logo-dark" decoding="async" src={IMG.logoDark} width={400} height={178} alt="Mariam Automobile" />
        </a>
        <div className="nav-mid">
          <a href="/">Home</a>
          <a href="/cars" className="active">
            Cars
          </a>
          <a href="/#process">How It Works</a>
          <a href="/#finance">Finance</a>
          <a href="/#faq">FAQ</a>
          <a href="/#contact">Contact</a>
        </div>
        <a href={telLink(undefined, site)} className="btn btn-red">
          {PHONE_ICON}
          {site.phone}
        </a>
      </nav>

      {/* HEAD */}
      <header className="detail-head">
        <div className="head-bg" id="headBg">
          <img src={IMG.headBg} alt="" loading="eager" />
        </div>
        <div className="grain"></div>

        <div className="wrap inner">
          <div className="crumbs fade-up">
            <a href="/">Home</a>
            <span>/</span>
            <a href="/cars">Available cars</a>
            <span>/</span>
            <em style={{ fontStyle: "normal", color: "rgba(255,255,255,0.75)" }}>
              {car.brand} {car.model}
            </em>
          </div>
          <div className="badges fade-up" id="badges">
            <span className="badge on">Available now</span>
            {car.featured ? <span className="badge hot">Our pick</span> : null}
            <span className="badge">{car.condition}</span>
            <span className="badge">{car.auction}</span>
          </div>
          <h1 className="fade-up d1" id="title">
            {car.brand} {car.title}
          </h1>
          <div className="head-sub fade-up d2" id="headSub">
            {[`Registered ${car.year}`, car.fuel, car.mileage, car.transmission, car.body].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </header>

      {/* GALLERY */}
      <div className="wrap gallery-wrap">
        <CarGallery car={car} />
      </div>

      {/* SHELL */}
      <main className="wrap shell">
        <div>
          {/* overview */}
          <section className="block rv">
            <span className="kicker">Overview</span>
            <h2 id="ovTitle">About this {car.model}</h2>
            <p className="lead" id="about">
              {car.about}
            </p>

            <div className="keyspecs" id="keyspecs">
              {keys.map((k) => (
                <div className="ks" key={k.t}>
                  <div className="ic">{KEY_ICONS[k.i]}</div>
                  <div className="t">{k.t}</div>
                  <div className="v">{k.v}</div>
                </div>
              ))}
            </div>
          </section>

          {/* condition */}
          <section className="block rv">
            <div className="condition">
              <div className="in">
                <span className="kicker on-dark">Condition report</span>
                <h2 style={{ marginTop: 16 }}>Nothing hidden, nothing guessed</h2>
                <p>
                  Every car we import comes with its original Japanese auction sheet. It records the grade, the interior
                  rating and any repair history. Ask for it before you decide — we would rather you read it than take our
                  word.
                </p>

                <div className="cond-grid">
                  <div className="cond">
                    <div className="t">Auction grade</div>
                    <div className="v">{car.auction}</div>
                    <div className="n">Exterior / interior rating</div>
                  </div>
                  <div className="cond">
                    <div className="t">Recorded mileage</div>
                    <div className="v">{car.mileage}</div>
                    <div className="n">Verified against the sheet</div>
                  </div>
                  <div className="cond">
                    <div className="t">Registration</div>
                    <div className="v">{car.reg}</div>
                    <div className="n">Paperwork handled by us</div>
                  </div>
                </div>

                <a className="btn btn-red" id="sheetBtn" href={waLink(`Hi, can you send me the auction sheet for the ${name}?`, site)}>
                  Request the auction sheet
                </a>
              </div>
            </div>
          </section>

          {/* specification */}
          <section className="block rv">
            <span className="kicker">Specification</span>
            <h2>Full spec sheet</h2>
            <div className="spectable" id="spectable">
              {specRows.map((r) => (
                <div className="spec-row" key={r[0]}>
                  <div className="k">{r[0]}</div>
                  <div className="v">{r[1]}</div>
                </div>
              ))}
            </div>
          </section>

          {/* features */}
          <section className="block rv">
            <span className="kicker">Equipment</span>
            <h2>What is fitted</h2>
            <ul className="features" id="features">
              {car.features.map((f) => (
                <li key={f}>
                  {CHECK}
                  {f}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ENQUIRY */}
        <aside className="buy rv">
          <div className="buy-top">
            <div className="plabel">Showroom price</div>
            <div className="price">{lakh(car.price)}</div>
            <p className="pnote">Negotiable for cash buyers. Registration and documentation quoted separately.</p>
          </div>

          <div className="buy-actions">
            <a className="btn btn-wa btn-full" id="waBtn" href={waAsk} target="_blank" rel="noopener noreferrer">
              <WaGlyph />
              Ask about this car
            </a>
            <div className="pair">
              <a className="btn btn-dark" href={telLink(undefined, site)}>
                Call now
              </a>
              <BookViewing car={car} />
            </div>
          </div>

          <EmiCalc price={car.price} calc={calc} />

          <div className="buy-foot">
            <div className="ht">Included with every car</div>
            <ul>
              <li>{CHECK}Original auction sheet</li>
              <li>{CHECK}Import and registration handled</li>
              <li>{CHECK}Warranty and after-sales support</li>
              <li>{CHECK}Bank loan assistance</li>
            </ul>
          </div>
        </aside>
      </main>

      {/* SIMILAR */}
      <section className="similar">
        <div className="wrap">
          <div className="sim-top">
            <div>
              <span className="kicker">Also in stock</span>
              <h2>You might also consider</h2>
            </div>
            <Link className="btn btn-line" href="/cars">
              See all cars
            </Link>
          </div>
          <div className="car-grid" id="simGrid">
            {sim.map((c, i) => (
              <SimilarCard car={c} key={c.id} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <SiteFooter site={site} />

      {/* MOBILE BAR */}
      <div className="bar">
        <div className="p">
          <div className="l">Price</div>
          <div className="v">{lakh(car.price)}</div>
        </div>
        <a className="btn btn-wa btn-sm" id="barWa" href={waAsk} target="_blank" rel="noopener noreferrer">
          <WaGlyph />
          WhatsApp
        </a>
        <a className="btn btn-dark btn-sm" href={telLink(undefined, site)}>
          Call
        </a>
      </div>

      <DetailChrome />
    </>
  );
}
