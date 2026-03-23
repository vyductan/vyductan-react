import test from "node:test";
import assert from "node:assert/strict";

import {
  getConflictResolutionOptions,
  getNextConflictResolutionState,
  getNextConflictResolutionStateAfterPreviewRefresh,
  getNextFileActionStateAfterPreviewRefresh,
} from "./acme-sync-preview-selection-state.ts";

test("stores a selected conflict resolution for a conflict path", () => {
  assert.deepEqual(
    getNextConflictResolutionState({}, "/tmp/file-a.ts", "incoming"),
    {
      "/tmp/file-a.ts": "incoming",
    },
  );
});

test("builds resolution options for binary conflicts without a both action", () => {
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

test("preserves only still-relevant preview selections after refresh", () => {
  assert.deepEqual(
    getNextFileActionStateAfterPreviewRefresh({
      previousSelections: {
        "keep.ts": "keep",
        "delete.ts": "delete",
        "gone.ts": "keep",
      },
      nextAllowedPaths: ["keep.ts", "delete.ts"],
    }),
    {
      "keep.ts": "keep",
      "delete.ts": "delete",
    },
  );
});

test("preserves only still-relevant conflict resolutions after refresh", () => {
  assert.deepEqual(
    getNextConflictResolutionStateAfterPreviewRefresh({
      previousSelections: {
        "conflict-a.ts": "incoming",
        "gone.ts": "current",
      },
      nextAllowedPaths: ["conflict-a.ts"],
    }),
    {
      "conflict-a.ts": "incoming",
    },
  );
});
