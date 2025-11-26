"use client";

/**
 * Editor component với Markdown sync support
 *
 * Converts between markdown string and Lexical editor state automatically
 */
import type {
  InitialConfigType,
  InitialEditorStateType,
} from "@lexical/react/LexicalComposer";
import { useEffect, useRef, useState } from "react";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { TooltipProvider } from "../tooltip";
import { EditorErrorBoundary } from "./components/editor-error-boundary";
import { FloatingLinkContext } from "./context/floating-link-context";
import { SharedAutocompleteContext } from "./context/shared-autocomplete-context";
import { nodes } from "./nodes/nodes";
import { Plugins } from "./plugins/plugins";
import { WordCountPlugin } from "./plugins/word-count-plugin";
import { editorTheme } from "./themes/editor-theme";
import { MARKDOWN_TRANSFORMERS } from "./transformers/markdown-transformers";
import { getMarkdownFromEditor } from "./utils/lexical-converter";
import {
  createSyncState,
  shouldApplyMarkdownToEditor,
  updateStateAfterApplyToEditor,
  updateStateAfterSendFromEditor,
  updateStateOnEditorChange,
  type MarkdownSyncState,
} from "./utils/markdown-sync-state";

interface EditorWithMarkdownProps {
  markdown: string; // Markdown string input
  onMarkdownChange: (markdown: string) => void; // Callback with markdown string
  placeholder?: string;
  onStatsChange?: (stats: {
    wordCount: number;
    characterCount: number;
    readingTimeMinutes: number;
  }) => void;
}

/**
 * Simplified Markdown Sync Plugin
 * Uses state machine approach to prevent race conditions
 */
function MarkdownSyncPlugin({
  markdown,
  onMarkdownChange,
  syncStateRef,
}: {
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
  syncStateRef: React.MutableRefObject<MarkdownSyncState>;
}) {
  const [editor] = useLexicalComposerContext();

  // Convert markdown to Lexical state when external markdown changes
  useEffect(() => {
    const currentEditorMarkdown = getMarkdownFromEditor(editor);
    const shouldApply = shouldApplyMarkdownToEditor(
      syncStateRef.current,
      markdown,
      currentEditorMarkdown,
    );

    if (!shouldApply) {
      return;
    }

    editor.update(
      () => {
        $convertFromMarkdownString(markdown, MARKDOWN_TRANSFORMERS);
      },
      { discrete: true },
    );

    syncStateRef.current = updateStateAfterApplyToEditor(
      syncStateRef.current,
      markdown,
    );
  }, [markdown, editor, syncStateRef]);

  // Convert Lexical state to markdown on editor changes
  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves, tags }) => {
        // Skip if it's just a selection change or history merge
        if (tags.has("selection-change") || tags.has("history-merge")) {
          return;
        }

        // Skip if there are no actual content changes
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
          return;
        }

        editorState.read(() => {
          const markdownString = $convertToMarkdownString(MARKDOWN_TRANSFORMERS);

          // Only send if markdown has changed and is not empty
          if (
            markdownString !== syncStateRef.current.lastAppliedMarkdown &&
            markdownString.trim().length > 0
          ) {
            syncStateRef.current = updateStateOnEditorChange(
              syncStateRef.current,
              markdownString,
            );

            onMarkdownChange(markdownString);

            syncStateRef.current = updateStateAfterSendFromEditor(
              syncStateRef.current,
              markdownString,
            );
          }
        });
      },
    );
  }, [editor, onMarkdownChange, syncStateRef]);

  return null;
}

const editorConfig: InitialConfigType = {
  namespace: "EditorWithMarkdown",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    // Log error for debugging
    console.error("Lexical Editor Error:", error);

    // Error boundary will handle user-facing error messages
    // This is just for logging internal errors
  },
};

export function EditorWithMarkdown({
  markdown,
  onMarkdownChange,
  placeholder,
  onStatsChange,
}: EditorWithMarkdownProps) {
  const syncStateRef = useRef(createSyncState(markdown));

  // Update sync state when markdown prop changes externally
  useEffect(() => {
    syncStateRef.current.lastAppliedMarkdown = markdown;
  }, [markdown]);

  // Initial editor state - empty, will be set by MarkdownSyncPlugin
  const initialEditorState: InitialEditorStateType | undefined = undefined;

  return (
    <EditorErrorBoundary>
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          editorState: initialEditorState,
        }}
      >
        <TooltipProvider>
          <SharedAutocompleteContext>
            <FloatingLinkContext>
              <Plugins placeholder={placeholder} />

              {/* Markdown Sync Plugin - Simplified state machine approach */}
              <MarkdownSyncPlugin
                markdown={markdown}
                onMarkdownChange={onMarkdownChange}
                syncStateRef={syncStateRef}
              />

              {/* Word Count Plugin - Tính toán word count và reading time */}
              {onStatsChange && (
                <WordCountPlugin onStatsChange={onStatsChange} />
              )}
            </FloatingLinkContext>
          </SharedAutocompleteContext>
        </TooltipProvider>
      </LexicalComposer>
    </EditorErrorBoundary>
  );
}
