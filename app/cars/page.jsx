import { SITE, waLink, telLink, mapsLink } from "@/lib/site";
import { getListingCars, getSettings } from "@/lib/query";
import CarsClient from "@/components/cars-client";
import WaGlyph from "@/components/wa-glyph";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import "./cars.css";

export const revalidate = 60;

export const metadata = {
  title: "Available Cars — Browse Our Current Stock",
  description:
    "Browse every Japanese reconditioned and new car in stock at Mariam Automobile, Rajshahi. Filter by model, body type, year and budget. Auction sheet available on every unit.",
  alternates: { canonical: "/cars" },
};

const IMG = {
  logoFooter: "/img/logo-light.webp",
  headBg: "https://images.unsplash.com/photo-1761738217531-44a249d1dc87?fm=jpg&q=72&w=2200&auto=format&fit=crop",
};

const PIN_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default async function CarsPage() {
  const [cars, settings] = await Promise.all([getListingCars(), getSettings()]);
  const site = { ...SITE, ...settings };

  return (
    <>
      <SiteHeader site={site} tel={telLink(undefined, site)} active="/cars" />

      {/* PAGE HEAD */}
      <header className="page-head">
        <div className="head-bg" id="headBg">
          <img src={IMG.headBg} alt="" loading="eager" />
        </div>
        <div className="grain"></div>

        <div className="wrap inner">
          <div className="crumbs fade-up">
            <a href="/">Home</a>
            <span>/</span>Available cars
          </div>

          <div className="head-row">
            <div>
              <span className="kicker on-dark fade-up">Current stock · Terokhadia showroom</span>
              <h1 className="fade-up">
                Every car we have,
                <br />
                on one page
              </h1>
              <p className="lede fade-up">
                Auction-verified Japanese vehicles, inspected and ready to register. Filter by what matters to you — then
                click any car for the full condition report.
              </p>
            </div>

            <div className="head-stats fade-up">
              <div className="cell">
                <div className="n" id="statCount">
                  {cars.length}
                </div>
                <div className="t">In stock now</div>
              </div>
              <div className="cell">
                <div className="n">
                  4<i>+</i>
                </div>
                <div className="t">Auction grade</div>
              </div>
              <div className="cell">
                <div className="n">
                  48<i>h</i>
                </div>
                <div className="t">Sheet on request</div>
              </div>
            </div>
          </div>

          <label className="searchbar fade-up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input type="search" id="q" placeholder="Search a model — Corolla Cross, C-HR, Harrier…" aria-label="Search cars" />
          </label>
        </div>
      </header>

      <div className="scrim" id="scrim"></div>

      {/* SHELL */}
      <main className="wrap shell">
        <CarsClient cars={cars} settings={site} />
      </main>

      {/* SOURCE BAND */}
      <section className="source">
        <div className="wrap inner">
          <span className="kicker on-dark">Custom order</span>
          <h2>We can find the exact car you want</h2>
          <p>
            Tell us the model, grade, year and budget. We bid on it at the Japanese auction and quote you the full landed
            cost — before you commit to anything.
          </p>
          <div className="row">
            <a className="btn btn-red" id="srcWa" href={waLink("Hi, I'd like to place a custom order from the Japanese auction.", site)}>
              Start a custom order
            </a>
            <a className="btn btn-glass" href={telLink(undefined, site)}>
              Call {site.phone}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <SiteFooter site={site} />

      <a
        href={waLink("Hi Mariam Automobile, I'm browsing your available cars.", site)}
        className="fab"
        id="fab"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat on WhatsApp"
      >
        <WaGlyph />
      </a>
    </>
  );
}

