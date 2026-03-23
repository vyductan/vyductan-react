import { CodeBlock } from "@acme/ui/components/code-block";
import { Modal } from "@acme/ui/components/modal";

import type { RsyncPreviewModalState } from "./acme-sync-preview-modal-state";
import type {
  SyncConflictDetail,
  SyncConflictResolution,
  SyncPreviewFile,
  SyncPreviewFileAction,
} from "../../lib/acme-sync/types";
import { getConflictResolutionOptions } from "./acme-sync-preview-selection-state";
import { SyncDiffViewer } from "./sync-diff-viewer";

interface AcmeSyncRsyncPreviewModalProps {
  open: boolean;
  title: string;
  description: string;
  previewModal: RsyncPreviewModalState;
  selectedPreviewFile: SyncPreviewFile | null;
  selectedDiff: string;
  selectedConflictDetail: SyncConflictDetail | null;
  previewError: string | null;
  diffError: string | null;
  isDiffLoading: boolean;
  pendingConfirmAfterPreview: boolean;
  showConflictOnly: boolean;
  previewModalUnresolvedFileDecisionCount: number;
  isPreviewModalContinueDisabled: boolean;
  onClose: () => void;
  onContinue: () => void;
  onSelectPreviewFile: (file: SyncPreviewFile) => void;
  onLoadPreviewDiff: (file: SyncPreviewFile) => void;
  onSetFileAction: (path: string, action: SyncPreviewFileAction) => void;
  onSetConflictResolution: (
    path: string,
    resolution: SyncConflictResolution,
  ) => void;
  onApplySelectedFileAction: () => void;
  isApplyingSelectedFileAction: boolean;
  getConflictSetForPreviewModal: () => Set<string>;
  getChangeTypeBadgeClass: (
    changeType: SyncPreviewFile["changeType"],
  ) => string;
  formatChangeTypeLabel: (changeType: SyncPreviewFile["changeType"]) => string;
}

export function AcmeSyncRsyncPreviewModal({
  open,
  title,
  description,
  previewModal,
  selectedPreviewFile,
  selectedDiff,
  selectedConflictDetail,
  previewError,
  diffError,
  isDiffLoading,
  pendingConfirmAfterPreview,
  showConflictOnly,
  previewModalUnresolvedFileDecisionCount,
  isPreviewModalContinueDisabled,
  onClose,
  onContinue,
  onSelectPreviewFile,
  onLoadPreviewDiff,
  onSetFileAction,
  onSetConflictResolution,
  onApplySelectedFileAction,
  isApplyingSelectedFileAction,
  getConflictSetForPreviewModal,
  getChangeTypeBadgeClass,
  formatChangeTypeLabel,
}: AcmeSyncRsyncPreviewModalProps) {
  const conflictSet = getConflictSetForPreviewModal();
  const decisions = previewModal.result.decisions ?? [];
  const filesToShow = showConflictOnly
    ? previewModal.result.files.filter((file) => conflictSet.has(file.path))
    : previewModal.result.files;
  const selectedDecision = selectedPreviewFile
    ? decisions.find((decision) => decision.path === selectedPreviewFile.path)
    : null;

  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      title={title}
      description={description}
      width="min(1260px, 95vw)"
      footer={
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
          >
            Close
          </button>
          {pendingConfirmAfterPreview ? (
            <button
              onClick={onContinue}
              disabled={isPreviewModalContinueDisabled}
              title={
                isPreviewModalContinueDisabled
                  ? "Resolve all conflicts before continuing"
                  : undefined
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
            >
              Continue to Confirm
            </button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-4">
        {decisions.length > 0 ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">File Actions</h3>
              <p className="text-muted-foreground text-xs">
                {previewModalUnresolvedFileDecisionCount > 0
                  ? `${previewModalUnresolvedFileDecisionCount} unresolved file decision(s). Choose an action for each file before continuing.`
                  : "All required file actions selected. You can continue to confirmation."}
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid h-[70vh] min-h-0 grid-cols-2 overflow-hidden rounded-md border">
          <div className="min-h-0 overflow-y-auto border-r p-4">
            {previewError ? (
              <p className="text-destructive mb-3 text-xs">{previewError}</p>
            ) : null}

            {filesToShow.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {showConflictOnly
                  ? "No conflict files in current preview."
                  : "No file changes."}
              </p>
            ) : (
              <ul className="space-y-2">
                {filesToShow.map((file) => {
                  const isConflict = conflictSet.has(file.path);
                  const decision = decisions.find(
                    (entry) => entry.path === file.path,
                  );
                  const selectedAction = decision
                    ? previewModal.selectedFileActions[file.path]
                    : undefined;

                  return (
                    <li key={`${file.changeType}:${file.path}`}>
                      <button
                        onClick={() => {
                          onSelectPreviewFile(file);
                          onLoadPreviewDiff(file);
                        }}
                        className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                          selectedPreviewFile?.path === file.path
                            ? "bg-accent"
                            : "hover:bg-accent/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{file.path}</span>
                          <div className="flex items-center gap-2">
                            {isConflict ? (
                              <span className="rounded border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-700 uppercase dark:text-red-300">
                                conflict
                              </span>
                            ) : null}
                            <span
                              className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase ${getChangeTypeBadgeClass(file.changeType)}`}
                            >
                              {formatChangeTypeLabel(file.changeType)}
                            </span>
                          </div>
                        </div>
                        {decision
                          ? (() => {
                              const statusLabel = selectedAction
                                ? `Selected: ${
                                    selectedAction === "delete"
                                      ? "Delete"
                                      : decision.kind === "deleted"
                                        ? "Restore"
                                        : "Keep"
                                  }`
                                : "Action required";
                              const statusClass = selectedAction
                                ? selectedAction === "delete"
                                  ? "border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-300"
                                  : "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300";

                              return (
                                <div className="mt-1">
                                  <span
                                    className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}
                                  >
                                    {statusLabel}
                                  </span>
                                </div>
                              );
                            })()
                          : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="min-h-0 overflow-y-auto p-4">
            {selectedPreviewFile ? (
              selectedDecision ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">File Action</h4>
                    <p className="text-muted-foreground text-xs">
                      {selectedDecision.kind === "deleted"
                        ? "Choose whether to restore this deleted file back to Project or delete it from Primary."
                        : "Choose how this added file should be handled before continuing."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDecision.allowedActions.map((action) => {
                      const isSelected =
                        previewModal.selectedFileActions[
                          selectedDecision.path
                        ] === action;
                      const label =
                        action === "delete"
                          ? "Delete"
                          : selectedDecision.kind === "deleted"
                            ? "Restore"
                            : "Keep";

                      return (
                        <button
                          key={action}
                          onClick={() =>
                            onSetFileAction(selectedDecision.path, action)
                          }
                          className={`inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-2 text-sm">
                    {selectedDecision.allowedActions.includes("keep") ? (
                      selectedDecision.kind === "deleted" ? (
                        <p>Restore this file back to Project</p>
                      ) : (
                        <p>Push this file to Primary</p>
                      )
                    ) : null}
                    {selectedDecision.allowedActions.includes("delete") ? (
                      selectedDecision.kind === "deleted" ? (
                        <p>Delete this file from Primary</p>
                      ) : (
                        <p>
                          Delete this file from Project instead of pushing it
                        </p>
                      )
                    ) : null}
                  </div>
                  <div>
                    <button
                      onClick={onApplySelectedFileAction}
                      disabled={
                        previewModal.selectedFileActions[
                          selectedDecision.path
                        ] === undefined || isApplyingSelectedFileAction
                      }
                      className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium disabled:pointer-events-none disabled:opacity-50"
                    >
                      Apply selected action
                    </button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">File Preview</h4>
                    <SyncDiffViewer
                      diffText={selectedDiff}
                      isLoading={isDiffLoading}
                      error={diffError}
                    />
                  </div>
                </div>
              ) : selectedConflictDetail ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs">
                      {previewModal.action === "pull"
                        ? "Ours = Project • Theirs = Primary"
                        : "Ours = Primary • Theirs = Project"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {previewModal.result.conflicts
                        ?.find((conflict) => conflict.path === selectedPreviewFile.path)
                        ? getConflictResolutionOptions(
                            previewModal.result.conflicts.find(
                              (conflict) => conflict.path === selectedPreviewFile.path,
                            )!,
                          ).map((option) => {
                            const isSelected =
                              previewModal.selectedConflictResolutions[
                                selectedPreviewFile.path
                              ] === option.value;

                            return (
                              <button
                                key={option.value}
                                onClick={() =>
                                  onSetConflictResolution(
                                    selectedPreviewFile.path,
                                    option.value,
                                  )
                                }
                                className={`inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })
                        : null}
                    </div>
                  </div>
                  {selectedConflictDetail.kind === "text" ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">
                            {selectedConflictDetail.current.label}
                          </h4>
                          <div className="rounded-md border">
                            <CodeBlock language="text">
                              {selectedConflictDetail.current.content}
                            </CodeBlock>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">
                            {selectedConflictDetail.incoming.label}
                          </h4>
                          <div className="rounded-md border">
                            <CodeBlock language="text">
                              {selectedConflictDetail.incoming.content}
                            </CodeBlock>
                          </div>
                        </div>
                      </div>
                      {previewModal.selectedConflictResolutions[
                        selectedPreviewFile.path
                      ] === "both" && selectedConflictDetail.bothPreview ? (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Both Preview</h4>
                          <div className="rounded-md border">
                            <CodeBlock language="text">
                              {selectedConflictDetail.bothPreview}
                            </CodeBlock>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">
                        Binary conflict preview unavailable.
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {selectedConflictDetail.message ??
                          "Choose Ours or Theirs for this binary conflict."}
                      </p>
                    </div>
                  )}
                  {selectedConflictDetail.message ? (
                    <p className="text-muted-foreground text-xs">
                      {selectedConflictDetail.message}
                    </p>
                  ) : null}
                </div>
              ) : (
                <SyncDiffViewer
                  diffText={selectedDiff}
                  isLoading={isDiffLoading}
                  error={diffError}
                />
              )
            ) : (
              <p className="text-muted-foreground text-sm">
                Select a file to preview diff.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
