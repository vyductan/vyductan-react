import type { SyncStatusResult } from "../../lib/acme-sync/types";

import type { SyncStatusResult } from "../../lib/acme-sync/types";

export const buildRsyncStatusFailureState = (): SyncStatusResult => ({
  mode: "rsync",
  state: "unknown",
});

export const getRsyncStatusBadgeTone = (
  state:
    | "in-sync"
    | "outdated"
    | "local-changes"
    | "diverged"
    | "unknown",
) => {
  if (state === "outdated" || state === "diverged") {
    return "warning";
  }

  if (state === "in-sync") {
    return "success";
  }

  if (state === "local-changes") {
    return "info";
  }

  return "neutral";
};

export const formatRsyncStatusLabel = (status?: SyncStatusResult) => {
  if (!status || status.mode !== "rsync") {
    return null;
  }

  if (status.state === "outdated") return "Outdated";
  if (status.state === "local-changes") return "Local Changes";
  if (status.state === "in-sync") return "In Sync";
  if (status.state === "diverged") return "Diverged";
  return null;
};

export const shouldHighlightPullAction = (status?: SyncStatusResult) => {
  if (!status || status.mode !== "rsync") {
    return true;
  }

  return status.state === "outdated" || status.state === "unknown";
};

export const shouldHighlightPushAction = (status?: SyncStatusResult) => {
  if (!status || status.mode !== "rsync") {
    return false;
  }

  return status.state === "local-changes" || status.state === "diverged";
};
