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
    backLabel: "All themes",
    metaKey: "month",
    eyebrow: "Monthly theme",
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
    title: "Themes",
    eyebrow: "Themes",
    heading: "Monthly inspiration",
    lead: "Each month we share an optional theme. Use it as a spark, remix it, or ignore it entirely — your project, your pace.",
    description: "Monthly theme pages for the Attleboro Public Library Hackathon.",
  },
  tutorials: {
    kind: "tutorials",
    title: "Tutorials",
    eyebrow: "Tutorials",
    heading: "Learn at your own pace",
    lead: "Short, friendly walkthroughs you can follow on library Wi‑Fi before or during a meetup. No special tools required beyond a browser and a text editor.",
    description: "Tutorials for Attleboro Public Library Hackathon beginners and beyond.",
  },
};

let catalogPromise;
const fragmentCache = new Map();

export function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch(new URL("../data/content.json", import.meta.url)).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load content (${response.status})`);
      }
      return response.json();
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
  const html = await response.text();
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
