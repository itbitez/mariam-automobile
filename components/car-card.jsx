"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { lakh } from "@/lib/format";
import { PLACEHOLDER_IMG } from "@/lib/data";
import { carStatus } from "@/lib/car-status";

const ARROW = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/**
 * Shared between the homepage grid and the cars listing so the two can't drift
 * apart. The whole card is the link.
 */
export default function CarCard({ car, i = 0, sizes }) {
  const [failed, setFailed] = useState(false);
  const src = failed || !car.photos?.[0] ? PLACEHOLDER_IMG : car.photos[0];
  const sold = car.status === "sold";
  const status = carStatus(car.status);

  return (
    <Link
      className={sold ? "car rv car-sold" : "car rv"}
      href={`/cars/${car.id}`}
      style={{ transitionDelay: Math.min(i, 6) * 0.05 + "s" }}
      aria-label={`${car.brand} ${car.title} ${car.year} — ${lakh(car.price)}`}
    >
      <div className="car-photo">
        {/* Both pills sit in the same top-left corner, so only one can show.
            Status wins over "Our pick": recommending a car nobody can buy is
            worse than not recommending one at all. */}
        {car.status && car.status !== "available" ? (
          <span className={status.tag}>{status.label}</span>
        ) : car.featured ? (
          <span className="tag-pick">Our pick</span>
        ) : (
          <span className="tag-avail">Available</span>
        )}
        <span className="tag-year">{car.year}</span>
        <Image
          src={src}
          alt={`${car.brand} ${car.model} ${car.year} at Mariam Automobile`}
          fill
          sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw"}
          onError={() => setFailed(true)}
        />
        <span className="car-shine"></span>
        <span className="car-model">
          {car.brand} {car.model}
        </span>
      </div>

      <div className="car-info">
        <h3>{car.title}</h3>
        <p>{car.tagline}</p>
        <div className="car-specs">
          {[car.fuel, car.mileage, car.engine, car.auction].filter(Boolean).map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        <div className="car-foot">
          <div className="price-ask">
            <b>{lakh(car.price)}</b>
            Negotiable · loan available
          </div>
          <span className="see">View details{ARROW}</span>
        </div>
      </div>
    </Link>
  );
}
