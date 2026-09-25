export function normalizeHtmlOutput(html: string): string {
  const document = new DOMParser().parseFromString(html, "text/html");

  for (const element of document.body.querySelectorAll("[class]")) {
    element.removeAttribute("class");
  }

  for (const element of document.body.querySelectorAll("[style]")) {
    const style = element.getAttribute("style");
    if (!style) continue;

    const declarations = style
      .split(";")
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .filter((declaration) => {
        const [property] = declaration.split(":");
        return property?.trim().toLowerCase() !== "white-space";
      });

    if (declarations.length === 0) {
      element.removeAttribute("style");
      continue;
    }

    element.setAttribute("style", `${declarations.join("; ")};`);
  }

  foldListWrapperItems(document.body);

  for (const span of document.body.querySelectorAll("span")) {
    if (span.attributes.length > 0 || !span.parentNode) continue;

    span.replaceWith(...span.childNodes);
  }

  return document.body.innerHTML;
}

/**
 * Lexical keeps a nested list in a list item of its own, right after the item
 * it belongs under — the shape its list commands and theme expect. In HTML
 * the nested list belongs inside that item, so each such wrapper is folded
 * into the item before it on the way out. Deepest first, so a wrapper inside
 * a wrapper lands in the right place.
 */
function foldListWrapperItems(root: HTMLElement): void {
  const items = [...root.querySelectorAll("li")].reverse();

  for (const item of items) {
    const elements = [...item.children];
    const [only] = elements;
    const isWrapper =
      elements.length === 1 &&
      (only?.tagName === "UL" || only?.tagName === "OL") &&
      (item.textContent ?? "").trim() === (only.textContent ?? "").trim();
    const previous = item.previousElementSibling;

    if (isWrapper && only && previous?.tagName === "LI") {
      previous.append(only);
      item.remove();
    }
  }
}
