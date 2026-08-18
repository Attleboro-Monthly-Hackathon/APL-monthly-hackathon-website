import { getSite, interpolate } from "../config.js";
import { loadChrome } from "../content.js";
import { fillSlot, upgradeOnce } from "../dom.js";

class SiteFooter extends HTMLElement {
  async connectedCallback() {
    if (!upgradeOnce(this)) return;
    this.classList.add("site-footer");
    this.innerHTML = interpolate(await loadChrome("footer"));
    fillSlot(
      this,
      "explore",
      getSite()
        .chrome.explore.map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
        .join("")
    );
  }
}

customElements.define("site-footer", SiteFooter);
