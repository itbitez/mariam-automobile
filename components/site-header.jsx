"use client";

import { useEffect } from "react";
import MobileNav from "@/components/mobile-nav";

/**
 * The site header — one definition for every page.
 *
 * Previously each page carried its own copy of this markup, its own nav CSS,
 * and its own scroll handler. They drifted: /happy-customers was built without
 * a handler, so its nav never gained the `.scrolled` class and the white links
 * stayed white once you scrolled onto the white page body — the menu simply
 * disappeared. Its progress bar never moved either.
 *
 * Everything lives here now, so a page cannot be added without it.
 */

const PHONE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const LOGO_LIGHT = "/img/logo-light.webp";
const LOGO_DARK = "/img/logo-dark.webp";

/**
 * On the homepage the section links are in-page anchors so the browser scrolls
 * smoothly. Everywhere else they have to navigate home first.
 */
function links(isHome) {
  const at = (hash) => (isHome ? hash : "/" + hash);
  return [
    { href: isHome ? "#top" : "/", label: "Home", key: "/" },
    { href: "/cars", label: "Cars", key: "/cars" },
    { href: "/happy-customers", label: "Happy Customers", key: "/happy-customers" },
    { href: at("#process"), label: "How It Works", key: "#process" },
    { href: at("#finance"), label: "Finance", key: "#finance" },
    { href: at("#faq"), label: "FAQ", key: "#faq" },
    { href: at("#contact"), label: "Contact", key: "#contact" },
  ];
}

export default function SiteHeader({ site, active = "/", isHome = false, tel }) {
  useEffect(() => {
    const progress = document.getElementById("progress");
    const nav = document.getElementById("nav");
    if (!nav) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const h = document.documentElement;
        const top = h.scrollTop || document.body.scrollTop;
        if (progress) {
          progress.style.transform = "scaleX(" + top / (h.scrollHeight - h.clientHeight || 1) + ")";
        }
        nav.classList.toggle("scrolled", top > 60);

        // The floating WhatsApp button is chrome too, and it sits at opacity 0
        // until it gets .show — on /happy-customers nothing ever added it, so
        // the button was invisible on that page.
        const fab = document.getElementById("fab");
        if (fab) fab.classList.toggle("show", top > 500);

        ticking = false;
      });
    };

    onScroll(); // set the correct state for a page restored mid-scroll
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = links(isHome);

  return (
    <>
      <div className="progress" id="progress" />

      <nav id="nav">
        <a className="logo-link" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo logo-light" src={LOGO_LIGHT} width={400} height={178} alt="Mariam Automobile" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo logo-dark" decoding="async" src={LOGO_DARK} width={400} height={178} alt="" aria-hidden="true" />
        </a>

        <div className="nav-mid">
          {items.map((l) => (
            <a key={l.key} href={l.href} className={l.key === active ? "active" : undefined}>
              {l.label}
            </a>
          ))}
        </div>

        <a href={tel} className="btn btn-red">
          {PHONE_ICON}
          {site.phone}
        </a>

        <MobileNav phone={site.phone} tel={tel} active={active} />
      </nav>
    </>
  );
}
