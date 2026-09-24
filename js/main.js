(() => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  const heroImage = document.querySelector(".hero-image");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const yearEl = document.getElementById("year");
  const form = document.querySelector(".contact-form");
  const loader = document.querySelector(".page-loader");
  const progress = document.querySelector(".scroll-progress");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* —— Intro loader —— */
  body.classList.add("is-loading");

  const finishLoader = () => {
    if (loader) loader.classList.add("is-done");
    body.classList.remove("is-loading");
    startHeroEntrance();
  };

  if (reduceMotion) {
    finishLoader();
  } else {
    window.setTimeout(finishLoader, 1500);
  }

  /* —— Hero text choreography —— */
  const splitBrand = document.querySelector("[data-split]");
  if (splitBrand && !reduceMotion) {
    const text = splitBrand.textContent.trim();
    splitBrand.textContent = "";
    [...text].forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = ch;
      span.style.transitionDelay = `${0.05 + i * 0.045}s`;
      splitBrand.appendChild(span);
    });
  }

  const headline = document.querySelector("[data-reveal-lines]");
  if (headline && !reduceMotion) {
    const text = headline.textContent.trim();
    headline.textContent = "";
    const line = document.createElement("span");
    line.className = "line";
    const inner = document.createElement("span");
    inner.className = "line-inner";
    inner.textContent = text;
    line.appendChild(inner);
    headline.appendChild(line);
  }

  function startHeroEntrance() {
    const fadeEls = [...document.querySelectorAll("[data-fade]")];

    if (reduceMotion) {
      document.querySelectorAll("[data-split], [data-reveal-lines], [data-fade]").forEach((el) => {
        el.classList.add("is-in");
      });
      return;
    }

    requestAnimationFrame(() => {
      const status = document.querySelector(".hero-status");
      if (status) status.classList.add("is-in");

      window.setTimeout(() => {
        if (splitBrand) splitBrand.classList.add("is-in");
      }, 120);

      window.setTimeout(() => {
        if (headline) headline.classList.add("is-in");
      }, 380);

      window.setTimeout(() => {
        fadeEls
          .filter((el) => !el.classList.contains("hero-status"))
          .forEach((el, i) => {
            window.setTimeout(() => el.classList.add("is-in"), i * 110);
          });
      }, 780);
    });
  }

  /* —— Header + progress + parallax —— */
  const updateChrome = () => {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 20);
      if (hero) {
        const heroBottom = hero.offsetTop + hero.offsetHeight - header.offsetHeight;
        header.classList.toggle("is-over-hero", y < heroBottom - 40);
      }
    }

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (y / max) * 100 : 0;
      progress.style.width = `${pct}%`;
    }

    if (heroImage && !reduceMotion && hero) {
      const heroH = hero.offsetHeight;
      if (y < heroH) {
        heroImage.style.transform = `scale(1.02) translate3d(0, ${y * 0.22}px, 0)`;
      }
    }
  };

  updateChrome();
  window.addEventListener("scroll", updateChrome, { passive: true });
  window.addEventListener("resize", updateChrome);

  /* —— Mobile nav —— */
  if (navToggle && navLinks) {
    const setOpen = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      navLinks.classList.toggle("is-open", open);
      body.style.overflow = open ? "hidden" : "";
    };

    navToggle.addEventListener("click", () => {
      setOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* —— Scroll reveals —— */
  const revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* —— Metric counters —— */
  const metrics = document.querySelectorAll("[data-count]");

  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (reduceMotion) {
    metrics.forEach((el) => {
      el.textContent = `${el.dataset.prefix || ""}${el.dataset.count}${el.dataset.suffix || ""}`;
    });
  } else if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    metrics.forEach((el) => countObserver.observe(el));
  }

  /* —— Form —— */
  if (form) {
    const status = form.querySelector(".form-status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) {
          status.hidden = false;
          status.classList.add("is-error");
          status.textContent = "Please complete the required fields.";
        }
        return;
      }

      if (status) {
        status.hidden = false;
        status.classList.remove("is-error");
        status.textContent =
          "Thank you. Your inquiry has been received. A partner will follow up within two business days.";
      }

      form.reset();
    });
  }
})();
