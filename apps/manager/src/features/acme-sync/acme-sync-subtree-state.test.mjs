import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSubtreeStatusFailureState,
  shouldApplySubtreeStatusResult,
} from "./acme-sync-subtree-state.ts";

test("accepts subtree status result only for the latest matching request", () => {
  assert.equal(
    shouldApplySubtreeStatusResult({
      requestId: 3,
      currentRequestId: 3,
      projectPath: "/tmp/project-a",
      activeProjectPaths: ["/tmp/project-a", "/tmp/project-b"],
    }),
    true,
  );

  assert.equal(
    shouldApplySubtreeStatusResult({
      requestId: 2,
      currentRequestId: 3,
      projectPath: "/tmp/project-a",
      activeProjectPaths: ["/tmp/project-a", "/tmp/project-b"],
    }),
    false,
  );
});

test("rejects subtree status result for projects removed while request was in flight", () => {
  assert.equal(
    shouldApplySubtreeStatusResult({
      requestId: 4,
      currentRequestId: 4,
      projectPath: "/tmp/project-a",
      activeProjectPaths: ["/tmp/project-b"],
    }),
    false,
  );
});

test("builds an unknown subtree status that preserves the failure message", () => {
  assert.deepEqual(
    buildSubtreeStatusFailureState("preview failed"),
    {
      mode: "subtree",
      state: "unknown",
      aheadCount: 0,
      behindCount: 0,
      dirty: false,
      message: "preview failed",
    },
  );
});
