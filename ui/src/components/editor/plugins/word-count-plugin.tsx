"use client";

/**
 * Word Count & Reading Time Plugin
 * 
 * Tính toán và hiển thị:
 * - Số từ (word count)
 * - Thời gian đọc ước tính (reading time)
 * 
 * Plugin này expose stats qua callback để component cha có thể hiển thị
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";

interface WordCountStats {
  wordCount: number;
  characterCount: number;
  readingTimeMinutes: number;
}

interface WordCountPluginProps {
  onStatsChange?: (stats: WordCountStats) => void;
  wordsPerMinute?: number; // Default: 200
}

export function WordCountPlugin({
  onStatsChange,
  wordsPerMinute = 200,
}: WordCountPluginProps) {
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

