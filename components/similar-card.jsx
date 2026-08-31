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

export default function SimilarCard({ car, i }) {
  const [failed, setFailed] = useState(false);
  const delay = { transitionDelay: Math.min(i, 5) * 0.05 + "s" };
  const sold = car.status === "sold";
  const status = carStatus(car.status);

  return (
    <Link className={sold ? "car rv car-sold" : "car rv"} href={`/cars/${car.id}`} style={delay}>
      <div className="car-photo">
        {/* Unlike the main card this one carries no pill when a car is for
            sale, so only a non-available status needs saying. */}
        {car.status && car.status !== "available" && <span className={status.tag}>{status.label}</span>}
        <span className="tag-year">{car.year}</span>
        <Image
          src={failed ? PLACEHOLDER_IMG : car.photos[0]}
          alt={`${car.brand} ${car.model}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw"
          onError={() => setFailed(true)}
        />
        <span className="car-model">
          {car.brand} {car.model}
        </span>
      </div>
      <div className="car-info">
        <h3>{car.title}</h3>
        <div className="car-specs">
          <span>{car.fuel}</span>
          <span>{car.mileage}</span>
          <span>{car.auction}</span>
        </div>
        <div className="car-foot">
          <div className="price-ask">
            <b>{lakh(car.price)}</b>
            Loan available
          </div>
          <span className="see">
            Details{ARROW}
          </span>
        </div>
      </div>
    </Link>
  );
}
