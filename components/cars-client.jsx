"use client";

import { useEffect, useMemo, useState } from "react";
import { lakh } from "@/lib/format";
import { waLink } from "@/lib/site";
import { byAvailability } from "@/lib/car-status";
import CarCard from "@/components/car-card";

const MAX_PRICE = 6000000;

const TICK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ARROW = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function uniq(cars, key) {
  const seen = {};
  const out = [];
  cars.forEach((c) => {
    const v = String(c[key]);
    if (!seen[v]) {
      seen[v] = 0;
      out.push(v);
    }
    seen[v]++;
  });
  if (key === "year") out.sort((a, b) => b - a);
  else out.sort();
  return out.map((v) => ({ v, n: seen[v] }));
}

export default function CarsClient({ cars, settings }) {
  const [q, setQ] = useState("");
  const [model, setModel] = useState([]);
  const [body, setBody] = useState([]);
  const [year, setYear] = useState([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState("featured");
  const [railOpen, setRailOpen] = useState(false);

  const groups = useMemo(
    () => ({
      model: uniq(cars, "model"),
      body: uniq(cars, "body"),
      year: uniq(cars, "year"),
    }),
    [cars]
  );

  /* wire the page-head search input (server-rendered) to state */
  useEffect(() => {
    if (window.__carsInit) return;
    window.__carsInit = true;

    const input = document.getElementById("q");
    const onInput = (e) => setQ(e.target.value.trim().toLowerCase());
    if (input) {
      input.addEventListener("input", onInput);
      input.value = "";
    }

    /* scroll chrome */
    const headBg = document.getElementById("headBg");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;

    function frame() {
      const h = document.documentElement;
      const top = h.scrollTop;
      if (headBg && !reduceMotion) headBg.style.transform = "translate3d(0," + top * 0.22 + "px,0)";
      ticking = false;
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    frame();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (input) input.removeEventListener("input", onInput);
      window.__carsInit = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setRailOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const state = { model, body, year };
  const setState = { model: setModel, body: setBody, year: setYear };

  function toggle(key, v, checked) {
    setState[key]((prev) => {
      const arr = prev.slice();
      const i = arr.indexOf(v);
      if (checked && i < 0) arr.push(v);
      if (!checked && i > -1) arr.splice(i, 1);
      return arr;
    });
  }

  function resetAll() {
    setQ("");
    setModel([]);
    setBody([]);
    setYear([]);
    setMaxPrice(MAX_PRICE);
    const input = document.getElementById("q");
    if (input) input.value = "";
  }

  const filtered = useMemo(() => {
    let list = cars.filter((c) => {
      if (model.length && model.indexOf(c.model) < 0) return false;
      if (body.length && body.indexOf(c.body) < 0) return false;
      if (year.length && year.indexOf(String(c.year)) < 0) return false;
      if (c.price > maxPrice) return false;
      if (q) {
        const hay = (
          c.title + " " + c.brand + " " + c.model + " " + c.grade + " " + c.body + " " + c.fuel + " " + c.year
        ).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });

    const s = sort;
    list = list.slice().sort((a, b) => {
      // Sold cars stay in the results but never rank above one still for sale,
      // whichever sort the visitor picked.
      const avail = byAvailability(a, b);
      if (avail) return avail;
      if (s === "new") return b.year - a.year;
      if (s === "low") return a.price - b.price;
      if (s === "high") return b.price - a.price;
      if (s === "km")
        return parseInt(String(a.mileage).replace(/\D/g, ""), 10) - parseInt(String(b.mileage).replace(/\D/g, ""), 10);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.year - a.year;
    });
    return list;
  }, [cars, q, model, body, year, maxPrice, sort]);

  const forSale = useMemo(() => filtered.filter((c) => c.status !== "sold").length, [filtered]);

  /* reveal animation for cards (re-runs when the filtered list changes) */
  useEffect(() => {
    const els = document.querySelectorAll(".car-grid .rv");
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filtered]);

  const chips = [];
  [["model", "Model"], ["body", "Body"], ["year", "Year"]].forEach(([key, label]) => {
    state[key].forEach((v) => chips.push({ key, label, v }));
  });
  if (maxPrice < MAX_PRICE) chips.push({ key: "price", label: "Under", v: lakh(maxPrice) });
  if (q) chips.push({ key: "q", label: "Search", v: `“${q}”` });

  function removeChip(chip) {
    if (chip.key === "price") setMaxPrice(MAX_PRICE);
    else if (chip.key === "q") {
      setQ("");
      const input = document.getElementById("q");
      if (input) input.value = "";
    } else {
      setState[chip.key]((prev) => prev.filter((x) => x !== chip.v));
    }
  }

  function renderGroup(hostId, key, label) {
    return (
      <div className="fgroup">
        <h3>{label}</h3>
        <div id={hostId}>
          {groups[key].map((o) => (
            <label className="check" key={o.v}>
              <input
                type="checkbox"
                data-key={key}
                value={o.v}
                checked={state[key].indexOf(o.v) > -1}
                onChange={(e) => toggle(key, o.v, e.target.checked)}
              />
              <span className="box">{TICK}</span>
              <span>{o.v}</span>
              <span className="cnt">{o.n}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* FILTERS */}
      <aside className={"rail" + (railOpen ? " open" : "")} id="rail">
        <div className="rail-top">
          <h2>Filters</h2>
          <button className="clear" id="clearAll" onClick={resetAll}>
            Reset all
          </button>
        </div>

        {renderGroup("fModel", "model", "Model")}
        {renderGroup("fBody", "body", "Body type")}
        {renderGroup("fYear", "year", "Registration year")}

        <div className="fgroup budget">
          <h3>Maximum budget</h3>
          <div className="row">
            <label htmlFor="fPrice">Up to</label>
            <span className="val" id="priceVal">
              {lakh(maxPrice)}
            </span>
          </div>
          <input
            type="range"
            id="fPrice"
            min="2500000"
            max={MAX_PRICE}
            step="100000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(+e.target.value)}
          />
        </div>

        <div className="rail-help">
          <p>Not seeing the model you want? We source to order directly from Japanese auctions.</p>
          <a
            className="btn btn-dark btn-sm"
            id="railWa"
            href={waLink("Hi, I'm looking for a specific model. Can you source it for me?", settings)}
          >
            Request a car
          </a>
        </div>
      </aside>

      {/* RESULTS */}
      <section>
        <div className="toolbar">
          <div className="count" id="count">
            {/* The list now includes sold cars, so a flat "N cars available"
                would overcount the stock someone can actually buy. */}
            <b>{filtered.length}</b> {filtered.length === 1 ? "car" : "cars"}
            {forSale === filtered.length ? " available" : ` · ${forSale} available`}
          </div>
          <div className="tools">
            <button className="btn btn-line btn-sm filter-toggle" id="openFilters" onClick={() => setRailOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Filters
            </button>
            <div className="sortwrap">
              <select id="sort" aria-label="Sort cars" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Sort: Our picks first</option>
                <option value="new">Newest year</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="km">Lowest mileage</option>
              </select>
            </div>
          </div>
        </div>

        <div className="chips" id="chips">
          {chips.map((chip) => (
            <span className="chip" key={chip.key + chip.v}>
              {chip.label}: {chip.v}
              <button
                data-key={chip.key}
                data-val={chip.v}
                aria-label="Remove filter"
                onClick={() => removeChip(chip)}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <h3>No cars match those filters</h3>
            <p>
              Widen your budget or clear a filter to see more. We can also source this exact specification from the
              Japanese auction for you.
            </p>
            <div className="row">
              <button className="btn btn-line" id="emptyReset" onClick={resetAll}>
                Clear filters
              </button>
              <a
                className="btn btn-red"
                href={waLink("Hi, I couldn't find what I wanted on your site. Can you source it?", settings)}
              >
                Ask us to source it
              </a>
            </div>
          </div>
        ) : (
          <div className="car-grid" id="grid">
            {filtered.map((c, i) => (
              <CarCard car={c} i={i} key={c.id} />
            ))}
            <a
              className="car source-tile rv"
              href={waLink("Hi, I'm looking for a model that is not listed on your site. Can you source it from the auction?", settings)}
            >
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
                </svg>
              </span>
              <h3>Want a different model?</h3>
              <p>We bid on your exact specification at the Japanese auction and quote the full landed cost first.</p>
              <span className="see">
                Start a custom order{ARROW}
              </span>
            </a>
          </div>
        )}
      </section>
    </>
  );
}
