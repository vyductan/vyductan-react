import test from "node:test";
import assert from "node:assert/strict";

import { shouldDisablePrimaryPathChange } from "./acme-sync-primary-path-state.ts";

test("disables primary path change while a sync is running", () => {
  assert.equal(
    shouldDisablePrimaryPathChange({
      isSyncing: true,
      isPreviewLoading: false,
      isConfirmPreviewLoading: false,
    }),
    true,
  );
});

test("disables primary path change while preview loading is in flight", () => {
  assert.equal(
    shouldDisablePrimaryPathChange({
      isSyncing: false,
      isPreviewLoading: true,
      isConfirmPreviewLoading: false,
    }),
    true,
  );
});

test("allows primary path change when no blocking async work is active", () => {
  assert.equal(
    shouldDisablePrimaryPathChange({
      isSyncing: false,
      isPreviewLoading: false,
      isConfirmPreviewLoading: false,
    }),
    false,
  );
});
