import test from "node:test";
import assert from "node:assert/strict";

import { clearPreviewPrefetchErrorForProject } from "./acme-sync-preview-prefetch-state.ts";

test("clears stale preview prefetch error for one project", () => {
  assert.deepEqual(
    clearPreviewPrefetchErrorForProject(
      {
        "/repo-a": "old subtree preview error",
        "/repo-b": "keep me",
      },
      "/repo-a",
    ),
    {
      "/repo-a": null,
      "/repo-b": "keep me",
    },
  );
});
