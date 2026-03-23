export const getPrimarySectionComment = () => "Primary Path Section";

export const getPrimarySectionTitle = () => "Primary @acme Path";

export const getPrimarySectionDescription = () =>
  "The primary directory where shared @acme code is managed.";

export const getPrimaryRepoTypeLabel = () => "Type: Standalone git repo";

export const getPrimaryRepoScopeLabel = () => "Scope: @acme/";

export const getPrimaryRepoSyncExplanation = () =>
  "Projects sync shared @acme code from this repo.";

export const getProjectSectionTitle = () => "Project Profiles";

export const getProjectSectionDescription = () =>
  "Projects configured to sync shared @acme code.";

export const getSyncActionLabel = (action: "push" | "pull") =>
  action === "push" ? "Push to Primary" : "Pull from Primary";

export const getSyncScreenDescription = () =>
  "Synchronize your primary @acme workspace with local projects.";

export const getAiSyncActionTitle = () =>
  "Generate AI review prompt for Claude Code / Codex";

export const getPrimaryPathEmptyState = () =>
  "No primary path set. Please select one.";

export const getConflictResolutionLabel = (action: "push" | "pull") =>
  action === "pull"
    ? {
        title: "Keep Primary version",
        label: "Keep Primary",
      }
    : {
        title: "Keep Project version",
        label: "Keep Project",
      };

export const getSubtreeHistoryFallbackMessage = () =>
  "Previewed subtree history.";
