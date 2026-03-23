import type {
  SyncPreviewResult,
  SyncProfile,
  SyncStatusResult,
} from "../../lib/acme-sync/types";

export interface ConfirmPreviewState {
  projectPath: string;
  profileMode?: SyncProfile["mode"];
  prefetchError?: string | null;
  preview?: SyncPreviewResult;
  oppositePreview?: SyncPreviewResult;
  subtreeStatus?: SyncStatusResult;
}

export const shouldReuseConfirmCachedPreview = ({
  profileMode,
  prefetchError,
  preview,
  oppositePreview,
  subtreeStatus,
}: ConfirmPreviewState) => {
  if (prefetchError) {
    return false;
  }

  if (profileMode === "subtree" && subtreeStatus?.mode === "subtree") {
    return true;
  }

  return Boolean(preview && oppositePreview);
};

export const getConfirmModalDescription = ({
  action,
  mode,
}: {
  action: "push" | "pull";
  mode: SyncProfile["mode"];
}) => {
  if (mode === "subtree") {
    return "You are about to apply subtree commits from Primary into this project.";
  }

  return action === "push"
    ? "You are about to push local @acme changes to Primary."
    : "You are about to pull Primary @acme changes to this project.";
};

export const getConfirmLoadingMessage = (mode: SyncProfile["mode"]) => {
  return mode === "subtree"
    ? "Loading subtree history preview..."
    : "Loading push/pull previews to check divergence...";
};

export const getConfirmPreviewFallbackMessage = (mode: SyncProfile["mode"]) => {
  return mode === "subtree"
    ? "No subtree history preview available yet. You can continue, or run Preview History first."
    : "No preview data available yet for this action. You can continue, or run Preview first.";
};

export const getConfirmDeleteWarningMessage = (
  summary?: SyncPreviewResult["summary"] | null,
) => {
  if (!summary || summary.deleted <= 0) {
    return null;
  }

  return `Warning: this sync will delete ${summary.deleted} path(s) in the destination @acme tree.`;
};

export const getConfirmSubtreeSummaryMessage = (status?: SyncStatusResult) => {
  if (!status || status.mode !== "subtree") {
    return null;
  }

  return `Subtree history preview • Behind: ${status.behindCount} commits • Ahead: ${status.aheadCount} commits • Working tree ${status.dirty ? "dirty" : "clean"}`;
};
