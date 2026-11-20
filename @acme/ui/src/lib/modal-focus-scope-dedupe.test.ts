import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

/**
 * A nested modal is only safe while there is ONE focus trap implementation.
 *
 * `focusScopesStack` in @radix-ui/react-focus-scope is module-level state, so a
 * FocusScope pauses the one beneath it only when both come from the same copy
 * of the package. Our Dialog resolves it through `radix-ui` and our Drawer
 * through `vaul`'s own @radix-ui/react-dialog; when those resolved to different
 * versions the two traps never saw each other, and a Dialog's `focusin`
 * handler pulled focus straight back out of any Drawer opened from inside it.
 * Every text input in that Drawer became impossible to focus.
 *
 * The pin lives in `overrides` in pnpm-workspace.yaml. Nothing else fails when
 * it is dropped — the split is invisible until someone opens a drawer from a
 * dialog — so the lockfile is checked directly.
 */
describe("@radix-ui/react-focus-scope", () => {
  test("resolves to exactly one version across the whole tree", () => {
    const lockfile = resolve(
      dirname(fileURLToPath(import.meta.url)),
      "../../../../pnpm-lock.yaml",
    );
    const versions = new Set(
      [
        ...readFileSync(lockfile, "utf8").matchAll(
          /^ {2}'@radix-ui\/react-focus-scope@([^'(]+)[^']*':/gm,
        ),
      ].map((match) => match[1]),
    );

    expect([...versions]).toHaveLength(1);
  });
});
