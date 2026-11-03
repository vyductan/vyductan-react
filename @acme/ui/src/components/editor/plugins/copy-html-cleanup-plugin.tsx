import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isTableCellNode } from "@lexical/table";
import { $findMatchingParent } from "@lexical/utils";
import { $getSelection, $isRangeSelection } from "lexical";

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
    // On the window, bubbling: after whatever filled the clipboard — the
    // editor's listener on its root, or @lexical/table's on the document.
    // Cells selected, the page has no selection of its own and a copy (VS
    // Code's, for one) is aimed at <body>; the table fills it from the
    // document. Taken only when aimed inside the editor, that HTML went out
    // as it was. So the focus being in the editor counts too.
    const onCopy = (event: ClipboardEvent) => {
      const root = editor.getRootElement();
      if (!root) return;
      const aimedHere =
        event.target instanceof Node && root.contains(event.target);
      if (!aimedHere && !root.contains(document.activeElement)) return;
      const html = event.clipboardData?.getData("text/html");
      if (!html) return;
      const fromCell = editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;
        const cell = $findMatchingParent(
          selection.anchor.getNode(),
          $isTableCellNode,
        );
        return cell !== null && cell.isParentOf(selection.focus.getNode());
      });
      const cleaned = cleanCopiedHtml(html, { fromCell });
      event.clipboardData?.setData("text/html", cleaned);
      // Pasted into a Notion cell, the plain text is what Notion takes.
      if (fromCell) {
        event.clipboardData?.setData("text/plain", cellPlainText(cleaned));
        event.clipboardData?.setData(
          "text/_notion-text-production",
          notionCellText(cleaned),
        );
      }
    };
    window.addEventListener("copy", onCopy);
    window.addEventListener("cut", onCopy);
    return () => {
      window.removeEventListener("copy", onCopy);
      window.removeEventListener("cut", onCopy);
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

// Classes a node is read back by (importDOM): without them a to-do copied
// by its line pasted back as plain text, its checkbox gone.
const READ_BACK_CLASSES = new Set(["check-block", "check-block-checked"]);

/**
 * The copied HTML, without what only made sense inside the editor.
 * `fromCell`: the copy was made inside one table cell (Cmd+A there), its
 * content with no table around it — its lists go out as a cell's are.
 */
export function cleanCopiedHtml(
  html: string,
  { fromCell = false }: { fromCell?: boolean } = {},
): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const { body } = doc;

  for (const element of body.querySelectorAll<HTMLElement>("*")) {
    const kept = [...element.classList].filter((name) =>
      READ_BACK_CLASSES.has(name),
    );
    if (kept.length > 0) element.className = kept.join(" ");
    else element.removeAttribute("class");
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

  foldNestedLists(doc);
  toTaskLists(doc);
  cellListsAsLines(doc, fromCell);

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
 * Nested lists inside their parent item, as HTML nests them. Lexical keeps a
 * nested list in an item of its own after its parent (bullets under a
 * numbered item: in a list of their own after it); Notion took that item
 * for an empty one, and each nested list came in under an extra empty item,
 * a level off. One with no item before it (a list under a to-do) stays.
 */
function foldNestedLists(doc: Document) {
  const isList = (node: Node) =>
    node instanceof Element && (node.tagName === "UL" || node.tagName === "OL");
  for (const holder of doc.body.querySelectorAll("li")) {
    const children = [...holder.childNodes].filter(
      (child) => !(child.nodeType === 3 && child.textContent?.trim() === ""),
    );
    if (children.length === 0 || !children.every(isList)) continue;
    const parent = itemBefore(holder);
    if (!parent) continue;
    const list = holder.parentElement;
    parent.append(...children);
    holder.remove();
    if (list && list.children.length === 0) list.remove();
  }
}

/**
 * The item a holder's list belongs under: the item before it, or — when it
 * opens its list, as bullets under a numbered item do (a list of their own,
 * of another kind) — the last item of the list just before. None for a list
 * under a to-do or a paragraph.
 */
function itemBefore(holder: Element): Element | null {
  const before = holder.previousElementSibling;
  if (before) return before.tagName === "LI" ? before : null;
  const list = holder.parentElement;
  const listBefore = list?.previousElementSibling;
  if (!listBefore || !/^(UL|OL)$/.test(listBefore.tagName)) return null;
  const last = listBefore.lastElementChild;
  return last?.tagName === "LI" ? last : null;
}

/**
 * To-dos as task list items — `<ul><li><input type="checkbox">` — the form
 * Notion and GitHub read as to-dos; the editor's own `<div class="check-block">`
 * pasted into Notion as plain text. One after another, they share a list. The
 * class stays: the editor reads its to-dos back by it.
 */
function toTaskLists(doc: Document) {
  for (const todo of [...doc.body.querySelectorAll("div.check-block")]) {
    const item = doc.createElement("li");
    for (const { name, value } of todo.attributes) {
      item.setAttribute(name, value);
    }
    const box = doc.createElement("input");
    box.type = "checkbox";
    if (todo.classList.contains("check-block-checked")) {
      box.setAttribute("checked", "");
    }
    item.append(box, ...todo.childNodes);

    const before = todo.previousElementSibling;
    if (before?.tagName === "UL" && before.hasAttribute("data-task-list")) {
      before.append(item);
      todo.remove();
    } else {
      const list = doc.createElement("ul");
      list.dataset.taskList = "true";
      list.append(item);
      todo.replaceWith(list);
    }
  }
  for (const list of doc.body.querySelectorAll("ul[data-task-list]")) {
    list.removeAttribute("data-task-list");
  }
}

/**
 * The plain text of a copy from a table cell, as a Notion cell takes it —
 * pasted into one, Notion reads the plain text, not the HTML: a line per
 * block and line break, its lists as cleanCopiedHtml wrote them. Notion
 * trims every pasted line's opening spaces; a zero-width space ahead keeps
 * a list line's indent, and Notion drops it.
 */
export function cellPlainText(cleanHtml: string): string {
  const { body } = new DOMParser().parseFromString(cleanHtml, "text/html");
  for (const lineBreak of body.querySelectorAll("br")) {
    lineBreak.replaceWith("\n");
  }
  return [...body.childNodes]
    .map((node) => (node.textContent ?? "").replaceAll("\u200b", ""))
    .join("\n")
    .split("\n")
    .map((line) => (/^\s/.test(line) ? `\u200b${line}` : line))
    .join("\n");
}

/** Notion's rich-text marks, by the element that carries them. */
const NOTION_MARKS: Record<string, (element: Element) => string[]> = {
  STRONG: () => ["b"],
  B: () => ["b"],
  EM: () => ["i"],
  I: () => ["i"],
  S: () => ["s"],
  DEL: () => ["s"],
  U: () => ["_"],
  CODE: () => ["c"],
  A: (element) => ["a", element.getAttribute("href") ?? ""],
};

/**
 * A copy from a table cell as Notion copies a cell's text itself, its
 * `text/_notion-text-production`: the rich text — runs of text with their
 * marks — and how much of it is meant. Pasted into a Notion cell, HTML with
 * any formatting in it had its lines joined by spaces; this, Notion pastes
 * line for line, formatting kept.
 */
export function notionCellText(cleanHtml: string): string {
  const { body } = new DOMParser().parseFromString(cleanHtml, "text/html");
  const runs: [string, string[][]][] = [];
  const add = (text: string, marks: string[][]) => {
    if (!text) return;
    const last = runs.at(-1);
    if (last && JSON.stringify(last[1]) === JSON.stringify(marks)) {
      last[0] += text;
    } else {
      runs.push([text, marks]);
    }
  };
  const walk = (node: Node, marks: string[][]) => {
    if (node.nodeType === Node.TEXT_NODE) {
      add((node.textContent ?? "").replaceAll("\u200b", ""), marks);
      return;
    }
    if (!(node instanceof Element)) return;
    if (node.tagName === "BR") {
      add("\n", marks);
      return;
    }
    const mark = NOTION_MARKS[node.tagName]?.(node);
    // Italic exports as <i><em>: one mark, not two.
    const inner =
      mark && !marks.some((other) => other[0] === mark[0])
        ? [...marks, mark]
        : marks;
    for (const child of node.childNodes) walk(child, inner);
  };
  for (const [index, block] of [...body.childNodes].entries()) {
    if (index > 0) add("\n", []);
    walk(block, []);
  }
  const text = runs.map(([run]) => run).join("");
  return JSON.stringify({
    editing: runs.map(([run, marks]) =>
      marks.length > 0 ? [run, marks] : [run],
    ),
    selection: { startIndex: 0, endIndex: text.length },
    action: "copy",
  });
}

/** A cell's list levels, as Notion marks them. */
const CELL_BULLETS = ["•", "◦", "▪"];

/**
 * Lists in table cells as Notion keeps them there: no list blocks — a
 * Notion cell holds text only — but lines of it, two spaces and "• " for an
 * item, four spaces more and "◦ " a level deeper, which Notion lays out as
 * a list. A <ul> in a cell pasted as "• a" with no indent, plain text. The
 * spaces stay plain: Notion reads them as the indent, `&nbsp;` it does not.
 */
function cellListsAsLines(doc: Document, fromCell: boolean) {
  const isList = (node: Element) =>
    node.tagName === "UL" || node.tagName === "OL";
  const lines = (list: Element, depth: number): HTMLElement[] => {
    const out: HTMLElement[] = [];
    let number = Number(list.getAttribute("start") ?? 1);
    for (const item of list.children) {
      if (item.tagName !== "LI") continue;
      const nested = [...item.children].filter(isList);
      const marker =
        list.tagName === "OL"
          ? `${number++}. `
          : `${CELL_BULLETS[depth % CELL_BULLETS.length]} `;
      const line = doc.createElement("p");
      line.append(
        `${" ".repeat(2 + 4 * depth)}${marker}`,
        ...[...item.childNodes].filter(
          (child) =>
            !(child instanceof Element) ||
            !(isList(child) || child.tagName === "INPUT"),
        ),
      );
      out.push(line);
      for (const list of nested) out.push(...lines(list, depth + 1));
    }
    return out;
  };
  for (const list of [
    ...doc.body.querySelectorAll(
      fromCell
        ? ":is(body, td, th) > :is(ul, ol)"
        : ":is(td, th) > :is(ul, ol)",
    ),
  ]) {
    const items = lines(list, 0);
    // Notion trims the spaces opening a pasted cell, `&nbsp;` too: a cell
    // that opened with a list lost its first item's indent. A zero-width
    // space ahead keeps them, and Notion drops it.
    if (!list.previousElementSibling) items[0]?.prepend("\u200b");
    list.replaceWith(...items);
  }
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
