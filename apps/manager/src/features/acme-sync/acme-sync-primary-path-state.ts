export const shouldDisablePrimaryPathChange = (input: {
  isSyncing: boolean;
  isPreviewLoading: boolean;
  isConfirmPreviewLoading: boolean;
}) => {
  return (
    input.isSyncing ||
    input.isPreviewLoading ||
    input.isConfirmPreviewLoading
  );
};
