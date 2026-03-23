import type { SyncProfile, SyncStatusResult } from "../../lib/acme-sync/types";

import { buildRsyncStatusFailureState } from "./acme-sync-rsync-state.ts";
import { buildSubtreeStatusFailureState } from "./acme-sync-subtree-state.ts";

export const getStatusStateAfterPrefetchFailure = (
  profileMode: SyncProfile["mode"],
  message: string,
): SyncStatusResult => {
  return profileMode === "subtree"
    ? buildSubtreeStatusFailureState(message)
    : buildRsyncStatusFailureState();
};
