"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TextNode } from "lexical";

import {
  containsInvalidBlockTypeValue,
  normalizeBlockTypeLikeString,
} from "../utils/blocktype-normalization";

/**
 * Ensures user-entered text that matches blockType identifiers is automatically
 * adjusted so it isn't treated as structural metadata (prevents content loss).
 *
 * Performance optimizations:
 * - Only checks text that might be invalid (quick check before full normalization)
 * - Debounced transform to avoid excessive updates
 */
export function BlockTypeNormalizationPlugin(): null {
  const [editor] = useLexicalComposerContext();
  const transformTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return editor.registerNodeTransform(TextNode, (node) => {
      const textContent = node.getTextContent();

      // Quick check: only normalize if text might be invalid
      // This avoids expensive normalization for most text nodes
      if (!containsInvalidBlockTypeValue(textContent)) {
        return;
      }

      // Debounce transform to avoid excessive updates during rapid typing
      if (transformTimeoutRef.current) {
        clearTimeout(transformTimeoutRef.current);
      }

      transformTimeoutRef.current = setTimeout(() => {
        editor.update(() => {
          const normalized = normalizeBlockTypeLikeString(textContent);
          if (textContent !== normalized) {
            node.setTextContent(normalized);
          }
        });
      }, 100); // 100ms debounce
    });
  }, [editor]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transformTimeoutRef.current) {
        clearTimeout(transformTimeoutRef.current);
      }
    };
  }, []);

  return null;
}
