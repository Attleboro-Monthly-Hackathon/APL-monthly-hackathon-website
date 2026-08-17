import { siteConfig } from "./config.js";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,480..700&family=Manrope:wght@400;560;650;700&display=swap";

function ensureMeta(selector, create) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.append(el);
  }
  return el;
}

export function ensureAssets() {
  if (!document.head.querySelector("meta[charset]")) {
    const charset = document.createElement("meta");
    charset.setAttribute("charset", "UTF-8");
    document.head.prepend(charset);
  }

  ensureMeta('meta[name="viewport"]', () => {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1.0";
    return meta;
  });

  if (!document.head.querySelector('link[rel="stylesheet"][href*="styles.css"]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = new URL("../css/styles.css", import.meta.url).href;
    document.head.append(stylesheet);
  }

  if (!document.head.querySelector('link[href*="fonts.googleapis.com"]')) {
    const preconnectGoogle = document.createElement("link");
    preconnectGoogle.rel = "preconnect";
    preconnectGoogle.href = "https://fonts.googleapis.com";

    const preconnectGstatic = document.createElement("link");
    preconnectGstatic.rel = "preconnect";
    preconnectGstatic.href = "https://fonts.gstatic.com";
    preconnectGstatic.crossOrigin = "";

    const fonts = document.createElement("link");
    fonts.rel = "stylesheet";
    fonts.href = FONT_HREF;

    document.head.append(preconnectGoogle, preconnectGstatic, fonts);
  }
}

export function setPageTitle(pageTitle) {
  document.title = pageTitle ? `${pageTitle} · ${siteConfig.name}` : siteConfig.name;
}

export function setMetaDescription(text) {
  if (!text) return;
  const meta = ensureMeta('meta[name="description"]', () => {
    const el = document.createElement("meta");
    el.name = "description";
    return el;
  });
  meta.content = text;
}
