import test from "node:test";
import assert from "node:assert/strict";

import { getStatusStateAfterPrefetchFailure } from "./acme-sync-prefetch-failure-state.ts";

test("maps rsync profiles to an unknown rsync status after prefetch failure", () => {
  assert.deepEqual(getStatusStateAfterPrefetchFailure("rsync", "preview failed"), {
    mode: "rsync",
    state: "unknown",
  });
});

test("maps subtree profiles to an unknown subtree status after prefetch failure", () => {
  assert.deepEqual(getStatusStateAfterPrefetchFailure("subtree", "preview failed"), {
    mode: "subtree",
    state: "unknown",
    aheadCount: 0,
    behindCount: 0,
    dirty: false,
    message: "preview failed",
  });
});
