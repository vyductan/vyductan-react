import { parseDiff } from "react-diff-view";

export interface ParsedSyncDiffState {
  firstFile: ReturnType<typeof parseDiff>[number] | null;
  parseError: string | null;
}

export const getParsedSyncDiffState = (
  diffText: string,
): ParsedSyncDiffState => {
  if (!diffText.trim()) {
    return {
      firstFile: null,
      parseError: null,
    };
  }

  try {
    const files = parseDiff(diffText);
    const firstFile = files[0];
    const renderableFile =
      firstFile && firstFile.hunks.length > 0 ? firstFile : null;

    if (!renderableFile) {
      return {
        firstFile: null,
        parseError: "Diff parse failed: no renderable hunks found.",
      };
    }

    return {
      firstFile: renderableFile,
      parseError: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      firstFile: null,
      parseError: `Diff parse failed: ${message}`,
    };
  }
};
