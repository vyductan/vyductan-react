import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRsyncPreviewCacheEntries,
  getPreviewCacheKey,
  resolvePreviewPrimaryPath,
  shouldReopenPreviewAfterApply,
} from "./acme-sync-preview-cache-state.ts";

test("preview cache key includes primary path identity", () => {
  assert.equal(
    getPreviewCacheKey("/tmp/project-a", "/tmp/primary-a", "push"),
    "/tmp/project-a::/tmp/primary-a::push",
  );
  assert.notEqual(
    getPreviewCacheKey("/tmp/project-a", "/tmp/primary-a", "push"),
    getPreviewCacheKey("/tmp/project-a", "/tmp/primary-b", "push"),
  );
});

test("builds push and pull cache entries scoped to project and primary path", () => {
  const result = buildRsyncPreviewCacheEntries({
    projectPath: "/tmp/project-a",
    primaryPath: "/tmp/primary-a",
    pushPreview: { summary: { added: 1, modified: 0, deleted: 0 } },
    pullPreview: { summary: { added: 0, modified: 2, deleted: 1 } },
  });

  assert.deepEqual(Object.keys(result).sort(), [
    "/tmp/project-a::/tmp/primary-a::pull",
    "/tmp/project-a::/tmp/primary-a::push",
  ]);
  assert.equal(
    result["/tmp/project-a::/tmp/primary-a::push"].summary.added,
    1,
  );
  assert.equal(
    result["/tmp/project-a::/tmp/primary-a::pull"].summary.modified,
    2,
  );
});

test("resolves preview primary path by preferring the profile path over the global fallback", () => {
  assert.equal(
    resolvePreviewPrimaryPath("/tmp/profile-primary", "/tmp/global-primary"),
    "/tmp/profile-primary",
  );
  assert.equal(
    resolvePreviewPrimaryPath(null, "/tmp/global-primary"),
    "/tmp/global-primary",
  );
});

test("reopens preview after apply only when the same modal instance is still active", () => {
  assert.equal(
    shouldReopenPreviewAfterApply({
      activePreviewProjectPath: "/tmp/project-a",
      activePreviewAction: "push",
      activePreviewFingerprint: "fingerprint-a",
      applyProjectPath: "/tmp/project-a",
      applyAction: "push",
      applyPreviewFingerprint: "fingerprint-a",
    }),
    true,
  );

  assert.equal(
    shouldReopenPreviewAfterApply({
      activePreviewProjectPath: "/tmp/project-a",
      activePreviewAction: "push",
      activePreviewFingerprint: "fingerprint-b",
      applyProjectPath: "/tmp/project-a",
      applyAction: "push",
      applyPreviewFingerprint: "fingerprint-a",
    }),
    false,
  );

  assert.equal(
    shouldReopenPreviewAfterApply({
      activePreviewProjectPath: null,
      activePreviewAction: null,
      activePreviewFingerprint: null,
      applyProjectPath: "/tmp/project-a",
      applyAction: "push",
      applyPreviewFingerprint: "fingerprint-a",
    }),
    false,
  );

  assert.equal(
    shouldReopenPreviewAfterApply({
      activePreviewProjectPath: "/tmp/project-a",
      activePreviewAction: "pull",
      activePreviewFingerprint: "fingerprint-a",
      applyProjectPath: "/tmp/project-a",
      applyAction: "push",
      applyPreviewFingerprint: "fingerprint-a",
    }),
    false,
  );
});
