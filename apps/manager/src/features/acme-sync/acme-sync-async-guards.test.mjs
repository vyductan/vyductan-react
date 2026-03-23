import test from "node:test";
import assert from "node:assert/strict";

import { shouldApplyAsyncResultForProject } from "./acme-sync-async-guards.ts";

test("accepts async result only for the latest matching active project", () => {
  assert.equal(
    shouldApplyAsyncResultForProject({
      requestId: 5,
      currentRequestId: 5,
      projectPath: "/tmp/project-a",
      activeProjectPaths: ["/tmp/project-a", "/tmp/project-b"],
    }),
    true,
  );

  assert.equal(
    shouldApplyAsyncResultForProject({
      requestId: 4,
      currentRequestId: 5,
      projectPath: "/tmp/project-a",
      activeProjectPaths: ["/tmp/project-a", "/tmp/project-b"],
    }),
    false,
  );
});

test("rejects async result for projects removed while request was in flight", () => {
  assert.equal(
    shouldApplyAsyncResultForProject({
      requestId: 6,
      currentRequestId: 6,
      projectPath: "/tmp/project-a",
      activeProjectPaths: ["/tmp/project-b"],
    }),
    false,
  );
});
