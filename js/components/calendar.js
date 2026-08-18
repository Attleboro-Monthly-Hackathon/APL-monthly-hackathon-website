import { interpolate } from "../config.js";
import { loadChrome } from "../content.js";
import { upgradeOnce } from "../dom.js";

class SiteCalendar extends HTMLElement {
  async connectedCallback() {
    if (!upgradeOnce(this)) return;
    this.innerHTML = interpolate(await loadChrome("calendar"));
  }
}

customElements.define("site-calendar", SiteCalendar);
