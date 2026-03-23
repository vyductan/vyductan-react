export type SyncEngineMode = "rsync" | "subtree";
export type SyncDirection = "to-primary" | "from-primary";

export interface RsyncSyncSettings {
  useGitSafetyChecks: boolean;
}

export interface SubtreeSyncSettings {
  repoRoot: string;
  prefix: "@acme";
  remote: string;
  branch: string;
  squash: boolean;
}

export interface SyncProfile {
  id: string;
  projectPath: string;
  mode: SyncEngineMode;
  primaryPath: string | null;
  rsync?: RsyncSyncSettings;
  subtree?: SubtreeSyncSettings;
}

export type SyncChangeType = "added" | "modified" | "deleted";

export interface SyncPreviewFile {
  path: string;
  changeType: SyncChangeType;
}

export interface SyncPreviewSummary {
  added: number;
  modified: number;
  deleted: number;
}

export type SyncConflictKind = "text" | "binary";
export type SyncConflictResolution = "current" | "incoming" | "both";
export type TextSyncConflictResolution = Extract<
  SyncConflictResolution,
  "current" | "incoming" | "both"
>;
export type BinarySyncConflictResolution = Extract<
  SyncConflictResolution,
  "current" | "incoming"
>;

export interface BaseSyncConflict {
  path: string;
  kind: SyncConflictKind;
}

export interface TextSyncConflict extends BaseSyncConflict {
  kind: "text";
  allowedResolutions: TextSyncConflictResolution[];
}

export interface BinarySyncConflict extends BaseSyncConflict {
  kind: "binary";
  allowedResolutions: BinarySyncConflictResolution[];
}

export type SyncPreviewConflict = TextSyncConflict | BinarySyncConflict;

export interface SyncConflictTextSide {
  label: string;
  content: string;
}

export interface BaseSyncConflictDetail {
  path: string;
  kind: SyncConflictKind;
  message?: string | null;
}

export interface TextSyncConflictDetail extends BaseSyncConflictDetail {
  kind: "text";
  current: SyncConflictTextSide;
  incoming: SyncConflictTextSide;
  bothPreview?: string | null;
}

export interface BinarySyncConflictDetail extends BaseSyncConflictDetail {
  kind: "binary";
  current?: null;
  incoming?: null;
  bothPreview?: null;
}

export type SyncConflictDetail =
  | TextSyncConflictDetail
  | BinarySyncConflictDetail;

export interface SyncConflictResolutionSelection {
  path: string;
  resolution: SyncConflictResolution;
}

export type SyncPreviewFileAction = "keep" | "delete";

export interface SyncPreviewDecision {
  path: string;
  kind: SyncChangeType;
  allowedActions: SyncPreviewFileAction[];
}

export interface SyncPreviewFileActionSelection {
  path: string;
  action: SyncPreviewFileAction;
}

export interface RsyncConflictExecutionRequest {
  src: string;
  dest: string;
  direction: SyncDirection;
  fingerprint: string;
  resolutions: SyncConflictResolutionSelection[];
  fileActions?: SyncPreviewFileActionSelection[];
  useGitSafetyChecks?: boolean;
}

export interface RsyncPreviewActionRequest {
  src: string;
  dest: string;
  direction: SyncDirection;
  fingerprint: string;
  path: string;
  action: SyncPreviewFileAction;
  changeType: SyncChangeType;
  useGitSafetyChecks?: boolean;
}

export interface SyncPreviewResult {
  files: SyncPreviewFile[];
  summary: SyncPreviewSummary;
  conflicts?: SyncPreviewConflict[];
  decisions?: SyncPreviewDecision[];
  fingerprint?: string;
}

export interface RepoMetadata {
  branch: string;
  lastCommitMessage: string;
  lastUpdated: string;
}

export interface PrimaryRemoteStatus {
  upstreamBranch: string | null;
  workingTreeDirty: boolean;
  aheadCount: number;
  behindCount: number;
  status: "synced" | "unpublished" | "unknown";
  message?: string | null;
}

export type RsyncSyncState =
  | "in-sync"
  | "outdated"
  | "local-changes"
  | "diverged"
  | "unknown";

export type SubtreeSyncState =
  | "clean"
  | "ahead"
  | "behind"
  | "diverged"
  | "misconfigured"
  | "missing_subtree"
  | "unknown";

export type SyncStatusResult =
  | {
      mode: "rsync";
      state: RsyncSyncState;
      dirtyPaths?: string[];
      summary?: SyncPreviewSummary;
      oppositeSummary?: SyncPreviewSummary;
    }
  | {
      mode: "subtree";
      state: SubtreeSyncState;
      aheadCount: number;
      behindCount: number;
      dirty: boolean;
      message?: string;
    };
