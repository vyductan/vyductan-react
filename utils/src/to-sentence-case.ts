export function toSentenceCase(string_: string) {
  return string_
    .replaceAll("_", " ")
    .replaceAll(/([A-Z])/g, " $1")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .replaceAll(/\s+/g, " ")
    .trim();
}
