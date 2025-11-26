/**
 * State management for markdown sync to prevent race conditions
 * Uses a simple state machine approach instead of multiple refs
 */

export type SyncState = "idle" | "syncing-to-editor" | "syncing-from-editor";

export interface MarkdownSyncState {
  state: SyncState;
  lastAppliedMarkdown: string;
  lastEditorMarkdown: string;
  lastEditorChangeTime: number;
  isInitialMount: boolean;
}

const EDITOR_CHANGE_DEBOUNCE_MS = 15_000; // 15 seconds (increased from 10)

/**
 * Create initial sync state
 */
export function createSyncState(initialMarkdown: string): MarkdownSyncState {
  return {
    state: "idle",
    lastAppliedMarkdown: initialMarkdown,
    lastEditorMarkdown: "",
    lastEditorChangeTime: 0,
    isInitialMount: true,
  };
}

/**
 * Check if we should apply external markdown to editor
 */
export function shouldApplyMarkdownToEditor(
  syncState: MarkdownSyncState,
  incomingMarkdown: string,
  currentEditorMarkdown: string,
): boolean {
  // Always apply on initial mount
  if (syncState.isInitialMount) {
    return true;
  }

  // Skip if markdown hasn't changed
  if (incomingMarkdown === syncState.lastAppliedMarkdown) {
    return false;
  }

  // Skip if this markdown came from the editor itself
  if (incomingMarkdown === syncState.lastEditorMarkdown) {
    return false;
  }

  // Skip if editor was recently modified
  const timeSinceLastChange = Date.now() - syncState.lastEditorChangeTime;
  if (timeSinceLastChange < EDITOR_CHANGE_DEBOUNCE_MS) {
    return false;
  }

  // Skip if content already matches
  if (currentEditorMarkdown === incomingMarkdown) {
    return false;
  }

  // Don't clear content if incoming markdown is empty but editor has content
  if (incomingMarkdown.trim().length === 0 && currentEditorMarkdown.trim().length > 0) {
    return false;
  }

  return true;
}

/**
 * Update sync state after applying markdown to editor
 */
export function updateStateAfterApplyToEditor(
  syncState: MarkdownSyncState,
  markdown: string,
): MarkdownSyncState {
  return {
    ...syncState,
    state: "idle",
    lastAppliedMarkdown: markdown,
    isInitialMount: false,
  };
}

/**
 * Update sync state when editor changes
 */
export function updateStateOnEditorChange(
  syncState: MarkdownSyncState,
  editorMarkdown: string,
): MarkdownSyncState {
  return {
    ...syncState,
    state: "syncing-from-editor",
    lastEditorMarkdown: editorMarkdown,
    lastEditorChangeTime: Date.now(),
  };
}

/**
 * Update sync state after sending markdown from editor
 */
export function updateStateAfterSendFromEditor(
  syncState: MarkdownSyncState,
  markdown: string,
): MarkdownSyncState {
  return {
    ...syncState,
    state: "idle",
    lastAppliedMarkdown: markdown,
    lastEditorMarkdown: markdown,
  };
}

