import type {
  ElementTransformer,
  TextMatchTransformer,
} from "@lexical/markdown";
import { HEADING, QUOTE } from "@lexical/markdown";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { getStyleObjectFromCSS } from "@lexical/selection";
import {
  $getState,
  $isParagraphNode,
  $isTextNode,
  $setState,
  createState,
} from "lexical";

import {
  EDITOR_HIGHLIGHT_COLORS,
  EDITOR_TEXT_COLORS,
} from "../plugins/toolbar/editor-color-palette";

/*
 * Colors in Notion-flavored Markdown, read into what the editor already has:
 * https://developers.notion.com/guides/data-apis/enhanced-markdown
 *
 * - Text: `<span color="red">hot</span>` (a background is `red_bg`) becomes
 *   a text style, `<span underline="true">` the underline format.
 * - A block: `{color="red"}` at the end of a paragraph's, heading's or
 *   quote's first line becomes blockColorState, which BlockColorPlugin
 *   shows. A list item's stays text: Lexical writes a whole list at once,
 *   with no per-item hook to put it back — kept as text, it is at least kept.
 *
 * Writing back, a style is named by the Notion color it stands for, from
 * either toolbar's palette; a color Notion has no name for is left out, as
 * before. A span with markdown inside is left to NFM_RAW_INLINE (a chip).
 */

export const NOTION_COLOR_NAMES = [
  "gray",
  "brown",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
] as const;
type NotionColor = (typeof NOTION_COLOR_NAMES)[number];

// What a Notion color reads into: the floating toolbar's text colors (the
// same nine names), and for a background that hue at 25% alpha — like the
// fixed toolbar's highlights, readable on a light page and a dark one.
const TEXT_HEX: Record<NotionColor, string> = {
  gray: "#6B7280",
  brown: "#B45309",
  orange: "#EA580C",
  yellow: "#CA8A04",
  green: "#16A34A",
  blue: "#2563EB",
  purple: "#9333EA",
  pink: "#DB2777",
  red: "#DC2626",
};

const rgba = (hex: string, alpha: number) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

/** The CSS a Notion color name reads into, or undefined for a name it lacks. */
export function cssForNotionColor(
  name: string,
): { property: "color" | "background-color"; value: string } | undefined {
  const background = name.endsWith("_bg");
  const hue = (background ? name.slice(0, -3) : name) as NotionColor;
  if (!NOTION_COLOR_NAMES.includes(hue)) return undefined;
  return background
    ? { property: "background-color", value: rgba(TEXT_HEX[hue], 0.25) }
    : { property: "color", value: TEXT_HEX[hue] };
}

// The fixed toolbar's eleven hues, by the Notion name nearest each.
const TOOLBAR_HUES: Record<string, NotionColor> = {
  Gray: "gray",
  Red: "red",
  Orange: "orange",
  Amber: "brown",
  Yellow: "yellow",
  Green: "green",
  Teal: "green",
  Blue: "blue",
  Indigo: "blue",
  Violet: "purple",
  Pink: "pink",
};

// The floating toolbar's own light backgrounds.
const FLOATING_BACKGROUNDS: Record<string, NotionColor> = {
  "#f3f4f6": "gray",
  "#fef3c7": "brown",
  "#ffedd5": "orange",
  "#fef9c3": "yellow",
  "#dcfce7": "green",
  "#dbeafe": "blue",
  "#ede9fe": "purple",
  "#fce7f3": "pink",
  "#fee2e2": "red",
};

const normalize = (value: string) => value.toLowerCase().replaceAll(/\s+/g, "");

const TEXT_NAMES = new Map<string, NotionColor>([
  ...NOTION_COLOR_NAMES.map(
    (name) => [normalize(TEXT_HEX[name]), name] as const,
  ),
  ...EDITOR_TEXT_COLORS.map(
    ({ name, value }) => [normalize(value), TOOLBAR_HUES[name]!] as const,
  ),
]);

const BACKGROUND_NAMES = new Map<string, NotionColor>([
  ...NOTION_COLOR_NAMES.map(
    (name) => [normalize(rgba(TEXT_HEX[name], 0.25)), name] as const,
  ),
  ...EDITOR_HIGHLIGHT_COLORS.map(
    ({ name, value }) => [normalize(value), TOOLBAR_HUES[name]!] as const,
  ),
  ...Object.entries(FLOATING_BACKGROUNDS),
]);

/** The Notion color names a text style stands for: text first, then background. */
function notionColorsOf(style: string): string[] {
  const css = getStyleObjectFromCSS(style);
  const names: string[] = [];
  const text = css.color && TEXT_NAMES.get(normalize(css.color));
  if (text) names.push(text);
  const background =
    css["background-color"] &&
    BACKGROUND_NAMES.get(normalize(css["background-color"]));
  if (background) names.push(`${background}_bg`);
  return names;
}

const SPAN =
  /<span((?:\s+(?:color|underline)="[^"]*")+)>([^<>*_~`[\]$\\]+)<\/span>/;
const ATTRIBUTE = /([\w-]+)="([^"]*)"/g;

const spanAttributes = (source: string) =>
  Object.fromEntries([...source.matchAll(ATTRIBUTE)].map(([, k, v]) => [k, v]));

export const NFM_SPAN: TextMatchTransformer = {
  dependencies: [],
  export: (node, _exportChildren, exportFormat) => {
    if (!$isTextNode(node)) return null;
    const colors = notionColorsOf(node.getStyle());
    const underline = node.hasFormat("underline");
    if (colors.length === 0 && !underline) return null;

    let markup = exportFormat(node, node.getTextContent());
    // Notion has one color per span: a background goes in a span of its own.
    if (colors[1]) markup = `<span color="${colors[1]}">${markup}</span>`;
    const attributes = [
      colors[0] && `color="${colors[0]}"`,
      underline && `underline="true"`,
    ].filter(Boolean);
    return `<span ${attributes.join(" ")}>${markup}</span>`;
  },
  // A color it has no name for is not ours to read: leave it to the chip.
  getEndIndex: (node, match) => {
    const { color } = spanAttributes(match[1] ?? "");
    if (color !== undefined && !cssForNotionColor(color)) return false;
    return (match.index ?? 0) + match[0].length;
  },
  importRegExp: SPAN,
  regExp: new RegExp(`(?:${SPAN.source})$`),
  replace: (textNode, match) => {
    const { color, underline } = spanAttributes(match[1] ?? "");
    textNode.setTextContent(match[2] ?? "");
    const css = color ? cssForNotionColor(color) : undefined;
    if (css) textNode.setStyle(`${css.property}: ${css.value};`);
    if (underline === "true" && !textNode.hasFormat("underline")) {
      textNode.toggleFormat("underline");
    }
  },
  type: "text-match",
};

/** A paragraph's, heading's or quote's Notion color name (`red`, `blue_bg`); null for none. */
export const blockColorState = createState("blockColor", {
  parse: (value) =>
    typeof value === "string" && cssForNotionColor(value) ? value : null,
});

const BLOCK_COLOR_SUFFIX = / ?\{color="(\w+)"\}$/;

export const NFM_BLOCK_COLOR_IMPORT: TextMatchTransformer = {
  dependencies: [],
  export: () => null,
  // Only at the very end of a paragraph, heading or quote.
  getEndIndex: (node, match) => {
    const end = (match.index ?? 0) + match[0].length;
    const parent = node.getParent();
    const eligible =
      cssForNotionColor(match[1] ?? "") !== undefined &&
      end === node.getTextContentSize() &&
      node.getNextSibling() === null &&
      ($isParagraphNode(parent) ||
        $isHeadingNode(parent) ||
        $isQuoteNode(parent));
    return eligible ? end : false;
  },
  importRegExp: BLOCK_COLOR_SUFFIX,
  regExp: BLOCK_COLOR_SUFFIX,
  replace: (textNode, match) => {
    const parent = textNode.getParent();
    if (parent) $setState(parent, blockColorState, match[1] ?? null);
    textNode.remove();
  },
  type: "text-match",
};

/** Writes a colored paragraph, heading or quote with its `{color=…}`. */
export const NFM_BLOCK_COLOR_EXPORT: ElementTransformer = {
  dependencies: [],
  export: (node, traverseChildren) => {
    const color = $getState(node, blockColorState);
    if (!color) return null;
    const markdown = $isHeadingNode(node)
      ? HEADING.export(node, traverseChildren)
      : $isQuoteNode(node)
        ? QUOTE.export(node, traverseChildren)
        : $isParagraphNode(node)
          ? traverseChildren(node)
          : null;
    if (markdown === null) return null;
    const [first = "", ...rest] = markdown.split("\n");
    return [`${first} {color="${color}"}`, ...rest].join("\n");
  },
  // Import is NFM_BLOCK_COLOR_IMPORT's; this never matches a line.
  regExp: /(?!)/,
  replace: () => false,
  type: "element",
};
