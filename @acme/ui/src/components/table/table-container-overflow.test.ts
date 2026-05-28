import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

test("table separates horizontal scrolling from the outer wrapper to avoid vertical auto-scroll during drag", () => {
  const source = readFileSync(
    path.resolve(import.meta.dirname, "./table.tsx"),
    "utf8",
  );

  expect(source).not.toContain('scroll?.x && "overflow-x-auto",');
  expect(source).toContain("ref={wrapperRef}");
  expect(source).toContain('scroll?.x && "overflow-x-auto overflow-y-hidden"');
  expect(source).toContain('scroll?.y && "overflow-y-auto"');
});
