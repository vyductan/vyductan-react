import {
  EDITOR_HIGHLIGHT_COLORS,
  EDITOR_TEXT_COLORS,
} from "../plugins/toolbar/editor-color-palette";

/**
 * One document that exercises every block and inline feature the editor can
 * produce and `EditorRender` can publish. It exists so the three renderers —
 * Lexical while editing, Lexical read-only, and the serialized-document
 * renderer — can be compared on identical content in one screen.
 *
 * Node shapes mirror render-fixtures.ts, and kitchen-sink-document.test.ts
 * asserts `normalizeEditorContent` accepts the result, so a wrong shape fails a
 * test rather than silently rendering as an empty document.
 */

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 1 << 1;
const FORMAT_STRIKETHROUGH = 1 << 2;
const FORMAT_UNDERLINE = 1 << 3;
const FORMAT_CODE = 1 << 4;
const FORMAT_SUBSCRIPT = 1 << 5;
const FORMAT_SUPERSCRIPT = 1 << 6;

const text = (value: string, format = 0, style = "") => ({
  detail: 0,
  format,
  mode: "normal",
  style,
  text: value,
  type: "text" as const,
  version: 1,
});

const linebreak = () => ({ type: "linebreak" as const, version: 1 });

const block = <T extends string>(type: T) => ({
  type,
  direction: "ltr" as const,
  format: "" as const,
  indent: 0,
  version: 1,
});

const paragraph = (...children: unknown[]) => ({
  ...block("paragraph"),
  children,
});

const heading = (tag: "h1" | "h2" | "h3", content: string) => ({
  ...block("heading"),
  tag,
  children: [text(content)],
});

const quote = (content: string) => ({
  ...block("quote"),
  children: [text(content)],
});

const link = (url: string, content: string) => ({
  ...block("link"),
  url,
  rel: null,
  target: null,
  title: null,
  children: [text(content)],
});

const autolink = (url: string) => ({
  ...block("autolink"),
  url,
  rel: null,
  target: null,
  title: null,
  children: [text(url)],
});

const listItem = (
  children: unknown[],
  options?: { checked?: boolean; value?: number },
) => ({
  ...block("listitem"),
  value: options?.value ?? 1,
  checked: options?.checked,
  children,
});

const list = (
  listType: "bullet" | "number" | "check",
  tag: "ul" | "ol",
  items: unknown[],
) => ({
  ...block("list"),
  listType,
  start: 1,
  tag,
  children: items,
});

const checkBlock = (checked: boolean, content: string) => ({
  ...block("check-block"),
  checked,
  children: [text(content)],
});

const codeHighlight = (value: string, highlightType: string | null) => ({
  detail: 0,
  format: 0,
  highlightType,
  mode: "normal",
  style: "",
  text: value,
  type: "code-highlight" as const,
  version: 1,
});

const codeBlock = (language: string, ...children: unknown[]) => ({
  ...block("code"),
  language,
  children,
});

const horizontalRule = () => ({ type: "horizontalrule" as const, version: 1 });

const tableCell = (content: string, headerState = 0) => ({
  ...block("tablecell"),
  backgroundColor: null,
  colSpan: 1,
  rowSpan: 1,
  headerState,
  children: [paragraph(text(content))],
});

const tableRow = (...children: unknown[]) => ({
  ...block("tablerow"),
  children,
});

const table = (...children: unknown[]) => ({
  ...block("table"),
  colWidths: null,
  rowStriping: false,
  children,
});

const RED = EDITOR_TEXT_COLORS.find((swatch) => swatch.name === "Red")?.value;
const BLUE = EDITOR_TEXT_COLORS.find((swatch) => swatch.name === "Blue")?.value;
const AMBER_HIGHLIGHT = EDITOR_HIGHLIGHT_COLORS.find(
  (swatch) => swatch.name === "Amber",
)?.value;

export const kitchenSinkContent = {
  root: {
    type: "root" as const,
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    version: 1,
    children: [
      heading("h1", "Editor kitchen sink"),
      paragraph(
        text(
          "Every block and inline mark the editor can produce, in one document. Edit above and watch the published view follow.",
        ),
      ),

      heading("h2", "Inline marks"),
      paragraph(
        text("Bold", FORMAT_BOLD),
        text(", "),
        text("italic", FORMAT_ITALIC),
        text(", "),
        text("underline", FORMAT_UNDERLINE),
        text(", "),
        text("strikethrough", FORMAT_STRIKETHROUGH),
        text(", "),
        text("inline code", FORMAT_CODE),
        text(", H"),
        text("2", FORMAT_SUBSCRIPT),
        text("O and x"),
        text("2", FORMAT_SUPERSCRIPT),
        text("."),
      ),

      heading("h2", "Color, highlight, and size"),
      paragraph(
        text("Palette red", 0, `color: ${RED}`),
        text(", "),
        text("palette blue", 0, `color: ${BLUE}`),
        text(", "),
        text("amber highlight", 0, `background-color: ${AMBER_HIGHLIGHT}`),
        text(", "),
        text("20px text", 0, "font-size: 20px"),
        text(", "),
        text("bold and colored", FORMAT_BOLD, `color: ${RED}`),
        text("."),
      ),
      paragraph(
        text(
          "Highlights are the hue at 25% alpha, so they read the same on a light or a dark page.",
        ),
      ),

      heading("h2", "Links"),
      paragraph(
        text("A "),
        link("https://example.com", "titled link"),
        text(" and a bare one: "),
        autolink("https://example.com/autolink"),
      ),

      heading("h2", "Lists"),
      heading("h3", "Bulleted, with nesting"),
      list("bullet", "ul", [
        listItem([paragraph(text("First bullet"))]),
        listItem([
          paragraph(text("Second bullet")),
          list("bullet", "ul", [
            listItem([paragraph(text("Nested bullet"))], { value: 1 }),
          ]),
        ]),
      ]),
      heading("h3", "Numbered"),
      list("number", "ol", [
        listItem([paragraph(text("First step"))], { value: 1 }),
        listItem([paragraph(text("Second step"))], { value: 2 }),
      ]),
      heading("h3", "Checklist"),
      list("check", "ul", [
        listItem([paragraph(text("Done item"))], { checked: true, value: 1 }),
        listItem([paragraph(text("Pending item"))], {
          checked: false,
          value: 2,
        }),
      ]),

      heading("h2", "Check blocks"),
      checkBlock(true, "A finished check block"),
      checkBlock(false, "An unfinished check block"),

      heading("h2", "Quote"),
      quote("A quote keeps its own left rule and italic treatment."),

      heading("h2", "Code block"),
      codeBlock(
        "typescript",
        codeHighlight("const", "keyword"),
        codeHighlight(" answer", null),
        codeHighlight(" =", "operator"),
        codeHighlight(" 42", "number"),
        codeHighlight(";", "punctuation"),
      ),

      heading("h2", "Table"),
      table(
        tableRow(tableCell("Feature", 1), tableCell("Published", 1)),
        tableRow(tableCell("Inline color"), tableCell("Yes")),
        tableRow(tableCell("Images"), tableCell("Editor only")),
      ),

      horizontalRule(),

      paragraph(
        text("A soft line break splits this line"),
        linebreak(),
        text("without starting a new paragraph."),
      ),
    ],
  },
};

export const kitchenSinkValue = JSON.stringify(kitchenSinkContent);
