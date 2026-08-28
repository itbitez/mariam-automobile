"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PLACEHOLDER_IMG } from "@/lib/data";

function pad(n) {
  return (n < 10 ? "0" : "") + n;
}

export default function CarGallery({ car }) {
  const shots = car.photos.slice(0, 4);
  const [gi, setGi] = useState(0);
  const [failed, setFailed] = useState({});

  function showShot(i) {
    setGi((i + shots.length) % shots.length);
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") showShot(gi - 1);
      if (e.key === "ArrowRight") showShot(gi + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [gi, shots.length]);

  const mainSrc = failed[gi] ? PLACEHOLDER_IMG : shots[gi];

  return (
    <div className="gallery">
      <div className="g-main">
        <Image
          src={mainSrc}
          alt={`${car.brand} ${car.model} ${car.year} — photo ${gi + 1}`}
          fill
          priority
          sizes="(max-width: 1100px) 100vw, 1040px"
          onError={() => setFailed((f) => ({ ...f, [gi]: true }))}
        />
        <div className="g-nav">
          <div className="g-arrows">
            <button id="gPrev" aria-label="Previous photo" onClick={() => showShot(gi - 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button id="gNext" aria-label="Next photo" onClick={() => showShot(gi + 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          <div className="g-index">
            {pad(gi + 1)} / {pad(shots.length)}
          </div>
        </div>
      </div>
      {/* A single-photo car has nothing to switch between. */}
      {shots.length > 1 && (
        <div className="g-thumbs">
          {shots.map((k, i) => (
            <button
              key={k + i}
              className={i === gi ? "on" : undefined}
              aria-label={`View photo ${i + 1}`}
              onClick={() => showShot(i)}
            >
              <Image
                src={failed[i] ? PLACEHOLDER_IMG : k}
                alt=""
                fill
                sizes="(max-width: 780px) 25vw, 250px"
                onError={() => setFailed((f) => ({ ...f, [i]: true }))}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
