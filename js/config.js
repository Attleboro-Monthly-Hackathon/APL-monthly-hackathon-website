/**
 * Load site identity and chrome copy from data/site.json.
 * HTML and catalog strings may use {location}, {meetupDay}, and other keys.
 */
export const siteConfig = {};

let siteData = null;
const PLACEHOLDER = /\{(\w+)\}/g;

function asText(value) {
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

function interpolateWith(text, bag) {
  return text.replace(PLACEHOLDER, (match, key) => asText(bag[key]) ?? match);
}

function collectStringBag(value, bag) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectStringBag(item, bag));
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (typeof nested === "string") bag[key] = nested;
    else collectStringBag(nested, bag);
  }
}

function walkInterpolate(value, bag) {
  if (typeof value === "string") return interpolateWith(value, bag);
  if (Array.isArray(value)) return value.map((item) => walkInterpolate(item, bag));
  if (value && typeof value === "object") {
    const next = {};
    for (const [key, nested] of Object.entries(value)) {
      next[key] = walkInterpolate(nested, bag);
    }
    return next;
  }
  return value;
}

function flattenStrings(source) {
  if (!source || typeof source !== "object") return;
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string") siteConfig[key] = value;
  }
}

export function getSite() {
  if (!siteData) throw new Error("Site data has not been loaded yet.");
  return siteData;
}

export function getCollections() {
  return getSite().collections;
}

export function getPage(name) {
  return getSite().pages?.[name] || null;
}

export function interpolate(text, extra = {}) {
  if (typeof text !== "string") return text;
  return interpolateWith(text, { ...siteConfig, ...extra });
}

export function applyConfigText(text) {
  return interpolate(text);
}

export function bindConfig(root) {
  if (!root?.querySelectorAll) return;
  root.querySelectorAll("[data-config]").forEach((el) => {
    const key = el.getAttribute("data-config");
    const value = asText(siteConfig[key]);
    if (value != null) el.textContent = value;
  });
}

export async function loadSite() {
  if (siteData) return siteData;

  const response = await fetch(new URL("../data/site.json", import.meta.url));
  if (!response.ok) {
    throw new Error(`Failed to load site data (${response.status})`);
  }

  const raw = await response.json();
  const bag = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") bag[key] = value;
  }
  collectStringBag(raw.chrome, bag);
  collectStringBag(raw.ui, bag);
  siteData = walkInterpolate(raw, bag);

  Object.keys(siteConfig).forEach((key) => {
    delete siteConfig[key];
  });
  Object.assign(siteConfig, siteData);
  flattenStrings(siteData.chrome);
  flattenStrings(siteData.ui);

  return siteData;
}
