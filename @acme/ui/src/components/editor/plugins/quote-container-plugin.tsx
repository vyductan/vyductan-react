"use client";

import { useEffect } from "react";
import { $createListNode, $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  INSERT_PARAGRAPH_COMMAND,
} from "lexical";

import { $isQuoteContainerNode } from "../nodes/quote-container-node";

/**
 * Enter on the empty last item of a list that ends a quote takes the item
 * out, right after the quote and still an item, as Notion does: the way out
 * of a list in a quote. It became an empty line inside the quote.
 */
export function QuoteContainerPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand(
        INSERT_PARAGRAPH_COMMAND,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return false;
          }
          const item = $findMatchingParent(
            selection.anchor.getNode(),
            $isListItemNode,
          );
          const list = item?.getParent();
          const quote = list?.getParent();
          if (
            !item ||
            !$isListNode(list) ||
            !$isQuoteContainerNode(quote) ||
            item.getChildrenSize() > 0 ||
            item.getNextSibling() !== null ||
            list.getNextSibling() !== null
          ) {
            return false;
          }

          // A list of the same kind just after the quote takes it at its
          // head; else it starts one.
          const after = quote.getNextSibling();
          if (
            $isListNode(after) &&
            after.getListType() === list.getListType()
          ) {
            const first = after.getFirstChild();
            if (first) first.insertBefore(item);
            else after.append(item);
          } else {
            quote.insertAfter($createListNode(list.getListType()).append(item));
          }
          if (list.getChildrenSize() === 0) list.remove();
          if (quote.getChildrenSize() === 0) quote.remove();
          item.select();
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    [editor],
  );

  return null;
}
