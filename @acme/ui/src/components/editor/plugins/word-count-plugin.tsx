"use client";

/**
 * Word Count & Reading Time Plugin
 *
 * Computes and reports:
 * - Word count
 * - Estimated reading time
 *
 * The plugin exposes the stats through a callback so the parent component can display them
 */
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";

interface WordCountStats {
  wordCount: number;
  characterCount: number;
  readingTimeMinutes: number;
}

interface WordCountPluginProperties {
  onStatsChange?: (stats: WordCountStats) => void;
  wordsPerMinute?: number; // Default: 200
}

export function WordCountPlugin({
  onStatsChange,
  wordsPerMinute = 200,
}: WordCountPluginProperties) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();

        // Remove extra whitespace and split into words
        const words = textContent
          .trim()
          .split(/\s+/)
          .filter((w) => w.length > 0);

        const wordCount = words.length;
        const characterCount = textContent.length;
        const readingTimeMinutes = Math.max(
          1,
          Math.ceil(wordCount / wordsPerMinute),
        );

        onStatsChange?.({
          wordCount,
          characterCount,
          readingTimeMinutes,
        });
      });
    });
  }, [editor, onStatsChange, wordsPerMinute]);

  return null;
}
