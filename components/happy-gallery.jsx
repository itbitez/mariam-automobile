"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Masonry gallery + lightbox for /happy-customers.
 *
 * The lightbox is portaled to <body> for the same reason the mobile drawer is:
 * the header is `position: fixed; z-index: 200`, so anything rendered inside the
 * page flow can end up trapped beneath it.
 */

const CLOSE = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
  </svg>
);

const PREV = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M15 18 9 12l6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NEXT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SPARK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeLinecap="round" />
  </svg>
);

export default function HappyGallery({ photos }) {
  const [index, setIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const open = index >= 0 && index < photos.length;
  const close = useCallback(() => setIndex(-1), []);
  const step = useCallback(
    (d) => setIndex((i) => (i + d + photos.length) % photos.length),
    [photos.length]
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  const current = open ? photos[index] : null;

  return (
    <>
      <div className="hc-grid">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className="hc-item"
            onClick={() => setIndex(i)}
            aria-label={p.caption ? `View photo: ${p.caption}` : `View photo ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.caption || "Happy Mariam Automobile customer"}
              loading={i < 4 ? "eager" : "lazy"}
              decoding="async"
            />
            <span className="hc-badge">{SPARK}Delivered</span>
            {p.caption ? <span className="hc-cap">{p.caption}</span> : null}
          </button>
        ))}
      </div>

      {mounted && open
        ? createPortal(
            <div
              className="hc-lb"
              role="dialog"
              aria-modal="true"
              aria-label="Customer photo"
              onClick={close}
            >
              <button type="button" className="hc-lb-close" onClick={close} aria-label="Close">
                {CLOSE}
              </button>

              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="hc-lb-nav prev"
                    aria-label="Previous photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      step(-1);
                    }}
                  >
                    {PREV}
                  </button>
                  <button
                    type="button"
                    className="hc-lb-nav next"
                    aria-label="Next photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      step(1);
                    }}
                  >
                    {NEXT}
                  </button>
                </>
              ) : null}

              <div className="hc-lb-stage" onClick={(e) => e.stopPropagation()}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.url} alt={current.caption || "Happy Mariam Automobile customer"} />
              </div>

              <div className="hc-lb-foot">
                {current.caption ? <span>{current.caption}</span> : null}
                <span>
                  {index + 1} / {photos.length}
                </span>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
