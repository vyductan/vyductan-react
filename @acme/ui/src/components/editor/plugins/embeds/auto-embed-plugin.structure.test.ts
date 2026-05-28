import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const source = readFileSync(
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "auto-embed-plugin.tsx",
  ),
  "utf8",
);

describe("AutoEmbedPlugin popover menu structure", () => {
  test("passes the menu anchor container to PopoverContent", () => {
    expect(source).toContain("container={anchorElementReference.current}");
    expect(source).not.toContain("<PopoverPortal");
  });
});
