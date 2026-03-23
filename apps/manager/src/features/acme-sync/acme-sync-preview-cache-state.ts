import type { SyncPreviewResult } from "../../lib/acme-sync/types";

export const getPreviewCacheKey = (
  projectPath: string,
  primaryPath: string,
  action: "push" | "pull",
) => `${projectPath}::${primaryPath}::${action}`;

export const resolvePreviewPrimaryPath = (
  profilePrimaryPath: string | null | undefined,
  fallbackPrimaryPath: string | null | undefined,
) => profilePrimaryPath ?? fallbackPrimaryPath ?? "";

export const buildRsyncPreviewCacheEntries = (input: {
  projectPath: string;
  primaryPath: string;
  pushPreview: SyncPreviewResult;
  pullPreview: SyncPreviewResult;
}) => {
  return {
    [getPreviewCacheKey(input.projectPath, input.primaryPath, "push")]:
      input.pushPreview,
    [getPreviewCacheKey(input.projectPath, input.primaryPath, "pull")]:
      input.pullPreview,
  };
};

export const shouldReopenPreviewAfterApply = (input: {
  activePreviewProjectPath: string | null;
  activePreviewAction: "push" | "pull" | null;
  activePreviewFingerprint: string | null;
  applyProjectPath: string;
  applyAction: "push" | "pull";
  applyPreviewFingerprint: string;
}) => {
  return (
    input.activePreviewProjectPath === input.applyProjectPath &&
    input.activePreviewAction === input.applyAction &&
    input.activePreviewFingerprint === input.applyPreviewFingerprint
  );
};
