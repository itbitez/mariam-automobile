import { SITE, waLink, telLink, mapsLink } from "@/lib/site";
import { getListingCars, getSettings } from "@/lib/query";
import CarsClient from "@/components/cars-client";
import WaGlyph from "@/components/wa-glyph";
import SiteFooter from "@/components/site-footer";
import MobileNav from "@/components/mobile-nav";
import "./cars.css";

export const revalidate = 60;

export const metadata = {
  title: "Available Cars â€” Browse Our Current Stock",
  description:
    "Browse every Japanese reconditioned and new car in stock at Mariam Automobile, Rajshahi. Filter by model, body type, year and budget. Auction sheet available on every unit.",
  alternates: { canonical: "/cars" },
};

const IMG = {
  logoLight: "/img/logo-light.webp",
  logoDark: "/img/logo-dark.webp",
  logoFooter: "/img/logo-light.webp",
  headBg: "https://images.unsplash.com/photo-1761738217531-44a249d1dc87?fm=jpg&q=72&w=2200&auto=format&fit=crop",
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

export default async function CarsPage() {
  const [cars, settings] = await Promise.all([getListingCars(), getSettings()]);
  const site = { ...SITE, ...settings };

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
        <MobileNav phone={site.phone} tel={telLink(undefined, site)} active="/cars" />
      </nav>

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
              <span className="kicker on-dark fade-up">Current stock Â· Terokhadia showroom</span>
              <h1 className="fade-up">
                Every car we have,
                <br />
                on one page
              </h1>
              <p className="lede fade-up">
                Auction-verified Japanese vehicles, inspected and ready to register. Filter by what matters to you â€” then
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
            <input type="search" id="q" placeholder="Search a model â€” Corolla Cross, C-HR, Harrierâ€¦" aria-label="Search cars" />
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
            cost â€” before you commit to anything.
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

