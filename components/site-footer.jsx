import Link from "next/link";
import { waLink, telLink, mapsLink } from "@/lib/site";
import WaGlyph from "@/components/wa-glyph";

const PHONE = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const PIN = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const FB = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 9h3V5h-3c-2.2 0-4 1.8-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1z" />
  </svg>
);

const ARROW = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// Absolute hrefs so the same links work from /cars and /cars/[id] too.
const LINKS = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Available cars" },
  { href: "/#process", label: "How it works" },
  { href: "/#finance", label: "Finance & loans" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact us" },
];

/**
 * Shared across every page. Lives in one place so the three pages cannot drift
 * apart the way they did before; styles are in app/globals.css.
 */
export default function SiteFooter({ site, logo = "/img/logo-footer.webp" }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-foot">
      <div className="sf-top">
        <div className="sf-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="sf-logo" src={logo} width={280} height={125} loading="lazy" decoding="async" alt="Mariam Automobile" />
          <p>
            Japan recondition &amp; new cars sales center in Rajshahi. Auction-verified vehicles, bank loan support and
            after-sales care — start to finish.
          </p>
          <div className="sf-socials">
            <a href={site.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              {FB}
            </a>
            <a href={waLink(undefined, site)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <WaGlyph />
            </a>
            <a href={telLink(undefined, site)} aria-label="Call us">
              {PHONE}
            </a>
          </div>
        </div>

        {/* A <nav> element would be caught by the page stylesheets' bare
            `nav { position: fixed; top: 0 }` rule for the site header and get
            pinned to the top of the viewport. role="navigation" is equivalent
            to <nav> for assistive tech without the selector collision. */}
        <div className="sf-col" role="navigation" aria-label="Footer">
          <h4>Explore</h4>
          <ul className="sf-links">
            {LINKS.map((l) => (
              <li key={l.href + l.label}>
                <Link href={l.href}>
                  {l.label}
                  {ARROW}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="sf-col">
          <h4>Get in touch</h4>
          <a className="sf-contact" href={telLink(undefined, site)}>
            <span className="sf-ic">{PHONE}</span>
            <span>
              <span className="sf-lbl">Call the showroom</span>
              <span className="sf-val">{site.phone}</span>
            </span>
          </a>
          <a className="sf-contact" href={waLink(undefined, site)} target="_blank" rel="noopener noreferrer">
            <span className="sf-ic">
              <WaGlyph />
            </span>
            <span>
              <span className="sf-lbl">WhatsApp — fastest reply</span>
              <span className="sf-val">Message us</span>
            </span>
          </a>
          <a className="sf-contact" href={mapsLink(undefined, site)} target="_blank" rel="noopener noreferrer">
            <span className="sf-ic">{PIN}</span>
            <span>
              <span className="sf-lbl">Visit us</span>
              <span className="sf-val sf-val-sm">{site.address}</span>
            </span>
          </a>
        </div>

        <div className="sf-col">
          <h4>Opening hours</h4>
          <div className="sf-hours">
            <div>
              <span>Saturday &ndash; Thursday</span>
              <b>{site.hoursWeek}</b>
            </div>
            <div>
              <span>Friday</span>
              <b>{site.hoursFri}</b>
            </div>
          </div>
          <div className="sf-emergency">
            <span className="sf-dot" aria-hidden="true"></span>
            {site.emergency}
          </div>
        </div>
      </div>

      <div className="sf-bottom-wrap">
        <div className="sf-bottom">
          <span>&copy; {year} Mariam Automobile. All rights reserved.</span>
          <span>Terokhadia, Rajshahi &middot; Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}
