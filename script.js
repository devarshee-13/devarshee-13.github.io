/* Devarshee Thopte — portfolio motion layer.
   Native scrolling is left untouched; only the animation values are
   smoothed (lerped) each frame, which gives the silky feel of a
   scroll-hijacking library without stealing the scrollbar. */

(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqDesktop = window.matchMedia("(min-width: 768px)");

  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ── elements ─────────────────────────────────────────── */
  const navbar = document.querySelector(".navbar");
  const heroHost = document.querySelector("[data-pin-host]");
  const heroMedia = document.querySelector("[data-hero-media]");
  const heroInner = document.querySelector(".hero-inner");
  const revealStack = document.querySelector("[data-reveal-text]");
  const seqHost = document.querySelector("[data-seq-host]");
  const seqDigits = document.querySelector("[data-seq-digits]");
  const seqPanels = [...document.querySelectorAll("[data-seq-panel]")];
  const marquee = document.querySelector("[data-marquee]");

  /* ── in-view reveals ──────────────────────────────────── */
  const inview = [...document.querySelectorAll("[data-inview]")];
  if (reduced) {
    inview.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (!e.isIntersecting) return;
          setTimeout(() => e.target.classList.add("is-in"), Math.min(i, 4) * 70);
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    inview.forEach((el) => io.observe(el));
  }

  /* ── nav auto-hide ────────────────────────────────────── */
  let lastY = window.scrollY;
  const updateNav = () => {
    const y = window.scrollY;
    const goingDown = y > lastY;
    if (navbar) navbar.classList.toggle("is-hidden", goingDown && y > 220);
    lastY = y;
  };

  /* ── marquee ──────────────────────────────────────────── */
  let marqueeWidth = 0;
  let marqueeX = 0;
  if (marquee) {
    marquee.innerHTML += marquee.innerHTML; // seamless loop
    const measure = () => {
      marqueeWidth = marquee.scrollWidth / 2;
    };
    measure();
    window.addEventListener("resize", measure);
  }

  /* ── scroll-progress helpers ──────────────────────────── */
  // progress through a tall pin host, 0 → 1
  const spanProgress = (el) => {
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    if (total <= 0) return clamp(-r.top / Math.max(r.height, 1));
    return clamp(-r.top / total);
  };

  // progress of an element crossing the viewport
  const crossProgress = (el, startAt, endAt) => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * startAt;
    const end = -r.height + vh * endAt;
    return clamp((start - r.top) / Math.max(start - end, 1));
  };

  /* ── targets + smoothed values ────────────────────────── */
  const t = { hero: 0, reveal: 0, seq: 0 };
  const s = { hero: 0, reveal: 0, seq: 0 };
  let activeIndex = -1;
  let queued = false;

  const readTargets = () => {
    queued = false;
    if (heroHost) t.hero = spanProgress(heroHost);
    if (revealStack) t.reveal = crossProgress(revealStack, 0.82, 0.55);
    if (seqHost && mqDesktop.matches) t.seq = spanProgress(seqHost);
  };

  const render = () => {
    const ease = reduced ? 1 : 0.12;
    s.hero = lerp(s.hero, t.hero, ease);
    s.reveal = lerp(s.reveal, t.reveal, ease);
    s.seq = lerp(s.seq, t.seq, ease);

    // hero: media parallax + copy lift and fade
    if (heroMedia) {
      heroMedia.style.transform =
        `translate3d(0, ${(s.hero * 14).toFixed(2)}%, 0) ` +
        `scale(${(1 + s.hero * 0.06).toFixed(4)})`;
    }
    if (heroInner) {
      const p = clamp(s.hero / 0.7);
      heroInner.style.opacity = String(1 - p);
      heroInner.style.transform = `translate3d(0, ${(-p * 60).toFixed(1)}px, 0)`;
    }

    // manifesto: sweep the text-clipped gradient from dim to bright
    if (revealStack && !reduced) {
      revealStack.style.backgroundPositionY = `${(100 - s.reveal * 100).toFixed(2)}%`;
    }

    // sequence: pick the panel from progress, roll the odometer
    if (seqPanels.length && mqDesktop.matches) {
      const idx = clamp(
        Math.floor(s.seq * seqPanels.length),
        0,
        seqPanels.length - 1
      );
      if (idx !== activeIndex) {
        activeIndex = idx;
        seqPanels.forEach((p, i) => p.classList.toggle("is-active", i === idx));
        if (seqDigits) seqDigits.style.transform = `translateY(${-idx * 100}%)`;
      }
    }

    // marquee drift
    if (marquee && marqueeWidth && !reduced) {
      marqueeX = (marqueeX - 0.35) % marqueeWidth;
      marquee.style.transform = `translate3d(${marqueeX.toFixed(2)}px, 0, 0)`;
    }

    requestAnimationFrame(render);
  };

  const onScroll = () => {
    updateNav();
    if (!queued) {
      queued = true;
      requestAnimationFrame(readTargets);
    }
  };

  /* ── breakpoint sync ──────────────────────────────────── */
  const syncBreakpoint = () => {
    if (!mqDesktop.matches) {
      seqPanels.forEach((p) => p.classList.add("is-active"));
      activeIndex = -1;
    } else {
      seqPanels.forEach((p, i) => p.classList.toggle("is-active", i === 0));
      activeIndex = 0;
      if (seqDigits) seqDigits.style.transform = "translateY(0%)";
    }
  };

  mqDesktop.addEventListener("change", syncBreakpoint);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", readTargets);

  syncBreakpoint();
  readTargets();
  requestAnimationFrame(render);
})();
