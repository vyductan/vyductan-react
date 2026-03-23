import test from "node:test";
import assert from "node:assert/strict";

import { canConfirmSyncAction } from "./acme-sync-confirm-state.ts";

test("blocks confirm while confirm preview is still loading", () => {
  assert.equal(
    canConfirmSyncAction({
      hasConfirmState: true,
      isSyncing: false,
      isConfirmPreviewLoading: true,
      hasConfirmPreviewError: false,
      hasUnresolvedConflictSelections: false,
      hasUnresolvedFileSelections: false,
    }),
    false,
  );
});

test("blocks confirm when conflict selections remain unresolved", () => {
  assert.equal(
    canConfirmSyncAction({
      hasConfirmState: true,
      isSyncing: false,
      isConfirmPreviewLoading: false,
      hasConfirmPreviewError: false,
      hasUnresolvedConflictSelections: true,
      hasUnresolvedFileSelections: false,
    }),
    false,
  );
});

test("blocks confirm when file action selections remain unresolved", () => {
  assert.equal(
    canConfirmSyncAction({
      hasConfirmState: true,
      isSyncing: false,
      isConfirmPreviewLoading: false,
      hasConfirmPreviewError: false,
      hasUnresolvedConflictSelections: false,
      hasUnresolvedFileSelections: true,
    }),
    false,
  );
});

test("allows confirm only when previews are ready and all selections are resolved", () => {
  assert.equal(
    canConfirmSyncAction({
      hasConfirmState: true,
      isSyncing: false,
      isConfirmPreviewLoading: false,
      hasConfirmPreviewError: false,
      hasUnresolvedConflictSelections: false,
      hasUnresolvedFileSelections: false,
    }),
    true,
  );
});
