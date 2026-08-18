export function upgradeOnce(element) {
  if (element.dataset.upgraded === "true") return false;
  element.dataset.upgraded = "true";
  return true;
}

export function setHtml(element, html) {
  element.innerHTML = html;
  return element;
}

export function fillSlot(root, name, html) {
  const slot = root.querySelector(`[data-slot="${name}"]`);
  if (!slot) return null;
  if (html == null || html === "") {
    slot.remove();
    return null;
  }
  slot.innerHTML = html;
  return slot;
}

export function pruneOptional(root) {
  root.querySelectorAll("[data-optional]").forEach((el) => {
    if (!el.textContent.trim()) el.remove();
  });
}
