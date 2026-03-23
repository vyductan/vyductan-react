import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  RsyncSyncSettings,
  SubtreeSyncSettings,
  SyncEngineMode,
  SyncProfile,
} from "../lib/acme-sync/types";

interface AcmeState {
  primaryPath: string | null;
  profiles: SyncProfile[];
  setPrimaryPath: (path: string | null) => void;
  addProjectProfile: (projectPath: string) => void;
  removeProjectProfile: (profileId: string) => void;
  updateProfileMode: (profileId: string, mode: SyncEngineMode) => void;
  updateRsyncSettings: (profileId: string, settings: RsyncSyncSettings) => void;
  updateSubtreeSettings: (
    profileId: string,
    settings: SubtreeSyncSettings,
  ) => void;
}

interface LegacyAcmeState {
  mainPath?: string | null;
  paths?: string[];
}

interface PersistedAcmeState {
  primaryPath: string | null;
  profiles: SyncProfile[];
}

const DEFAULT_PRIMARY_ACME_PATH: string | null = null;

function normalizePrimaryPath(path: string | null): string | null {
  if (path === null) {
    return null;
  }

  return path;
}

function isPersistedAcmeState(
  persistedState: LegacyAcmeState | PersistedAcmeState,
): persistedState is PersistedAcmeState {
  return "profiles" in persistedState || "primaryPath" in persistedState;
}

export function migrateAcmeStoreState(
  persistedState: LegacyAcmeState | PersistedAcmeState | undefined,
): PersistedAcmeState {
  if (!persistedState) {
    return {
      primaryPath: DEFAULT_PRIMARY_ACME_PATH,
      profiles: [],
    };
  }

  if (isPersistedAcmeState(persistedState)) {
    const primaryPath =
      persistedState.primaryPath === undefined
        ? DEFAULT_PRIMARY_ACME_PATH
        : normalizePrimaryPath(persistedState.primaryPath);

    return {
      primaryPath,
      profiles: (persistedState.profiles ?? []).map((profile) => ({
        ...profile,
        primaryPath:
          profile.primaryPath === undefined
            ? primaryPath
            : normalizePrimaryPath(profile.primaryPath),
      })),
    };
  }

  const primaryPath =
    persistedState.mainPath === undefined
      ? DEFAULT_PRIMARY_ACME_PATH
      : normalizePrimaryPath(persistedState.mainPath);
  const uniquePaths = persistedState.paths
    ? Array.from(new Set(persistedState.paths))
    : [];

  return {
    primaryPath,
    profiles: uniquePaths.map((projectPath) => ({
      id: crypto.randomUUID(),
      projectPath,
      primaryPath,
      mode: "rsync",
    })),
  };
}

export const useAcmeStore = create<AcmeState>()(
  persist(
    (set) => ({
      primaryPath: DEFAULT_PRIMARY_ACME_PATH,
      profiles: [],
      setPrimaryPath: (path) =>
        set((state) => {
          const normalizedPath = normalizePrimaryPath(path);

          return {
            primaryPath: normalizedPath,
            profiles: state.profiles.map((profile) => ({
              ...profile,
              primaryPath: normalizedPath,
            })),
          };
        }),
      addProjectProfile: (projectPath) =>
        set((state) => {
          if (
            state.profiles.some((profile) => profile.projectPath === projectPath)
          ) {
            return state;
          }

          if (!state.primaryPath) {
            return state;
          }

          return {
            profiles: [
              ...state.profiles,
              {
                id: crypto.randomUUID(),
                projectPath,
                primaryPath: state.primaryPath,
                mode: "rsync",
              },
            ],
          };
        }),
      removeProjectProfile: (profileId) =>
        set((state) => ({
          profiles: state.profiles.filter((profile) => profile.id !== profileId),
        })),
      updateProfileMode: (profileId, mode) =>
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === profileId
              ? {
                  ...profile,
                  mode,
                }
              : profile,
          ),
        })),
      updateRsyncSettings: (profileId, settings) =>
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === profileId
              ? {
                  ...profile,
                  rsync: settings,
                }
              : profile,
          ),
        })),
      updateSubtreeSettings: (profileId, settings) =>
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === profileId
              ? {
                  ...profile,
                  subtree: settings,
                }
              : profile,
          ),
        })),
    }),
    {
      name: "acme-storage",
      version: 1,
      migrate: (persistedState) =>
        migrateAcmeStoreState(persistedState as LegacyAcmeState),
    },
  ),
);
