import type { SyncStatusResult } from "../../lib/acme-sync/types";

export const clearSubtreeStatusForProject = (
  statuses: Record<string, SyncStatusResult>,
  projectPath: string,
) => {
  const next = { ...statuses };
  delete next[projectPath];
  return next;
};

export const shouldApplySubtreeStatusResult = (input: {
  requestId: number;
  currentRequestId: number;
  projectPath: string;
  activeProjectPaths: string[];
}) => {
  return (
    input.requestId === input.currentRequestId &&
    input.activeProjectPaths.includes(input.projectPath)
  );
};

export const buildSubtreeStatusFailureState = (message: string): SyncStatusResult => ({
  mode: "subtree",
  state: "unknown",
  aheadCount: 0,
  behindCount: 0,
  dirty: false,
  message,
});

export function formatSubtreeStatusLabel(input: {
  state:
    | "clean"
    | "ahead"
    | "behind"
    | "diverged"
    | "misconfigured"
    | "missing_subtree"
    | "unknown";
  aheadCount?: number;
  behindCount?: number;
}) {
  if (input.state === "diverged") {
    return `Diverged from source (ahead ${input.aheadCount ?? 0}, behind ${input.behindCount ?? 0})`;
  }
  if (input.state === "ahead")
    return `Ahead of source (${input.aheadCount ?? 0})`;
  if (input.state === "behind")
    return `Behind source (${input.behindCount ?? 0})`;
  if (input.state === "misconfigured") return "Misconfigured";
  if (input.state === "missing_subtree") return "Missing subtree";
  if (input.state === "clean") return "In sync";
  return "Unknown";
}

export function formatSubtreeProjectLine(status: SyncStatusResult) {
  if (status.mode !== "subtree") return "Project @acme: Unknown";
  if (status.dirty) return "Project @acme: Modified";
  if (status.state === "ahead" || status.state === "diverged") {
    return "Project @acme: Modified";
  }
  if (status.state === "missing_subtree") {
    return "Project @acme: Missing subtree";
  }
  if (status.state === "clean" || status.state === "behind") {
    return "Project @acme: No local changes";
  }
  return "Project @acme: Unknown";
}

export function formatSubtreeSourceSyncLine(status: SyncStatusResult) {
  if (status.mode !== "subtree") return "Source sync: Unknown";
  if (status.state === "misconfigured") return "Source sync: Misconfigured";
  if (status.state === "missing_subtree") return "Source sync: Cannot compare";
  if (status.state === "diverged") {
    return `Source sync: Diverged from source (ahead ${status.aheadCount ?? 0}, behind ${status.behindCount ?? 0})`;
  }
  if (status.state === "ahead") {
    return `Source sync: Ahead of source (${status.aheadCount ?? 0})`;
  }
  if (status.state === "behind") {
    return `Source sync: Behind source (${status.behindCount ?? 0})`;
  }
  if (status.state === "clean") return "Source sync: In sync";
  return "Source sync: Unknown";
}

export const getSubtreeStatusBadgeTone = (
  state:
    | "clean"
    | "ahead"
    | "behind"
    | "diverged"
    | "misconfigured"
    | "missing_subtree"
    | "unknown",
) => {
  if (state === "misconfigured") return "danger";
  if (
    state === "behind" ||
    state === "diverged" ||
    state === "missing_subtree"
  ) {
    return "warning";
  }
  if (state === "clean") return "success";
  return "info";
};

export const buildSubtreeConfirmDetails = (status?: SyncStatusResult) => {
  if (!status || status.mode !== "subtree") {
    return null;
  }

  return {
    statusLabel: formatSubtreeStatusLabel(status),
    aheadCount: status.aheadCount,
    behindCount: status.behindCount,
    dirty: status.dirty,
  };
};
