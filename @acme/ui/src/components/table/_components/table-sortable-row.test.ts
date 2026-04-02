import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

test("full-row sortable rows disable native text selection", () => {
  const source = readFileSync(
    path.resolve(import.meta.dirname, "./table-sortable-row.tsx"),
    "utf8",
  );

  expect(source).toContain('cursor: "move"');
  expect(source).toContain('userSelect: "none"');
  expect(source).toContain('WebkitUserSelect: "none"');
});
