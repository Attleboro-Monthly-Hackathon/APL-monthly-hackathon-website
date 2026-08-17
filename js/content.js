import { applyConfigText } from "./config.js";

export const collections = {
  articles: {
    key: "articles",
    label: "Articles",
    path: "#/articles",
    backLabel: "All articles",
    metaKey: "date",
  },
  themes: {
    key: "themes",
    label: "Themes",
    path: "#/themes",
    backLabel: "All workshop ideas",
    metaKey: "theme",
    eyebrow: "Workshop idea",
  },
  tutorials: {
    key: "tutorials",
    label: "Tutorials",
    path: "#/tutorials",
    backLabel: "All tutorials",
    metaKey: "level",
  },
};

export const indexPages = {
  articles: {
    kind: "articles",
    title: "Articles",
    eyebrow: "Articles",
    heading: "Notes from the library",
    lead: "Practical guides, welcome notes, and reflections from organizers and attendees. Want to contribute? Email the organizers with a draft.",
    description: "Articles from the Attleboro Public Library Hackathon community.",
  },
  themes: {
    kind: "themes",
    title: "Workshop ideas",
    eyebrow: "Themes",
    heading: "Future sessions",
    lead: "Each meetup can follow an optional workshop idea. Pick a light or heavy track, choose one project, and ignore the rest — your project, your pace.",
    description: "Workshop ideas for Attleboro Public Library Hackathon meetups.",
  },
  tutorials: {
    kind: "tutorials",
    title: "Tutorials",
    eyebrow: "Tutorials",
    heading: "Languages and tools",
    lead: "Curated starting points from the Hello-World repo: official docs, Learn X in Y Minutes, koans, and tutorials you can follow on library Wi‑Fi.",
    description: "Language and tool landing pages for the Attleboro Public Library Hackathon.",
  },
};

let catalogPromise;
const fragmentCache = new Map();

function interpolateItem(item) {
  const next = { ...item };
  for (const [key, value] of Object.entries(next)) {
    if (typeof value === "string") next[key] = applyConfigText(value);
  }
  return next;
}

export function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch(new URL("../data/content.json", import.meta.url)).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load content (${response.status})`);
      }
      return response.json();
    }).then((json) => {
      const catalog = {};
      for (const [kind, items] of Object.entries(json)) {
        catalog[kind] = Array.isArray(items) ? items.map(interpolateItem) : items;
      }
      return catalog;
    });
  }
  return catalogPromise;
}

export async function loadFragment(kind, slug) {
  const key = `${kind}/${slug}`;
  if (fragmentCache.has(key)) return fragmentCache.get(key);

  const response = await fetch(new URL(`../content/${kind}/${slug}.html`, import.meta.url));
  if (!response.ok) {
    throw new Error(`Failed to load ${key} (${response.status})`);
  }
  const html = applyConfigText(await response.text());
  fragmentCache.set(key, html);
  return html;
}

export function formatDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function itemHref(kind, slug) {
  return `#/${kind}/${slug}`;
}

export function itemListMeta(item, collection) {
  if (collection.metaKey === "date" && item.date) return formatDate(item.date);
  return item[collection.metaKey] || item.eyebrow || "";
}

export function itemEyebrow(item, collection) {
  if (collection.eyebrow) return collection.eyebrow;
  if (item.eyebrow) return item.eyebrow;
  return itemListMeta(item, collection);
}

export function findItem(catalog, kind, slug) {
  return (catalog[kind] || []).find((entry) => entry.slug === slug) || null;
}
