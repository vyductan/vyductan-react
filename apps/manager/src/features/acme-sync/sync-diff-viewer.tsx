import { Diff, Hunk } from "react-diff-view";

import "react-diff-view/style/index.css";

import { getParsedSyncDiffState } from "./sync-diff-parse-state";

interface SyncDiffViewerProps {
  diffText: string;
  isLoading: boolean;
  error: string | null;
}

export function SyncDiffViewer({
  diffText,
  isLoading,
  error,
}: SyncDiffViewerProps) {
  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading diff...</p>;
  }

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  if (!diffText.trim()) {
    return (
      <p className="text-muted-foreground text-sm">No textual diff output.</p>
    );
  }

  const parsedState = getParsedSyncDiffState(diffText);

  if (!parsedState.firstFile) {
    return (
      <div className="space-y-2">
        {parsedState.parseError ? (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {parsedState.parseError} Showing raw unified diff instead.
          </p>
        ) : null}
        <pre className="bg-muted/30 overflow-auto rounded-md border p-3 text-xs whitespace-pre-wrap">
          {diffText}
        </pre>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 [&_.diff-decoration]:bg-muted/60 [&_.diff-decoration]:text-muted-foreground [&_.diff-line]:border-border/40 [&_.diff-gutter-normal]:text-muted-foreground overflow-auto rounded-md border p-3 text-sm [&_.diff]:min-w-full [&_.diff]:table-fixed [&_.diff-code]:font-mono [&_.diff-code]:text-[12px] [&_.diff-code]:leading-6 [&_.diff-code-delete]:bg-red-500/10 [&_.diff-code-delete]:text-red-950 dark:[&_.diff-code-delete]:bg-red-500/15 dark:[&_.diff-code-delete]:text-red-100 [&_.diff-code-insert]:bg-emerald-500/10 [&_.diff-code-insert]:text-emerald-950 dark:[&_.diff-code-insert]:bg-emerald-500/15 dark:[&_.diff-code-insert]:text-emerald-100 [&_.diff-code-normal]:bg-transparent [&_.diff-decoration-content]:text-[12px] [&_.diff-gutter]:text-[11px] [&_.diff-gutter-delete]:bg-red-500/15 [&_.diff-gutter-delete]:text-red-700 dark:[&_.diff-gutter-delete]:text-red-300 [&_.diff-gutter-insert]:bg-emerald-500/15 [&_.diff-gutter-insert]:text-emerald-700 dark:[&_.diff-gutter-insert]:text-emerald-300 [&_.diff-line]:border-b">
      <Diff
        diffType={parsedState.firstFile.type}
        hunks={parsedState.firstFile.hunks}
        viewType="unified"
      >
        {(hunks) =>
          hunks.map((hunk, index) => (
            <Hunk key={`${hunk.content}-${index}`} hunk={hunk} />
          ))
        }
      </Diff>
    </div>
  );
}
