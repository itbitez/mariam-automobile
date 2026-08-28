"use client";

import { useEffect } from "react";

export default function DetailChrome() {
  useEffect(() => {
    if (window.__detailInit) return;
    window.__detailInit = true;

    /* reveal */
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -4% 0px" }
    );
    document.querySelectorAll(".rv").forEach((el, i) => {
      el.style.transitionDelay = Math.min(i, 5) * 0.05 + "s";
      io.observe(el);
    });

    /* scroll chrome */
    const progress = document.getElementById("progress");
    const nav = document.getElementById("nav");
    const headBg = document.getElementById("headBg");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;

    function frame() {
      const h = document.documentElement;
      const top = h.scrollTop;
      progress.style.transform = "scaleX(" + top / (h.scrollHeight - h.clientHeight || 1) + ")";
      nav.classList.toggle("scrolled", top > 60);
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
      io.disconnect();
      window.__detailInit = false;
    };
  }, []);

  return null;
}
