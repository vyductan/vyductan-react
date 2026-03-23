import { Modal } from "@acme/ui/components/modal";

interface AcmeSyncSubtreePreviewModalProps {
  open: boolean;
  title: string;
  description: string;
  previewError: string | null;
  message: string;
  statusLabel: string;
  behindCount: number;
  aheadCount: number;
  dirty: boolean;
  onClose: () => void;
}

export function AcmeSyncSubtreePreviewModal({
  open,
  title,
  description,
  previewError,
  message,
  statusLabel,
  behindCount,
  aheadCount,
  dirty,
  onClose,
}: AcmeSyncSubtreePreviewModalProps) {
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
        </div>
      }
    >
      <div className="space-y-4 rounded-md border p-4">
        {previewError ? (
          <p className="text-destructive text-xs">{previewError}</p>
        ) : null}

        <div className="space-y-2 text-sm">
          <p>{message}</p>
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-xs">
            <li>Behind: {behindCount} commit(s)</li>
            <li>Ahead: {aheadCount} commit(s)</li>
            <li>Working tree: {dirty ? "dirty" : "clean"}</li>
            <li>Status: {statusLabel}</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
