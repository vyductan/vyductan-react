const ZERO_WIDTH_SPACE = "\u200b";

export const INVALID_BLOCK_TYPE_VALUES = [
  "bullet",
  "number",
  "check",
  "paragraph",
  "code",
  "quote",
  "h1",
  "h2",
  "h3",
] as const;

const INVALID_LOOKUP = new Set(INVALID_BLOCK_TYPE_VALUES);

/**
 * Insert a zero-width space after the first character so the string is no longer
 * exactly the same as a blockType identifier but still renders identically.
 */
const injectZeroWidthSpace = (value: string): string => {
  if (!value || value.includes(ZERO_WIDTH_SPACE)) {
    return value;
  }

  if (value.length === 1) {
    return `${value}${ZERO_WIDTH_SPACE}`;
  }

  return `${value[0]}${ZERO_WIDTH_SPACE}${value.slice(1)}`;
};

/**
 * Normalize strings that match Lexical blockType identifiers so they are treated
 * as plain text instead of structural markers.
 */
export const normalizeBlockTypeLikeString = (
  value: string | null | undefined,
): string => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (!INVALID_LOOKUP.has(trimmed)) {
    return value;
  }

  const startIndex = value.indexOf(trimmed);

  // Inject zero width space to break equality checks while keeping visuals intact
  const normalized = injectZeroWidthSpace(trimmed);

  if (startIndex === -1) {
    return normalized;
  }

  return (
    value.slice(0, startIndex) +
    normalized +
    value.slice(startIndex + trimmed.length)
  );
};

export const containsInvalidBlockTypeValue = (
  value: string | null | undefined,
): boolean => {
  if (typeof value !== "string") {
    return false;
  }

  return INVALID_LOOKUP.has(value.trim());
};

