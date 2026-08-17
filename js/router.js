import { setMetaDescription, setPageTitle } from "./assets.js";
import { applyConfigText, bindConfig } from "./config.js";
import {
  collections,
  findItem,
  indexPages,
  itemEyebrow,
  loadCatalog,
  loadFragment,
} from "./content.js";

const HOME_DESCRIPTION =
  "A friendly monthly hackathon at the Attleboro Public Library. Build, learn, and meet your neighbors.";

let renderGeneration = 0;

export function currentRoute() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw || raw === "calendar") return raw === "calendar" ? "/calendar" : "/";
  return raw.startsWith("/") ? raw.replace(/\/$/, "") || "/" : `/${raw}`;
}

export function parseRoute(route = currentRoute()) {
  if (route === "/" || route === "") return { name: "home" };
  if (route === "/calendar") return { name: "home", scroll: "calendar" };

  const match = route.match(/^\/(articles|themes|tutorials)(?:\/([^/]+))?$/);
  if (!match) return { name: "not-found" };

  const kind = match[1];
  const slug = match[2] || null;
  return slug ? { name: "doc", kind, slug } : { name: "index", kind };
}

export function toHash(href) {
  if (!href) return null;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  if (href === "#main" || href.startsWith("#main?")) return null;

  if (href === "#calendar" || href === "/#calendar") return "#/calendar";
  if (href.startsWith("#/")) return href;
  if (href === "#" || href === "#/") return "#/";

  try {
    const url = new URL(href, window.location.origin);
    const path = url.pathname.replace(/\/index\.html$/, "/");
    if (url.origin !== window.location.origin) return null;

    if (path === "/" || path === "" || path.endsWith("/index.html")) {
      if (url.hash === "#calendar") return "#/calendar";
      if (url.hash.startsWith("#/")) return url.hash;
      return "#/";
    }

    const match = path.match(/\/(articles|themes|tutorials)(?:\/([^/]+?)(?:\.html)?)?\/?$/);
    if (match) {
      const slug = match[2] && match[2] !== "index" ? `/${match[2]}` : "";
      return `#/${match[1]}${slug}`;
    }
  } catch {
    return null;
  }

  return null;
}

export function navigate(hash, { replace = false } = {}) {
  const next = hash.startsWith("#") ? hash : `#${hash}`;
  if (replace) {
    history.replaceState(null, "", next);
  } else if (window.location.hash !== next) {
    window.location.hash = next;
    return;
  }
  renderRoute();
}

function mainEl() {
  return document.getElementById("main");
}

function renderHome(scrollId) {
  const template = document.getElementById("view-home");
  const main = mainEl();
  main.replaceChildren(template.content.cloneNode(true));
  setPageTitle(scrollId === "calendar" ? "Calendar" : null);
  setMetaDescription(HOME_DESCRIPTION);
  return scrollId;
}

function renderIndex(kind) {
  const copy = indexPages[kind];
  const main = mainEl();
  if (!copy) {
    renderNotFound();
    return;
  }
  setPageTitle(copy.title);
  setMetaDescription(copy.description);
  main.innerHTML = `
    <header class="page-hero wrap">
      <p class="section__eyebrow">${copy.eyebrow}</p>
      <h1>${copy.heading}</h1>
      <p>${copy.lead}</p>
    </header>
    <section class="section" style="padding-top: 0">
      <div class="wrap">
        <content-list kind="${copy.kind}"></content-list>
      </div>
    </section>
  `;
}

async function renderDoc(kind, slug) {
  const collection = collections[kind];
  const main = mainEl();
  if (!collection) {
    renderNotFound();
    return;
  }

  main.innerHTML = `<p class="empty-state wrap">Loading…</p>`;

  const catalog = await loadCatalog();
  const item = findItem(catalog, kind, slug);
  if (!item) {
    renderNotFound();
    return;
  }

  const body = await loadFragment(kind, slug);
  const title =
    collection.key === "themes" && item.theme ? `${item.title}` : item.title;
  setPageTitle(title);
  setMetaDescription(applyConfigText(item.summary));

  const eyebrow = itemEyebrow(item, collection);
  const lede = applyConfigText(item.lede || item.summary);
  const banner =
    item.bannerTitle || item.bannerText
      ? `
        <div class="theme-banner">
          ${item.theme ? `<p class="theme-banner__month">${item.theme}</p>` : ""}
          ${item.bannerTitle ? `<h2>${item.bannerTitle}</h2>` : ""}
          ${item.bannerText ? `<p>${item.bannerText}</p>` : ""}
        </div>
      `
      : "";

  const widthClass = collection.key === "articles" ? "wrap wrap--narrow" : "wrap";
  main.innerHTML = `
    <article class="${widthClass}">
      <header class="page-hero">
        ${eyebrow ? `<p class="section__eyebrow">${eyebrow}</p>` : ""}
        <h1>${item.title}</h1>
        ${lede ? `<p>${lede}</p>` : ""}
      </header>
      ${banner}
      <div class="prose">${body}</div>
      <p class="content-back"><a href="${collection.path}">← ${collection.backLabel}</a></p>
    </article>
  `;
}

function renderNotFound() {
  setPageTitle("Page not found");
  setMetaDescription("That page is not in the Attleboro Public Library Hackathon site.");
  mainEl().innerHTML = `
    <header class="page-hero wrap">
      <p class="section__eyebrow">404</p>
      <h1>We could not find that page</h1>
      <p>Try the home page, or browse articles, themes, and tutorials from the menu.</p>
    </header>
    <p class="wrap" style="padding-bottom: 4rem">
      <a class="btn btn--solid" href="#/">Back to home</a>
    </p>
  `;
}

export async function renderRoute() {
  const gen = ++renderGeneration;
  const parsed = parseRoute();
  const main = mainEl();
  if (!main) return;

  let scrollId = null;
  try {
    if (parsed.name === "home") {
      scrollId = renderHome(parsed.scroll);
    } else if (parsed.name === "index") {
      renderIndex(parsed.kind);
    } else if (parsed.name === "doc") {
      await renderDoc(parsed.kind, parsed.slug);
    } else {
      renderNotFound();
    }
  } catch (error) {
    console.error(error);
    if (gen !== renderGeneration) return;
    main.innerHTML = `<p class="empty-state wrap">Unable to load this page right now.</p>`;
  }

  if (gen !== renderGeneration) return;

  bindConfig(main);

  document.dispatchEvent(
    new CustomEvent("spa:navigated", { detail: { route: currentRoute(), parsed } })
  );

  if (scrollId) {
    document.getElementById(scrollId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
}

export function absorbLegacyPath() {
  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  const match = path.match(/\/(articles|themes|tutorials)(?:\/([^/]+?)(?:\.html)?)?\/?$/);
  if (!match) return false;
  const slug = match[2] && match[2] !== "index" ? `/${match[2]}` : "";
  window.location.replace(`${window.location.origin}/#/${match[1]}${slug}`);
  return true;
}

export function interceptNavigation() {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const link = event.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
    const hash = toHash(link.getAttribute("href"));
    if (!hash) return;
    event.preventDefault();
    navigate(hash);
  });

  window.addEventListener("hashchange", () => {
    renderRoute();
  });
}
