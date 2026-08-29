import { SITE, waLink, telLink } from "@/lib/site";
import { getHappyCustomers, getSettings } from "@/lib/query";
import HappyGallery from "@/components/happy-gallery";
import WaGlyph from "@/components/wa-glyph";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import "./happy.css";

export const revalidate = 60;

export const metadata = {
  title: "Happy Customers — Deliveries from Our Rajshahi Showroom",
  description:
    "Real handover photos from Mariam Automobile customers across Rajshahi and beyond. See the cars we have delivered and the people driving them.",
  alternates: { canonical: "/happy-customers" },
};

const IMG = {
  headBg: "https://images.unsplash.com/photo-1761738217531-44a249d1dc87?fm=jpg&q=72&w=2200&auto=format&fit=crop",
};

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
      <SiteHeader site={site} tel={telLink(undefined, site)} active="/happy-customers" />

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
