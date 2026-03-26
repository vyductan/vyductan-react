import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "vitest";

test("simple editor variant still mounts block copy paste support", () => {
  const pluginsSource = readFileSync(
    resolve(import.meta.dirname, "./plugins.tsx"),
    "utf8",
  );

  expect(pluginsSource).toContain("{editable && <BlockCopyPastePlugin />}");
});
