"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Burger + full-screen drawer for the /cars and /cars/[id] pages.
 *
 * Those pages hide `.nav-mid` below 1080px but never had a replacement, so on a
 * phone the header collapsed to just a logo and a call button — there was no way
 * to reach any other page. The home page has its own bespoke drawer driven by
 * imperative DOM code in home-client.jsx; this is the same design expressed as a
 * normal React component, for the two pages that were missing one.
 */

const ARROW = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PHONE = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path
      d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Cars" },
  { href: "/happy-customers", label: "Happy Customers" },
  { href: "/#process", label: "How It Works" },
  { href: "/#finance", label: "Finance" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export default function MobileNav({ phone, tel, active }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock the page behind the drawer, and let Escape close it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`mnav-burger${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-controls="mobile-drawer"
        onClick={() => setOpen((v) => !v)}
      >
        <i />
        <i />
        <i />
      </button>

      {/* Portaled to <body>. The header is `position: fixed; z-index: 200`, which
          makes it a stacking context — a drawer rendered inside it would paint
          over the burger and there would be no way to close the menu. */}
      {mounted && open
        ? createPortal(
            <div id="mobile-drawer" className="mnav-drawer">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  className="mnav-link"
                  href={l.href}
                  aria-current={l.href === active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                  {ARROW}
                </a>
              ))}

              {phone ? (
                <div className="mnav-cta">
                  <a href={tel} className="btn btn-red">
                    {PHONE}
                    Call {phone}
                  </a>
                </div>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
