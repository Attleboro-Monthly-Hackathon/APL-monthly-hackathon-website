import "./components.js";
import { absorbLegacyPath, interceptNavigation, renderRoute } from "./router.js";

function observeReveals() {
  const nodes = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!nodes.length) return;

  if (!("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
}

document.addEventListener("spa:navigated", observeReveals);

if (!absorbLegacyPath()) {
  interceptNavigation();
  renderRoute();
}
