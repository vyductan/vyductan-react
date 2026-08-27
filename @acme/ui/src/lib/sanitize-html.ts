import DOMPurify from "dompurify";

/**
 * Content authored through `<Editor format="html">` is stored as markup and
 * rendered back as markup, which makes it untrusted: a stored payload runs in
 * every other reader's session.
 *
 * The parsing is DOMPurify's rather than ours on purpose. A hand-written
 * allowlist loses to mXSS and namespace confusion — `<svg><style>`, mutated
 * comments, nested foreign content — which is the reason that library exists.
 *
 * Sanitizing markup rather than going through `EditorRender` is deliberate:
 * that renderer only knows the node types it implements and silently drops the
 * rest, images included, while the saved HTML is what a CMS or mail client will
 * publish verbatim.
 *
 * This lives in @acme/ui because the allowlist is defined by what the editor
 * emits — editor/editor-sanitize-parity.test.tsx asserts the two agree by
 * exporting a full document and checking nothing is lost.
 */

/** Everything `<Editor format="html">` can emit, and nothing beyond it. */
const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "span",
  "div",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "sub",
  "sup",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
  // Lexical exports table column widths as a colgroup; without these the column
  // sizing is silently flattened on the way out.
  "colgroup",
  "col",
  "caption",
];

/**
 * `style` stays because the editor persists text color, highlight, and size
 * there. DOMPurify runs its own CSS parser across the attribute, so `url()` and
 * the other escape hatches do not survive it.
 *
 * `class` is deliberately absent: the editor strips classes on export, so any
 * class present came from pasted markup and would only fight the host's styles.
 */
const ALLOWED_ATTR = [
  "style",
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "colspan",
  "rowspan",
  "align",
  "dir",
  "title",
  "value",
  "start",
  "role",
  "aria-checked",
  "aria-label",
  "spellcheck",
  // Named individually rather than switching ALLOW_DATA_ATTR on: these two carry
  // a code block's language, so dropping them means a published snippet loses
  // its highlighting and reopening it loses the language selection.
  "data-language",
  "data-highlight-language",
];

/**
 * Callers have to decide whether a stored value is markup or plain text, because
 * plain text needs `whitespace-pre-line` to keep its newlines while markup must
 * not be shown verbatim.
 *
 * The tag list comes from ALLOWED_TAGS so the detector and the sanitizer cannot
 * drift: anything that would survive sanitizing is what counts as markup.
 *
 * `b`, `i`, `u`, and `s` are excluded from detection only. A note reading
 * "if a<b then c>d" parses as a `<b>` tag, and misreading prose as markup costs
 * the reader their line breaks. Those tags are still honored inside a value that
 * some other tag has already identified as markup.
 */
const AMBIGUOUS_SINGLE_LETTER_TAGS = new Set(["b", "i", "u", "s"]);

const MARKUP_PATTERN = new RegExp(
  `<(?:${ALLOWED_TAGS.filter(
    (tag) => !AMBIGUOUS_SINGLE_LETTER_TAGS.has(tag),
  ).join("|")})\\b[^>]*>`,
  "i",
);

export function containsRichTextMarkup(value: string): boolean {
  return MARKUP_PATTERN.test(value);
}

let isTargetHookRegistered = false;

function registerTargetHook() {
  if (isTargetHookRegistered) {
    return;
  }

  isTargetHookRegistered = true;

  // A link opening in a new tab hands the opener a window reference unless this
  // is set, so it is forced rather than trusted to be present in the content.
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.hasAttribute("target")) {
      node.setAttribute("rel", "noreferrer noopener");
    }
  });
}

export function sanitizeRichTextHtml(html: string): string {
  registerTargetHook();

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Email bodies need a wider allowlist than editor content: mail clients have no
 * modern layout, so real messages are built from nested tables with presentation
 * attributes — `bgcolor`, `cellpadding`, `valign`, `<font>`.
 *
 * Kept separate from the editor allowlist rather than widening it, because these
 * two differ in what they are protecting against. Editor content comes from a
 * colleague; an email body comes from whoever sent the mail.
 */
const ALLOWED_EMAIL_TAGS = [
  ...ALLOWED_TAGS,
  "center",
  "font",
  "small",
  "big",
  "strike",
  "dl",
  "dt",
  "dd",
  "address",
  "abbr",
];

/**
 * Two omissions worth stating, since both are common in real mail:
 *
 * - No `<style>` tag. A stylesheet from the sender is not scoped to the preview,
 *   so it would restyle the surrounding app, and `@import` inside it fetches from
 *   the sender's server.
 * - No `background` attribute. It takes a URL, and it is not one of the
 *   attributes DOMPurify treats as a URI, so it would skip the scheme check.
 */
const ALLOWED_EMAIL_ATTR = [
  ...ALLOWED_ATTR,
  "bgcolor",
  "cellpadding",
  "cellspacing",
  "border",
  "valign",
  "size",
  "face",
  "color",
  "nowrap",
  "hspace",
  "vspace",
  "lang",
];

export function sanitizeEmailHtml(html: string): string {
  registerTargetHook();

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ALLOWED_EMAIL_TAGS,
    ALLOWED_ATTR: ALLOWED_EMAIL_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
