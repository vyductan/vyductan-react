import type { CSSProperties } from "react";

/**
 * Lexical keeps text-level styling as a raw CSS declaration string: the
 * font-size / font-color / font-background toolbar plugins call
 * `$patchStyleText`, which writes `color: #eb5757; font-size: 20px` onto the
 * text node and serializes it into the saved document.
 *
 * `EditorRender` has to turn that string back into React style props, so the
 * string is untrusted input that arrives from storage. Only declarations
 * matched below survive; everything else is dropped instead of passed through,
 * which keeps arbitrary CSS out of the published view.
 *
 * Values are kept verbatim rather than mapped onto design tokens so the same
 * document renders identically in apps that do not share our theme variables.
 */

const COLOR_HEX_PATTERN = /^#[\da-f]{3,8}$/i;
const COLOR_KEYWORD_PATTERN = /^[a-z]+$/i;
/** Single-level functional colors only — `rgb(0 0 0 / 50%)`, `oklch(65% .19 256)`. */
const COLOR_FUNCTION_PATTERN = /^[a-z]+\([\d\s%,./+-]*\)$/i;
const FONT_SIZE_PATTERN = /^\d+(?:\.\d+)?(?:px|rem|em|pt|%)$/i;
/** Font stacks reach us quoted and comma separated: `"Segoe UI", -apple-system`. */
const FONT_FAMILY_PATTERN = /^[\w\s"',-]+$/;

function isColorValue(value: string): boolean {
  return (
    COLOR_HEX_PATTERN.test(value) ||
    COLOR_KEYWORD_PATTERN.test(value) ||
    COLOR_FUNCTION_PATTERN.test(value)
  );
}

type InlineStyleRule = {
  styleKey: "backgroundColor" | "color" | "fontFamily" | "fontSize";
  isValid: (value: string) => boolean;
};

const INLINE_STYLE_RULES = new Map<string, InlineStyleRule>([
  ["color", { styleKey: "color", isValid: isColorValue }],
  ["background-color", { styleKey: "backgroundColor", isValid: isColorValue }],
  [
    "font-size",
    {
      styleKey: "fontSize",
      isValid: (value) => FONT_SIZE_PATTERN.test(value),
    },
  ],
  [
    "font-family",
    {
      styleKey: "fontFamily",
      isValid: (value) => FONT_FAMILY_PATTERN.test(value),
    },
  ],
]);

function collectAllowedDeclarations(
  style: string,
): { property: string; rule: InlineStyleRule; value: string }[] {
  if (!style.trim()) {
    return [];
  }

  const allowed: { property: string; rule: InlineStyleRule; value: string }[] =
    [];

  for (const declaration of style.split(";")) {
    const separatorIndex = declaration.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const property = declaration.slice(0, separatorIndex).trim().toLowerCase();
    const value = declaration.slice(separatorIndex + 1).trim();
    const rule = INLINE_STYLE_RULES.get(property);

    if (!rule || !value || !rule.isValid(value)) {
      continue;
    }

    allowed.push({ property, rule, value });
  }

  return allowed;
}

/**
 * Returns the allowlisted subset of a Lexical node `style` string as React style
 * props, or `undefined` when nothing survives. `undefined` matters: it lets
 * callers keep rendering bare text instead of wrapping it in an element with an
 * empty style.
 */
export function parseInlineStyle(style: string): CSSProperties | undefined {
  const allowed = collectAllowedDeclarations(style);

  if (allowed.length === 0) {
    return undefined;
  }

  const parsedStyle: Record<string, string> = {};

  for (const { rule, value } of allowed) {
    parsedStyle[rule.styleKey] = value;
  }

  return parsedStyle;
}

/**
 * The same allowlist expressed back as a CSS declaration string, for the HTML
 * import path: Lexical stores text styling as raw CSS on the node, so carrying a
 * `<span style>` from saved markup into the editor means handing it a string,
 * not React props. Sharing `collectAllowedDeclarations` keeps one allowlist
 * governing both directions.
 */
export function sanitizeInlineStyle(style: string): string {
  return collectAllowedDeclarations(style)
    .map(({ property, value }) => `${property}: ${value}`)
    .join("; ");
}
