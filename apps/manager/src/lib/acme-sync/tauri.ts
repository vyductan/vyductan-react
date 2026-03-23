import { invoke } from "@tauri-apps/api/core";

import type {
  PrimaryRemoteStatus,
  RepoMetadata,
  RsyncConflictExecutionRequest,
  RsyncPreviewActionRequest,
  SyncChangeType,
  SyncConflictDetail,
  SyncDirection,
  SyncPreviewResult,
  SyncProfile,
  SyncStatusResult,
} from "./types";

const isTauri = () => {
  return (
    globalThis.window !== undefined &&
    "__TAURI_INTERNALS__" in globalThis.window
  );
};

function ensureTauri() {
  if (!isTauri()) {
    throw new Error(
      "Not running in Tauri context. Please run the manager app through Tauri instead of the standard web dev server.",
    );
  }
}

export async function previewSyncChanges(
  src: string,
  dest: string,
  direction: SyncDirection,
): Promise<SyncPreviewResult> {
  ensureTauri();
  return await invoke<SyncPreviewResult>("preview_sync_changes", {
    src,
    dest,
    direction,
  });
}

export async function previewSyncFileDiff(
  src: string,
  dest: string,
  relativePath: string,
  changeType: SyncChangeType,
): Promise<string> {
  ensureTauri();
  return await invoke<string>("preview_sync_file_diff", {
    src,
    dest,
    relativePath,
    changeType,
  });
}

export async function getSyncConflictDetail(
  src: string,
  dest: string,
  relativePath: string,
  direction: SyncDirection,
): Promise<SyncConflictDetail> {
  ensureTauri();
  return await invoke<SyncConflictDetail>("get_sync_conflict_detail", {
    src,
    dest,
    relativePath,
    direction,
  });
}

export async function deleteSyncFile(
  root: string,
  relativePath: string,
): Promise<void> {
  ensureTauri();
  return await invoke<void>("delete_sync_file", {
    root,
    relativePath,
  });
}

export async function getLatestModified(path: string): Promise<string> {
  ensureTauri();
  return await invoke<string>("get_latest_modified", { path });
}

export async function getRepoMetadata(path: string): Promise<RepoMetadata> {
  ensureTauri();
  return await invoke<RepoMetadata>("get_repo_metadata", { path });
}

export async function getPrimaryRemoteStatus(
  path: string,
): Promise<PrimaryRemoteStatus> {
  ensureTauri();
  return await invoke<PrimaryRemoteStatus>("get_repo_remote_status", { path });
}

export async function getSyncStatus(
  profile: SyncProfile,
): Promise<SyncStatusResult> {
  ensureTauri();
  return await invoke<SyncStatusResult>("get_sync_status", { profile });
}

export async function executeRsyncSync(
  src: string,
  dest: string,
  useGitSafetyChecks = false,
): Promise<void> {
  ensureTauri();
  return await invoke<void>("execute_rsync_sync", {
    src,
    dest,
    useGitSafetyChecks,
  });
}

export async function executeRsyncConflictResolutions(
  request: RsyncConflictExecutionRequest,
): Promise<void> {
  ensureTauri();
  return await invoke<void>("execute_rsync_conflict_resolutions", { request });
}

export async function applySingleRsyncPreviewAction(
  request: RsyncPreviewActionRequest,
): Promise<void> {
  ensureTauri();
  return await invoke<void>("apply_single_rsync_preview_action", { request });
}

export async function executeSubtreeSync(
  profile: SyncProfile,
  direction: SyncDirection,
): Promise<void> {
  ensureTauri();
  return await invoke<void>("execute_subtree_sync", { profile, direction });
}

export async function executeSubtreeAdd(profile: SyncProfile): Promise<void> {
  ensureTauri();
  return await invoke<void>("execute_subtree_add", { profile });
}

export async function executeSyncAction(
  profile: SyncProfile,
  direction: SyncDirection,
  rsyncConflictRequest?: Omit<
    RsyncConflictExecutionRequest,
    "src" | "dest" | "direction"
  >,
): Promise<void> {
  ensureTauri();

  if (profile.mode === "subtree") {
    return await executeSubtreeSync(profile, direction);
  }

  if (!profile.primaryPath) {
    throw new Error("Rsync sync requires a primary path");
  }

  const src =
    direction === "to-primary" ? profile.projectPath : profile.primaryPath;
  const dest =
    direction === "to-primary" ? profile.primaryPath : profile.projectPath;

  if (rsyncConflictRequest) {
    return await executeRsyncConflictResolutions({
      src,
      dest,
      direction,
      fingerprint: rsyncConflictRequest.fingerprint,
      resolutions: rsyncConflictRequest.resolutions,
      fileActions: rsyncConflictRequest.fileActions,
      useGitSafetyChecks:
        rsyncConflictRequest.useGitSafetyChecks ??
        profile.rsync?.useGitSafetyChecks ??
        false,
    });
  }

  return await executeRsyncSync(
    src,
    dest,
    profile.rsync?.useGitSafetyChecks ?? false,
  );
}

export async function previewSubtreeSync(
  profile: SyncProfile,
  direction: SyncDirection,
): Promise<SyncStatusResult> {
  ensureTauri();
  return await invoke<SyncStatusResult>("preview_subtree_sync", {
    profile,
    direction,
  });
}
