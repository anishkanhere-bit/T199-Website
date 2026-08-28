/**
 * Troop calendar, listed in date order.
 * Add an entry as: { date: "Sept 12, 2026", event: "Mission Peak", type: "Day Outing / Hiking" }
 */
const schedule = [
  { date: "Sept 12, 2026", event: "Mission Peak", type: "Day Outing / Hiking" },
  { date: "Sept 19–20, 2026", event: "Del Valle", type: "Car Camping / Service" },
  { date: "Sept 25–27, 2026", event: "Fall Camporee", type: "Car Camping / Competition" },
  { date: "Oct 3, 2026", event: "Shoreline", type: "Day Outing" },
  { date: "Oct 10, 2026", event: "Mt. Umunhum", type: "Day Outing / Hiking" },
  { date: "Oct 17–18, 2026", event: "Mt. Hermon", type: "Car Camping / Henry Coe" },
  { date: "Nov 7–14, 2026", event: "Scouting for Food (SFF)", type: "Service / Day Outing" },
  { date: "Dec 5, 2026", event: "Quarry Parks", type: "Day Outing" },
  { date: "Dec 12–13, 2026", event: "Mt. Diablo", type: "Backpacking" },
  { date: "Jan 2–3, 2027", event: "Cal Academy", type: "Car Camping" },
  { date: "Feb 13–14, 2027", event: "Black Diamond Mines", type: "Backpacking" },
  { date: "June 7–14, 2027", event: "Summit Bechtel Reserve", type: "High Adventure" },
];

function renderSchedule() {
  const body = document.getElementById("schedule-body");
  if (!body) return;

  if (!schedule.length) {
    body.innerHTML =
      '<tr class="schedule-empty"><td colspan="3">No events posted yet. Check back soon.</td></tr>';
    return;
  }

  body.innerHTML = schedule
    .map(
      (row) => `
        <tr>
          <td class="schedule-date">${row.date}</td>
          <td class="schedule-event">${row.event}</td>
          <td><span class="schedule-type">${row.type}</span></td>
        </tr>
      `
    )
    .join("");
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function headerOffset() {
  const header = document.querySelector(".site-header");
  return header ? header.offsetHeight - 1 : 0;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function focusTarget(target) {
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

function scrollToTarget(target) {
  const startY = window.scrollY;
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  /* A fixed element (the header itself, via #top) always measures at viewport
     position 0, so anchoring to it means the top of the document. */
  const isFixed = getComputedStyle(target).position === "fixed";
  const endY = isFixed
    ? 0
    : Math.max(
        0,
        Math.min(maxY, Math.round(target.getBoundingClientRect().top + startY - headerOffset()))
      );
  const distance = endY - startY;

  if (reducedMotion.matches || Math.abs(distance) < 2) {
    window.scrollTo({ top: endY, behavior: "auto" });
    focusTarget(target);
    return;
  }

  const duration = Math.min(1100, Math.max(450, Math.abs(distance) * 0.55));
  const startTime = performance.now();
  let frame = 0;

  const stop = () => {
    cancelAnimationFrame(frame);
    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", stop);
  };

  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("keydown", stop);

  const step = (now) => {
    const progress = Math.min(1, (now - startTime) / duration);
    window.scrollTo({ top: startY + distance * easeInOutCubic(progress), behavior: "auto" });

    if (progress < 1) {
      frame = requestAnimationFrame(step);
      return;
    }

    cleanup();
    focusTarget(target);
  };

  frame = requestAnimationFrame(step);
}

function samePageTarget(link) {
  if (link.target === "_blank" || link.classList.contains("skip-link")) return null;

  const url = new URL(link.href, window.location.href);
  const sameSite = url.protocol === "file:" || url.origin === window.location.origin;
  if (!sameSite || url.pathname !== window.location.pathname) return null;
  if (!url.hash || url.hash === "#") return null;

  return document.getElementById(url.hash.slice(1));
}

function setupSmoothScroll() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href*="#"]');
    if (!link) return;

    const target = samePageTarget(link);
    if (!target) return;

    event.preventDefault();
    scrollToTarget(target);

    try {
      history.pushState(null, "", new URL(link.href, window.location.href).hash);
    } catch {
      /* Pages opened straight from disk reject history updates; the scroll still ran. */
    }
  });

  window.addEventListener("popstate", () => {
    if (!window.location.hash) return;
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) scrollToTarget(target);
  });
}

/** Glide to the section instead of landing on it when arriving from another page. */
function setupHashArrival() {
  if (!window.location.hash) return;

  const target = document.getElementById(window.location.hash.slice(1));
  if (!target || reducedMotion.matches) return;

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo({ top: 0, behavior: "auto" });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollToTarget(target));
  });
}

function setupNavigation() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-links");
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = [...document.querySelectorAll("main section[id]")];

  const closeMenu = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
}

function applyImages() {
  document.querySelectorAll("[data-image]").forEach((container) => {
    const key = container.getAttribute("data-image");
    const img = document.createElement("img");
    img.src = `images/${key}.jpg`;
    img.alt = container.querySelector("figcaption")?.textContent || "Troop photo";
    img.loading = "lazy";

    img.addEventListener("load", () => {
      container.classList.add("has-image");
    });

    img.addEventListener("error", () => {
      img.remove();
    });

    container.prepend(img);
  });
}

/* Photos carried over from the troop's original t199.org site. */
const galleryPhotos = [
  { file: "og/og-07.jpg", caption: "The whole troop on the ridge above the bay" },
  { file: "og/og-19.jpg", caption: "Packs on and ready to hit the trail" },
  { file: "og/og-04.jpg", caption: "Spring hike past the old mine tunnel" },
  { file: "og/og-18.jpg", caption: "Snow camping in the Sierra" },
  { file: "og/og-09.jpg", caption: "Below the Golden Gate Bridge" },
  { file: "og/og-06.jpg", caption: "In uniform at the San Francisco National Cemetery" },
  { file: "og/og-03.jpg", caption: "Placing flags for Memorial Day" },
  { file: "og/og-05.jpg", caption: "Honoring veterans row by row" },
  { file: "og/og-15.jpg", caption: "Trailhead photo before heading up" },
  { file: "og/og-20.jpg", caption: "Troop bowling night" },
];

function setupCarousel() {
  const carousel = document.getElementById("gallery-carousel");
  const viewport = carousel?.querySelector(".carousel-viewport");
  const dotsWrap = document.querySelector(".carousel-dots");
  if (!carousel || !viewport || !dotsWrap) return;

  const status = carousel.querySelector(".carousel-status");

  const slides = galleryPhotos.map((photo, index) => {
    const figure = document.createElement("figure");
    figure.className = "carousel-slide";

    const img = document.createElement("img");
    img.src = `images/${photo.file}`;
    img.alt = photo.caption;
    img.decoding = "async";
    img.loading = index === 0 ? "eager" : "lazy";

    const caption = document.createElement("figcaption");
    caption.textContent = photo.caption;

    figure.append(img, caption);
    viewport.append(figure);
    return figure;
  });

  const dots = galleryPhotos.map((photo, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", photo.caption);
    dot.addEventListener("click", () => show(index));
    dotsWrap.append(dot);
    return dot;
  });

  let current = 0;
  let timer = 0;
  let hovered = false;
  let onscreen = false;

  /* One place decides whether the slideshow should be running, so hover,
     visibility and scroll position can't leave stray intervals behind. */
  function sync() {
    clearInterval(timer);
    if (reducedMotion.matches || hovered || document.hidden || !onscreen) return;
    timer = setInterval(() => show(current + 1), 6000);
  }

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === current);
      if (i === current) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    if (status) {
      status.textContent = `Photo ${current + 1} of ${slides.length}: ${galleryPhotos[current].caption}`;
    }

    sync();
  }

  carousel.querySelector(".carousel-arrow-prev")?.addEventListener("click", () => show(current - 1));
  carousel.querySelector(".carousel-arrow-next")?.addEventListener("click", () => show(current + 1));

  carousel.addEventListener("mouseenter", () => ((hovered = true), sync()));
  carousel.addEventListener("mouseleave", () => ((hovered = false), sync()));
  carousel.addEventListener("focusin", () => ((hovered = true), sync()));
  carousel.addEventListener("focusout", () => ((hovered = false), sync()));
  document.addEventListener("visibilitychange", sync);

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });

  let touchStart = null;
  viewport.addEventListener(
    "touchstart",
    (event) => {
      touchStart = event.changedTouches[0].clientX;
    },
    { passive: true }
  );
  viewport.addEventListener(
    "touchend",
    (event) => {
      if (touchStart === null) return;
      const delta = event.changedTouches[0].clientX - touchStart;
      touchStart = null;
      if (Math.abs(delta) > 40) show(current + (delta < 0 ? 1 : -1));
    },
    { passive: true }
  );

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        onscreen = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { threshold: 0.2 }
    ).observe(carousel);
  } else {
    onscreen = true;
  }

  show(0);
}

function setupGalleryLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeButton = document.querySelector(".lightbox-close");
  if (!lightbox || !lightboxImage || !lightboxCaption || !closeButton) return;

  const openLightbox = (src, alt, caption) => {
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightboxCaption.textContent = caption || alt;
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    document.body.style.overflow = "";
  };

  /* Delegated so carousel slides built later are covered too. */
  document.addEventListener("click", (event) => {
    const item = event.target.closest(".carousel-slide.is-active");
    if (!item) return;

    const img = item.querySelector("img");
    if (!img) return;

    openLightbox(img.src, img.alt, item.querySelector("figcaption")?.textContent);
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
}

function setupContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    alert("Thanks for your message. A troop contact email can be connected here later.");
    form.reset();
  });
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* One failing feature should never take the rest of the page down with it. */
function run(setup) {
  try {
    setup();
  } catch (error) {
    console.error(`${setup.name} failed:`, error);
  }
}

[
  renderSchedule,
  applyImages,
  setupNavigation,
  setupSmoothScroll,
  setupRevealAnimations,
  setupCarousel,
  setupGalleryLightbox,
  setupContactForm,
  setupHashArrival,
].forEach(run);
