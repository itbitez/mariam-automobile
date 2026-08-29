import { SITE, waLink, telLink } from "@/lib/site";
import { getHappyCustomers, getSettings } from "@/lib/query";
import HappyGallery from "@/components/happy-gallery";
import WaGlyph from "@/components/wa-glyph";
import SiteFooter from "@/components/site-footer";
import MobileNav from "@/components/mobile-nav";
import "./happy.css";

export const revalidate = 60;

export const metadata = {
  title: "Happy Customers — Deliveries from Our Rajshahi Showroom",
  description:
    "Real handover photos from Mariam Automobile customers across Rajshahi and beyond. See the cars we have delivered and the people driving them.",
  alternates: { canonical: "/happy-customers" },
};

const IMG = {
  logoLight: "/img/logo-light.webp",
  logoDark: "/img/logo-dark.webp",
  headBg: "https://images.unsplash.com/photo-1761738217531-44a249d1dc87?fm=jpg&q=72&w=2200&auto=format&fit=crop",
};

const PHONE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const CAMERA = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M3 9a2 2 0 0 1 2-2h2l1.4-2h7.2L17 7h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
    <circle cx="12" cy="13" r="3.6" />
  </svg>
);

export default async function HappyCustomersPage() {
  const [photos, settings] = await Promise.all([getHappyCustomers(), getSettings()]);
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
          <a href="/cars">Cars</a>
          <a href="/happy-customers" className="active">
            Happy Customers
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
        <MobileNav phone={site.phone} tel={telLink(undefined, site)} active="/happy-customers" />
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
            <span>/</span>Happy customers
          </div>

          <div className="head-row">
            <div>
              <span className="kicker on-dark fade-up">Handover day · Terokhadia showroom</span>
              <h1 className="fade-up">
                The best part
                <br />
                of the job
              </h1>
              <p className="lede fade-up">
                Every car here left our showroom with someone who had done their homework — auction sheet checked,
                paperwork sorted, keys in hand. These are their photos.
              </p>
            </div>

            {photos.length ? (
              <div className="head-stats fade-up">
                <div className="cell">
                  <div className="n">
                    {photos.length}
                    <i>+</i>
                  </div>
                  <div className="t">Handovers pictured</div>
                </div>
                <div className="cell">
                  <div className="n">
                    500<i>+</i>
                  </div>
                  <div className="t">Cars delivered</div>
                </div>
                <div className="cell">
                  <div className="n">
                    100<i>%</i>
                  </div>
                  <div className="t">Auction verified</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="hc-intro wrap">
        <h2>Delivered, registered, and on the road</h2>
        <p>
          We would rather show you the people than talk about ourselves. Tap any photo to see it full size.
        </p>
      </section>

      <section className="hc-wrap wrap">
        {photos.length ? (
          <HappyGallery photos={photos} />
        ) : (
          <div className="hc-empty">
            {CAMERA}
            <h3>Photos coming soon</h3>
            <p>
              We are collecting handover photos from our recent customers. Check back shortly, or ask us on WhatsApp
              about the cars we have delivered.
            </p>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <SiteFooter site={site} />

      <a
        href={waLink("Hi Mariam Automobile, I saw your happy customers page.", site)}
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
