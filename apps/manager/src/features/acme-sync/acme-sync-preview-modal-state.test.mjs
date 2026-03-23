import test from "node:test";
import assert from "node:assert/strict";

import { getConflictResolutionOptions } from "./acme-sync-preview-selection-state.ts";

test("returns current and incoming options for binary conflicts", () => {
  assert.deepEqual(
    getConflictResolutionOptions({
      path: "image.png",
      kind: "binary",
      allowedResolutions: ["current", "incoming"],
    }),
    [
      { value: "current", label: "Ours" },
      { value: "incoming", label: "Theirs" },
    ],
  );
});

test("returns current, incoming, and both options for text conflicts", () => {
  assert.deepEqual(
    getConflictResolutionOptions({
      path: "file.ts",
      kind: "text",
      allowedResolutions: ["current", "incoming", "both"],
    }),
    [
      { value: "current", label: "Ours" },
      { value: "incoming", label: "Theirs" },
      { value: "both", label: "Both" },
    ],
  );
});
