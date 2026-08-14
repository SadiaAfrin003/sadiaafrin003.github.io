// =============================================================
// SADIA AFRIN CHOWDHURY — "BASECAMP"
// script.js — sky ambience, nav interactions, gear bars, badges
// =============================================================
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  /* -------------------- THEME TOGGLE -------------------- */
  const THEME_KEY = "sadia-basecamp-theme";
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }
  (function initTheme() {
    let saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { saved = null; }
    if (saved === "light" || saved === "dark") applyTheme(saved);
    else applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  })();
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
  });

  /* -------------------- MOBILE NAV -------------------- */
  const navLinksEl = document.getElementById("nav-links");
  const navToggle = document.getElementById("nav-toggle");
  navToggle?.addEventListener("click", () => {
    const open = navLinksEl.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".nav-links a, [data-nav]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.dataset.nav || link.getAttribute("href")?.replace("#", "");
      if (targetId) {
        e.preventDefault();
        document.getElementById(targetId)?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
      navLinksEl?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  /* -------------------- SCROLLSPY -------------------- */
  const sections = Array.from(document.querySelectorAll("main > section[id]"));
  const navAnchors = Array.from(document.querySelectorAll(".nav-links a[data-nav]"));
  function setActiveNav(id) {
    navAnchors.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === id));
  }
  const spyObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveNav(entry.target.id)),
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => spyObserver.observe(s));

  /* -------------------- SCROLL REVEAL -------------------- */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (prefersReducedMotion) el.classList.add("is-visible");
    else revealObserver.observe(el);
  });

  /* -------------------- STAT COUNTERS -------------------- */
  const counterObserver = new IntersectionObserver(
    (entries, obs) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10) || 0;
      if (prefersReducedMotion) { el.textContent = target; }
      else {
        const duration = 1200; const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
      obs.unobserve(el);
    }),
    { threshold: 0.5 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

  /* -------------------- GEAR BARS -------------------- */
  const gearBars = document.querySelectorAll(".gear-bar[data-level]");
  const gearObserver = new IntersectionObserver(
    (entries, obs) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      const fill = bar.querySelector(".gear-fill");
      if (fill) fill.style.width = bar.dataset.level + "%";
      obs.unobserve(bar);
    }),
    { threshold: 0.3 }
  );
  gearBars.forEach((bar) => gearObserver.observe(bar));

  /* -------------------- PROJECT FILTERS -------------------- */
  const filterChips = document.querySelectorAll(".filter-chip");
  const projectCards = document.querySelectorAll(".project-card");
  const filterEmpty = document.getElementById("filter-empty");
  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterChips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const filter = chip.dataset.filter;
      let visible = 0;
      projectCards.forEach((card) => {
        const matches = filter === "all" || (card.dataset.tags || "").split(" ").includes(filter);
        card.classList.toggle("is-hidden", !matches);
        if (matches) visible++;
      });
      if (filterEmpty) filterEmpty.hidden = visible !== 0;
    });
  });

  /* -------------------- BADGE WALL REVEAL -------------------- */
  const badges = document.querySelectorAll("#badge-grid [data-badge]");
  const badgeObserver = new IntersectionObserver(
    (entries, obs) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      if (prefersReducedMotion) { badges.forEach((b) => (b.style.opacity = "1")); return; }
      badges.forEach((badge, i) => {
        setTimeout(() => {
          badge.style.transition = "transform 520ms cubic-bezier(0.22,1,0.36,1), opacity 520ms ease";
          badge.style.opacity = "1";
          badge.style.transform = "translateY(0) scale(1)";
        }, i * 90);
      });
    }),
    { threshold: 0.2 }
  );
  const badgeGrid = document.getElementById("badge-grid");
  if (badgeGrid) {
    badges.forEach((b) => { b.style.opacity = prefersReducedMotion ? "1" : "0"; b.style.transform = "translateY(16px) scale(0.96)"; });
    badgeObserver.observe(badgeGrid);
  }

  /* -------------------- COPY EMAIL -------------------- */
  const copyBtn = document.getElementById("copy-email-btn");
  const copyLabel = document.getElementById("copy-btn-label");
  const emailText = document.getElementById("email-text");
  copyBtn?.addEventListener("click", async () => {
    const email = emailText?.textContent?.trim() || "";
    try { await navigator.clipboard.writeText(email); }
    catch (e) {
      const temp = document.createElement("textarea");
      temp.value = email; temp.style.position = "fixed"; temp.style.opacity = "0";
      document.body.appendChild(temp); temp.select();
      try { document.execCommand("copy"); } catch (err) {}
      document.body.removeChild(temp);
    }
    copyBtn.classList.add("is-copied");
    if (copyLabel) copyLabel.textContent = "copied!";
    setTimeout(() => { copyBtn.classList.remove("is-copied"); if (copyLabel) copyLabel.textContent = "copy"; }, 2000);
  });

  /* -------------------- CONTACT FORM (mailto) -------------------- */
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("cf-name").value.trim();
    const email = document.getElementById("cf-email").value.trim();
    const subject = document.getElementById("cf-subject").value.trim();
    const message = document.getElementById("cf-message").value.trim();
    if (!name || !email || !subject || !message) {
      if (formStatus) formStatus.textContent = "Please fill in every field before sending.";
      return;
    }
    const destination = emailText?.textContent?.trim() || "sadia.afrin.chowdhury@example.com";
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    window.location.href = `mailto:${destination}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (formStatus) formStatus.textContent = "Opening your email app...";
  });

  const footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* -------------------- CANVAS: SUN + CLOUDS + BIRDS -------------------- */
  const canvas = document.getElementById("sky-canvas");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let width, height, dpr;
    let clouds = [];
    let birds = [];
    let animId = null;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      canvas.style.width = width + "px"; canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeCloud(i) {
      return {
        x: Math.random() * width,
        y: 40 + Math.random() * height * 0.35,
        scale: 0.6 + Math.random() * 1.1,
        speed: 0.05 + Math.random() * 0.09,
        opacity: 0.35 + Math.random() * 0.3,
        puffs: 4 + Math.floor(Math.random() * 3),
        seed: Math.random() * 1000,
      };
    }

    function makeBird(i) {
      return {
        x: Math.random() * width,
        y: 60 + Math.random() * height * 0.28,
        speed: 0.5 + Math.random() * 0.4,
        flapPhase: Math.random() * Math.PI * 2,
        scale: 0.6 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.25,
      };
    }

    function initSky() {
      const cloudCount = width < 700 ? 3 : width < 1300 ? 5 : 7;
      clouds = Array.from({ length: cloudCount }, (_, i) => makeCloud(i));
      const birdCount = width < 700 ? 2 : 4;
      birds = Array.from({ length: birdCount }, (_, i) => makeBird(i));
    }

    function drawSun() {
      const sx = width * 0.86;
      const sy = height * 0.14;
      const isDark = root.getAttribute("data-theme") === "dark";
      const color = isDark ? "255,244,214" : "255,214,120";
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 220);
      glow.addColorStop(0, `rgba(${color},${isDark ? 0.5 : 0.55})`);
      glow.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, sy, 220, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(sx, sy, 46, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},0.9)`;
      ctx.fill();
    }

    function drawCloud(c) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.scale, c.scale);
      const isDark = root.getAttribute("data-theme") === "dark";
      const fill = isDark ? `rgba(180,210,220,${c.opacity * 0.5})` : `rgba(255,255,255,${c.opacity})`;
      ctx.fillStyle = fill;
      for (let p = 0; p < c.puffs; p++) {
        const px = p * 34 - (c.puffs * 34) / 2;
        const py = Math.sin(p + c.seed) * 6;
        const r = 26 + (p % 2 === 0 ? 10 : 0);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawBird(b, time) {
      const flap = Math.sin(time * 0.006 + b.flapPhase) * 8;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(b.scale, b.scale);
      ctx.strokeStyle = `rgba(60,70,60,${b.opacity})`;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.quadraticCurveTo(-6, -8 - flap, 0, 0);
      ctx.quadraticCurveTo(6, -8 - flap, 14, 0);
      ctx.stroke();
      ctx.restore();
    }

    function animate(time) {
      ctx.clearRect(0, 0, width, height);
      drawSun();
      clouds.forEach((c) => {
        c.x += c.speed;
        if (c.x > width + 160) c.x = -160;
        drawCloud(c);
      });
      birds.forEach((b) => {
        b.x += b.speed;
        if (b.x > width + 40) { b.x = -40; b.y = 60 + Math.random() * height * 0.28; }
        drawBird(b, time);
      });
      animId = requestAnimationFrame(animate);
    }

    function start() {
      resize();
      initSky();
      if (!prefersReducedMotion) {
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
        drawSun();
        clouds.forEach(drawCloud);
        birds.forEach((b) => drawBird(b, 0));
      }
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 200);
    });

    start();
  }
})();
