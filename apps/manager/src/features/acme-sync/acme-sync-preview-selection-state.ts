import type {
  SyncConflictResolution,
  SyncPreviewConflict,
  SyncPreviewFileAction,
} from "../../lib/acme-sync/types";

export const getNextConflictResolutionState = (
  current: Record<string, SyncConflictResolution | undefined>,
  path: string,
  resolution: SyncConflictResolution,
) => ({
  ...current,
  [path]: resolution,
});

export const getConflictResolutionOptions = (
  conflict: Pick<SyncPreviewConflict, "allowedResolutions">,
) => {
  return conflict.allowedResolutions.map((resolution) => ({
    value: resolution,
    label:
      resolution === "current"
        ? "Ours"
        : resolution === "incoming"
          ? "Theirs"
          : "Both",
  }));
};

export const getNextFileActionStateAfterPreviewRefresh = (input: {
  previousSelections: Record<string, SyncPreviewFileAction | undefined>;
  nextAllowedPaths: string[];
}) => {
  const allowed = new Set(input.nextAllowedPaths);

  return Object.fromEntries(
    Object.entries(input.previousSelections).filter(([path, action]) => {
      return action !== undefined && allowed.has(path);
    }),
  );
};

export const getNextConflictResolutionStateAfterPreviewRefresh = (input: {
  previousSelections: Record<string, SyncConflictResolution | undefined>;
  nextAllowedPaths: string[];
}) => {
  const allowed = new Set(input.nextAllowedPaths);

  return Object.fromEntries(
    Object.entries(input.previousSelections).filter(([path, resolution]) => {
      return resolution !== undefined && allowed.has(path);
    }),
  );
};
