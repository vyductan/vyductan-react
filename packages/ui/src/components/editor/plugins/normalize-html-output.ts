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

  for (const span of document.body.querySelectorAll("span")) {
    if (span.attributes.length > 0 || !span.parentNode) continue;

    span.replaceWith(...span.childNodes);
  }

  return document.body.innerHTML;
}
