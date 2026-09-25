"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

/** Keys Lexical binds to text formatting under ⌘ (macOS) / Ctrl. */
const FORMAT_KEYS = new Set(["b", "i", "u"]);

/**
 * Keeps ⌘B / ⌘I / ⌘U inside the editor once Lexical has formatted with them.
 *
 * Pages bind the same chords at `window` — the shadcn sidebar toggles on ⌘B —
 * and that listener ignores `defaultPrevented`, so bolding a word also
 * collapsed the sidebar. The listener is vendored and not ours to change, so
 * the editor stops the chord from bubbling instead. It is on the root element,
 * the same node Lexical listens on, so stopPropagation leaves Lexical's own
 * handler untouched and only hides the key from ancestors.
 *
 * A read-only editor formats nothing, so there the key goes on to the page.
 */
export function FormatShortcutsPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) {
        return;
      }
      if (!FORMAT_KEYS.has(event.key.toLowerCase())) return;
      if (!editor.isEditable()) return;
      event.stopPropagation();
    };

    return editor.registerRootListener((root, previous) => {
      previous?.removeEventListener("keydown", onKeyDown);
      root?.addEventListener("keydown", onKeyDown);
    });
  }, [editor]);

  return null;
}
