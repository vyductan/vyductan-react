"use client";

import type { LexicalNode } from "lexical";
import { useEffect } from "react";
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import { $createTextNode, $getRoot } from "lexical";

/**
 * Add a line to a document's section from outside the editor: the text
 * becomes an item of the list under the section's heading. Returns false
 * when the line was already there, so a second click does nothing.
 */
export type SectionAppender = (text: string) => boolean;

export interface SectionAppendPluginProps {
  /** Whether a heading with this text opens the section. */
  isSectionHeading: (text: string) => boolean;
  /** The heading to add at the end when the document has no such section. */
  fallbackHeading: string;
  /** Receives the appender once the editor is ready, and null on unmount. */
  onReady: (append: SectionAppender | null) => void;
}

/**
 * Lets a component beside the editor write into one of its sections — e.g.
 * a panel that offers "add this to Learned" — without owning the editor.
 *
 * The line goes into the list right after the section's heading: into its
 * first empty item (a template leaves one to type into), else as a new last
 * item, else as a new list when the heading has none. Without the section at
 * all, the heading and list are added at the end of the document.
 */
export function SectionAppendPlugin({
  isSectionHeading,
  fallbackHeading,
  onReady,
}: SectionAppendPluginProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const append: SectionAppender = (text) => {
      const line = text.trim();
      if (!line) return false;
      let added = false;
      editor.update(() => {
        const root = $getRoot();
        const heading = root
          .getChildren()
          .find(
            (node) =>
              $isHeadingNode(node) && isSectionHeading(node.getTextContent()),
          );

        const newItem = () => {
          const item = $createListItemNode();
          item.append($createTextNode(line));
          return item;
        };

        if (!heading) {
          const title = $createHeadingNode("h2");
          title.append($createTextNode(fallbackHeading));
          const list = $createListNode("number");
          list.append(newItem());
          root.append(title, list);
          added = true;
          return;
        }

        const next: LexicalNode | null = heading.getNextSibling();
        if (!$isListNode(next)) {
          const list = $createListNode("number");
          list.append(newItem());
          heading.insertAfter(list);
          added = true;
          return;
        }

        const items = next.getChildren().filter($isListItemNode);
        if (items.some((item) => item.getTextContent().trim() === line)) {
          return;
        }
        const empty = items.find((item) => item.getTextContent().trim() === "");
        if (empty) empty.append($createTextNode(line));
        else next.append(newItem());
        added = true;
      });
      return added;
    };

    onReady(append);
    return () => onReady(null);
  }, [editor, isSectionHeading, fallbackHeading, onReady]);

  return null;
}
