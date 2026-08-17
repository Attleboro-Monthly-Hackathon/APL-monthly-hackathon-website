import { siteConfig } from "./config.js";
import { collections, itemHref, itemListMeta, loadCatalog } from "./content.js";
import { currentRoute } from "./router.js";

const NAV_ITEMS = [
  { href: "#/", label: "Home", match: (route) => route === "/" },
  { href: "#/calendar", label: "Calendar", match: (route) => route === "/calendar" },
  { href: "#/articles", label: "Articles", match: (route) => route.startsWith("/articles") },
  { href: "#/themes", label: "Themes", match: (route) => route.startsWith("/themes") },
  { href: "#/tutorials", label: "Tutorials", match: (route) => route.startsWith("/tutorials") },
];

function upgradeOnce(element) {
  if (element.dataset.upgraded === "true") return false;
  element.dataset.upgraded = "true";
  return true;
}

function navMarkup() {
  const route = currentRoute();
  return NAV_ITEMS.map((item) => {
    const current = item.match(route);
    return `<a href="${item.href}" ${current ? 'aria-current="page"' : ""}>${item.label}</a>`;
  }).join("");
}

class SiteHeader extends HTMLElement {
  connectedCallback() {
    if (!upgradeOnce(this)) return;
    this.classList.add("site-header");
    this.innerHTML = `
      <div class="site-header__inner">
        <a class="brand" href="#/">
          <span class="brand__mark">${siteConfig.shortName}</span>
          <span>Hackathon</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
          Menu
        </button>
        <nav class="site-nav" id="site-nav" aria-label="Primary">
          ${navMarkup()}
        </nav>
      </div>
    `;

    const toggle = this.querySelector(".nav-toggle");
    const nav = this.querySelector(".site-nav");
    toggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("spa:navigated", () => this.refresh());
  }

  refresh() {
    const nav = this.querySelector(".site-nav");
    const toggle = this.querySelector(".nav-toggle");
    if (nav) {
      nav.innerHTML = navMarkup();
      nav.classList.remove("is-open");
    }
    toggle?.setAttribute("aria-expanded", "false");
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    if (!upgradeOnce(this)) return;
    this.classList.add("site-footer");
    this.innerHTML = `
      <div class="site-footer__inner">
        <div class="site-footer__grid">
          <div>
            <h2>${siteConfig.name}</h2>
            <p>${siteConfig.library}<br>${siteConfig.location}<br>${siteConfig.address}</p>
          </div>
          <div>
            <h2>When</h2>
            <p>${siteConfig.schedule}</p>
          </div>
          <div>
            <h2>Explore</h2>
            <ul>
              <li><a href="#/articles">Articles</a></li>
              <li><a href="#/themes">Monthly themes</a></li>
              <li><a href="#/tutorials">Tutorials</a></li>
              <li><a href="#/calendar">Calendar</a></li>
            </ul>
          </div>
          <div>
            <h2>Contact</h2>
            <p><a href="${siteConfig.phoneHref}">${siteConfig.phone}</a><br />
            <a href="mailto:${siteConfig.contactEmail}">${siteConfig.contactEmail}</a><br />
            <a href="${siteConfig.website}">${siteConfig.websiteLabel}</a></p>
          </div>
        </div>
        <p class="site-footer__meta">A monthly makers’ meetup at the Attleboro Public Library.</p>
      </div>
    `;
  }
}

class SiteCalendar extends HTMLElement {
  connectedCallback() {
    if (!upgradeOnce(this)) return;
    this.innerHTML = `
      <div class="calendar-panel">
        <div class="calendar-panel__frame">
          <iframe
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="${siteConfig.name} calendar"
            src="${siteConfig.googleCalendarEmbedUrl}"
          ></iframe>
        </div>
        <p class="calendar-panel__note">
          Calendar embed is configured in <code>js/config.js</code>. Replace the
          placeholder URL with your library’s Google Calendar embed link.
        </p>
      </div>
    `;
  }
}

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
    const collection = collections[kind];
    this.classList.add("content-list");

    if (!collection) {
      this.innerHTML = `<p class="empty-state">Unknown content type.</p>`;
      return;
    }

    try {
      const catalog = await loadCatalog();
      const limit = Number(this.getAttribute("limit") || 0);
      let items = catalog[kind] || [];
      if (limit > 0) items = items.slice(0, limit);

      if (!items.length) {
        this.innerHTML = `<p class="empty-state">Content coming soon.</p>`;
        return;
      }

      this.innerHTML = items
        .map((item) => {
          const meta = itemListMeta(item, collection);
          const href = item.href || itemHref(kind, item.slug);
          return `
            <a class="content-item" href="${href}">
              <div>
                ${meta ? `<p class="content-item__meta">${meta}</p>` : ""}
                <h3 class="content-item__title">${item.title}</h3>
                <p class="content-item__summary">${item.summary}</p>
              </div>
              <span class="content-item__arrow" aria-hidden="true">→</span>
            </a>
          `;
        })
        .join("");
    } catch (error) {
      console.error(error);
      this.innerHTML = `<p class="empty-state">Unable to load content right now.</p>`;
    }
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
customElements.define("site-calendar", SiteCalendar);
customElements.define("content-list", ContentList);
