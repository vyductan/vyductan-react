import test from "node:test";
import assert from "node:assert/strict";

import { shouldReportAiRequestError } from "./acme-sync-ai-request-state.ts";

test("reports AI request error only for the latest active project request", () => {
  assert.equal(
    shouldReportAiRequestError({
      requestId: 4,
      currentRequestId: 4,
      projectPath: "/tmp/project-a",
      activeProjectPaths: ["/tmp/project-a"],
    }),
    true,
  );
});

test("suppresses AI request error for stale or removed project requests", () => {
  assert.equal(
    shouldReportAiRequestError({
      requestId: 3,
      currentRequestId: 4,
      projectPath: "/tmp/project-a",
      activeProjectPaths: ["/tmp/project-a"],
    }),
    false,
  );

  assert.equal(
    shouldReportAiRequestError({
      requestId: 4,
      currentRequestId: 4,
      projectPath: "/tmp/project-a",
      activeProjectPaths: ["/tmp/project-b"],
    }),
    false,
  );
});
