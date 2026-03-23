import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderPlus, RefreshCw, Settings, Trash2, Upload } from "lucide-react";

import { CodeBlock } from "@acme/ui/components/code-block";
import { Modal } from "@acme/ui/components/modal";

import "react-diff-view/style/index.css";

import type {
  PrimaryRemoteStatus,
  RepoMetadata,
  SyncChangeType,
  SyncConflictDetail,
  SyncConflictResolution,
  SyncPreviewFile,
  SyncPreviewFileAction,
  SyncPreviewResult,
  SyncPreviewSummary,
  SyncProfile,
  SyncStatusResult,
} from "../../lib/acme-sync/types";
import type { AiSyncMode } from "./acme-sync-ai-sync-state";
import type { LastModifiedEntry } from "./acme-sync-error-state";
import type {
  PreviewModalState,
  SubtreePreviewModalState,
} from "./acme-sync-preview-modal-state";
import { AcmeSyncRsyncPreviewModal } from "./acme-sync-rsync-preview-modal";
import { AcmeSyncSubtreePreviewModal } from "./acme-sync-subtree-preview-modal";
import {
  applySingleRsyncPreviewAction,
  deleteSyncFile,
  executeSubtreeAdd,
  executeSyncAction,
  getLatestModified,
  getPrimaryRemoteStatus,
  getRepoMetadata,
  getSyncConflictDetail,
  previewSubtreeSync,
  previewSyncChanges,
  previewSyncFileDiff,
  getSyncStatus,
} from "../../lib/acme-sync/tauri";
import { useAcmeStore } from "../../store/acme-store";
import { useToastStore } from "../../store/toast-store";
import { shouldReuseAiSyncCachedPreview } from "./acme-sync-ai-preview-state";
import { shouldReportAiRequestError } from "./acme-sync-ai-request-state";
import {
  buildRsyncAiSyncPrompt,
  buildSubtreeAiSyncPrompt,
  getAiSyncModalDescription,
  getAiSyncStepLabels,
} from "./acme-sync-ai-sync-state";
import { shouldApplyAsyncResultForProject } from "./acme-sync-async-guards";
import {
  getConfirmDeleteWarningMessage,
  getConfirmLoadingMessage,
  getConfirmModalDescription,
  getConfirmPreviewFallbackMessage,
  getConfirmSubtreeSummaryMessage,
  shouldReuseConfirmCachedPreview,
} from "./acme-sync-confirm-preview-state";
import { canConfirmSyncAction } from "./acme-sync-confirm-state";
import {
  buildFocusListenerSetupErrorMessage,
  buildLastModifiedFailureState,
  formatSyncExecutionError,
} from "./acme-sync-error-state";
import {
  buildPreviewConflictResolutionState,
  buildPreviewFileActionState,
  buildSubtreePreviewModalState,
  getPreviewModalDescription,
  getPreviewModalTitle,
  getUnresolvedConflictCount,
  getUnresolvedFileDecisionCount,
} from "./acme-sync-preview-modal-state";
import { AcmeSyncProfileModal } from "./acme-sync-profile-modal";
import { shouldDisablePrimaryPathChange } from "./acme-sync-primary-path-state";
import {
  getNextConflictResolutionState,
  getNextConflictResolutionStateAfterPreviewRefresh,
  getNextFileActionStateAfterPreviewRefresh,
} from "./acme-sync-preview-selection-state";
import {
  buildPreviewRequestForAction,
  buildPreviewRequestsForProfile,
  canPreviewAction,
  getPreviewButtonLabel,
  getSyncDirectionForAction,
} from "./acme-sync-profile-state";
import { getStatusStateAfterPrefetchFailure } from "./acme-sync-prefetch-failure-state";
import { clearPreviewPrefetchErrorForProject } from "./acme-sync-preview-prefetch-state";
import {
  buildRsyncPreviewCacheEntries,
  getPreviewCacheKey,
  resolvePreviewPrimaryPath,
  shouldReopenPreviewAfterApply,
} from "./acme-sync-preview-cache-state";
import {
  buildRsyncStatusFailureState,
  formatRsyncStatusLabel,
  getRsyncStatusBadgeTone,
  shouldHighlightPullAction,
  shouldHighlightPushAction,
} from "./acme-sync-rsync-state";
import {
  buildSubtreeConfirmDetails,
  buildSubtreeStatusFailureState,
  clearSubtreeStatusForProject,
  formatSubtreeProjectLine,
  formatSubtreeSourceSyncLine,
  formatSubtreeStatusLabel,
  getSubtreeStatusBadgeTone,
  shouldApplySubtreeStatusResult,
} from "./acme-sync-subtree-state";
import {
  getAiSyncActionTitle,
  getConflictResolutionLabel,
  getPrimaryPathEmptyState,
  getPrimarySectionComment,
  getPrimarySectionDescription,
  getPrimarySectionTitle,
  getProjectSectionDescription,
  getProjectSectionTitle,
  getSubtreeHistoryFallbackMessage,
  getSyncActionLabel,
  getSyncScreenDescription,
} from "./acme-sync-wording";

type SyncAction = "push" | "pull";

interface ConfirmState {
  action: SyncAction;
  profile: SyncProfile;
  selectedConflictResolutions?: Record<
    string,
    SyncConflictResolution | undefined
  >;
  selectedFileActions?: Record<string, SyncPreviewFileAction | undefined>;
}

interface AiSyncModalState {
  projectPath: string;
  mode: AiSyncMode;
  command: string;
  prompt: string;
}

const getPreviewKey = (
  projectPath: string,
  action: SyncAction,
  primaryPath?: string | null,
) => getPreviewCacheKey(projectPath, primaryPath ?? "", action);

const getPreviewPrimaryPathForProfile = (
  profile: Pick<SyncProfile, "primaryPath">,
  fallbackPrimaryPath?: string | null,
) => resolvePreviewPrimaryPath(profile.primaryPath, fallbackPrimaryPath);

const getChangeTypeBadgeClass = (changeType: SyncChangeType) => {
  if (changeType === "added") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (changeType === "deleted") {
    return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300";
  }

  return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
};

const formatChangeTypeLabel = (changeType: SyncChangeType) => {
  if (changeType === "added") return "Added";
  if (changeType === "deleted") return "Deleted";
  return "Modified";
};

const hasSummaryChanges = (summary?: SyncPreviewSummary | null) => {
  if (!summary) return false;
  return summary.added + summary.modified + summary.deleted > 0;
};

const makeConflictKey = (projectPath: string, filePath: string) =>
  `${projectPath}::${filePath}`;

const getConflictPaths = (
  pushFiles: SyncPreviewFile[],
  pullFiles: SyncPreviewFile[],
) => {
  const pushPaths = new Set(pushFiles.map((file) => file.path));
  const pullPaths = new Set(pullFiles.map((file) => file.path));

  const conflicts = new Set<string>();
  for (const path of pushPaths) {
    if (pullPaths.has(path)) {
      conflicts.add(path);
    }
  }

  return conflicts;
};

// Helper to parse the timestamp string and return a Date object
const parseModifiedDate = (dateStr?: string) => {
  if (!dateStr || dateStr === "Not Found" || dateStr === "Error") return null;
  // expects format: "2026-02-27 15:10:00"
  return new Date(dateStr.replace(" ", "T"));
};

const getPrimaryRemoteBadgeClass = (status?: PrimaryRemoteStatus) => {
  if (status?.status === "synced") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (status?.status === "unpublished") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  return "border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-300";
};

const getPrimaryRemoteBadgeLabel = (status?: PrimaryRemoteStatus) => {
  if (status?.status === "synced") {
    return "Synced to Remote";
  }

  if (status?.status === "unpublished") {
    return "Not Synced to Remote";
  }

  return "Remote Unknown";
};

const getPrimaryRemoteDetail = (status?: PrimaryRemoteStatus) => {
  if (!status) {
    return null;
  }

  if (status.status === "unknown") {
    return status.message ?? "Could not determine remote sync status";
  }

  if (status.status === "synced") {
    return null;
  }

  const details: string[] = [];

  if (status.workingTreeDirty) {
    details.push("Uncommitted changes in primary repo");
  }

  if (status.aheadCount > 0) {
    details.push(`Ahead of remote by ${status.aheadCount} commits`);
  }

  return details.join(" • ");
};

export function AcmeSync() {
  const {
    primaryPath,
    profiles,
    setPrimaryPath,
    addProjectProfile,
    removeProjectProfile,
    updateProfileMode,
    updateRsyncSettings,
    updateSubtreeSettings,
  } = useAcmeStore();
  const mainPath = primaryPath;
  const projectProfiles = profiles;
  const paths = projectProfiles.map((profile) => profile.projectPath);
  const addToast = useToastStore((state) => state.addToast);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<
    Record<string, LastModifiedEntry>
  >({});
  const [primaryRepoMetadataByPath, setPrimaryRepoMetadataByPath] = useState<
    Record<string, RepoMetadata>
  >({});
  const [primaryRemoteStatusByPath, setPrimaryRemoteStatusByPath] = useState<
    Record<string, PrimaryRemoteStatus>
  >({});
  const [subtreeRepoMetadataByPath, setSubtreeRepoMetadataByPath] = useState<
    Record<string, RepoMetadata>
  >({});
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<PreviewModalState | null>(
    null,
  );
  const [selectedPreviewFile, setSelectedPreviewFile] =
    useState<SyncPreviewFile | null>(null);
  const [showConflictOnly, setShowConflictOnly] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<string>("");
  const [selectedConflictDetail, setSelectedConflictDetail] =
    useState<SyncConflictDetail | null>(null);
  const [isDiffLoading, setIsDiffLoading] = useState(false);
  const [diffError, setDiffError] = useState<string | null>(null);
  const diffRequestIdRef = useRef(0);
  const previewRequestIdRef = useRef(0);
  const aiSyncRequestIdRef = useRef(0);
  const confirmPreviewRequestIdRef = useRef(0);
  const [latestPreviewByAction, setLatestPreviewByAction] = useState<
    Record<string, SyncPreviewResult>
  >({});
  const [latestRsyncStatusByProject, setLatestRsyncStatusByProject] = useState<
    Record<string, SyncStatusResult>
  >({});
  const [latestSubtreeStatusByProject, setLatestSubtreeStatusByProject] =
    useState<Record<string, SyncStatusResult>>({});
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [isConfirmPreviewLoading, setIsConfirmPreviewLoading] = useState(false);
  const [confirmPreviewError, setConfirmPreviewError] = useState<string | null>(
    null,
  );
  const [pendingConfirmAfterPreview, setPendingConfirmAfterPreview] =
    useState(false);
  const prefetchPreviewRequestIdRef = useRef(0);
  const subtreeStatusRequestIdRef = useRef(0);
  const [indicatorLoadingByProject, setIndicatorLoadingByProject] = useState<
    Record<string, boolean>
  >({});
  const [previewPrefetchErrorByProject, setPreviewPrefetchErrorByProject] =
    useState<Record<string, string | null>>({});
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);
  const [resolvingConflictKey, setResolvingConflictKey] = useState<
    string | null
  >(null);
  const [isApplyingSelectedFileAction, setIsApplyingSelectedFileAction] =
    useState(false);
  const [conflictResolveError, setConflictResolveError] = useState<
    string | null
  >(null);
  const [aiSyncModal, setAiSyncModal] = useState<AiSyncModalState | null>(null);
  const [profileModalProfileId, setProfileModalProfileId] = useState<
    string | null
  >(null);
  const mainPathRef = useRef(mainPath);
  const previewModalRef = useRef<PreviewModalState | null>(null);
  const projectProfilesRef = useRef(projectProfiles);
  const subtreeProfilesRef = useRef(
    projectProfiles.filter((profile) => profile.mode === "subtree"),
  );
  const prefetchPreviewIndicatorsRef = useRef<() => Promise<void>>(
    async () => undefined,
  );

  useEffect(() => {
    mainPathRef.current = mainPath;
  }, [mainPath]);

  useEffect(() => {
    previewModalRef.current = previewModal;
  }, [previewModal]);

  useEffect(() => {
    projectProfilesRef.current = projectProfiles;
    subtreeProfilesRef.current = projectProfiles.filter(
      (profile) => profile.mode === "subtree",
    );
  }, [projectProfiles]);

  const fetchLastModified = useCallback(async (path: string) => {
    try {
      const result = await getLatestModified(path);
      const parsed = parseModifiedDate(result);
      setLastModified((prev) => ({
        ...prev,
        [path]: {
          display: result,
          time: parsed ? parsed.getTime() : null,
          errorMessage: null,
        },
      }));
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : `Failed to refresh modified timestamp for ${path}`;
      setLastModified((prev) => ({
        ...prev,
        [path]: buildLastModifiedFailureState(message),
      }));
    }
  }, []);

  const fetchPrimaryRepoMetadata = useCallback(async (path: string) => {
    try {
      const metadata = await getRepoMetadata(path);
      setPrimaryRepoMetadataByPath((prev) => ({
        ...prev,
        [path]: metadata,
      }));
    } catch (error) {
      console.error(error);
      setPrimaryRepoMetadataByPath((prev) => ({
        ...prev,
        [path]: {
          branch: "Unknown",
          lastCommitMessage: "Unknown",
          lastUpdated: "Unknown",
        },
      }));
    }
  }, []);

  const fetchPrimaryRemoteStatus = useCallback(async (path: string) => {
    try {
      const status = await getPrimaryRemoteStatus(path);
      setPrimaryRemoteStatusByPath((prev) => ({
        ...prev,
        [path]: status,
      }));
    } catch (error) {
      console.error(error);
      setPrimaryRemoteStatusByPath((prev) => ({
        ...prev,
        [path]: {
          upstreamBranch: null,
          workingTreeDirty: false,
          aheadCount: 0,
          behindCount: 0,
          status: "unknown",
          message: "Could not determine remote sync status",
        },
      }));
    }
  }, []);

  const fetchSubtreeRepoMetadata = useCallback(async (path: string) => {
    try {
      const metadata = await getRepoMetadata(path);
      setSubtreeRepoMetadataByPath((prev) => ({
        ...prev,
        [path]: metadata,
      }));
    } catch (error) {
      console.error(error);
      setSubtreeRepoMetadataByPath((prev) => ({
        ...prev,
        [path]: {
          branch: "Unknown",
          lastCommitMessage: "Unknown",
          lastUpdated: "Unknown",
        },
      }));
    }
  }, []);

  const prefetchPreviewIndicators = useCallback(async () => {
    if (!mainPath || projectProfiles.length === 0) return;

    const requestId = prefetchPreviewRequestIdRef.current + 1;
    prefetchPreviewRequestIdRef.current = requestId;

    setIndicatorLoadingByProject((prev) => {
      const next = { ...prev };
      for (const profile of projectProfiles) {
        next[profile.projectPath] = true;
      }
      return next;
    });
    setPreviewPrefetchErrorByProject((prev) => {
      const next = { ...prev };
      for (const profile of projectProfiles) {
        next[profile.projectPath] = null;
      }
      return next;
    });

    await Promise.all(
      projectProfiles.map(async (profile) => {
        const projectPath = profile.projectPath;

        try {
          const previewPrimaryPath = resolvePreviewPrimaryPath(
            profile.primaryPath,
            mainPath,
          );
          const requests = buildPreviewRequestsForProfile(profile);
          const results = await Promise.all(
            requests.map(async (request) => {
              if (request.mode === "subtree") {
                return {
                  action: request.action,
                  subtreeStatus: await previewSubtreeSync(
                    profile,
                    "from-primary",
                  ),
                };
              }

              if (!request.src || !request.dest) {
                throw new Error(
                  "Rsync preview request is missing source or destination.",
                );
              }

              return {
                action: request.action,
                result: await previewSyncChanges(
                  request.src,
                  request.dest,
                  request.action === "push" ? "to-primary" : "from-primary",
                ),
              };
            }),
          );

          if (requestId !== prefetchPreviewRequestIdRef.current) {
            return;
          }

          const rsyncEntries = results.filter(
            (
              entry,
            ): entry is { action: SyncAction; result: SyncPreviewResult } =>
              entry !== null && "result" in entry,
          );
          setLatestPreviewByAction((prev) => ({
            ...prev,
            ...Object.fromEntries(
              rsyncEntries.map((entry) => [
                getPreviewKey(projectPath, entry.action, previewPrimaryPath),
                entry.result,
              ]),
            ),
          }));
          if (profile.mode === "rsync") {
            const status = await getSyncStatus(profile);
            if (requestId !== prefetchPreviewRequestIdRef.current) {
              return;
            }
            setLatestRsyncStatusByProject((prev) => ({
              ...prev,
              [projectPath]: status,
            }));
          }

          const subtreeEntry = results.find(
            (
              entry,
            ): entry is {
              action: SyncAction;
              subtreeStatus: SyncStatusResult;
            } => entry !== null && "subtreeStatus" in entry,
          );
          if (subtreeEntry) {
            setLatestSubtreeStatusByProject((prev) => ({
              ...prev,
              [projectPath]: subtreeEntry.subtreeStatus,
            }));
          }
        } catch (error) {
          if (requestId === prefetchPreviewRequestIdRef.current) {
            const message =
              error instanceof Error ? error.message : String(error);
            setPreviewPrefetchErrorByProject((prev) => ({
              ...prev,
              [projectPath]: message,
            }));
            const failureStatus = getStatusStateAfterPrefetchFailure(
              profile.mode,
              message,
            );
            if (profile.mode === "subtree") {
              setLatestSubtreeStatusByProject((prev) => ({
                ...prev,
                [projectPath]: failureStatus,
              }));
            } else {
              setLatestRsyncStatusByProject((prev) => ({
                ...prev,
                [projectPath]: failureStatus,
              }));
            }
          }
        } finally {
          if (requestId === prefetchPreviewRequestIdRef.current) {
            setIndicatorLoadingByProject((prev) => ({
              ...prev,
              [projectPath]: false,
            }));
          }
        }
      }),
    );
  }, [mainPath, projectProfiles]);

  useEffect(() => {
    prefetchPreviewIndicatorsRef.current = prefetchPreviewIndicators;
  }, [prefetchPreviewIndicators]);

  const preloadSubtreeStatuses = useCallback(
    async (profiles: SyncProfile[]) => {
      const subtreeProfiles = profiles.filter(
        (profile) => profile.mode === "subtree",
      );

      if (subtreeProfiles.length === 0) {
        return;
      }

      const requestId = subtreeStatusRequestIdRef.current + 1;
      subtreeStatusRequestIdRef.current = requestId;

      await Promise.all(
        subtreeProfiles.map(async (profile) => {
          try {
            const status = await previewSubtreeSync(profile, "from-primary");
            if (
              !shouldApplySubtreeStatusResult({
                requestId,
                currentRequestId: subtreeStatusRequestIdRef.current,
                projectPath: profile.projectPath,
                activeProjectPaths: projectProfilesRef.current.map(
                  (entry) => entry.projectPath,
                ),
              })
            ) {
              return;
            }
            setLatestSubtreeStatusByProject((prev) => ({
              ...prev,
              [profile.projectPath]: status,
            }));
          } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : String(error);
            if (
              !shouldApplySubtreeStatusResult({
                requestId,
                currentRequestId: subtreeStatusRequestIdRef.current,
                projectPath: profile.projectPath,
                activeProjectPaths: projectProfilesRef.current.map(
                  (entry) => entry.projectPath,
                ),
              })
            ) {
              return;
            }
            setLatestSubtreeStatusByProject((prev) => ({
              ...prev,
              [profile.projectPath]: buildSubtreeStatusFailureState(message),
            }));
          }
        }),
      );
    },
    [],
  );

  useEffect(() => {
    let active = true;
    let unlisten: (() => void) | undefined;

    const handleFocusChange = ({ payload: focused }: { payload: boolean }) => {
      const currentMainPath = mainPathRef.current;
      if (focused && currentMainPath) {
        void fetchLastModified(currentMainPath);
        void fetchPrimaryRepoMetadata(currentMainPath);
        void fetchPrimaryRemoteStatus(currentMainPath);

        for (const profile of projectProfilesRef.current) {
          if (profile.mode === "rsync") {
            void fetchLastModified(profile.projectPath);
          }
        }

        const subtreeRepoRoots = [
          ...new Set(
            projectProfilesRef.current
              .filter((profile) => profile.mode === "subtree")
              .map((profile) => profile.subtree?.repoRoot)
              .filter((path): path is string => !!path),
          ),
        ];

        for (const path of subtreeRepoRoots) {
          void fetchSubtreeRepoMetadata(path);
        }
        void prefetchPreviewIndicatorsRef.current();
      }
    };

    getCurrentWindow()
      .onFocusChanged(handleFocusChange)
      .then((fn) => {
        if (active) {
          unlisten = fn;
          return;
        }

        fn();
      })
      .catch((error) => {
        if (active) {
          addToast(buildFocusListenerSetupErrorMessage(error), "error");
        }
      });

    return () => {
      active = false;
      unlisten?.();
    };
  }, [
    addToast,
    fetchLastModified,
    fetchPrimaryRemoteStatus,
    fetchPrimaryRepoMetadata,
    fetchSubtreeRepoMetadata,
    preloadSubtreeStatuses,
  ]);

  useEffect(() => {
    if (!mainPath) {
      return;
    }

    void fetchLastModified(mainPath);
    void fetchPrimaryRepoMetadata(mainPath);
    void fetchPrimaryRemoteStatus(mainPath);
  }, [
    fetchLastModified,
    fetchPrimaryRemoteStatus,
    fetchPrimaryRepoMetadata,
    mainPath,
  ]);

  useEffect(() => {
    subtreeStatusRequestIdRef.current += 1;

    if (!mainPath) {
      setLatestPreviewByAction({});
      setLatestRsyncStatusByProject({});
      setLatestSubtreeStatusByProject({});
      setPreviewPrefetchErrorByProject({});
      setIndicatorLoadingByProject({});
      return;
    }

    setLatestPreviewByAction({});
    setLatestRsyncStatusByProject({});
    setLatestSubtreeStatusByProject({});
    setPreviewPrefetchErrorByProject({});
    setIndicatorLoadingByProject({});

    const subtreeProfiles = projectProfiles.filter(
      (profile) => profile.mode === "subtree",
    );
    const subtreeRepoRoots = [
      ...new Set(
        subtreeProfiles
          .map((profile) => profile.subtree?.repoRoot)
          .filter((path): path is string => !!path),
      ),
    ];

    for (const path of subtreeRepoRoots) {
      void fetchSubtreeRepoMetadata(path);
    }
    void prefetchPreviewIndicators();
  }, [
    fetchSubtreeRepoMetadata,
    mainPath,
    prefetchPreviewIndicators,
    projectProfiles,
  ]);

  const handleSetMainPath = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected && typeof selected === "string") {
      closePreviewModal();
      closeConfirmModal();
      aiSyncRequestIdRef.current += 1;
      setAiSyncModal(null);
      setPrimaryPath(selected);
    }
  };

  const handleAddProject = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected && typeof selected === "string") {
      addProjectProfile(selected);
    }
  };

  const loadPreviewForAction = async (
    profile: SyncProfile,
    action: SyncAction,
  ) => {
    if (!mainPath) return;

    const requestId = previewRequestIdRef.current + 1;
    previewRequestIdRef.current = requestId;

    const request = buildPreviewRequestForAction(profile, action);
    if (!request) {
      return;
    }

    const projectPath = profile.projectPath;
    if (request.mode === "rsync" && (!request.src || !request.dest)) {
      addToast("Preview request is missing source or destination.", "error");
      return;
    }

    const src =
      request.mode === "rsync"
        ? request.src
        : (profile.primaryPath ?? mainPath);
    const dest = request.mode === "rsync" ? request.dest : profile.projectPath;
    if (!src || !dest) {
      addToast("Preview request is missing source or destination.", "error");
      return;
    }

    try {
      setIsPreviewLoading(true);
      setPreviewError(null);

      if (request.mode === "subtree") {
        const result = (await previewSubtreeSync(
          profile,
          "from-primary",
        )) as Extract<SyncStatusResult, { mode: "subtree" }>;
        if (requestId !== previewRequestIdRef.current) {
          return;
        }
        setLatestSubtreeStatusByProject((prev) => ({
          ...prev,
          [projectPath]: result,
        }));
        setPreviewModal(
          buildSubtreePreviewModalState({
            action: "pull",
            projectPath,
            status: result,
          }),
        );
        setSelectedPreviewFile(null);
        setShowConflictOnly(false);
        setSelectedDiff("");
        setSelectedConflictDetail(null);
        setDiffError(null);
        return;
      }

      const result = await previewSyncChanges(
        src,
        dest,
        action === "push" ? "to-primary" : "from-primary",
      );
      if (requestId !== previewRequestIdRef.current) {
        return;
      }
      const preservedConflictResolutions =
        previewModalRef.current?.mode === "rsync" &&
        previewModalRef.current.projectPath === projectPath &&
        previewModalRef.current.action === action
          ? getNextConflictResolutionStateAfterPreviewRefresh({
              previousSelections:
                previewModalRef.current.selectedConflictResolutions,
              nextAllowedPaths: (result.conflicts ?? []).map(
                (conflict) => conflict.path,
              ),
            })
          : buildPreviewConflictResolutionState();
      const preservedFileActions =
        previewModalRef.current?.mode === "rsync" &&
        previewModalRef.current.projectPath === projectPath &&
        previewModalRef.current.action === action
          ? getNextFileActionStateAfterPreviewRefresh({
              previousSelections: previewModalRef.current.selectedFileActions,
              nextAllowedPaths: (result.decisions ?? []).map(
                (decision) => decision.path,
              ),
            })
          : buildPreviewFileActionState();
      setPreviewModal({
        mode: "rsync",
        action,
        projectPath,
        src,
        dest,
        result,
        selectedConflictResolutions: preservedConflictResolutions,
        selectedFileActions: preservedFileActions,
      });
      const initialSelectedFile =
        (result.decisions ?? []).length > 0
          ? (result.files.find((file) =>
              (result.decisions ?? []).some(
                (decision) => decision.path === file.path,
              ),
            ) ?? null)
          : null;
      setSelectedPreviewFile(initialSelectedFile);
      setShowConflictOnly(false);
      setSelectedDiff("");
      setSelectedConflictDetail(null);
      setDiffError(null);
      const previewPrimaryPath = getPreviewPrimaryPathForProfile(
        profile,
        mainPath,
      );
      setLatestPreviewByAction((prev) => ({
        ...prev,
        [getPreviewKey(projectPath, action, previewPrimaryPath)]: result,
      }));
    } catch (error) {
      if (requestId !== previewRequestIdRef.current) {
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      setPreviewError(message);
      addToast(`Preview failed: ${message}`, "error");
    } finally {
      if (requestId === previewRequestIdRef.current) {
        setIsPreviewLoading(false);
      }
    }
  };

  const rsyncPreviewRefreshRequestIdRef = useRef(0);

  const refreshRsyncPreviewCache = async (profile: SyncProfile) => {
    if (!profile.primaryPath) {
      return;
    }

    const primaryPath = profile.primaryPath;
    const requestId = rsyncPreviewRefreshRequestIdRef.current + 1;
    rsyncPreviewRefreshRequestIdRef.current = requestId;

    try {
      const [pushPreview, pullPreview, status] = await Promise.all([
        previewSyncChanges(profile.projectPath, primaryPath, "to-primary"),
        previewSyncChanges(primaryPath, profile.projectPath, "from-primary"),
        getSyncStatus(profile),
      ]);

      if (
        !shouldApplyAsyncResultForProject({
          requestId,
          currentRequestId: rsyncPreviewRefreshRequestIdRef.current,
          projectPath: profile.projectPath,
          activeProjectPaths: projectProfilesRef.current.map(
            (entry) => entry.projectPath,
          ),
        })
      ) {
        return;
      }

      setLatestPreviewByAction((prev) => ({
        ...prev,
        ...buildRsyncPreviewCacheEntries({
          projectPath: profile.projectPath,
          primaryPath,
          pushPreview,
          pullPreview,
        }),
      }));
      setLatestRsyncStatusByProject((prev) => ({
        ...prev,
        [profile.projectPath]: status,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        !shouldApplyAsyncResultForProject({
          requestId,
          currentRequestId: rsyncPreviewRefreshRequestIdRef.current,
          projectPath: profile.projectPath,
          activeProjectPaths: projectProfilesRef.current.map(
            (entry) => entry.projectPath,
          ),
        })
      ) {
        return;
      }

      console.error(error);
      setLatestRsyncStatusByProject((prev) => ({
        ...prev,
        [profile.projectPath]: buildRsyncStatusFailureState(),
      }));
      setPreviewPrefetchErrorByProject((prev) => ({
        ...prev,
        [profile.projectPath]: message,
      }));
      addToast(`Preview refresh failed: ${message}`, "error");
    }
  };

  const loadPreviewDiff = async (file: SyncPreviewFile) => {
    if (!previewModal || previewModal.mode !== "rsync") return;

    const requestId = diffRequestIdRef.current + 1;
    diffRequestIdRef.current = requestId;
    const conflict = (previewModal.result.conflicts ?? []).find(
      (entry) => entry.path === file.path,
    );

    try {
      setSelectedPreviewFile(file);
      setIsDiffLoading(true);
      setDiffError(null);
      setSelectedDiff("");
      setSelectedConflictDetail(null);

      if (conflict) {
        const detail = await getSyncConflictDetail(
          previewModal.src,
          previewModal.dest,
          file.path,
          getSyncDirectionForAction(previewModal.action),
        );

        if (requestId !== diffRequestIdRef.current) {
          return;
        }

        setSelectedConflictDetail(detail);
        return;
      }

      const patch = await previewSyncFileDiff(
        previewModal.src,
        previewModal.dest,
        file.path,
        file.changeType,
      );

      if (requestId !== diffRequestIdRef.current) {
        return;
      }

      setSelectedDiff(patch);
    } catch (error) {
      if (requestId !== diffRequestIdRef.current) {
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      setDiffError(message);
      setSelectedDiff("");
      setSelectedConflictDetail(null);
    } finally {
      if (requestId === diffRequestIdRef.current) {
        setIsDiffLoading(false);
      }
    }
  };

  const closePreviewModal = () => {
    diffRequestIdRef.current += 1;
    previewRequestIdRef.current += 1;
    setPreviewModal(null);
    setSelectedPreviewFile(null);
    setShowConflictOnly(false);
    setSelectedDiff("");
    setSelectedConflictDetail(null);
    setIsPreviewLoading(false);
    setIsDiffLoading(false);
    setDiffError(null);
    setPendingConfirmAfterPreview(false);
  };

  const continuePreviewToConfirm = () => {
    if (!previewModal || previewModal.mode !== "rsync") return;

    const selectedConflictResolutions =
      previewModal.selectedConflictResolutions;
    const selectedFileActions = previewModal.selectedFileActions;
    const profile = projectProfiles.find(
      (entry) => entry.projectPath === previewModal.projectPath,
    );

    closePreviewModal();

    if (!profile) {
      return;
    }

    setConfirmState({
      action: previewModal.action,
      profile,
      selectedConflictResolutions,
      selectedFileActions,
    });
    void requestSyncConfirmation(previewModal.action, profile, {
      selectedConflictResolutions,
      selectedFileActions,
    });
  };

  const applySelectedPreviewFileAction = async () => {
    if (
      !previewModal ||
      previewModal.mode !== "rsync" ||
      !mainPath ||
      !selectedPreviewFile
    ) {
      return;
    }

    const decision = (previewModal.result.decisions ?? []).find(
      (entry) => entry.path === selectedPreviewFile.path,
    );
    if (!decision) {
      return;
    }

    const selectedAction = previewModal.selectedFileActions[decision.path];
    if (!selectedAction) {
      return;
    }

    try {
      setIsApplyingSelectedFileAction(true);
      setDiffError(null);

      const sourceRoot =
        previewModal.action === "push" ? previewModal.projectPath : mainPath;
      const targetRoot =
        previewModal.action === "push" ? mainPath : previewModal.projectPath;

      const applyPreviewProjectPath = previewModal.projectPath;
      const applyPreviewAction = previewModal.action;
      const previewFingerprint = previewModal.result.fingerprint;
      if (!previewFingerprint) {
        throw new Error("Preview fingerprint is missing. Refresh preview and try again.");
      }

      const previewProfile = projectProfiles.find(
        (entry) => entry.projectPath === previewModal.projectPath,
      );
      if (!previewProfile) {
        throw new Error("Sync profile not found for preview action.");
      }

      await applySingleRsyncPreviewAction({
        src: sourceRoot,
        dest: targetRoot,
        direction:
          previewModal.action === "push" ? "to-primary" : "from-primary",
        fingerprint: previewFingerprint,
        path: decision.path,
        action: selectedAction,
        changeType: decision.kind,
        useGitSafetyChecks: previewProfile.rsync?.useGitSafetyChecks ?? false,
      });

      await Promise.all([
        fetchLastModified(previewModal.projectPath),
        fetchLastModified(mainPath),
        fetchPrimaryRemoteStatus(mainPath),
        previewProfile.mode === "rsync"
          ? getSyncStatus(previewProfile).then((status) => {
              setLatestRsyncStatusByProject((prev) => ({
                ...prev,
                [previewProfile.projectPath]: status,
              }));
            })
          : Promise.resolve(),
      ]);

      if (
        shouldReopenPreviewAfterApply({
          activePreviewProjectPath: previewModalRef.current?.projectPath ?? null,
          activePreviewAction:
            previewModalRef.current?.mode === "rsync"
              ? previewModalRef.current.action
              : null,
          activePreviewFingerprint:
            previewModalRef.current?.mode === "rsync"
              ? previewModalRef.current.result.fingerprint ?? null
              : null,
          applyProjectPath: applyPreviewProjectPath,
          applyAction: applyPreviewAction,
          applyPreviewFingerprint: previewFingerprint,
        })
      ) {
        await loadPreviewForAction(previewProfile, applyPreviewAction);
      }
      addToast(`Applied action for ${decision.path}.`, "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setDiffError(message);
      addToast(`Apply selected action failed: ${message}`, "error");
    } finally {
      setIsApplyingSelectedFileAction(false);
    }
  };

  const selectPreviewFile = (file: SyncPreviewFile) => {
    setSelectedPreviewFile(file);
    setIsDiffLoading(false);
    setDiffError(null);
    setSelectedDiff("");
    setSelectedConflictDetail(null);
  };

  const closeConfirmModal = () => {
    confirmPreviewRequestIdRef.current += 1;
    setConfirmState(null);
    setIsConfirmPreviewLoading(false);
    setConfirmPreviewError(null);
    setPendingConfirmAfterPreview(false);
    setConflictResolveError(null);
    setIsResolvingConflict(false);
    setResolvingConflictKey(null);
  };

  const resolveConflictFile = async (
    projectPath: string,
    filePath: string,
    resolution: "push" | "pull",
  ) => {
    if (!mainPath) return;

    try {
      setIsResolvingConflict(true);
      setResolvingConflictKey(makeConflictKey(projectPath, filePath));
      setConflictResolveError(null);

      const profile = projectProfiles.find(
        (entry) => entry.projectPath === projectPath,
      );
      const previewPrimaryPath = getPreviewPrimaryPathForProfile(
        profile ?? { primaryPath: null },
        mainPath,
      );
      const pushFile = latestPreviewByAction[
        getPreviewKey(projectPath, "push", previewPrimaryPath)
      ]?.files.find((file) => file.path === filePath);
      const pullFile = latestPreviewByAction[
        getPreviewKey(projectPath, "pull", previewPrimaryPath)
      ]?.files.find((file) => file.path === filePath);
      const selectedFile = resolution === "push" ? pushFile : pullFile;

      if (!selectedFile) {
        throw new Error(
          "Conflict preview is stale. Refresh preview and try again.",
        );
      }

      const targetRoot = resolution === "push" ? mainPath : projectPath;
      const sourceRoot = resolution === "push" ? projectPath : mainPath;
      const previewActionKey = getPreviewKey(
        projectPath,
        resolution === "push" ? "push" : "pull",
        previewPrimaryPath,
      );
      const preview = latestPreviewByAction[previewActionKey];
      const previewFingerprint = preview?.fingerprint;

      if (!previewFingerprint) {
        throw new Error("Conflict preview is stale. Refresh preview and try again.");
      }

      await applySingleRsyncPreviewAction({
        src: sourceRoot,
        dest: targetRoot,
        direction: resolution === "push" ? "to-primary" : "from-primary",
        fingerprint: previewFingerprint,
        path: filePath,
        action: "keep",
        changeType: selectedFile.changeType,
        useGitSafetyChecks:
          projectProfiles.find((entry) => entry.projectPath === projectPath)?.rsync
            ?.useGitSafetyChecks ?? false,
      });

      addToast(
        `Resolved ${filePath} using ${resolution === "push" ? "project" : "main"} version.`,
        "success",
      );

      await Promise.all([
        fetchLastModified(projectPath),
        fetchLastModified(mainPath),
        fetchPrimaryRemoteStatus(mainPath),
        prefetchPreviewIndicators(),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setConflictResolveError(message);
      addToast(`Resolve conflict failed: ${message}`, "error");
    } finally {
      setIsResolvingConflict(false);
      setResolvingConflictKey(null);
    }
  };

  const requestSyncConfirmation = async (
    action: SyncAction,
    profile: SyncProfile,
    preservedSelections?: Pick<
      ConfirmState,
      "selectedConflictResolutions" | "selectedFileActions"
    >,
  ) => {
    if (!mainPath) return;

    const projectPath = profile.projectPath;

    setConfirmState((current) => ({
      action,
      profile,
      selectedConflictResolutions:
        preservedSelections?.selectedConflictResolutions ??
        current?.selectedConflictResolutions,
      selectedFileActions:
        preservedSelections?.selectedFileActions ?? current?.selectedFileActions,
    }));
    setPendingConfirmAfterPreview(false);
    setConfirmPreviewError(null);

    const requestId = confirmPreviewRequestIdRef.current + 1;
    confirmPreviewRequestIdRef.current = requestId;

    const previewPrimaryPath = resolvePreviewPrimaryPath(
      profile.primaryPath,
      mainPath,
    );
    const previewKey = getPreviewKey(projectPath, action, previewPrimaryPath);
    const oppositeAction: SyncAction = action === "push" ? "pull" : "push";
    const oppositeKey = getPreviewKey(
      projectPath,
      oppositeAction,
      previewPrimaryPath,
    );
    const prefetchError = previewPrefetchErrorByProject[projectPath];
    const subtreeStatus = latestSubtreeStatusByProject[projectPath];
    const canReuseCachedPreview = shouldReuseConfirmCachedPreview({
      projectPath,
      profileMode: profile.mode,
      prefetchError,
      preview: latestPreviewByAction[previewKey],
      oppositePreview: latestPreviewByAction[oppositeKey],
      subtreeStatus,
    });

    if (canReuseCachedPreview) {
      setIsConfirmPreviewLoading(false);
      return;
    }

    setIsConfirmPreviewLoading(true);

    try {
      if (profile.mode === "subtree") {
        const subtreePreview = await previewSubtreeSync(
          profile,
          "from-primary",
        );

        if (requestId !== confirmPreviewRequestIdRef.current) {
          return;
        }

        setLatestSubtreeStatusByProject((prev) => ({
          ...prev,
          [projectPath]: subtreePreview,
        }));
        return;
      }

      const previews = await Promise.all([
        latestPreviewByAction[previewKey]
          ? Promise.resolve(latestPreviewByAction[previewKey])
          : previewSyncChanges(
              action === "push" ? projectPath : previewPrimaryPath,
              action === "push" ? previewPrimaryPath : projectPath,
              action === "push" ? "to-primary" : "from-primary",
            ),
        latestPreviewByAction[oppositeKey]
          ? Promise.resolve(latestPreviewByAction[oppositeKey])
          : previewSyncChanges(
              oppositeAction === "push" ? projectPath : previewPrimaryPath,
              oppositeAction === "push" ? previewPrimaryPath : projectPath,
              oppositeAction === "push" ? "to-primary" : "from-primary",
            ),
      ]);

      if (requestId !== confirmPreviewRequestIdRef.current) {
        return;
      }

      setLatestPreviewByAction((prev) => ({
        ...prev,
        [previewKey]: previews[0],
        [oppositeKey]: previews[1],
      }));
    } catch (error) {
      if (requestId !== confirmPreviewRequestIdRef.current) {
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      setConfirmPreviewError(message);
    } finally {
      if (requestId === confirmPreviewRequestIdRef.current) {
        setIsConfirmPreviewLoading(false);
      }
    }
  };

  const confirmSyncAction = () => {
    if (!confirmState || !mainPath) return;

    const { action } = confirmState;
    const profile = projectProfiles.find(
      (entry) => entry.id === confirmState.profile.id,
    );

    if (!profile) {
      closeConfirmModal();
      addToast("Sync profile no longer exists. Refresh and try again.", "error");
      return;
    }

    const syncId = `${action}-${profile.projectPath}`;
    const direction = getSyncDirectionForAction(action);
    const previewPrimaryPath = getPreviewPrimaryPathForProfile(profile, mainPath);
    const preview = latestPreviewByAction[
      getPreviewKey(profile.projectPath, action, previewPrimaryPath)
    ];
    const hasPreviewConflicts = (preview?.conflicts?.length ?? 0) > 0;
    const hasPreviewDecisions = (preview?.decisions?.length ?? 0) > 0;
    const conflictRequest =
      profile.mode === "rsync" &&
      preview?.fingerprint &&
      (hasPreviewConflicts || hasPreviewDecisions)
        ? {
            fingerprint: preview.fingerprint,
            resolutions: (preview.conflicts ?? []).flatMap((conflict) => {
              const resolution =
                confirmState.selectedConflictResolutions?.[conflict.path];

              return resolution ? [{ path: conflict.path, resolution }] : [];
            }),
            fileActions: (preview.decisions ?? []).flatMap((decision) => {
              const action = confirmState.selectedFileActions?.[decision.path];

              return action ? [{ path: decision.path, action }] : [];
            }),
          }
        : undefined;

    setIsSyncing(syncId);
    setConfirmPreviewError(null);
    void executeSyncAction(profile, direction, conflictRequest)
      .then(() => {
        addToast("Sync completed successfully!", "success");
        void fetchLastModified(profile.projectPath);
        if (profile.primaryPath) {
          void fetchLastModified(profile.primaryPath);
          void fetchPrimaryRemoteStatus(profile.primaryPath);
          void fetchPrimaryRepoMetadata(profile.primaryPath);
        }
        if (profile.mode === "rsync") {
          setLatestPreviewByAction((prev) => {
            const previewPrimaryPath = resolvePreviewPrimaryPath(
              profile.primaryPath,
              mainPath,
            );
            const next = { ...prev };
            delete next[getPreviewKey(profile.projectPath, "push", previewPrimaryPath)];
            delete next[getPreviewKey(profile.projectPath, "pull", previewPrimaryPath)];
            return next;
          });
          setPreviewPrefetchErrorByProject((prev) => ({
            ...prev,
            [profile.projectPath]: null,
          }));
          void refreshRsyncPreviewCache(profile);
        }
        if (profile.mode === "subtree" && profile.subtree?.repoRoot) {
          setLatestSubtreeStatusByProject((prev) =>
            clearSubtreeStatusForProject(prev, profile.projectPath),
          );
          void fetchSubtreeRepoMetadata(profile.subtree.repoRoot);
          void preloadSubtreeStatuses([profile]);
        }
        closeConfirmModal();
      })
      .catch((error) => {
        console.error("Execution error:", error);
        const message = formatSyncExecutionError(error);
        setConfirmPreviewError(message);
        addToast(message, "error");
      })
      .finally(() => {
        setIsSyncing(null);
      });
  };

  const handleAddSubtree = (profile: SyncProfile) => {
    const syncId = `add-subtree-${profile.projectPath}`;

    setIsSyncing(syncId);
    void executeSubtreeAdd(profile)
      .then(() => {
        addToast('Added subtree "@acme" successfully!', "success");
        setLatestSubtreeStatusByProject((prev) =>
          clearSubtreeStatusForProject(prev, profile.projectPath),
        );
        setPreviewPrefetchErrorByProject((prev) =>
          clearPreviewPrefetchErrorForProject(prev, profile.projectPath),
        );
        void fetchLastModified(profile.projectPath);
        if (profile.primaryPath) {
          void fetchLastModified(profile.primaryPath);
          void fetchPrimaryRemoteStatus(profile.primaryPath);
          void fetchPrimaryRepoMetadata(profile.primaryPath);
        }
        if (profile.mode === "subtree" && profile.subtree?.repoRoot) {
          void fetchSubtreeRepoMetadata(profile.subtree.repoRoot);
          void preloadSubtreeStatuses([profile]);
        }
      })
      .catch((error) => {
        console.error("Subtree add error:", error);
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to add subtree "@acme".';
        addToast(message, "error");
      })
      .finally(() => {
        setIsSyncing(null);
      });
  };

  const handleRemoveProject = (profile: SyncProfile) => {
    if (previewModal?.projectPath === profile.projectPath) {
      closePreviewModal();
    }

    if (confirmState?.profile.id === profile.id) {
      closeConfirmModal();
    }

    aiSyncRequestIdRef.current += 1;
    if (aiSyncModal?.projectPath === profile.projectPath) {
      setAiSyncModal(null);
    }

    if (profileModalProfileId === profile.id) {
      setProfileModalProfileId(null);
    }

    prefetchPreviewRequestIdRef.current += 1;
    subtreeStatusRequestIdRef.current += 1;
    removeProjectProfile(profile.id);

    setLatestSubtreeStatusByProject((prev) =>
      clearSubtreeStatusForProject(prev, profile.projectPath),
    );
    setLatestRsyncStatusByProject((prev) => {
      const next = { ...prev };
      delete next[profile.projectPath];
      return next;
    });
    setLatestPreviewByAction((prev) => {
      const previewPrimaryPath = resolvePreviewPrimaryPath(
        profile.primaryPath,
        mainPath,
      );
      const next = { ...prev };
      delete next[getPreviewKey(profile.projectPath, "push", previewPrimaryPath)];
      delete next[getPreviewKey(profile.projectPath, "pull", previewPrimaryPath)];
      return next;
    });
    setPreviewPrefetchErrorByProject((prev) => {
      const next = { ...prev };
      delete next[profile.projectPath];
      return next;
    });
    setIndicatorLoadingByProject((prev) => {
      const next = { ...prev };
      delete next[profile.projectPath];
      return next;
    });
    setLastModified((prev) => {
      const next = { ...prev };
      delete next[profile.projectPath];
      return next;
    });
  };

  const getConfirmPreviewSummary = () => {
    if (!confirmState) return null;

    const previewPrimaryPath = resolvePreviewPrimaryPath(
      confirmState.profile.primaryPath,
      mainPath,
    );

    return latestPreviewByAction[
      getPreviewKey(
        confirmState.profile.projectPath,
        confirmState.action,
        previewPrimaryPath,
      )
    ]?.summary;
  };

  const getOppositePreviewSummary = () => {
    if (!confirmState) return null;

    const oppositeAction: SyncAction =
      confirmState.action === "push" ? "pull" : "push";

    const previewPrimaryPath = resolvePreviewPrimaryPath(
      confirmState.profile.primaryPath,
      mainPath,
    );

    return latestPreviewByAction[
      getPreviewKey(
        confirmState.profile.projectPath,
        oppositeAction,
        previewPrimaryPath,
      )
    ]?.summary;
  };

  const confirmPreviewSummary = getConfirmPreviewSummary();
  const oppositePreviewSummary = getOppositePreviewSummary();
  const confirmDeleteWarningMessage = getConfirmDeleteWarningMessage(
    confirmPreviewSummary,
  );
  const confirmSubtreeStatus = confirmState
    ? latestSubtreeStatusByProject[confirmState.profile.projectPath]
    : undefined;
  const confirmSubtreeSummaryMessage = confirmState
    ? getConfirmSubtreeSummaryMessage(confirmSubtreeStatus)
    : null;
  const confirmSubtreeDetails =
    buildSubtreeConfirmDetails(confirmSubtreeStatus);
  const isSubtreeConfirmMode = confirmState?.profile.mode === "subtree";
  const isSubtreeMisconfigured =
    isSubtreeConfirmMode && confirmSubtreeStatus?.mode === "subtree"
      ? confirmSubtreeStatus.state === "misconfigured" ||
        confirmSubtreeStatus.state === "missing_subtree"
      : false;
  const hasBidirectionalDivergence =
    confirmState?.profile.mode === "rsync" &&
    hasSummaryChanges(confirmPreviewSummary) &&
    hasSummaryChanges(oppositePreviewSummary);
  const confirmUnresolvedConflictCount =
    confirmState?.profile.mode === "rsync" && confirmPreview
      ? getUnresolvedConflictCount(
          confirmPreview,
          confirmState.selectedConflictResolutions ?? {},
        )
      : 0;
  const confirmUnresolvedFileDecisionCount =
    confirmState?.profile.mode === "rsync" && confirmPreview
      ? getUnresolvedFileDecisionCount(
          confirmPreview,
          confirmState.selectedFileActions ?? {},
        )
      : 0;
  const canConfirmCurrentSyncAction =
    canConfirmSyncAction({
      hasConfirmState: confirmState !== null,
      isSyncing: isSyncing !== null,
      isConfirmPreviewLoading,
      hasConfirmPreviewError: confirmPreviewError !== null,
      hasUnresolvedConflictSelections: confirmUnresolvedConflictCount > 0,
      hasUnresolvedFileSelections: confirmUnresolvedFileDecisionCount > 0,
    }) && !isSubtreeMisconfigured;

  const getPreviewSummary = (projectPath: string, action: SyncAction) => {
    const profile = projectProfiles.find((entry) => entry.projectPath === projectPath);
    const previewPrimaryPath = getPreviewPrimaryPathForProfile(
      profile ?? { primaryPath: null },
      mainPath,
    );

    return latestPreviewByAction[
      getPreviewKey(projectPath, action, previewPrimaryPath)
    ]?.summary;
  };

  const getConflictSetForProject = (projectPath: string) => {
    const profile = projectProfiles.find((entry) => entry.projectPath === projectPath);
    const previewPrimaryPath = getPreviewPrimaryPathForProfile(
      profile ?? { primaryPath: null },
      mainPath,
    );
    const pushFiles =
      latestPreviewByAction[
        getPreviewKey(projectPath, "push", previewPrimaryPath)
      ]?.files ?? [];
    const pullFiles =
      latestPreviewByAction[
        getPreviewKey(projectPath, "pull", previewPrimaryPath)
      ]?.files ?? [];

    return getConflictPaths(pushFiles, pullFiles);
  };

  const getConflictSetForPreviewModal = () => {
    if (!previewModal) return new Set<string>();

    const projectPath = previewModal.projectPath;
    const profile = projectProfiles.find((entry) => entry.projectPath === projectPath);
    const previewPrimaryPath = getPreviewPrimaryPathForProfile(
      profile ?? { primaryPath: null },
      mainPath,
    );
    const pushFiles =
      latestPreviewByAction[
        getPreviewKey(projectPath, "push", previewPrimaryPath)
      ]?.files ?? [];
    const pullFiles =
      latestPreviewByAction[
        getPreviewKey(projectPath, "pull", previewPrimaryPath)
      ]?.files ?? [];

    return getConflictPaths(pushFiles, pullFiles);
  };

  const previewModalUnresolvedConflictCount =
    previewModal?.mode === "rsync"
      ? getUnresolvedConflictCount(
          previewModal.result,
          previewModal.selectedConflictResolutions,
        )
      : 0;
  const previewModalUnresolvedFileDecisionCount =
    previewModal?.mode === "rsync"
      ? getUnresolvedFileDecisionCount(
          previewModal.result,
          previewModal.selectedFileActions,
        )
      : 0;
  const isPreviewModalContinueDisabled =
    pendingConfirmAfterPreview && previewModal?.mode === "rsync"
      ? previewModalUnresolvedConflictCount > 0 ||
        previewModalUnresolvedFileDecisionCount > 0
      : false;
  const subtreePreviewModal: SubtreePreviewModalState | null =
    previewModal?.mode === "subtree" ? previewModal : null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast(`${label} copied.`, "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addToast(`Copy ${label.toLowerCase()} failed: ${message}`, "error");
    }
  };

  const selectedProfileForModal =
    profileModalProfileId === null
      ? null
      : (projectProfiles.find(
          (profile) => profile.id === profileModalProfileId,
        ) ?? null);
  const isPrimaryPathChangeDisabled = shouldDisablePrimaryPathChange({
    isSyncing: isSyncing !== null,
    isPreviewLoading,
    isConfirmPreviewLoading,
  });

  const handleSaveProfileSettings = (profileId: string) => {
    return (nextProfile: {
      mode: SyncProfile["mode"];
      rsync: NonNullable<SyncProfile["rsync"]>;
      subtree: NonNullable<SyncProfile["subtree"]>;
    }) => {
      const projectPath =
        projectProfiles.find((profile) => profile.id === profileId)
          ?.projectPath ?? null;

      updateProfileMode(profileId, nextProfile.mode);
      updateRsyncSettings(profileId, nextProfile.rsync);
      updateSubtreeSettings(profileId, nextProfile.subtree);
      prefetchPreviewRequestIdRef.current += 1;
      subtreeStatusRequestIdRef.current += 1;

      if (projectPath && previewModal?.projectPath === projectPath) {
        closePreviewModal();
      }

      if (confirmState?.profile.id === profileId) {
        closeConfirmModal();
      }

      if (projectPath) {
        aiSyncRequestIdRef.current += 1;
      }
      if (projectPath && aiSyncModal?.projectPath === projectPath) {
        setAiSyncModal(null);
      }

      if (projectPath) {
        setLatestSubtreeStatusByProject((prev) =>
          clearSubtreeStatusForProject(prev, projectPath),
        );
        setLatestRsyncStatusByProject((prev) => {
          const next = { ...prev };
          delete next[projectPath];
          return next;
        });
        setLatestPreviewByAction((prev) => {
          const profile = projectProfiles.find(
            (entry) => entry.projectPath === projectPath,
          );
          const previewPrimaryPath = getPreviewPrimaryPathForProfile(
            profile ?? { primaryPath: null },
            mainPath,
          );
          const next = { ...prev };
          delete next[getPreviewKey(projectPath, "push", previewPrimaryPath)];
          delete next[getPreviewKey(projectPath, "pull", previewPrimaryPath)];
          return next;
        });
        setPreviewPrefetchErrorByProject((prev) => ({
          ...prev,
          [projectPath]: null,
        }));
      }

      setProfileModalProfileId(null);
    };
  };

  const openAiSyncModal = async (projectPath: string) => {
    if (!mainPath) return;

    const requestId = aiSyncRequestIdRef.current + 1;
    aiSyncRequestIdRef.current = requestId;

    const profile = projectProfiles.find(
      (entry) => entry.projectPath === projectPath,
    );
    if (!profile) {
      addToast("AI Sync profile not found.", "error");
      return;
    }

    if (profile.mode === "subtree") {
      try {
        const cachedStatus = latestSubtreeStatusByProject[projectPath];
        const status =
          cachedStatus?.mode === "subtree"
            ? cachedStatus
            : await previewSubtreeSync(profile, "from-primary");

        if (
          !shouldApplyAsyncResultForProject({
            requestId,
            currentRequestId: aiSyncRequestIdRef.current,
            projectPath,
            activeProjectPaths: projectProfilesRef.current.map(
              (entry) => entry.projectPath,
            ),
          })
        ) {
          return;
        }

        setLatestSubtreeStatusByProject((prev) => ({
          ...prev,
          [projectPath]: status,
        }));

        const result = buildSubtreeAiSyncPrompt({
          mainPath,
          profile,
          status,
        });

        setAiSyncModal({
          projectPath,
          mode: "subtree",
          command: result.command,
          prompt: result.prompt,
        });
      } catch (error) {
        if (
          !shouldReportAiRequestError({
            requestId,
            currentRequestId: aiSyncRequestIdRef.current,
            projectPath,
            activeProjectPaths: projectProfilesRef.current.map(
              (entry) => entry.projectPath,
            ),
          })
        ) {
          return;
        }
        const message = error instanceof Error ? error.message : String(error);
        addToast(`AI Sync preview failed: ${message}`, "error");
      }
      return;
    }

    const previewPrimaryPath = resolvePreviewPrimaryPath(
      profile.primaryPath,
      mainPath,
    );
    const pushKey = getPreviewKey(projectPath, "push", previewPrimaryPath);
    const pullKey = getPreviewKey(projectPath, "pull", previewPrimaryPath);

    const prefetchError = previewPrefetchErrorByProject[projectPath];
    const canReuseCachedPreview = shouldReuseAiSyncCachedPreview({
      projectPath,
      prefetchError,
      pushPreview: latestPreviewByAction[pushKey],
      pullPreview: latestPreviewByAction[pullKey],
    });

    let pushPreview = canReuseCachedPreview
      ? latestPreviewByAction[pushKey]
      : undefined;
    let pullPreview = canReuseCachedPreview
      ? latestPreviewByAction[pullKey]
      : undefined;

    try {
      const [resolvedPush, resolvedPull] = await Promise.all([
        pushPreview
          ? Promise.resolve(pushPreview)
          : previewSyncChanges(projectPath, previewPrimaryPath, "to-primary"),
        pullPreview
          ? Promise.resolve(pullPreview)
          : previewSyncChanges(previewPrimaryPath, projectPath, "from-primary"),
      ]);

      if (
        !shouldApplyAsyncResultForProject({
          requestId,
          currentRequestId: aiSyncRequestIdRef.current,
          projectPath,
          activeProjectPaths: projectProfilesRef.current.map(
            (entry) => entry.projectPath,
          ),
        })
      ) {
        return;
      }

      pushPreview = resolvedPush;
      pullPreview = resolvedPull;

      setLatestPreviewByAction((prev) => ({
        ...prev,
        [pushKey]: resolvedPush,
        [pullKey]: resolvedPull,
      }));
      setPreviewPrefetchErrorByProject((prev) => ({
        ...prev,
        [projectPath]: null,
      }));
    } catch (error) {
      if (
        !shouldApplyAsyncResultForProject({
          requestId,
          currentRequestId: aiSyncRequestIdRef.current,
          projectPath,
          activeProjectPaths: projectProfilesRef.current.map(
            (entry) => entry.projectPath,
          ),
        })
      ) {
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      setPreviewPrefetchErrorByProject((prev) => ({
        ...prev,
        [projectPath]: message,
      }));
      addToast(`AI Sync preview failed: ${message}`, "error");
      return;
    }

    try {
      const result = buildRsyncAiSyncPrompt({
        mainPath,
        projectPath,
        pushPreview,
        pullPreview,
      });

      if (
        !shouldApplyAsyncResultForProject({
          requestId,
          currentRequestId: aiSyncRequestIdRef.current,
          projectPath,
          activeProjectPaths: projectProfilesRef.current.map(
            (entry) => entry.projectPath,
          ),
        })
      ) {
        return;
      }

      setAiSyncModal({
        projectPath,
        mode: "rsync",
        command: result.command,
        prompt: result.prompt,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addToast(message, "error");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">@acme Sync</h2>
        <p className="text-muted-foreground">{getSyncScreenDescription()}</p>
      </div>

      <div className="space-y-6">
        <div
          data-section={getPrimarySectionComment()}
          className="bg-card text-card-foreground rounded-lg border shadow-sm"
        >
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="leading-none font-semibold tracking-tight">
              {getPrimarySectionTitle()}
            </h3>
            <p className="text-muted-foreground text-sm">
              {getPrimarySectionDescription()}
            </p>
          </div>
          <div className="p-6 pt-0">
            <div className="flex flex-1 flex-col gap-3">
              <div className="bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {mainPath || getPrimaryPathEmptyState()}
                </span>
                {mainPath && lastModified[mainPath] && (
                  <span className="ml-2 flex max-w-fit shrink-0 items-center gap-2">
                    <span className="bg-muted rounded-full px-2 text-xs">
                      Updated: {lastModified[mainPath].display}
                    </span>
                    {lastModified[mainPath].errorMessage ? (
                      <span
                        className="rounded-sm bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-300"
                        title={lastModified[mainPath].errorMessage}
                      >
                        Refresh Failed
                      </span>
                    ) : null}
                  </span>
                )}
                <button
                  onClick={handleSetMainPath}
                  aria-label="Set primary path"
                  title="Set primary path"
                  disabled={isPrimaryPathChangeDisabled}
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
              {mainPath ? (
                <>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span>
                      Branch:{" "}
                      {primaryRepoMetadataByPath[mainPath]?.branch ?? "Unknown"}
                    </span>
                    <span>
                      Updated:{" "}
                      {primaryRepoMetadataByPath[mainPath]?.lastUpdated ??
                        "Unknown"}
                    </span>
                    <span
                      className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${getPrimaryRemoteBadgeClass(
                        primaryRemoteStatusByPath[mainPath],
                      )}`}
                    >
                      {getPrimaryRemoteBadgeLabel(
                        primaryRemoteStatusByPath[mainPath],
                      )}
                    </span>
                  </div>
                  {getPrimaryRemoteDetail(
                    primaryRemoteStatusByPath[mainPath],
                  ) ? (
                    <p className="text-muted-foreground text-xs">
                      {getPrimaryRemoteDetail(
                        primaryRemoteStatusByPath[mainPath],
                      )}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground truncate text-xs">
                    Last commit:{" "}
                    {primaryRepoMetadataByPath[mainPath]?.lastCommitMessage ??
                      "Unknown"}
                  </p>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Target Projects Section */}
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
          <div className="flex flex-col space-y-1.5 border-b p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="leading-none font-semibold tracking-tight">
                  {getProjectSectionTitle()}
                </h3>
                <p className="text-muted-foreground mt-1.5 text-sm">
                  {getProjectSectionDescription()}
                </p>
              </div>
              <button
                onClick={handleAddProject}
                className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Project
              </button>
            </div>
          </div>
          <div className="p-0">
            {paths.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted rounded-full p-3">
                  <FolderPlus className="text-muted-foreground h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">No projects</h3>
                <p className="text-muted-foreground mt-2 mb-4 text-sm">
                  You haven't added any project targets yet.
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {projectProfiles.map((profile) => {
                  const projectPath = profile.projectPath;
                  const repoRoot = profile.subtree?.repoRoot;

                  return (
                    <li
                      key={projectPath}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <div className="truncate text-sm font-medium">
                          {projectPath}
                        </div>
                        <div className="text-muted-foreground mt-1 mb-2 flex items-center gap-2 text-xs">
                          {profile.mode === "rsync" ? (
                            <span>
                              Updated:{" "}
                              {lastModified[projectPath]?.display || "..."}
                            </span>
                          ) : null}
                          <span className="bg-muted rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                            {profile.mode === "subtree" ? "SUBTREE" : "RSYNC"}
                          </span>
                          {profile.mode === "rsync" &&
                          lastModified[projectPath]?.errorMessage ? (
                            <span
                              className="rounded-sm bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-300"
                              title={
                                lastModified[projectPath]?.errorMessage ??
                                undefined
                              }
                            >
                              Refresh Failed
                            </span>
                          ) : null}
                          {(() => {
                            if (profile.mode === "subtree") {
                              const subtreeStatus =
                                latestSubtreeStatusByProject[projectPath];
                              if (subtreeStatus?.mode !== "subtree") {
                                return null;
                              }

                              const tone = getSubtreeStatusBadgeTone(
                                subtreeStatus.state,
                              );
                              const className =
                                tone === "danger"
                                  ? "bg-destructive/10 text-destructive rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                                  : tone === "warning"
                                    ? "rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-300"
                                    : tone === "success"
                                      ? "rounded-sm bg-green-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-green-600 uppercase dark:text-green-400"
                                      : "rounded-sm bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400";

                              return (
                                <span className={className}>
                                  {formatSubtreeStatusLabel(subtreeStatus)}
                                </span>
                              );
                            }

                            const rsyncStatus =
                              latestRsyncStatusByProject[projectPath];
                            const rsyncLabel = formatRsyncStatusLabel(rsyncStatus);
                            if (!rsyncLabel) {
                              return null;
                            }

                            const tone = getRsyncStatusBadgeTone(
                              rsyncStatus.state,
                            );
                            const className =
                              tone === "warning"
                                ? "bg-destructive/10 text-destructive rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                                : tone === "success"
                                  ? "rounded-sm bg-green-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-green-600 uppercase dark:text-green-400"
                                  : tone === "info"
                                    ? "rounded-sm bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400"
                                    : "rounded-sm bg-slate-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300";

                            return <span className={className}>{rsyncLabel}</span>;
                          })()}
                        </div>
                        {profile.mode === "subtree" && repoRoot ? (
                          <div className="text-muted-foreground mt-1 space-y-1 text-xs">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span>
                                Branch:{" "}
                                {subtreeRepoMetadataByPath[repoRoot]?.branch ??
                                  "Unknown"}
                              </span>
                              <span>
                                Repo updated:{" "}
                                {subtreeRepoMetadataByPath[repoRoot]
                                  ?.lastUpdated ?? "Unknown"}
                              </span>
                            </div>
                            <p className="truncate">
                              Last commit:{" "}
                              {subtreeRepoMetadataByPath[repoRoot]
                                ?.lastCommitMessage ?? "Unknown"}
                            </p>
                            {(() => {
                              const subtreeStatus =
                                latestSubtreeStatusByProject[projectPath];
                              if (!subtreeStatus) {
                                return null;
                              }

                              const isMissingSubtree =
                                subtreeStatus.mode === "subtree" &&
                                subtreeStatus.state === "missing_subtree";
                              const isGenericMisconfigured =
                                subtreeStatus.mode === "subtree" &&
                                subtreeStatus.state === "misconfigured";

                              return (
                                <>
                                  <p>
                                    {formatSubtreeProjectLine(subtreeStatus)}
                                  </p>
                                  <p>
                                    {formatSubtreeSourceSyncLine(subtreeStatus)}
                                  </p>
                                  {isMissingSubtree ? (
                                    <>
                                      <p>
                                        This branch does not currently contain
                                        @acme.
                                      </p>
                                      <button
                                        onClick={() => {
                                          handleAddSubtree(profile);
                                        }}
                                        disabled={
                                          isSyncing !== null ||
                                          isPreviewLoading ||
                                          isConfirmPreviewLoading
                                        }
                                        className="border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                        title='Add subtree "@acme"'
                                      >
                                        {isSyncing ===
                                        `add-subtree-${projectPath}` ? (
                                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                          <FolderPlus className="mr-2 h-4 w-4" />
                                        )}
                                        Add subtree "@acme"
                                      </button>
                                      {isSyncing ===
                                      `add-subtree-${projectPath}` ? (
                                        <p>Adding subtree @acme…</p>
                                      ) : null}
                                    </>
                                  ) : null}
                                  {isGenericMisconfigured ? (
                                    <p>
                                      Subtree sync is misconfigured. Update the
                                      remote/branch settings before applying.
                                    </p>
                                  ) : null}
                                </>
                              );
                            })()}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {(() => {
                          const pushSummary = getPreviewSummary(
                            projectPath,
                            "push",
                          );
                          const pullSummary = getPreviewSummary(
                            projectPath,
                            "pull",
                          );
                          const hasPushChanges = hasSummaryChanges(pushSummary);
                          const hasPullChanges = hasSummaryChanges(pullSummary);
                          const indicatorLoading =
                            !!indicatorLoadingByProject[projectPath];
                          const prefetchError =
                            previewPrefetchErrorByProject[projectPath];

                          return (
                            <>
                              <button
                                onClick={() => {
                                  void loadPreviewForAction(profile, "pull");
                                  setPendingConfirmAfterPreview(true);
                                }}
                                disabled={
                                  !mainPath ||
                                  isSyncing !== null ||
                                  isPreviewLoading ||
                                  !canPreviewAction(profile, "pull")
                                }
                                className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                                  shouldHighlightPullAction(
                                    latestRsyncStatusByProject[projectPath],
                                  )
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground border"
                                }`}
                                title="Preview pull changes first"
                              >
                                {isSyncing === `pull-${projectPath}` ? (
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                {profile.mode === "subtree"
                                  ? getPreviewButtonLabel(profile, "pull")
                                  : getSyncActionLabel("pull")}
                                {indicatorLoading ? (
                                  <RefreshCw className="ml-2 h-3 w-3 animate-spin" />
                                ) : prefetchError ? (
                                  <span
                                    className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] leading-none text-amber-700 dark:text-amber-300"
                                    title={prefetchError}
                                  >
                                    ?
                                  </span>
                                ) : hasPullChanges ? (
                                  <span className="ml-2 rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] leading-none text-red-700 dark:text-red-300">
                                    !
                                  </span>
                                ) : null}
                              </button>
                              {profile.mode === "rsync" ? (
                                <>
                                  <button
                                    onClick={() => {
                                      void loadPreviewForAction(
                                        profile,
                                        "push",
                                      );
                                      setPendingConfirmAfterPreview(true);
                                    }}
                                    disabled={
                                      !mainPath ||
                                      isSyncing !== null ||
                                      isPreviewLoading ||
                                      !canPreviewAction(profile, "push")
                                    }
                                    className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                                      shouldHighlightPushAction(
                                        latestRsyncStatusByProject[projectPath],
                                      )
                                        ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                                        : "border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground border"
                                    }`}
                                    title="Preview push changes first"
                                  >
                                    {isSyncing === `push-${projectPath}` ? (
                                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Upload className="mr-2 h-4 w-4" />
                                    )}
                                    {getSyncActionLabel("push")}
                                    {indicatorLoading ? (
                                      <RefreshCw className="ml-2 h-3 w-3 animate-spin" />
                                    ) : prefetchError ? (
                                      <span
                                        className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] leading-none text-amber-700 dark:text-amber-300"
                                        title={prefetchError}
                                      >
                                        ?
                                      </span>
                                    ) : hasPushChanges ? (
                                      <span className="ml-2 rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] leading-none text-red-700 dark:text-red-300">
                                        !
                                      </span>
                                    ) : null}
                                  </button>
                                </>
                              ) : null}
                              <button
                                onClick={() => {
                                  void openAiSyncModal(projectPath);
                                }}
                                disabled={
                                  !mainPath ||
                                  isSyncing !== null ||
                                  isPreviewLoading ||
                                  isConfirmPreviewLoading
                                }
                                className="border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground inline-flex h-8 items-center justify-center rounded-md border px-2 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                title={getAiSyncActionTitle()}
                              >
                                AI Sync
                              </button>
                              <button
                                onClick={() =>
                                  loadPreviewForAction(profile, "pull")
                                }
                                disabled={
                                  !mainPath ||
                                  isSyncing !== null ||
                                  isPreviewLoading ||
                                  !canPreviewAction(profile, "pull")
                                }
                                className="border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground inline-flex h-8 items-center justify-center rounded-md border px-2 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                title={getPreviewButtonLabel(profile, "pull")}
                              >
                                {getPreviewButtonLabel(profile, "pull")}
                              </button>
                              {profile.mode === "rsync" ? (
                                <button
                                  onClick={() =>
                                    loadPreviewForAction(profile, "push")
                                  }
                                  disabled={
                                    !mainPath ||
                                    isSyncing !== null ||
                                    isPreviewLoading ||
                                    !canPreviewAction(profile, "push")
                                  }
                                  className="border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground inline-flex h-8 items-center justify-center rounded-md border px-2 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                  title={getPreviewButtonLabel(profile, "push")}
                                >
                                  {getPreviewButtonLabel(profile, "push")}
                                </button>
                              ) : null}
                            </>
                          );
                        })()}
                        <button
                          onClick={() => {
                            setProfileModalProfileId(profile.id);
                          }}
                          disabled={isSyncing !== null || isPreviewLoading}
                          className="border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                          title="Configure sync profile"
                          aria-label="Configure sync profile"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            handleRemoveProject(profile);
                          }}
                          disabled={
                            isSyncing !== null ||
                            isPreviewLoading ||
                            isConfirmPreviewLoading ||
                            isDiffLoading ||
                            isApplyingSelectedFileAction ||
                            isResolvingConflict
                          }
                          className="text-muted-foreground hover:bg-destructive/90 hover:text-destructive-foreground focus-visible:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                          title="Remove project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {subtreePreviewModal ? (
        <AcmeSyncSubtreePreviewModal
          open
          title={getPreviewModalTitle(subtreePreviewModal)}
          description={getPreviewModalDescription(
            subtreePreviewModal,
            pendingConfirmAfterPreview,
          )}
          previewError={previewError}
          message={
            subtreePreviewModal.status.message ??
            getSubtreeHistoryFallbackMessage()
          }
          statusLabel={formatSubtreeStatusLabel(subtreePreviewModal.status)}
          behindCount={subtreePreviewModal.status.behindCount}
          aheadCount={subtreePreviewModal.status.aheadCount}
          dirty={subtreePreviewModal.status.dirty}
          onClose={closePreviewModal}
        />
      ) : null}

      {previewModal?.mode === "rsync" ? (
        <AcmeSyncRsyncPreviewModal
          open
          title={getPreviewModalTitle(previewModal)}
          description={getPreviewModalDescription(
            previewModal,
            pendingConfirmAfterPreview,
          )}
          previewModal={previewModal}
          selectedPreviewFile={selectedPreviewFile}
          selectedDiff={selectedDiff}
          selectedConflictDetail={selectedConflictDetail}
          previewError={previewError}
          diffError={diffError}
          isDiffLoading={isDiffLoading}
          pendingConfirmAfterPreview={pendingConfirmAfterPreview}
          showConflictOnly={showConflictOnly}
          previewModalUnresolvedFileDecisionCount={
            previewModalUnresolvedFileDecisionCount
          }
          isPreviewModalContinueDisabled={isPreviewModalContinueDisabled}
          onClose={closePreviewModal}
          onContinue={continuePreviewToConfirm}
          onSelectPreviewFile={selectPreviewFile}
          onLoadPreviewDiff={loadPreviewDiff}
          onSetFileAction={(path, action) => {
            setPreviewModal((current) => {
              if (!current || current.mode !== "rsync") return current;

              return {
                ...current,
                selectedFileActions: {
                  ...current.selectedFileActions,
                  [path]: action,
                },
              };
            });
          }}
          onSetConflictResolution={(path, resolution) => {
            setPreviewModal((current) => {
              if (!current || current.mode !== "rsync") return current;

              return {
                ...current,
                selectedConflictResolutions: getNextConflictResolutionState(
                  current.selectedConflictResolutions,
                  path,
                  resolution,
                ),
              };
            });
          }}
          onApplySelectedFileAction={applySelectedPreviewFileAction}
          isApplyingSelectedFileAction={isApplyingSelectedFileAction}
          getConflictSetForPreviewModal={getConflictSetForPreviewModal}
          getChangeTypeBadgeClass={getChangeTypeBadgeClass}
          formatChangeTypeLabel={formatChangeTypeLabel}
        />
      ) : null}

      <AcmeSyncProfileModal
        open={selectedProfileForModal !== null}
        profile={selectedProfileForModal}
        onClose={() => {
          setProfileModalProfileId(null);
        }}
        onSave={
          selectedProfileForModal
            ? handleSaveProfileSettings(selectedProfileForModal.id)
            : () => {}
        }
      />

      <Modal
        open={aiSyncModal !== null}
        onOpenChange={(open) => {
          if (!open) {
            aiSyncRequestIdRef.current += 1;
            setAiSyncModal(null);
          }
        }}
        title="AI Sync"
        description={
          aiSyncModal ? getAiSyncModalDescription(aiSyncModal.mode) : ""
        }
        width="min(960px, 92vw)"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!aiSyncModal) return;
                void copyToClipboard(aiSyncModal.command, "Command");
              }}
              disabled={!aiSyncModal}
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
            >
              Copy Command
            </button>
            <button
              onClick={() => {
                if (!aiSyncModal) return;
                void copyToClipboard(aiSyncModal.prompt, "Prompt");
              }}
              disabled={!aiSyncModal}
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
            >
              Copy Prompt
            </button>
            <button
              onClick={() => {
                if (!aiSyncModal) return;
                void copyToClipboard(
                  `${aiSyncModal.command}\n\n${aiSyncModal.prompt}`,
                  "Command + Prompt",
                );
              }}
              disabled={!aiSyncModal}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
            >
              Copy All
            </button>
            <button
              onClick={() => {
                aiSyncRequestIdRef.current += 1;
                setAiSyncModal(null);
              }}
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
            >
              Close
            </button>
          </div>
        }
      >
        {aiSyncModal ? (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <p className="text-muted-foreground">
                {getAiSyncStepLabels(aiSyncModal.mode).command}
              </p>
              <div className="rounded-md border">
                <CodeBlock language="bash">{aiSyncModal.command}</CodeBlock>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">
                {getAiSyncStepLabels(aiSyncModal.mode).prompt}
              </p>
              <div className="max-h-[52vh] overflow-auto rounded-md border">
                <CodeBlock language="markdown" wrap>
                  {aiSyncModal.prompt}
                </CodeBlock>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={confirmState !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeConfirmModal();
          }
        }}
        title="Confirm sync action"
        description={
          confirmState
            ? getConfirmModalDescription({
                action: confirmState.action,
                mode: confirmState.profile.mode,
              })
            : ""
        }
        width={520}
        footer={
          <>
            <button
              onClick={closeConfirmModal}
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmSyncAction}
              disabled={!canConfirmCurrentSyncAction}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
            >
              Confirm {confirmState?.action === "push" ? "Push" : "Pull"}
            </button>
          </>
        }
      >
        {confirmState ? (
          <div className="space-y-3">
            {isConfirmPreviewLoading ? (
              <p className="text-muted-foreground text-xs">
                {getConfirmLoadingMessage(confirmState.profile.mode)}
              </p>
            ) : null}

            {confirmPreviewError ? (
              <p className="text-destructive text-xs">{confirmPreviewError}</p>
            ) : null}

            {confirmState.profile.mode === "subtree" ? (
              confirmSubtreeDetails ? (
                <div className="bg-muted/30 space-y-2 rounded-md border p-3 text-sm">
                  {confirmSubtreeSummaryMessage ? (
                    <p>{confirmSubtreeSummaryMessage}</p>
                  ) : null}
                  <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-xs">
                    <li>
                      Remote:{" "}
                      {confirmState.profile.subtree?.remote ?? "Unknown"}
                    </li>
                    <li>
                      Branch:{" "}
                      {confirmState.profile.subtree?.branch ?? "Unknown"}
                    </li>
                    <li>Ahead: {confirmSubtreeDetails.aheadCount} commit(s)</li>
                    <li>
                      Behind: {confirmSubtreeDetails.behindCount} commit(s)
                    </li>
                    <li>Status: {confirmSubtreeDetails.statusLabel}</li>
                  </ul>
                  {confirmSubtreeDetails.dirty ? (
                    <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-800 dark:text-amber-200">
                      Dirty repo warning: your working tree has local changes
                      under @acme.
                    </div>
                  ) : null}
                  {isSubtreeMisconfigured ? (
                    <div className="rounded-md border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-800 dark:text-red-200">
                      {confirmSubtreeStatus?.mode === "subtree" &&
                      confirmSubtreeStatus.state === "missing_subtree"
                        ? 'This branch does not currently contain @acme. Add subtree "@acme" before applying.'
                        : "Subtree sync is misconfigured. Update the remote/branch settings before applying."}
                    </div>
                  ) : null}
                </div>
              ) : (
                !isConfirmPreviewLoading &&
                !confirmPreviewError && (
                  <p className="text-muted-foreground text-xs">
                    {getConfirmPreviewFallbackMessage(
                      confirmState.profile.mode,
                    )}
                  </p>
                )
              )
            ) : confirmPreviewSummary ? (
              <div className="space-y-2">
                <div className="bg-muted/30 rounded-md border p-3 text-sm">
                  <p>
                    {confirmState.action === "push" ? "Push" : "Pull"} scope •
                    Added: {confirmPreviewSummary.added} • Modified:{" "}
                    {confirmPreviewSummary.modified} • Deleted:{" "}
                    {confirmPreviewSummary.deleted}
                  </p>
                </div>
                {confirmDeleteWarningMessage ? (
                  <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
                    {confirmDeleteWarningMessage}
                  </div>
                ) : null}
                {confirmUnresolvedConflictCount > 0 ||
                confirmUnresolvedFileDecisionCount > 0 ? (
                  <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
                    Resolve all preview conflicts and file actions before confirming.
                  </div>
                ) : null}
              </div>
            ) : (
              !isConfirmPreviewLoading &&
              !confirmPreviewError && (
                <p className="text-muted-foreground text-xs">
                  {getConfirmPreviewFallbackMessage(confirmState.profile.mode)}
                </p>
              )
            )}

            {confirmState.profile.mode === "rsync" && oppositePreviewSummary ? (
              <div className="bg-muted/20 rounded-md border p-3 text-xs">
                <p>
                  {confirmState.action === "push" ? "Pull side" : "Push side"}{" "}
                  summary • Added: {oppositePreviewSummary.added} • Modified:{" "}
                  {oppositePreviewSummary.modified} • Deleted:{" "}
                  {oppositePreviewSummary.deleted}
                </p>
              </div>
            ) : null}

            {hasBidirectionalDivergence ? (
              <div className="space-y-3">
                <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
                  Bidirectional divergence detected: both push and pull
                  directions have changes. Sync here is one-way (rsync), not a
                  Git merge. Applying this action may overwrite changes from the
                  other side.
                </div>

                {(() => {
                  if (!confirmState) return null;
                  const conflictSet = getConflictSetForProject(
                    confirmState.profile.projectPath,
                  );

                  if (conflictSet.size === 0) return null;

                  return (
                    <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs">
                      <p className="mb-2 font-semibold text-red-800 dark:text-red-200">
                        Potential file conflicts ({conflictSet.size})
                      </p>
                      <ul className="space-y-2">
                        {[...conflictSet].map((path) => {
                          const conflictKey = makeConflictKey(
                            confirmState.profile.projectPath,
                            path,
                          );
                          const busy =
                            isResolvingConflict &&
                            resolvingConflictKey === conflictKey;

                          return (
                            <li
                              key={path}
                              className="bg-background/50 flex items-center justify-between gap-2 rounded border border-red-500/20 px-2 py-1"
                            >
                              <span className="truncate text-red-900 dark:text-red-100">
                                {path}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-red-800 uppercase dark:text-red-200">
                                  conflict
                                </span>
                                <button
                                  onClick={() => {
                                    void resolveConflictFile(
                                      confirmState.profile.projectPath,
                                      path,
                                      "pull",
                                    );
                                  }}
                                  disabled={isResolvingConflict}
                                  className="rounded border px-2 py-0.5 text-[10px] font-medium disabled:opacity-50"
                                  title={
                                    getConflictResolutionLabel("pull").title
                                  }
                                >
                                  {getConflictResolutionLabel("pull").label}
                                </button>
                                <button
                                  onClick={() => {
                                    void resolveConflictFile(
                                      confirmState.profile.projectPath,
                                      path,
                                      "push",
                                    );
                                  }}
                                  disabled={isResolvingConflict}
                                  className="rounded border px-2 py-0.5 text-[10px] font-medium disabled:opacity-50"
                                  title={
                                    getConflictResolutionLabel("push").title
                                  }
                                >
                                  {getConflictResolutionLabel("push").label}
                                </button>
                                {busy ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : null}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      {conflictResolveError ? (
                        <p className="mt-2 text-red-700 dark:text-red-300">
                          {conflictResolveError}
                        </p>
                      ) : null}
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
