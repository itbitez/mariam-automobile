"use client";

import { useEffect, useState } from "react";
import { lakh } from "@/lib/format";

const SAVE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </svg>
);

const INFO_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </svg>
);

/** The four sliders, described once and rendered in a loop. */
const RANGES = [
  {
    key: "price",
    title: "Car price slider",
    note: "The price range buyers can drag through on the homepage estimator.",
    unit: "৳",
    money: true,
  },
  {
    key: "down",
    title: "Down payment slider",
    note: "Percentage of the car price paid upfront.",
    unit: "%",
  },
  {
    key: "term",
    title: "Loan term slider",
    note: "Loan length in years.",
    unit: "years",
  },
  {
    key: "rate",
    title: "Interest rate slider",
    note: "Annual interest rate offered by the banks you work with.",
    unit: "%",
  },
];

function emiFor(price, downPct, years, ratePct) {
  const dpAmt = (price * downPct) / 100;
  const loan = price - dpAmt;
  const i = ratePct / 100 / 12;
  const n = years * 12;
  const emi = i > 0 ? (loan * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1) : loan / n;
  return { emi, dpAmt };
}

export default function CalcView({ calc, onSave }) {
  const [c, setC] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setC({ ...calc });
  }, [calc]);

  if (!c) return <section />;

  const num = (k) => (e) => setC((p) => ({ ...p, [k]: e.target.value === "" ? "" : Number(e.target.value) }));
  const txt = (k) => (e) => setC((p) => ({ ...p, [k]: e.target.value }));

  // Validation: every slider needs max > min, step > 0, default inside range.
  const problems = [];
  RANGES.forEach((r) => {
    const min = Number(c[r.key + "Min"]);
    const max = Number(c[r.key + "Max"]);
    const step = Number(c[r.key + "Step"]);
    const def = Number(c[r.key + "Default"]);
    if (!(max > min)) problems.push(`${r.title}: maximum must be greater than minimum.`);
    if (!(step > 0)) problems.push(`${r.title}: step must be greater than zero.`);
    if (def < min || def > max) problems.push(`${r.title}: starting value must sit between the minimum and maximum.`);
  });

  const preview = emiFor(
    Number(c.priceDefault) || 0,
    Number(c.downDefault) || 0,
    Number(c.termDefault) || 1,
    Number(c.rateDefault) || 0
  );

  return (
    <section>
      <div className="topbar">
        <div>
          <h1>Calculator</h1>
          <div className="crumb">
            Controls the finance estimator on the homepage and the payment estimate on every car page.
          </div>
        </div>
        <div className="top-actions">
          <button
            className="btn btn-primary"
            disabled={saving || problems.length > 0}
            onClick={async () => {
              setSaving(true);
              await onSave(c);
              setSaving(false);
            }}
          >
            {saving ? <span className="spin" /> : SAVE_ICON}
            {saving ? "Saving…" : "Save calculator"}
          </button>
        </div>
      </div>

      <div className="note">
        {INFO_ICON}
        <span>
          <b>Minimum</b> and <b>maximum</b> set how far each slider travels. <b>Step</b> is how much one nudge moves it.
          <b> Starting value</b> is where the slider sits when the page first loads.
        </span>
      </div>

      {problems.length > 0 && (
        <div className="auth-err" style={{ display: "block", marginBottom: 20 }}>
          <b>Fix these before saving:</b>
          <ul style={{ margin: "6px 0 0 18px" }}>
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="calc-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Slider ranges</h2>
              <p>Match these to what your banks actually offer.</p>
            </div>
          </div>

          {RANGES.map((r) => (
            <div className="range-block" key={r.key}>
              <h3>{r.title}</h3>
              <p className="rb-note">{r.note}</p>
              <div className="form-grid-4">
                <div className="field">
                  <label htmlFor={`c-${r.key}-min`}>Minimum</label>
                  <input id={`c-${r.key}-min`} type="number" value={c[r.key + "Min"]} onChange={num(r.key + "Min")} />
                </div>
                <div className="field">
                  <label htmlFor={`c-${r.key}-max`}>Maximum</label>
                  <input id={`c-${r.key}-max`} type="number" value={c[r.key + "Max"]} onChange={num(r.key + "Max")} />
                </div>
                <div className="field">
                  <label htmlFor={`c-${r.key}-step`}>Step</label>
                  <input
                    id={`c-${r.key}-step`}
                    type="number"
                    step="any"
                    value={c[r.key + "Step"]}
                    onChange={num(r.key + "Step")}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`c-${r.key}-def`}>Starting value</label>
                  <input
                    id={`c-${r.key}-def`}
                    type="number"
                    step="any"
                    value={c[r.key + "Default"]}
                    onChange={num(r.key + "Default")}
                  />
                </div>
              </div>
              {r.money && (
                <div className="hint" style={{ marginTop: 4 }}>
                  Range: {lakh(c[r.key + "Min"] || 0)} – {lakh(c[r.key + "Max"] || 0)}, starting at{" "}
                  {lakh(c[r.key + "Default"] || 0)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div>
          <div className="card">
            <div className="card-head">
              <div>
                <h2>Live preview</h2>
                <p>What a buyer sees at the starting values.</p>
              </div>
            </div>
            <div className="calc-preview">
              <div className="pv-row">
                <div>
                  <div className="pv-lab">Estimated monthly</div>
                  <div className="pv-amt">
                    {lakh(preview.emi)} <small>/ mo</small>
                  </div>
                </div>
                <div className="pv-side">
                  <div className="pv-lab">Upfront</div>
                  <div className="pv-s2">{lakh(preview.dpAmt)}</div>
                </div>
              </div>
              <div className="pv-meta">
                {lakh(c.priceDefault || 0)} car · {c.downDefault}% down · {c.termDefault}{" "}
                {Number(c.termDefault) === 1 ? "year" : "years"} · {c.rateDefault}% per year
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <h2>Behaviour</h2>
                <p>How the estimator is presented.</p>
              </div>
            </div>

            <div className="field">
              <label className="setting-row">
                <span className="txt">
                  <b>Let buyers change the interest rate</b>
                  <span>
                    {c.showRateSlider
                      ? `The rate slider is visible on the homepage, starting at ${c.rateDefault}%.`
                      : `The rate slider is hidden. Every estimate uses ${c.rateDefault}% per year.`}
                  </span>
                </span>
                <span className="right">
                  <span className={"state" + (c.showRateSlider ? " on" : "")}>
                    {c.showRateSlider ? "Shown" : "Hidden"}
                  </span>
                  <span className="switch">
                    <input
                      type="checkbox"
                      checked={!!c.showRateSlider}
                      onChange={(e) => setC((p) => ({ ...p, showRateSlider: e.target.checked }))}
                    />
                    <span className="track"></span>
                  </span>
                </span>
              </label>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="c-carrate">Fixed rate on car pages</label>
              <input id="c-carrate" type="number" step="any" value={c.carPageRate} onChange={num("carPageRate")} />
              <div className="hint">
                Car detail pages show one rate rather than a slider. Currently {c.carPageRate}% per year.
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <h2>Wording</h2>
                <p>Text shown around the estimator.</p>
              </div>
            </div>
            <div className="field">
              <label htmlFor="c-heading">Heading</label>
              <input id="c-heading" type="text" value={c.heading} onChange={txt("heading")} />
            </div>
            <div className="field">
              <label htmlFor="c-intro">Intro paragraph</label>
              <textarea id="c-intro" value={c.intro} onChange={txt("intro")} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="c-disc">Small print</label>
              <textarea id="c-disc" value={c.disclaimer} onChange={txt("disclaimer")} />
              <div className="hint">Shown under the estimator on the homepage and on every car page.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
