"use client";

import type { EditorState } from "lexical";
import { useEffect, useRef } from "react";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import { MARKDOWN_TRANSFORMERS } from "../transformers/markdown-transformers";

// Plugin to initialize editor with markdown content
function InitialMarkdownPlugin({ markdown }: { markdown: string }) {
  const [editor] = useLexicalComposerContext();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;

    // Only initialize if markdown is provided and not empty
    if (markdown) {
      editor.update(() => {
        $convertFromMarkdownString(markdown, MARKDOWN_TRANSFORMERS);
      });
    }

    isInitializedRef.current = true;
  }, [editor, markdown]);

  return null;
}

interface MarkdownPluginsProps {
  defaultValue?: string;
  value?: string;
  onChange?: (markdown: string, editorState: EditorState) => void;
}

export function MarkdownPlugins({
  defaultValue,
  value,
  onChange,
}: MarkdownPluginsProps) {
  return (
    <>
      <InitialMarkdownPlugin markdown={defaultValue ?? value ?? ""} />

      <OnChangePlugin
        ignoreSelectionChange={true}
        onChange={(editorState) => {
          editorState.read(() => {
            const markdown = $convertToMarkdownString(MARKDOWN_TRANSFORMERS);
            console.log("[MarkdownPlugins] Converted markdown:", markdown);
            onChange?.(markdown, editorState);
          });
        }}
      />
    </>
  );
}

// Default export for dynamic imports
export default MarkdownPlugins;
