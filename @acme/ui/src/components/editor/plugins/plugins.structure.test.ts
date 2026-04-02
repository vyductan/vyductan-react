import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

test("simple editor variant still mounts block copy paste support", () => {
  const pluginsSource = readFileSync(
    path.resolve(import.meta.dirname, "./plugins.tsx"),
    "utf8",
  );

  expect(pluginsSource).toContain("{editable && <BlockCopyPastePlugin />}");
});
