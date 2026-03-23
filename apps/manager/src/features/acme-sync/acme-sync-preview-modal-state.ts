import type {
  SyncConflictResolution,
  SyncPreviewConflict,
  SyncPreviewDecision,
  SyncPreviewFileAction,
  SyncPreviewResult,
  SyncStatusResult,
} from "../../lib/acme-sync/types";
import { getSubtreeHistoryFallbackMessage } from "./acme-sync-wording";

export type SubtreeSyncPreviewStatus = Extract<
  SyncStatusResult,
  { mode: "subtree" }
>;

export interface RsyncPreviewModalState {
  mode: "rsync";
  action: "push" | "pull";
  projectPath: string;
  src: string;
  dest: string;
  result: SyncPreviewResult;
  selectedConflictResolutions: PreviewConflictResolutionState;
  selectedFileActions: PreviewFileActionState;
}

export interface SubtreePreviewModalState {
  mode: "subtree";
  action: "pull";
  projectPath: string;
  status: SubtreeSyncPreviewStatus;
}

export type PreviewModalState =
  | RsyncPreviewModalState
  | SubtreePreviewModalState;

export type PreviewConflictResolutionState = Record<
  string,
  SyncConflictResolution | undefined
>;

export type PreviewFileActionState = Record<
  string,
  SyncPreviewFileAction | undefined
>;

export const buildSubtreePreviewModalState = ({
  action,
  projectPath,
  status,
}: {
  action: "pull";
  projectPath: string;
  status: SubtreeSyncPreviewStatus;
}): SubtreePreviewModalState => ({
  mode: "subtree",
  action,
  projectPath,
  status,
});

export const buildPreviewConflictResolutionState =
  (): PreviewConflictResolutionState => ({});

export const buildPreviewFileActionState = (): PreviewFileActionState => ({});

export const canUseResolution = (
  conflict: SyncPreviewConflict,
  resolution: SyncConflictResolution,
) => conflict.allowedResolutions.includes(resolution as never);

export const hasConflictResolution = (
  conflict: SyncPreviewConflict,
  resolutions: PreviewConflictResolutionState,
) => {
  const selectedResolution = resolutions[conflict.path];

  return (
    selectedResolution !== undefined &&
    canUseResolution(conflict, selectedResolution)
  );
};

export const getUnresolvedConflictCount = (
  preview: SyncPreviewResult,
  resolutions: PreviewConflictResolutionState,
) =>
  (preview.conflicts ?? []).filter(
    (conflict) => !hasConflictResolution(conflict, resolutions),
  ).length;

export const canUseFileAction = (
  decision: SyncPreviewDecision,
  action: SyncPreviewFileAction,
) => decision.allowedActions.includes(action);

export const hasSelectedFileAction = (
  decision: SyncPreviewDecision,
  actions: PreviewFileActionState,
) => {
  const selectedAction = actions[decision.path];

  return (
    selectedAction !== undefined && canUseFileAction(decision, selectedAction)
  );
};

export const getUnresolvedFileDecisionCount = (
  preview: SyncPreviewResult,
  actions: PreviewFileActionState,
) =>
  (preview.decisions ?? []).filter(
    (decision) => !hasSelectedFileAction(decision, actions),
  ).length;

export const getPreviewModalTitle = (preview: PreviewModalState) => {
  if (preview.mode === "subtree") {
    return "Preview History";
  }

  return preview.action === "push" ? "Preview Push" : "Preview Pull";
};

export const getPreviewModalDescription = (
  preview: PreviewModalState,
  pendingConfirmAfterPreview: boolean,
) => {
  const suffix = pendingConfirmAfterPreview
    ? " • Review before continuing to confirmation"
    : "";

  if (preview.mode === "subtree") {
    const message =
      preview.status.mode === "subtree"
        ? (preview.status.message ?? getSubtreeHistoryFallbackMessage())
        : getSubtreeHistoryFallbackMessage();

    return `${message}${suffix}`;
  }

  const unresolvedConflictCount = getUnresolvedConflictCount(
    preview.result,
    preview.selectedConflictResolutions,
  );
  const unresolvedFileDecisionCount = getUnresolvedFileDecisionCount(
    preview.result,
    preview.selectedFileActions,
  );
  const conflictSuffix =
    unresolvedConflictCount > 0
      ? ` • ${unresolvedConflictCount} unresolved conflict(s)`
      : "";
  const fileDecisionSuffix =
    unresolvedFileDecisionCount > 0
      ? ` • ${unresolvedFileDecisionCount} unresolved file decision(s)`
      : "";

  return `${preview.result.files.length} changed file(s) • Added ${preview.result.summary.added} • Modified ${preview.result.summary.modified} • Deleted ${preview.result.summary.deleted}${conflictSuffix}${fileDecisionSuffix}${suffix}`;
};
