import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRsyncStatusFailureState,
  formatRsyncStatusLabel,
} from "./acme-sync-rsync-state.ts";

test("builds an unknown rsync status from a refresh failure", () => {
  assert.deepEqual(buildRsyncStatusFailureState(), {
    mode: "rsync",
    state: "unknown",
  });
});

test("unknown rsync status still renders no misleading status label", () => {
  assert.equal(formatRsyncStatusLabel(buildRsyncStatusFailureState()), null);
});
