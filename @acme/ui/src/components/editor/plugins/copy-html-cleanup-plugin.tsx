import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

/**
 * Puts plain semantic HTML on the clipboard for a copy or cut, the kind a
 * rendered markdown page has.
 *
 * The editor exports every run of text as a `white-space: pre-wrap` span,
 * inline code as a span inside `<code>`, and the theme's classes on
 * everything. Pasted into Notion, that made a code block of each inline
 * code — Notion takes `white-space: pre` for code — and the text between
 * them was lost. Other apps only get class soup.
 *
 * Only the clipboard's `text/html` changes, once the editor (or the block
 * copy) has written it; the editor's own copy, its nodes as JSON, is left
 * alone, so pasting back into the editor is unchanged.
 */
export function CopyHtmlCleanupPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // On the document, bubbling: after the editor's own listener on its root
    // has written the clipboard.
    const onCopy = (event: ClipboardEvent) => {
      const root = editor.getRootElement();
      if (
        !root ||
        !(event.target instanceof Node) ||
        !root.contains(event.target)
      )
        return;
      const html = event.clipboardData?.getData("text/html");
      if (!html) return;
      event.clipboardData?.setData("text/html", cleanCopiedHtml(html));
    };
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
    };
  }, [editor]);

  return null;
}

const BLOCK_TAGS = new Set([
  "ADDRESS",
  "BLOCKQUOTE",
  "DIV",
  "DL",
  "FIGURE",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HR",
  "OL",
  "P",
  "PRE",
  "TABLE",
  "UL",
]);

/** The copied HTML, without what only made sense inside the editor. */
export function cleanCopiedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const { body } = doc;

  for (const element of body.querySelectorAll<HTMLElement>("*")) {
    element.removeAttribute("class");
    const style = element.getAttribute("style");
    if (style !== null) {
      element.style.removeProperty("white-space");
      if (element.style.length === 0) element.removeAttribute("style");
    }
  }

  // Spaces pre-wrap kept; without it they collapse. Not in code blocks,
  // where <pre> keeps them.
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  for (const text of texts) {
    if (text.parentElement?.closest("pre")) continue;
    text.data = keepSpaces(text);
  }

  // Inline code: the bare text in <code>, not the theme's span.
  for (const code of body.querySelectorAll("code")) {
    if (code.closest("pre")) continue;
    code.removeAttribute("spellcheck");
    for (const span of [...code.querySelectorAll("span")]) {
      if (span.attributes.length === 0) span.replaceWith(...span.childNodes);
    }
  }

  // Bold once: <b><strong>…</strong></b> is how bold text exports.
  for (const bold of [...body.querySelectorAll("b")]) {
    const [only] = bold.childNodes;
    if (bold.childNodes.length === 1 && only instanceof HTMLElement) {
      if (only.tagName === "STRONG") bold.replaceWith(only);
    }
  }

  // Plain spans are nothing but runs of text.
  for (const span of [...body.querySelectorAll("span")]) {
    if (span.attributes.length === 0 && !span.closest("pre"))
      span.replaceWith(...span.childNodes);
  }
  body.normalize();

  // A quote's text in a paragraph, as markdown renders it.
  for (const quote of body.querySelectorAll("blockquote")) {
    const inline = [...quote.childNodes].every(
      (child) =>
        !(child instanceof HTMLElement && BLOCK_TAGS.has(child.tagName)),
    );
    if (inline && quote.childNodes.length > 0) {
      const paragraph = doc.createElement("p");
      paragraph.append(...quote.childNodes);
      quote.append(paragraph);
    }
  }

  return body.innerHTML;
}

/**
 * The text with the spaces that would collapse made non-breaking: every
 * other one in a run, and one at either edge of a line.
 */
function keepSpaces(text: Text): string {
  const isLineEdge = (beside: Node | null) =>
    beside === null ||
    (beside instanceof HTMLElement && beside.tagName === "BR");
  const atStart = isLineEdge(previousInLine(text));
  const atEnd = isLineEdge(nextInLine(text));

  let data = text.data.replaceAll(/ {2,}/g, (run) =>
    Array.from(run, (_, index) => (index % 2 === 0 ? " " : " ")).join(""),
  );
  if (atStart) data = data.replace(/^ /, " ");
  if (atEnd) data = data.replace(/ $/, " ");
  return data;
}

const isBlock = (element: HTMLElement) =>
  BLOCK_TAGS.has(element.tagName) ||
  element.tagName === "LI" ||
  element.tagName === "TD" ||
  element.tagName === "TH" ||
  element.tagName === "BODY";

/** What comes before `node` on its line: a sibling here or up to its block. */
function previousInLine(node: Node): Node | null {
  let current: Node | null = node;
  while (current) {
    if (current.previousSibling) return current.previousSibling;
    const parent: Node | null = current.parentNode;
    if (!parent || (parent instanceof HTMLElement && isBlock(parent)))
      return null;
    current = parent;
  }
  return null;
}

function nextInLine(node: Node): Node | null {
  let current: Node | null = node;
  while (current) {
    if (current.nextSibling) return current.nextSibling;
    const parent: Node | null = current.parentNode;
    if (!parent || (parent instanceof HTMLElement && isBlock(parent)))
      return null;
    current = parent;
  }
  return null;
}
