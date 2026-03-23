export interface ConfirmSyncGateState {
  hasConfirmState: boolean;
  isSyncing: boolean;
  isConfirmPreviewLoading: boolean;
  hasConfirmPreviewError: boolean;
  hasUnresolvedConflictSelections: boolean;
  hasUnresolvedFileSelections: boolean;
}

export const canConfirmSyncAction = ({
  hasConfirmState,
  isSyncing,
  isConfirmPreviewLoading,
  hasConfirmPreviewError,
  hasUnresolvedConflictSelections,
  hasUnresolvedFileSelections,
}: ConfirmSyncGateState): boolean => {
  return (
    hasConfirmState &&
    !isSyncing &&
    !isConfirmPreviewLoading &&
    !hasConfirmPreviewError &&
    !hasUnresolvedConflictSelections &&
    !hasUnresolvedFileSelections
  );
};
