import Image from "next/image";
import Link from "next/link";
import { HOME_LIMIT } from "@/lib/data";
import { SITE, waLink, telLink, mapsLink } from "@/lib/site";
import { lakh } from "@/lib/format";
import { getCars, getHome, getSettings, getCalc } from "@/lib/query";
import { byAvailability } from "@/lib/car-status";
import HomeClient from "@/components/home-client";
import WaGlyph from "@/components/wa-glyph";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import CarCard from "@/components/car-card";
import "./home.css";

export const revalidate = 60;

const IMG = {
  logoFooter: "/img/logo-footer.webp",
  hero: "/img/hero-showroom.webp",
  carBody: "/img/1cc5aa91e239badf.webp",
  rimRear: "/img/f03d4f6d7443ad06.webp",
  rimFront: "/img/e42e4ce18438132b.webp",
  finance: "/img/finance-mockup.webp",
  // Self-hosted rather than hotlinked so it is not a third-party round trip.
  whyBg: "/img/why-showroom.webp",
  cta: "/img/ece91fddb211fccd.jpg",
};

const PHONE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const PIN_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ARROW = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const EYE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default async function HomePage() {
  const [cars, home, settings, calc] = await Promise.all([getCars(), getHome(), getSettings(), getCalc()]);
  const site = { ...SITE, ...settings };
  // Sold and reserved cars stay on the site with a badge, so status no longer
  // gates this grid — only the owner's show-on-home flag. Sorting available
  // first means they claim the limited slots before anything unbuyable does.
  const homeCars = cars.filter((c) => c.showHome).sort(byAvailability).slice(0, HOME_LIMIT);
  // Still deliberately excludes sold: this drives the enquiry dropdown and the
  // "cars in stock" count, and neither should offer a car nobody can buy.
  const listedCars = cars.filter((c) => c.status !== "sold");
  const totalCars = listedCars.length;

  return (
    <>
      <SiteHeader site={site} tel={telLink(undefined, site)} active="/" isHome />


      {/* HERO */}
      <header className="hero" id="top">
        <div className="hero-media" id="heroMedia">
          <Image
            src={IMG.hero}
            alt="Japanese reconditioned cars in stock at Mariam Automobile, Rajshahi"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="hero-scrim"></div>

        <div className="hero-inner wrap">
          <div className="hero-top">
            <div className="hero-copy">
              <span className="kicker on-dark fade-up">{home.hero.kicker}</span>
              <h1>
                <span className="ln">
                  <span>{home.hero.line1}</span>
                </span>
                <span className="ln">
                  <span>{home.hero.line2}</span>
                </span>
                <span className="ln">
                  <span>{home.hero.line3}</span>
                </span>
              </h1>
              <p className="lede fade-up">{home.hero.lede}</p>

              <div className="hero-cta fade-up">
                <a href="#stock" className="btn btn-red">
                  {EYE_ICON}
                  {home.hero.cta1}
                </a>
                <a href={waLink(undefined, site)} className="btn btn-glass">
                  <WaGlyph />
                  {home.hero.cta2}
                </a>
              </div>

              <div className="hero-assure fade-up">
                {home.hero.assures.map((a) => (
                  <span className="assure" key={a}>
                    {CHECK}
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <form className="lead-card fade-up" id="leadForm" noValidate>
              <div className="lc-head">
                <div className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l9 6 9-6" />
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                  </svg>
                </div>
                <h3>{home.hero.leadTitle}</h3>
              </div>
              <p className="lc-sub">{home.hero.leadSub}</p>

              <div className="lf-row">
                <div className="lf-field">
                  <input type="text" id="lfName" placeholder="Your name" autoComplete="name" />
                </div>
                <div className="lf-field">
                  <input type="tel" id="lfPhone" placeholder="Mobile number" autoComplete="tel" />
                </div>
              </div>

              <div className="lf-row">
                <div className="lf-field is-select">
                  <select id="lfCar">
                    <option value="">Car you&apos;re interested in</option>
                    {listedCars.map((c) => (
                      <option key={c.id} value={`${c.brand} ${c.title} ${c.year}`}>
                        {c.brand} {c.title} · {c.year}
                      </option>
                    ))}
                    <option>Other / not sure yet</option>
                  </select>
                </div>
                <div className="lf-field is-select">
                  <select id="lfBudget">
                    <option value="">Your budget</option>
                    <option>Under ৳20 lakh</option>
                    <option>৳20 – 30 lakh</option>
                    <option>৳30 – 40 lakh</option>
                    <option>৳40 lakh +</option>
                  </select>
                </div>
              </div>

              <div className="lf-row" style={{ gridTemplateColumns: "1fr" }}>
                <div className="lf-field is-select">
                  <select id="lfPay">
                    <option value="">How you'd like to pay</option>
                    <option>Bank loan / financing</option>
                    <option>Cash purchase</option>
                    <option>Trade-in my current car</option>
                    <option>Still deciding</option>
                  </select>
                </div>
              </div>

              {/* Honeypot — hidden from people, filled in by bots. */}
              <input
                type="text"
                id="lfCompany"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />

              <div className="lf-err" id="leadErr" hidden>
                Sorry — we couldn&apos;t send that. Please try again, or call {site.phone}.
              </div>

              <button type="submit" className="btn btn-red">
                Send my enquiry
              </button>

              <div className="lc-foot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                We&apos;ll call you back — no spam, no obligation.
              </div>
            </form>

            {/* Shown in place of the form once the enquiry is saved. */}
            <div className="lead-done" id="leadDone" tabIndex={-1} hidden>
              <span className="ld-tick">{CHECK}</span>
              <h3>Thanks, <span id="leadDoneName">there</span>!</h3>
              <p>
                We have your enquiry and will call you on <b id="leadDonePhone"></b> shortly with options and full
                pricing.
              </p>
              <div className="ld-actions">
                <Link href="/cars" className="btn btn-red">
                  Browse all cars{ARROW}
                </Link>
                <a href={telLink(undefined, site)} className="btn btn-glass">
                  {PHONE_ICON}
                  Call now
                </a>
              </div>
            </div>
          </div>

          <div className="hero-rail fade-up">
            {home.hero.stats.map((s, i) => {
              const animated = !isNaN(parseInt(s.n, 10));
              return (
                <div className="cell" key={s.label}>
                  <div
                    className="n"
                    {...(animated
                      ? {
                          "data-count": s.n,
                          "data-suffix": s.suffix,
                        }
                      : {})}
                  >
                    {animated ? (
                      <>
                        0<i>{s.suffix}</i>
                      </>
                    ) : (
                      <>
                        {s.n}
                        <i>{s.suffix}</i>
                      </>
                    )}
                  </div>
                  <div className="t">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

      </header>

      {/* TRUST STRIP */}
      <div className="trust">
        <div className="trust-track" id="trustTrack">
          {[...home.trust, ...home.trust].map((item, i) => (
            <span className="trust-item" key={i} aria-hidden={i >= home.trust.length}>
              {CHECK}
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* INVENTORY */}
      <section className="inventory wrap" id="stock">
        <div className="inv-top">
          <div className="rv">
            <span className="kicker">{home.inventory.kicker}</span>
            <h2>{home.inventory.title}</h2>
            <p>{home.inventory.sub}</p>
          </div>
          <div className="stock-pill rv d1">
            <span className="d"></span>
            {homeCars.length} units available
          </div>
        </div>

        <div className="car-grid" id="carGrid">
          {homeCars.map((car, i) => (
            <CarCard car={car} i={i} key={car.id} sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" />
          ))}
        </div>

        <div className="inv-all rv">
          <Link href="/cars" className="btn btn-red">
            View all cars
            {ARROW}
          </Link>
          <span>
            {totalCars > homeCars.length
              ? `${totalCars} cars in stock — browse the full list with filters.`
              : "Browse the full list with filters for model, body type, year and price."}
          </span>
        </div>

        <div className="inv-note rv">
          <h3>{home.inventory.noteTitle}</h3>
          <p>{home.inventory.noteText}</p>
          <a href={waLink("Hi, I'd like to place a custom order from the Japanese auction.", site)} className="btn btn-dark">
            {home.inventory.noteBtn}
          </a>
        </div>
      </section>

      {/* SCROLL-DRIVEN ROAD JOURNEY */}
      <section className="journey" id="process">
        <div className="journey-sticky">
          <div className="journey-sky"></div>

          <div className="journey-head">
            <span className="kicker on-dark">{home.process.kicker}</span>
            <h2>{home.process.title}</h2>
            <p>{home.process.sub}</p>
          </div>

          <div className="journey-stage">
            <div className="milestones" id="milestones">
              {home.process.steps.map((step, i) => (
                <div
                  className="ms"
                  key={step.title}
                  data-at={["0.13", "0.37", "0.61", "0.85"][i] || "0.13"}
                  style={{ left: ["14%", "38%", "62%", "86%"][i] || "14%" }}
                >
                  <div className="ms-card">
                    <div className="sn">STEP 0{i + 1}</div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                  <div className="ms-post"></div>
                  <div className="ms-dot"></div>
                </div>
              ))}
            </div>

            <div className="drive-car" id="driveCar">
              <span className="speedlines">
                <i></i>
                <i></i>
                <i></i>
              </span>
              {/* loading="lazy" is load-bearing here: React preloads eager
                  <img> tags during SSR, and these sit several screens down —
                  without it they compete with the hero for bandwidth. */}
              <div className="car-stage" id="carStage">
                <img
                  className="car-body-img"
                  id="carImg"
                  src={IMG.carBody}
                  width={1200}
                  height={470}
                  loading="lazy"
                  decoding="async"
                  alt="Car driving along the road"
                />
                <img className="rim" id="rimRear" src={IMG.rimRear} width={137} height={137} loading="lazy" decoding="async" alt="" />
                <img className="rim" id="rimFront" src={IMG.rimFront} width={146} height={146} loading="lazy" decoding="async" alt="" />
                <span className="headbeam"></span>
                <span className="car-shadow" id="carShadow"></span>
              </div>
            </div>

            <div className="layer-far" id="layerFar"></div>
            <div className="layer-near" id="layerNear"></div>

            <div className="road">
              <div className="road-edge"></div>
              <div className="road-dash" id="roadDash"></div>
            </div>

            <div className="journey-meter">
              <span className="jm-txt" id="jmStep">
                Step 01
              </span>
              <span className="jm-bar">
                <i id="jmBar"></i>
              </span>
              <span className="jm-txt" id="jmPct">
                0%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FINANCE */}
      <section className="finance wrap" id="finance">
        <div className="fin-grid">
          <div className="fin-visual rv wipe" id="finVisual">
            {/* The panel is portrait but the source is landscape (1200x629), so
                object-fit: cover uses less than half the width and scales it up.
                Sizing this at 46vw made Next serve a 662px variant, which then
                had to stretch 2.2x — visibly soft. Ask for the full-width
                variant instead; the crop eats the rest. */}
            <Image
              id="finImg"
              src={IMG.finance}
              alt="Mariam Automobile showroom"
              fill
              quality={82}
              sizes="(max-width: 1000px) 100vw, 1200px"
            />
          </div>

          <div className="calc rv d1">
            <span className="kicker">Plan your budget</span>
            <h3>{calc.heading}</h3>
            <p className="sub">{calc.intro}</p>

            <div className="field">
              <div className="row">
                <label htmlFor="price">Car price</label>
                <span className="val" id="priceVal">
                  {lakh(calc.priceDefault)}
                </span>
              </div>
              <input
                type="range"
                id="price"
                min={calc.priceMin}
                max={calc.priceMax}
                step={calc.priceStep}
                defaultValue={calc.priceDefault}
              />
            </div>

            <div className="field">
              <div className="row">
                <label htmlFor="down">Down payment</label>
                <span className="val" id="downVal">
                  {calc.downDefault}%
                </span>
              </div>
              <input
                type="range"
                id="down"
                min={calc.downMin}
                max={calc.downMax}
                step={calc.downStep}
                defaultValue={calc.downDefault}
              />
            </div>

            <div className="field">
              <div className="row">
                <label htmlFor="term">Loan term</label>
                <span className="val" id="termVal">
                  {calc.termDefault} {calc.termDefault === 1 ? "year" : "years"}
                </span>
              </div>
              <input
                type="range"
                id="term"
                min={calc.termMin}
                max={calc.termMax}
                step={calc.termStep}
                defaultValue={calc.termDefault}
              />
            </div>

            {/* The rate input always exists so the client script can read it —
                hidden only visually when the owner turns the slider off. */}
            <div className="field" hidden={!calc.showRateSlider}>
              <div className="row">
                <label htmlFor="rate">Interest rate (per year)</label>
                <span className="val" id="rateVal">
                  {calc.rateDefault.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                id="rate"
                min={calc.rateMin}
                max={calc.rateMax}
                step={calc.rateStep}
                defaultValue={calc.rateDefault}
              />
            </div>

            <div className="calc-out">
              <div>
                <div className="lab">Estimated monthly</div>
                <div className="amt" id="emi">
                  {lakh(0)} <small>/ mo</small>
                </div>
              </div>
              <div className="side">
                <div className="lab">You pay upfront</div>
                <div className="s2" id="downAmt">
                  {lakh(0)}
                </div>
              </div>
            </div>

            <a href={waLink("Hi, I used the finance estimator on your site. Can I get an exact bank quote?", site)} className="btn btn-red" style={{ width: "100%" }}>
              Get my exact quote on WhatsApp
            </a>
            <p className="disc">{calc.disclaimer}</p>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="why" id="why">
        <div className="why-bg">
          <Image src={IMG.whyBg} alt="" fill sizes="100vw" />
        </div>
        <div className="wrap">
          <div className="sec-head center rv">
            <span className="kicker on-dark">{home.why.kicker}</span>
            <h2>{home.why.title}</h2>
            <p>{home.why.sub}</p>
          </div>

          <div className="why-grid">
            {home.pillars.map((p, i) => (
              <div className={"pillar rv" + (i ? " d" + i : "")} key={p.title}>
                <div className="ico">
                  {i === 0 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  )}
                  {i === 1 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  )}
                  {i === 2 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v10M9.5 9.5A2.5 2.5 0 0 1 12 8c1.4 0 2.5.9 2.5 2s-1.1 2-2.5 2-2.5.9-2.5 2 1.1 2 2.5 2" />
                    </svg>
                  )}
                  {i === 3 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="5" />
                      <path d="M12 13v3M8 21l4-4 4 4" />
                    </svg>
                  )}
                </div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq wrap" id="faq">
        <div className="faq-grid">
          <div className="faq-left rv">
            <span className="kicker">{home.faq.kicker}</span>
            <h2>{home.faq.title}</h2>
            <p>{home.faq.note}</p>
            <a href={waLink("Hi, I have a question about one of your cars.", site)} className="btn btn-dark">
              <WaGlyph />
              {home.faq.noteBtn}
            </a>
          </div>

          <div className="acc rv d1" id="acc">
            {home.faq.items.map((f) => (
              <div className="acc-item" key={f.q}>
                <button className="acc-q" type="button">
                  {f.q}
                </button>
                <div className="acc-a">
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <div className="bg" id="ctaBg">
          <Image src={IMG.cta} alt="" fill sizes="100vw" />
        </div>
        <div className="cta-inner wrap">
          <span className="kicker on-dark">{home.cta.kicker}</span>
          <h2>{home.cta.title}</h2>
          <p>{home.cta.text}</p>
          <div className="cta-btns">
            <a href={telLink(undefined, site)} className="btn btn-red">
              {PHONE_ICON}
              {home.cta.btn1}
            </a>
            <a href={mapsLink(undefined, site)} className="btn btn-glass">
              {home.cta.btn2}
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" id="contact">
        <div className="wrap">
          <div className="contact-shell rv">
            <div className="cs-left">
              <span className="kicker on-dark">{home.contact.kicker}</span>
              <h2>{home.contact.title}</h2>
              <p className="intro">{home.contact.intro}</p>

              <div className="status" id="openStatus">
                <span className="sdot"></span>
                <span id="openText">Checking hours&hellip;</span>
              </div>

              <div className="cs-rows">
                <a className="crow" href={telLink(undefined, site)}>
                  <span className="ci">{PHONE_ICON}</span>
                  <span>
                    <span className="lbl">Call us</span>
                    <span className="val">
                      {site.phone}
                      <span>
                        Sat&ndash;Thu {site.hoursWeek} &middot; Fri {site.hoursFri}
                      </span>
                    </span>
                  </span>
                  <span className="go">{ARROW}</span>
                </a>

                <a className="crow" href={mapsLink(undefined, site)} target="_blank" rel="noopener noreferrer">
                  <span className="ci">{PIN_ICON}</span>
                  <span>
                    <span className="lbl">Visit the showroom</span>
                    <span className="val">
                      Terokhadia, Rajshahi-6000<span>Bangladesh &middot; tap for directions</span>
                    </span>
                  </span>
                  <span className="go">{ARROW}</span>
                </a>

                <div className="crow">
                  <span className="ci">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </span>
                  <span>
                    <span className="lbl">Opening hours</span>
                    <div className="hours-mini">
                      <div className="hr">
                        <span>Saturday &ndash; Thursday</span>
                        <span>{site.hoursWeek}</span>
                      </div>
                      <div className="hr">
                        <span>Friday</span>
                        <span>{site.hoursFri}</span>
                      </div>
                      <div className="hr">
                        <span>Emergency</span>
                        <span>24/7 on WhatsApp</span>
                      </div>
                    </div>
                  </span>
                  <span></span>
                </div>
              </div>
            </div>

            <div className="cs-right">
              <div className="bub"><WaGlyph /></div>
              <h3>{home.contact.waTitle}</h3>
              <p>{home.contact.waText}</p>
              <a href={waLink(undefined, site)} className="btn btn-wa">
                Chat on WhatsApp &mdash; {site.phone}
              </a>

              <div className="help">
                <div className="ht">What we can help you with</div>
                <ul>
                  {home.contact.helpItems.map((h) => (
                    <li key={h}>
                      {CHECK}
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <a className="qa rv" href={telLink(undefined, site)}>
              <span className="qi">{PHONE_ICON}</span>
              <span>
                <b>Call now</b>
                <span>Talk to us directly</span>
              </span>
            </a>
            <a className="qa rv d1" href={waLink(undefined, site)}>
              <span className="qi"><WaGlyph /></span>
              <span>
                <b>WhatsApp</b>
                <span>Fastest reply</span>
              </span>
            </a>
            <a className="qa rv d2" href={mapsLink(undefined, site)} target="_blank" rel="noopener noreferrer">
              <span className="qi">{PIN_ICON}</span>
              <span>
                <b>Get directions</b>
                <span>Terokhadia, Rajshahi</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <SiteFooter site={site} />

      <a
        href={waLink("Hi Mariam Automobile, I'm browsing your website.", site)}
        className="fab"
        id="fab"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat on WhatsApp"
      >
        <WaGlyph />
      </a>

      <HomeClient settings={site} />
    </>
  );
}

