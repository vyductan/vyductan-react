import { useMemo, useState } from "react";

import { Checkbox } from "@acme/ui/components/checkbox";
import { Modal } from "@acme/ui/components/modal";

import type {
  RsyncSyncSettings,
  SubtreeSyncSettings,
  SyncEngineMode,
  SyncProfile,
} from "../../lib/acme-sync/types";

interface AcmeSyncProfileModalProps {
  open: boolean;
  profile: SyncProfile | null;
  onClose: () => void;
  onSave: (nextProfile: {
    mode: SyncEngineMode;
    rsync: RsyncSyncSettings;
    subtree: SubtreeSyncSettings;
  }) => void;
}

const DEFAULT_RSYNC_SETTINGS: RsyncSyncSettings = {
  useGitSafetyChecks: false,
};

function getDefaultSubtreeSettings(
  profile: SyncProfile | null,
): SubtreeSyncSettings {
  return {
    repoRoot: profile?.subtree?.repoRoot ?? profile?.projectPath ?? "",
    prefix: "@acme",
    remote: profile?.subtree?.remote ?? "origin",
    branch: profile?.subtree?.branch ?? "main",
    squash: profile?.subtree?.squash ?? true,
  };
}

export function AcmeSyncProfileModal({
  open,
  profile,
  onClose,
  onSave,
}: AcmeSyncProfileModalProps) {
  const [mode, setMode] = useState<SyncEngineMode>(profile?.mode ?? "rsync");
  const [rsync, setRsync] = useState<RsyncSyncSettings>(
    profile?.rsync ?? DEFAULT_RSYNC_SETTINGS,
  );
  const [subtree, setSubtree] = useState<SubtreeSyncSettings>(
    getDefaultSubtreeSettings(profile),
  );

  const profileIdentity = profile
    ? `${profile.id}:${profile.mode}:${profile.projectPath}`
    : "none";

  const description = useMemo(() => {
    if (!profile) return "";
    return `Configure sync mode for ${profile.projectPath}.`;
  }, [profile]);

  const handleSave = () => {
    onSave({
      mode,
      rsync,
      subtree: {
        ...subtree,
        prefix: "@acme",
      },
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      onCancel={onClose}
      title="Configure sync profile"
      description={description}
      width={560}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!profile}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
          >
            Save
          </button>
        </div>
      }
    >
      {profile ? (
        <div className="space-y-4 px-1 py-1" key={profileIdentity}>
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="acme-sync-profile-mode"
            >
              Mode
            </label>
            <select
              id="acme-sync-profile-mode"
              value={mode}
              onChange={(event) =>
                setMode(event.target.value as SyncEngineMode)
              }
              className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="rsync">rsync</option>
              <option value="subtree">subtree</option>
            </select>
          </div>

          {mode === "rsync" ? (
            <div className="space-y-3 rounded-md border p-4">
              <p className="text-sm font-medium">rsync settings</p>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={rsync.useGitSafetyChecks}
                  onChange={(event) =>
                    setRsync({
                      useGitSafetyChecks: event.target.checked,
                    })
                  }
                />
                <span>Use git safety checks</span>
              </label>
            </div>
          ) : (
            <div className="space-y-3 rounded-md border p-4">
              <p className="text-sm font-medium">subtree settings</p>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="acme-sync-prefix"
                >
                  Project subtree path
                </label>
                <input
                  id="acme-sync-prefix"
                  value="@acme"
                  readOnly
                  className="border-input bg-muted text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                />
                <p className="text-muted-foreground text-xs">
                  Fixed path inside the project repo where the subtree lives.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="acme-sync-repo-root"
                >
                  Project repo root
                </label>
                <input
                  id="acme-sync-repo-root"
                  value={subtree.repoRoot}
                  onChange={(event) =>
                    setSubtree((prev) => ({
                      ...prev,
                      repoRoot: event.target.value,
                    }))
                  }
                  className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                />
                <p className="text-muted-foreground text-xs">
                  Git subtree commands run in the project repo where this
                  subtree lives.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="acme-sync-remote"
                >
                  Source remote
                </label>
                <input
                  id="acme-sync-remote"
                  value={subtree.remote}
                  onChange={(event) =>
                    setSubtree((prev) => ({
                      ...prev,
                      remote: event.target.value,
                    }))
                  }
                  className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                />
                <p className="text-muted-foreground text-xs">
                  Source ref used for subtree pulls: the remote the project repo
                  pulls shared @acme code from.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="acme-sync-branch"
                >
                  Source branch
                </label>
                <input
                  id="acme-sync-branch"
                  value={subtree.branch}
                  onChange={(event) =>
                    setSubtree((prev) => ({
                      ...prev,
                      branch: event.target.value,
                    }))
                  }
                  className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                />
                <p className="text-muted-foreground text-xs">
                  Source ref used for subtree pulls: the branch paired with the
                  source remote.
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm">
                  <Checkbox
                    checked={subtree.squash}
                    onCheckedChange={(checked) =>
                      setSubtree((prev) => ({ ...prev, squash: !!checked }))
                    }
                  />
                  <span>Squash</span>
                </label>
                <p className="text-muted-foreground text-xs">
                  Combine pulled subtree changes into a smaller history.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
