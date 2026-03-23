import type { SyncPreviewResult } from "../../lib/acme-sync/types";

export interface AiSyncPreviewState {
  projectPath: string;
  prefetchError?: string | null;
  pushPreview?: SyncPreviewResult;
  pullPreview?: SyncPreviewResult;
}

export const shouldReuseAiSyncCachedPreview = ({
  prefetchError,
  pushPreview,
  pullPreview,
}: AiSyncPreviewState) => {
  return !prefetchError && Boolean(pushPreview && pullPreview);
};
