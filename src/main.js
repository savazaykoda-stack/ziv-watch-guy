import "./styles.css";
import Lenis from "lenis";

const img = (name) => `${import.meta.env.BASE_URL}images/${name}`;

const PRODUCTS = {
  breitling: {
    id: "breitling",
    brand: "Breitling",
    name: "Heritage B20 Automatic",
    price: "$22,500",
    image: img("b8d0e.png"),
    badge: true,
    desc: "A striking blue sunburst dial and matching blue rubber strap. Built to be worn — on the wrist, not in a box.",
    specs: [
      ["Case", "Stainless steel"],
      ["Dial", "Blue sunburst"],
      ["Strap", "Blue rubber"],
      ["Movement", "Automatic"],
      ["Condition", "Inspected in Miami"],
    ],
  },
  patek: {
    id: "patek",
    brand: "Patek Philippe",
    name: "Perpetual Calendar",
    price: "$38,900",
    image: img("d3dfa.png"),
    badge: true,
    desc: "39mm rose gold with an ivory lacquered dial and brown leather. A perpetual calendar you can FaceTime before you wire.",
    specs: [
      ["Case", "39mm rose gold"],
      ["Dial", "Ivory lacquered"],
      ["Strap", "Brown leather"],
      ["Complication", "Perpetual calendar"],
      ["Condition", "Inspected in Miami"],
    ],
  },
  gmt: {
    id: "gmt",
    brand: "Rolex",
    name: "GMT-Master II",
    price: "$44,400",
    image: img("452ea.png"),
    badge: false,
    desc: "Blue and red Pepsi bezel, meteorite dial, Oyster bracelet. Two time zones. One conversation.",
    specs: [
      ["Bezel", "Blue and red Pepsi"],
      ["Dial", "Meteorite"],
      ["Bracelet", "Oyster"],
      ["Function", "GMT"],
      ["Condition", "Inspected in Miami"],
    ],
  },
  "air-king": {
    id: "air-king",
    brand: "Rolex",
    name: "Air King",
    price: "$14,400",
    image: img("4c878.png"),
    badge: false,
    desc: "Smooth bezel, black dial, Oyster bracelet. The everyday Rolex — same-day wire when we agree.",
    specs: [
      ["Bezel", "Smooth"],
      ["Dial", "Black"],
      ["Bracelet", "Oyster"],
      ["Movement", "Automatic"],
      ["Condition", "Inspected in Miami"],
    ],
  },
};

const GLUE_WORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "for",
  "or",
  "and",
  "as",
  "is",
  "if",
  "it",
  "we",
  "not",
  "nor",
  "but",
  "from",
  "with",
  "into",
  "onto",
  "upon",
  "via",
  "per",
  "vs",
  "than",
  "then",
  "off",
  "out",
  "up",
]);

function glueHanging(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const el = node.parentElement;
      if (!el || el.closest("script, style, textarea, noscript")) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!node.nodeValue || !/[ \t]/.test(node.nodeValue)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const re = /([A-Za-z][A-Za-z'.]*)( +)(?=[A-Za-z0-9$“"'])/g;
  for (const node of nodes) {
    node.nodeValue = node.nodeValue.replace(re, (full, word, space) =>
      GLUE_WORDS.has(word.toLowerCase()) ? `${word}\u00A0` : full
    );
  }
}

document.querySelector("[data-subscribe]")?.addEventListener("submit", (event) => {
  event.preventDefault();
});

document.querySelectorAll("[data-marquee]").forEach((track) => {
  const row = track.querySelector(".marquee-row");
  if (!row) return;
  track.appendChild(row.cloneNode(true));
});

const lenis = new Lenis({
  duration: 1.2,
  smoothWheel: true,
  wheelMultiplier: 0.9,
  prevent: (node) => Boolean(node.closest(".pdp, .menu")),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

const loader = document.querySelector("[data-loader]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let heroBannerStarted = false;

function startHeroBanner() {
  if (heroBannerStarted || reduceMotion) return;
  const slides = [...document.querySelectorAll(".hero-image img")];
  if (slides.length < 2) return;
  heroBannerStarted = true;
  let i = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (i < 0) i = 0;
  window.setInterval(() => {
    slides[i].classList.remove("is-active");
    i = (i + 1) % slides.length;
    slides[i].classList.add("is-active");
  }, 4000);
}

if (loader && document.body.classList.contains("is-loading")) {
  lenis.stop();
  const pctEl = loader.querySelector("[data-loader-pct]");
  const heroImg = document.querySelector(".hero-image img");
  const DELAY = 400;
  const DURATION = 2000;
  const FADE = 800;
  const MAX = 5000;
  const started = performance.now();
  let ready = Boolean(heroImg?.complete && heroImg.naturalWidth);
  let finished = false;

  const markReady = () => {
    ready = true;
  };
  if (heroImg && !ready) {
    heroImg.addEventListener("load", markReady, { once: true });
    heroImg.addEventListener("error", markReady, { once: true });
  }
  window.addEventListener("load", markReady, { once: true });

  const setPct = (n) => {
    if (pctEl) pctEl.textContent = `${n}%`;
  };

  const dismiss = () => {
    if (finished) return;
    finished = true;
    setPct(100);
    if (reduceMotion) {
      document.body.classList.remove("is-loading");
      loader.remove();
      lenis.start();
      syncScene(lenis.scroll);
      startHeroBanner();
      return;
    }
    loader.classList.add("is-leaving");
    window.setTimeout(() => {
      loader.classList.add("is-gone");
      document.body.classList.remove("is-loading");
      lenis.start();
      syncScene(lenis.scroll);
      loader.remove();
      startHeroBanner();
    }, FADE);
  };

  const splitApart = () => {
    const logo = loader.querySelector(".loader-logo");
    if (!logo || !pctEl) return;
    const probe = document.createElement("div");
    probe.style.width = "var(--gutter)";
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    document.body.append(probe);
    const gutter = probe.getBoundingClientRect().width || 80;
    probe.remove();
    const logoBox = logo.getBoundingClientRect();
    const pctBox = pctEl.getBoundingClientRect();
    logo.style.transform = `translateX(${gutter - logoBox.left}px)`;
    pctEl.style.transform = `translateX(${window.innerWidth - gutter - pctBox.right}px)`;
  };

  if (reduceMotion) {
    setPct(100);
    window.setTimeout(dismiss, 200);
  } else {
    window.setTimeout(splitApart, DELAY);
    const tick = (now) => {
      if (finished) return;
      const elapsed = now - started;
      if (elapsed < DELAY) {
        requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, (elapsed - DELAY) / DURATION);
      const next = Math.round(t * 100);
      setPct(ready ? next : Math.min(92, next));
      if ((t >= 1 && ready) || elapsed >= MAX) {
        dismiss();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

const nav = document.querySelector("[data-nav]");
const hero = document.querySelector(".hero");
const heroImage = document.querySelector(".hero-image");
const heroCopy = document.querySelector(".hero-copy");
const menu = document.getElementById("menu");
const menuOpenBtn = document.querySelector("[data-menu-open]");
const loveSection = document.querySelector("[data-love]");
const loveCopy = document.querySelector(".love-copy");
const loveTitles = [...document.querySelectorAll("[data-love-title]")];
const loveImages = [...document.querySelectorAll("[data-love-image]")];

let lastY = 0;
let passedHero = false;
let loveIndex = -1;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function syncLove() {
  if (!loveSection) return;
  const rect = loveSection.getBoundingClientRect();
  const view = window.innerHeight;
  const total = Math.max(1, rect.height - view);
  const progress = clamp(-rect.top / total, 0, 0.999);

  if (loveCopy) {
    if (reduceMotion) {
      loveCopy.style.transform = "";
    } else {
      const ease = progress * 0.35 + progress * progress * 0.65;
      const factor = window.innerWidth <= 639 ? 0.12 : 0.22;
      loveCopy.style.transform = `translate3d(0, ${(-ease * factor * view).toFixed(2)}px, 0)`;
    }
  }

  if (!loveTitles.length) return;
  const raw = progress * loveTitles.length;
  let index = Math.min(loveTitles.length - 1, Math.floor(raw));
  if (loveIndex >= 0 && index !== loveIndex) {
    const edge = index > loveIndex ? loveIndex + 1 : loveIndex;
    if (index > loveIndex && raw < edge + 0.12) index = loveIndex;
    if (index < loveIndex && raw > edge - 0.12) index = loveIndex;
  }
  if (index === loveIndex) return;
  loveIndex = index;
  loveTitles.forEach((el, i) => {
    el.classList.toggle("is-current", i === index);
  });
  loveImages.forEach((el, i) => {
    el.classList.toggle("is-active", i === index);
  });
}

function syncScene(y) {
  const heroH = hero?.offsetHeight || 1;
  const goingUp = y < lastY - 0.5;
  const goingDown = y > lastY + 0.5;

  if (heroImage) {
    heroImage.style.transform = `translate3d(0, ${y * 0.2}px, 0)`;
  }
  if (heroCopy) {
    const lift = Math.min(y, heroH) * 0.08;
    heroCopy.style.transform = `translate3d(0, ${-lift}px, 0)`;
    heroCopy.style.opacity = "1";
  }

  if (nav) {
    if (y <= 16) {
      passedHero = false;
      nav.classList.remove("is-away", "is-compact", "is-over-hero");
      nav.style.transform = "";
    } else if (!passedHero && y < heroH) {
      const t = clamp((y - 16) / (heroH * 0.38), 0, 1);
      nav.classList.remove("is-compact", "is-over-hero");
      nav.style.transform = `translateY(${-t * (nav.offsetHeight + 12)}px)`;
      nav.classList.toggle("is-away", t >= 1);
      if (y > heroH * 0.92) passedHero = true;
    } else {
      passedHero = true;
      nav.style.transform = "";
      if (goingUp) {
        nav.classList.add("is-compact");
        nav.classList.toggle("is-over-hero", y < heroH);
        nav.classList.remove("is-away");
      } else if (goingDown) {
        nav.classList.add("is-away");
        nav.classList.remove("is-compact", "is-over-hero");
      }
    }
  }

  syncLove();
  lastY = y;
}

lenis.on("scroll", ({ scroll }) => syncScene(scroll));
const loveHover = document.querySelector("[data-love-hover]");
const loveCursor = document.querySelector("[data-love-cursor]");

const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (loveHover && loveCursor && canHover) {
  const moveCursor = (event) => {
    loveCursor.classList.add("is-on");
    loveCursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
  };
  loveHover.addEventListener("pointerenter", moveCursor);
  loveHover.addEventListener("pointermove", moveCursor);
  loveHover.addEventListener("pointerleave", () => {
    loveCursor.classList.remove("is-on");
  });
}

function collapseMenuGroups() {
  document.querySelectorAll(".menu-group.is-open").forEach((group) => {
    group.classList.remove("is-open");
    group.querySelector("[data-menu-toggle]")?.setAttribute("aria-expanded", "false");
  });
}

function openMenu() {
  if (!menu) return;
  menu.classList.add("is-open");
  menu.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
  if (menuOpenBtn) menuOpenBtn.textContent = "Close";
  lenis.stop();
}

function closeMenu() {
  if (!menu?.classList.contains("is-open")) return;
  menu.classList.remove("is-open");
  menu.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
  if (menuOpenBtn) menuOpenBtn.textContent = "Menu";
  collapseMenuGroups();
  lenis.start();
}

function toggleMenu() {
  if (menu?.classList.contains("is-open")) closeMenu();
  else openMenu();
}

const pdp = document.getElementById("pdp");
const pdpImage = document.getElementById("pdp-image");
const pdpBadge = document.getElementById("pdp-badge");
const pdpBrand = document.getElementById("pdp-brand");
const pdpTitle = document.getElementById("pdp-title");
const pdpPrice = document.getElementById("pdp-price");
const pdpDesc = document.getElementById("pdp-desc");
const pdpSpecs = document.getElementById("pdp-specs");
const pdpMore = document.getElementById("pdp-more");

function renderPdp(product) {
  pdpImage.src = product.image;
  pdpImage.alt = `${product.brand} ${product.name}`;
  pdpBadge.hidden = !product.badge;
  pdpBrand.textContent = product.brand;
  pdpTitle.textContent = product.name;
  pdpPrice.textContent = product.price;
  pdpDesc.textContent = product.desc;
  pdpSpecs.innerHTML = product.specs
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
    .join("");

  pdpMore.innerHTML = Object.values(PRODUCTS)
    .filter((item) => item.id !== product.id)
    .slice(0, 2)
    .map(
      (item) => `
        <article class="product">
          <div class="product-media">
            <div class="product-photo">
              <img src="${item.image}" alt="${item.brand} ${item.name}" />
            </div>
            ${item.badge ? `<div class="star"><img src="${img("bf23c.svg")}" alt="" /></div>` : ""}
          </div>
          <div class="product-meta">
            <h3 class="product-name"><span>${item.brand}</span><span>${item.name}</span></h3>
            <p class="product-price">${item.price}</p>
          </div>
        </article>`
    )
    .join("");
  glueHanging(pdp);
}

function openPdp(id, writeHistory = true) {
  const product = PRODUCTS[id];
  if (!product || !pdp) return;
  closeMenu();
  renderPdp(product);
  pdp.classList.add("is-open");
  pdp.setAttribute("aria-hidden", "false");
  document.body.classList.add("pdp-open");
  pdp.scrollTop = 0;
  document.querySelector(".pdp-body")?.scrollTo(0, 0);
  document.querySelector(".pdp-side")?.scrollTo(0, 0);
  lenis.stop();
  const next = `#watch/${id}`;
  if (writeHistory && location.hash !== next) {
    history.pushState({ pdp: id }, "", next);
  }
}

function closePdp() {
  if (!pdp?.classList.contains("is-open")) return;
  pdp.classList.remove("is-open");
  pdp.setAttribute("aria-hidden", "true");
  document.body.classList.remove("pdp-open");
  lenis.start();
  if (location.hash.startsWith("#watch/")) {
    history.pushState({}, "", location.pathname);
  }
}

function productFromEvent(event) {
  const card = event.target.closest(".available [data-product]");
  return card?.dataset.product;
}

document.addEventListener("click", (event) => {
  if (event.target.closest(".is-inert")) {
    event.preventDefault();
    return;
  }

  if (event.target.closest(".nav-logo")) {
    event.preventDefault();
    closeMenu();
    closePdp();
    lenis.scrollTo(0);
    return;
  }

  if (event.target.closest("[data-menu-open]")) {
    event.preventDefault();
    toggleMenu();
    return;
  }

  const toggle = event.target.closest("[data-menu-toggle]");
  if (toggle) {
    event.preventDefault();
    const group = toggle.closest(".menu-group");
    const willOpen = !group?.classList.contains("is-open");
    collapseMenuGroups();
    if (willOpen && group) {
      group.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }
    return;
  }

  if (event.target.closest("[data-menu-close]")) {
    const href = event.target.closest("a")?.getAttribute("href") || "";
    closeMenu();
    if (href === "#" || href === "") {
      event.preventDefault();
      lenis.scrollTo(0);
    } else if (href.startsWith("#")) {
      event.preventDefault();
      lenis.scrollTo(href, { offset: -20 });
    }
    return;
  }

  if (event.target.closest("[data-pdp-close]")) {
    event.preventDefault();
    closePdp();
    return;
  }

  const id = productFromEvent(event);
  if (id) {
    event.preventDefault();
    openPdp(id);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (menu?.classList.contains("is-open")) closeMenu();
    else closePdp();
    return;
  }
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = document.activeElement?.closest?.(".available [data-product]");
  const id = card?.dataset?.product;
  if (!id) return;
  event.preventDefault();
  openPdp(id);
});

window.addEventListener("popstate", () => {
  const match = location.hash.match(/^#watch\/(.+)$/);
  if (match && PRODUCTS[match[1]]) {
    renderPdp(PRODUCTS[match[1]]);
    pdp.classList.add("is-open");
    pdp.setAttribute("aria-hidden", "false");
    document.body.classList.add("pdp-open");
  } else {
    pdp.classList.remove("is-open");
    pdp.setAttribute("aria-hidden", "true");
    document.body.classList.remove("pdp-open");
  }
});

function initMethodSlider() {
  const root = document.querySelector("[data-method-slider]");
  if (!root) return;
  const slides = [...root.querySelectorAll("img")];
  const prev = root.querySelector("[data-method-prev]");
  const next = root.querySelector("[data-method-next]");
  const dots = [...document.querySelectorAll("[data-method-dots] .method-dot")];
  if (slides.length < 2) return;
  let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (index < 0) index = 0;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  };

  prev?.addEventListener("click", () => show(index - 1));
  next?.addEventListener("click", () => show(index + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
}

initMethodSlider();

glueHanging();

if (!loader || !document.body.classList.contains("is-loading")) {
  startHeroBanner();
}

const initial = location.hash.match(/^#watch\/(.+)$/);
if (initial && PRODUCTS[initial[1]]) openPdp(initial[1], false);
