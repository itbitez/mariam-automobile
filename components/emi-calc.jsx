"use client";

import { useState } from "react";
import { lakh } from "@/lib/format";
import { CALC } from "@/lib/content";

export default function EmiCalc({ price, calc }) {
  const c = calc || CALC;
  const [down, setDown] = useState(c.downDefault);
  const [term, setTerm] = useState(c.termDefault);

  const rate = c.carPageRate;
  const dpAmt = (price * down) / 100;
  const loan = price - dpAmt;
  const i = rate / 100 / 12;
  const n = term * 12;
  // A 0% rate would divide by zero in the amortisation formula.
  const emi = i > 0 ? (loan * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1) : loan / n;

  return (
    <div className="emi">
      <h3>Estimate your monthly payment</h3>
      <p>Based on this car&apos;s price at an indicative {rate}% annual rate.</p>

      <div className="field">
        <div className="row">
          <label htmlFor="down">Down payment</label>
          <span className="val">{down}%</span>
        </div>
        <input
          type="range"
          id="down"
          min={c.downMin}
          max={c.downMax}
          step={c.downStep}
          value={down}
          onChange={(e) => setDown(+e.target.value)}
        />
      </div>

      <div className="field">
        <div className="row">
          <label htmlFor="term">Loan term</label>
          <span className="val">
            {term} {term === 1 ? "year" : "years"}
          </span>
        </div>
        <input
          type="range"
          id="term"
          min={c.termMin}
          max={c.termMax}
          step={c.termStep}
          value={term}
          onChange={(e) => setTerm(+e.target.value)}
        />
      </div>

      <div className="emi-out">
        <div>
          <div className="lab">Monthly</div>
          <div className="amt">
            {lakh(emi)} <small>/ mo</small>
          </div>
        </div>
        <div className="side">
          <div className="lab">Upfront</div>
          <div className="s2">{lakh(dpAmt)}</div>
        </div>
      </div>

      <p className="disc">{c.disclaimer}</p>
    </div>
  );
}
