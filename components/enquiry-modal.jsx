"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CLOSE = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const TICK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const BUDGETS = ["Under ৳20 lakh", "৳20 – 30 lakh", "৳30 – 40 lakh", "৳40 lakh +"];
const PAYMENTS = ["Bank loan / financing", "Cash purchase", "Trade-in my current car", "Still deciding"];
const TIMES = ["As soon as possible", "This week", "This weekend", "Next week", "Just planning ahead"];

/**
 * Enquiry form in a dialog. Used by "Book a viewing" on car detail pages so a
 * visitor can request a slot without being pushed into WhatsApp.
 */
export default function EnquiryModal({ open, onClose, car, title, intro, source = "car-detail" }) {
  const [form, setForm] = useState({ name: "", phone: "", when: "", budget: "", payment: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);
  const [mounted, setMounted] = useState(false);
  const firstRef = useRef(null);
  const companyRef = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setDone(false);
    setError(null);
    setTouched(false);
    const t = setTimeout(() => firstRef.current && firstRef.current.focus(), 60);
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const nameBad = touched && !form.name.trim();
  const phoneBad = touched && !form.phone.trim();

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (!form.name.trim() || !form.phone.trim()) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          car: car ? `${car.brand} ${car.title} ${car.year}` : "",
          budget: form.budget,
          payment: form.payment,
          message: [form.when ? `Preferred time: ${form.when}` : "", form.message].filter(Boolean).join(" — "),
          source,
          company: companyRef.current ? companyRef.current.value : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || "Could not send your request.");
      setDone(true);
    } catch (err) {
      setError(err.message || "Could not send your request. Please try calling us instead.");
    }
    setBusy(false);
  }

  /**
   * Rendered into <body> rather than in place. The trigger lives inside the
   * sticky `.buy` sidebar, and `position: sticky` creates a stacking context —
   * so an in-place modal's z-index is scoped to that sidebar and page chrome
   * (nav, mobile bar) paints straight over it.
   */
  return createPortal(
    <div className="eq-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="eq" role="dialog" aria-modal="true" aria-labelledby="eq-title">
        <button type="button" className="eq-x" onClick={onClose} aria-label="Close">
          {CLOSE}
        </button>

        {done ? (
          <div className="eq-done">
            <span className="eq-tick">{TICK}</span>
            <h3>Request sent</h3>
            <p>
              Thanks {form.name.split(" ")[0] || "there"} — we have your details and will call you on{" "}
              <b>{form.phone}</b> to confirm a time.
            </p>
            <button type="button" className="btn btn-red" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="eq-head">
              <h3 id="eq-title">{title || "Book a viewing"}</h3>
              <p>
                {intro ||
                  (car
                    ? `Tell us when suits and we'll have the ${car.brand} ${car.title} ready for you at the showroom.`
                    : "Leave your details and we'll get back to you.")}
              </p>
              {car && (
                <div className="eq-car">
                  <b>
                    {car.brand} {car.title}
                  </b>
                  <span>
                    {car.year} · {car.grade || car.model}
                  </span>
                </div>
              )}
            </div>

            <form className="eq-form" onSubmit={submit} noValidate>
              {error && <div className="eq-err">{error}</div>}

              <div className="eq-row">
                <label className="eq-field">
                  <span>Your name *</span>
                  <input
                    ref={firstRef}
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    autoComplete="name"
                    className={nameBad ? "err" : ""}
                    placeholder="e.g. Rahim Uddin"
                  />
                </label>
                <label className="eq-field">
                  <span>Mobile number *</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    autoComplete="tel"
                    className={phoneBad ? "err" : ""}
                    placeholder="01XXXXXXXXX"
                  />
                </label>
              </div>

              <div className="eq-row">
                <label className="eq-field is-select">
                  <span>When would you like to come?</span>
                  <select value={form.when} onChange={set("when")}>
                    <option value="">Choose a time</option>
                    {TIMES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="eq-field is-select">
                  <span>How you&apos;d like to pay</span>
                  <select value={form.payment} onChange={set("payment")}>
                    <option value="">Choose an option</option>
                    {PAYMENTS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>

              {!car && (
                <label className="eq-field is-select">
                  <span>Your budget</span>
                  <select value={form.budget} onChange={set("budget")}>
                    <option value="">Choose a range</option>
                    {BUDGETS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="eq-field">
                <span>Anything else? (optional)</span>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Questions about the auction sheet, trade-in, paperwork…"
                />
              </label>

              {/* Honeypot */}
              <input
                ref={companyRef}
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />

              <button className="btn btn-red eq-submit" type="submit" disabled={busy}>
                {busy ? "Sending…" : "Request this viewing"}
              </button>
              <p className="eq-note">We&apos;ll call to confirm. No obligation, no pressure.</p>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
