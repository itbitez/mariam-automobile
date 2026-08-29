"use client";

import { useEffect, useRef } from "react";
import { waLink } from "@/lib/site";

const RIM = {
  rear: { leftPct: 13.00709939148073, topPct: 58.60284605433377, wPct: 12.170385395537526 },
  front: { leftPct: 72.54056795131845, topPct: 62.807244501940495, wPct: 11.460446247464503 },
  aspect: 0.3919878296146045,
};

function bdt(n) {
  n = Math.round(n);
  const s = String(n);
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
}

export default function HomeClient({ settings }) {
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (window.__homeInit) return;
    window.__homeInit = true;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- reveal ---------- */
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll(".rv, .wipe").forEach((el) => io.observe(el));

    /* ---------- counters ---------- */
    let counted = false;
    const rail = document.querySelector(".hero-rail");
    const cio = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting && !counted) {
            counted = true;
            document.querySelectorAll(".n[data-count]").forEach((n) => {
              const target = +n.getAttribute("data-count");
              const suffix = n.getAttribute("data-suffix") || "+";
              const t0 = performance.now();
              const dur = 1800;
              const step = (now) => {
                const p = Math.min(1, (now - t0) / dur);
                const eased = 1 - Math.pow(1 - p, 3);
                n.innerHTML = Math.round(target * eased) + "<i>" + suffix + "</i>";
                if (p < 1) requestAnimationFrame(step);
              };
              requestAnimationFrame(step);
            });
          }
        });
      },
      { threshold: 0.4 }
    );
    if (rail) cio.observe(rail);

    /* ---------- scroll chrome ---------- */
    const heroMedia = document.getElementById("heroMedia");
    const ctaBg = document.getElementById("ctaBg");
    const finImg = document.getElementById("finImg");
    let ticking = false;

    const journey = document.getElementById("process");
    const driveCar = document.getElementById("driveCar");
    const carStage = document.getElementById("carStage");
    const carShadow = document.getElementById("carShadow");
    const rimRear = document.getElementById("rimRear");
    const rimFront = document.getElementById("rimFront");
    const roadDash = document.getElementById("roadDash");
    const layerFar = document.getElementById("layerFar");
    const layerNear = document.getElementById("layerNear");
    const jmBar = document.getElementById("jmBar");
    const jmPct = document.getElementById("jmPct");
    const jmStep = document.getElementById("jmStep");
    const stones = Array.prototype.slice.call(document.querySelectorAll(".ms"));
    let lastProg = 0;
    let lastT = 0;

    function isMobile() {
      return window.innerWidth <= 640;
    }

    function placeRims() {
      [
        ["rear", rimRear],
        ["front", rimFront],
      ].forEach((p) => {
        const m = RIM[p[0]];
        const el = p[1];
        el.style.left = m.leftPct + "%";
        el.style.top = m.topPct + "%";
        el.style.width = m.wPct + "%";
      });
    }

    function sizeJourney() {
      const mult = isMobile() ? 2.2 : 2.5;
      journey.style.height = Math.round(window.innerHeight * mult) + "px";
    }

    function driveFrame(now) {
      const r = journey.getBoundingClientRect();
      const span = journey.offsetHeight - window.innerHeight;
      if (span <= 0) return;

      const prog = Math.min(Math.max(-r.top / span, 0), 1);
      const W = window.innerWidth;
      const carW = driveCar.offsetWidth;
      const mob = isMobile();

      let x;
      let ground;
      if (mob) {
        const inEnd = 0.16;
        const outStart = 0.84;
        const hold = W * 0.16;
        if (prog < inEnd) {
          x = -carW + (prog / inEnd) * (carW + hold);
        } else if (prog < outStart) {
          const t = (prog - inEnd) / (outStart - inEnd);
          x = hold + t * (W * 0.3 - hold);
        } else {
          const o = (prog - outStart) / (1 - outStart);
          x = W * 0.3 + o * (W - W * 0.3 + carW * 0.2);
        }
        ground = prog * W * 3.4;
      } else {
        const dStart = -carW * 0.8;
        const dEnd = W + carW * 0.1;
        x = dStart + prog * (dEnd - dStart);
        ground = prog * (dEnd - dStart);
      }
      driveCar.style.transform = "translate3d(" + x + "px,0,0)";

      const wheelD = carW * (RIM.front.wPct / 100);
      rimRear.style.transform = rimFront.style.transform =
        "rotate(" + (ground / (Math.PI * wheelD)) * 360 + "deg)";

      roadDash.style.backgroundPosition = -ground * 1.15 + "px 0";
      layerNear.style.backgroundPosition = -ground * 0.55 + "px 0";
      layerFar.style.backgroundPosition = -ground * 0.16 + "px 0";

      const dt = now - lastT || 16;
      const speed = Math.min(Math.abs(prog - lastProg) / (dt / 1000), 1.2);
      driveCar.classList.toggle("moving", speed > 0.015);

      const bob = Math.sin(ground / 26) * (0.7 + speed * 2);
      const lean = Math.max(-1.3, Math.min(1.3, (prog - lastProg) * 130));
      carStage.style.transform = "translateY(" + bob + "px) rotate(" + -lean + "deg)";
      carShadow.style.transform = "scaleX(" + (1 + speed * 0.12) + ")";
      carShadow.style.opacity = String(0.92 - speed * 0.22);

      lastProg = prog;
      lastT = now;

      let active = 0;
      stones.forEach((st, i) => {
        const on = prog >= parseFloat(st.getAttribute("data-at"));
        st.classList.toggle("live", on);
        if (on) active = i + 1;
      });
      stones.forEach((st, i) => {
        st.classList.toggle("current", i === active - 1);
        st.classList.toggle("past", i < active - 1);
        st.classList.toggle("future", i > active - 1);
      });

      jmBar.style.width = (prog * 100).toFixed(1) + "%";
      jmPct.textContent = Math.round(prog * 100) + "%";
      jmStep.textContent = active ? "Step " + ("0" + active).slice(-2) : "Start";
    }

    function frame() {
      const h = document.documentElement;
      const top = h.scrollTop;

      if (!reduce) {
        heroMedia.style.transform = "translate3d(0," + top * 0.28 + "px,0)";

        const r = ctaBg.parentElement.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          const p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
          ctaBg.style.transform = "translate3d(0," + (p - 0.5) * 70 + "px,0)";
        }

        const fr = finImg.getBoundingClientRect();
        if (fr.top < window.innerHeight && fr.bottom > 0) {
          const fp = (window.innerHeight - fr.top) / (window.innerHeight + fr.height);
          finImg.style.transform = "scale(1.14) translate3d(0," + (fp - 0.5) * 26 + "px,0)";
        }
      }
      driveFrame(performance.now());
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    let rzT;
    const onResize = () => {
      clearTimeout(rzT);
      rzT = setTimeout(() => {
        placeRims();
        sizeJourney();
        frame();
      }, 120);
    };
    window.addEventListener("resize", onResize);
    const onOrient = () => {
      setTimeout(() => {
        placeRims();
        sizeJourney();
        frame();
      }, 260);
    };
    window.addEventListener("orientationchange", onOrient);

    /* ---------- live open / closed (Asia/Dhaka) ---------- */
    const pill = document.getElementById("openStatus");
    const txt = document.getElementById("openText");

    function dhakaNow() {
      const s = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
      return new Date(s);
    }

    function fmt(h) {
      const ap = h >= 12 ? "PM" : "AM";
      const hh = h % 12 || 12;
      return hh + ":00 " + ap;
    }

    let openTimer = null;
    function updateStatus() {
      const d = dhakaNow();
      const day = d.getDay();
      const mins = d.getHours() * 60 + d.getMinutes();
      const open = day === 5 ? 14 * 60 : 9 * 60;
      const close = 20 * 60;

      if (mins >= open && mins < close) {
        pill.classList.remove("shut");
        const left = close - mins;
        txt.innerHTML =
          "Open now <small>&middot; closes " + fmt(20) + (left <= 60 ? " (in " + left + " min)" : "") + "</small>";
      } else {
        pill.classList.add("shut");
        const nextDay = mins >= close ? (day + 1) % 7 : day;
        const nextOpen = nextDay === 5 ? 14 : 9;
        const when = mins < open ? "today" : "tomorrow";
        txt.innerHTML =
          "Closed right now <small>&middot; opens " +
          fmt(nextOpen) +
          " " +
          when +
          " &middot; WhatsApp answered 24/7</small>";
      }
    }
    updateStatus();
    openTimer = setInterval(updateStatus, 60000);

    /* ---------- lead form -> saved as a lead in the admin panel ---------- */
    const leadForm = document.getElementById("leadForm");
    const lfName = document.getElementById("lfName");
    const lfPhone = document.getElementById("lfPhone");
    const leadDone = document.getElementById("leadDone");
    const leadDoneName = document.getElementById("leadDoneName");
    const leadDonePhone = document.getElementById("leadDonePhone");
    const leadErr = document.getElementById("leadErr");
    const submitBtn = leadForm.querySelector('button[type="submit"]');

    const onSubmit = async (e) => {
      e.preventDefault();
      let ok = true;
      [lfName, lfPhone].forEach((f) => {
        if (!f.value.trim()) {
          f.classList.add("err");
          ok = false;
        } else {
          f.classList.remove("err");
        }
      });
      if (!ok) {
        (!lfName.value.trim() ? lfName : lfPhone).focus();
        return;
      }

      const name = lfName.value.trim();
      const phone = lfPhone.value.trim();
      const car = document.getElementById("lfCar").value;
      const budget = document.getElementById("lfBudget").value;
      const pay = document.getElementById("lfPay").value;
      const company = document.getElementById("lfCompany");

      if (leadErr) leadErr.hidden = true;
      const label = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      let sent = false;
      try {
        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone,
            car,
            budget,
            payment: pay,
            source: "homepage",
            company: company ? company.value : "",
          }),
        });
        const data = await res.json().catch(() => ({}));
        sent = res.ok && data.ok !== false;
      } catch (err) {
        console.warn("[lead] submission failed:", err);
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = label;
      }

      if (!sent) {
        if (leadErr) leadErr.hidden = false;
        return;
      }

      // Swap the form for the confirmation, mirroring the book-a-viewing dialog.
      if (leadDoneName) leadDoneName.textContent = name.split(" ")[0] || "there";
      if (leadDonePhone) leadDonePhone.textContent = phone;
      leadForm.reset();
      leadForm.hidden = true;
      if (leadDone) {
        leadDone.hidden = false;
        leadDone.focus?.();
      }
    };
    leadForm.addEventListener("submit", onSubmit);

    const clearErr = (e) => e.target.classList.remove("err");
    lfName.addEventListener("input", clearErr);
    lfPhone.addEventListener("input", clearErr);

    /* ---------- magnetic buttons ---------- */
    let mags = [];
    if (!reduce && window.matchMedia("(pointer:fine)").matches) {
      document.querySelectorAll("[data-mag]").forEach(() => {});
      mags = Array.prototype.slice.call(document.querySelectorAll(".btn-red, .btn-dark, .btn-wa, .btn-glass"));
      mags.forEach((b) => {
        const move = (e) => {
          const r = b.getBoundingClientRect();
          b.style.transform =
            "translate(" +
            (e.clientX - r.left - r.width / 2) * 0.2 +
            "px," +
            (e.clientY - r.top - r.height / 2) * 0.3 +
            "px)";
        };
        const leave = () => {
          b.style.transform = "";
        };
        b.addEventListener("mousemove", move);
        b.addEventListener("mouseleave", leave);
        b.__magCleanup = { move, leave };
      });
    }

    /* ---------- accordion ---------- */
    document.querySelectorAll(".acc-q").forEach((q) => {
      const onClick = () => {
        const item = q.parentElement;
        const open = item.classList.contains("open");
        document.querySelectorAll(".acc-item").forEach((i) => {
          i.classList.remove("open");
          i.querySelector(".acc-a").style.maxHeight = null;
        });
        if (!open) {
          item.classList.add("open");
          const a = item.querySelector(".acc-a");
          a.style.maxHeight = a.scrollHeight + "px";
        }
      };
      q.addEventListener("click", onClick);
      q.__accCleanup = onClick;
    });

    /* ---------- finance estimator ---------- */
    const price = document.getElementById("price");
    const down = document.getElementById("down");
    const term = document.getElementById("term");
    const rate = document.getElementById("rate");

    function calc() {
      const P = +price.value;
      const d = +down.value;
      const y = +term.value;
      const r = +rate.value;
      const dpAmt = (P * d) / 100;
      const loan = P - dpAmt;
      const i = r / 100 / 12;
      const n = y * 12;
      const emi = i > 0 ? (loan * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1) : loan / n;

      document.getElementById("priceVal").textContent = "৳ " + bdt(P);
      document.getElementById("downVal").textContent = d + "%";
      document.getElementById("termVal").textContent = y + (y === 1 ? " year" : " years");
      document.getElementById("rateVal").textContent = r.toFixed(1) + "%";
      document.getElementById("emi").innerHTML = "৳ " + bdt(emi) + " <small>/ mo</small>";
      document.getElementById("downAmt").textContent = "৳ " + bdt(dpAmt);
    }
    const onCalc = calc;
    [price, down, term, rate].forEach((el) => el.addEventListener("input", onCalc));
    calc();

    placeRims();
    sizeJourney();
    driveFrame(performance.now());
    frame();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrient);
      clearInterval(openTimer);
      leadForm.removeEventListener("submit", onSubmit);
      lfName.removeEventListener("input", clearErr);
      lfPhone.removeEventListener("input", clearErr);
      document.querySelectorAll(".acc-q").forEach((q) => q.removeEventListener("click", q.__accCleanup));
      [price, down, term, rate].forEach((el) => el.removeEventListener("input", onCalc));
      mags.forEach((b) => {
        if (b.__magCleanup) {
          b.removeEventListener("mousemove", b.__magCleanup.move);
          b.removeEventListener("mouseleave", b.__magCleanup.leave);
        }
      });
      window.__homeInit = false;
    };
  }, []);

  return null;
}
