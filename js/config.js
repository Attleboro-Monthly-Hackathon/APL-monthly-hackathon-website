/**
 * Site configuration — Attleboro Public Library monthly hackathon.
 *
 * Location, meetup day, and schedule are the source of truth for copy
 * across the SPA. Use {location}, {meetupDay}, and {schedule} in catalog
 * strings, or data-config="…" in HTML.
 */
export const siteConfig = {
  name: "APL Hackathon",
  shortName: "APL",
  tagline: "Build something small. Learn something new. Meet your neighbors.",
  library: "Attleboro Public Library",
  location: "2nd Floor Tech Lab",
  address: "74 North Main Street, Attleboro, MA 02703",
  meetupDay: "Monday",
  schedule: "First Monday of each month, unless otherwise noted",
  phone: "508-222-0157",
  phoneHref: "tel:+15082220157",
  website: "https://attleborolibrary.org",
  websiteLabel: "attleborolibrary.org",
  contactEmail: "apl_ref@sailsinc.org",
  rsvpUrl: "#/calendar",
  /**
   * Replace with the library Google Calendar embed URL.
   * Google Calendar → Settings → Integrate calendar → Embed code → src URL
   */
  googleCalendarEmbedUrl:
    "https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FNew_York&mode=MONTH&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0",
};

const PLACEHOLDER = /\{(\w+)\}/g;

export function applyConfigText(text) {
  if (typeof text !== "string") return text;
  return text.replace(PLACEHOLDER, (match, key) =>
    Object.prototype.hasOwnProperty.call(siteConfig, key) ? siteConfig[key] : match
  );
}

export function bindConfig(root) {
  if (!root?.querySelectorAll) return;
  root.querySelectorAll("[data-config]").forEach((el) => {
    const key = el.getAttribute("data-config");
    if (key && key in siteConfig) el.textContent = siteConfig[key];
  });
}
