import { getCollections, interpolate, siteConfig } from "../config.js";
import { itemHref, itemListMeta, loadCatalog, loadChrome } from "../content.js";
import { pruneOptional, upgradeOnce } from "../dom.js";

class ContentList extends HTMLElement {
  static get observedAttributes() {
    return ["kind", "limit"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  async render() {
    const kind = this.getAttribute("kind");
    const collection = getCollections()[kind];
    this.classList.add("content-list");

    if (!collection) {
      this.innerHTML = `<p class="empty-state">${siteConfig.emptyUnknown}</p>`;
      return;
    }

    try {
      const [catalog, itemTemplate] = await Promise.all([
        loadCatalog(),
        loadChrome("content-item"),
      ]);
      const limit = Number(this.getAttribute("limit") || 0);
      let items = catalog[kind] || [];
      if (limit > 0) items = items.slice(0, limit);

      if (!items.length) {
        this.innerHTML = `<p class="empty-state">${siteConfig.emptySoon}</p>`;
        return;
      }

      this.innerHTML = items
        .map((item) => {
          const html = interpolate(itemTemplate, {
            href: item.href || itemHref(kind, item.slug),
            meta: itemListMeta(item, collection),
            title: item.title,
            summary: item.summary,
          });
          const wrap = document.createElement("div");
          wrap.innerHTML = html;
          pruneOptional(wrap);
          return wrap.innerHTML;
        })
        .join("");
    } catch (error) {
      console.error(error);
      this.innerHTML = `<p class="empty-state">${siteConfig.emptyLoadFail}</p>`;
    }
  }
}

customElements.define("content-list", ContentList);
