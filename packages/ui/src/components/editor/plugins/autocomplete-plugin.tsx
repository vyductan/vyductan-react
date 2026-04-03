/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { BaseSelection, NodeKey } from "lexical";
import type { JSX } from "react";
import { useCallback, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isAtNodeEnd } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_TAB_COMMAND,
} from "lexical";

import { useSharedAutocompleteContext } from "../context/shared-autocomplete-context";
import {
  $createAutocompleteNode,
  AutocompleteNode,
} from "../nodes/autocomplete-node";
import { addSwipeRightListener } from "../utils/swipe";

type SearchPromise = {
  dismiss: () => void;
  promise: Promise<null | string>;
};

export const uuid = Math.random()
  .toString(36)
  .replaceAll(/[^a-z]+/g, "")
  .slice(0, 5);

// TODO lookup should be custom
function $search(selection: null | BaseSelection): [boolean, string] {
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return [false, ""];
  }
  const node = selection.getNodes()[0];
  const anchor = selection.anchor;
  // Check siblings?
  if (!$isTextNode(node) || !node.isSimpleText() || !$isAtNodeEnd(anchor)) {
    return [false, ""];
  }
  const word = [];
  const text = node.getTextContent();
  let i = node.getTextContentSize();
  let c;
  while (i-- && i >= 0 && (c = text[i]) !== " ") {
    word.push(c);
  }
  if (word.length === 0) {
    return [false, ""];
  }
  return [true, word.toReversed().join("")];
}

// TODO query should be custom
function useQuery(): (searchText: string) => SearchPromise {
  return useCallback((searchText: string) => {
    const server = new AutocompleteServer();
    console.time("query");
    const response = server.query(searchText);
    console.timeEnd("query");
    return response;
  }, []);
}

export function AutocompletePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [, setSuggestion] = useSharedAutocompleteContext();
  const query = useQuery();

  useEffect(() => {
    let autocompleteNodeKey: null | NodeKey = null;
    let lastMatch: null | string = null;
    let lastSuggestion: null | string = null;
    let lastFullSuggestion: null | string = null; // Store full suggestion word
    let lastMatchNodeKey: null | NodeKey = null; // Store the node key where match was found
    let lastMatchOffset: null | number = null; // Store the offset where match was found
    let searchPromise: null | SearchPromise = null;
    function $clearSuggestion() {
      const autocompleteNode =
        autocompleteNodeKey === null
          ? null
          : $getNodeByKey(autocompleteNodeKey);
      if (autocompleteNode?.isAttached()) {
        autocompleteNode.remove();
        autocompleteNodeKey = null;
      }
      if (searchPromise !== null) {
        searchPromise.dismiss();
        searchPromise = null;
      }
      lastMatch = null;
      lastSuggestion = null;
      lastFullSuggestion = null;
      lastMatchNodeKey = null;
      lastMatchOffset = null;
      setSuggestion(null);
    }
    function updateAsyncSuggestion(
      refSearchPromise: SearchPromise,
      newSuggestion: null | string,
    ) {
      if (searchPromise !== refSearchPromise || newSuggestion === null) {
        // Outdated or no suggestion
        return;
      }
      editor.update(
        () => {
          const selection = $getSelection();
          const [hasMatch, match] = $search(selection);
          if (
            !hasMatch ||
            match !== lastMatch ||
            !$isRangeSelection(selection)
          ) {
            // Outdated
            return;
          }
          // Store the node and offset where match was found
          const node = selection.getNodes()[0];
          if ($isTextNode(node)) {
            lastMatchNodeKey = node.getKey();
            lastMatchOffset = selection.anchor.offset;
          }
          const selectionCopy = selection.clone();
          const autocompleteNode = $createAutocompleteNode(uuid);
          autocompleteNodeKey = autocompleteNode.getKey();
          selection.insertNodes([autocompleteNode]);
          $setSelection(selectionCopy);
          lastSuggestion = newSuggestion;
          // Store full suggestion word (match + suggestion)
          lastFullSuggestion = match + newSuggestion;
          setSuggestion(newSuggestion);
        },
        { tag: "history-merge" },
      );
    }

    function $handleAutocompleteNodeTransform(node: AutocompleteNode) {
      const key = node.getKey();
      if (node.__uuid === uuid && key !== autocompleteNodeKey) {
        // Max one Autocomplete node per session
        $clearSuggestion();
      }
    }
    function handleUpdate() {
      editor.update(() => {
        const selection = $getSelection();
        const [hasMatch, match] = $search(selection);
        if (!hasMatch) {
          $clearSuggestion();
          return;
        }
        if (match === lastMatch) {
          return;
        }
        $clearSuggestion();
        searchPromise = query(match);
        searchPromise.promise
          .then((newSuggestion) => {
            if (searchPromise !== null) {
              updateAsyncSuggestion(searchPromise, newSuggestion);
            }
          })
          .catch(() => {
            // console.error(e)
          });
        lastMatch = match;
      });
    }
    function $handleAutocompleteIntent(): boolean {
      if (
        lastSuggestion === null ||
        lastFullSuggestion === null ||
        autocompleteNodeKey === null ||
        lastMatch === null ||
        lastMatchNodeKey === null ||
        lastMatchOffset === null
      ) {
        return false;
      }

      // Store values in local variables to avoid TypeScript null checks in closure
      const nodeKey = autocompleteNodeKey;
      const matchKey = lastMatchNodeKey;
      const matchOffset = lastMatchOffset;
      const fullSuggestion = lastFullSuggestion;
      const match = lastMatch;

      // Use stored node and offset to ensure we replace the correct word
      editor.update(
        () => {
          const autocompleteNode = $getNodeByKey(nodeKey);
          if (!autocompleteNode?.isAttached()) {
            return;
          }

          const matchNode = $getNodeByKey(matchKey);
          if (!matchNode || !$isTextNode(matchNode)) {
            return;
          }

          const text = matchNode.getTextContent();
          const offset = matchOffset;

          // Find the start of the word that was matched (backward until space or start)
          let wordStart: number = offset;
          while (wordStart > 0 && text[wordStart - 1] !== " ") {
            wordStart--;
          }

          // Find the end of the word that was matched (forward until space or end)
          let wordEnd: number = offset;
          while (wordEnd < text.length && text[wordEnd] !== " ") {
            wordEnd++;
          }

          // Verify that the word at this position matches what we expect
          const currentWord = text.slice(wordStart, wordEnd);
          if (currentWord !== match) {
            // Word doesn't match, don't replace
            return;
          }

          // Only proceed if we found a valid word to replace
          if (wordStart >= wordEnd) {
            return;
          }

          // Use setTextContent instead of replace to preserve parent node
          const newText =
            text.slice(0, wordStart) + fullSuggestion + text.slice(wordEnd);
          matchNode.setTextContent(newText);

          // Remove autocomplete node if it exists
          if (autocompleteNode.isAttached()) {
            autocompleteNode.remove();
          }

          // Set cursor after the inserted word
          const newOffset = wordStart + fullSuggestion.length;
          matchNode.select(newOffset, newOffset);
        },
        { tag: "history-merge" },
      );

      $clearSuggestion();
      return true;
    }
    function $handleKeypressCommand(e: Event) {
      if ($handleAutocompleteIntent()) {
        e.preventDefault();
        return true;
      }
      return false;
    }
    function handleSwipeRight(_force: number, e: TouchEvent) {
      editor.update(() => {
        if ($handleAutocompleteIntent()) {
          e.preventDefault();
        }
      });
    }
    function unmountSuggestion() {
      editor.update(() => {
        $clearSuggestion();
      });
    }

    const rootElem = editor.getRootElement();

    return mergeRegister(
      editor.registerNodeTransform(
        AutocompleteNode,
        $handleAutocompleteNodeTransform,
      ),
      editor.registerUpdateListener(handleUpdate),
      editor.registerCommand(
        KEY_TAB_COMMAND,
        $handleKeypressCommand,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        $handleKeypressCommand,
        COMMAND_PRIORITY_LOW,
      ),
      ...(rootElem === null
        ? []
        : [addSwipeRightListener(rootElem, handleSwipeRight)]),
      unmountSuggestion,
    );
  }, [editor, query, setSuggestion]);

  return null;
}

/*
 * Simulate an asynchronous autocomplete server (typical in more common use cases like GMail where
 * the data is not static).
 */
class AutocompleteServer {
  DATABASE = DICTIONARY;
  LATENCY = 200;

  query = (searchText: string): SearchPromise => {
    let isDismissed = false;

    const dismiss = () => {
      isDismissed = true;
    };
    const promise = new Promise<null | string>((resolve, reject) => {
      setTimeout(() => {
        if (isDismissed) {
          // TODO cache result
          return reject(new Error("Dismissed"));
        }
        const searchTextLength = searchText.length;
        // Tắt autocomplete bằng cách yêu cầu từ phải dài hơn 100 ký tự (thực tế không bao giờ xảy ra)
        if (searchText === "" || searchTextLength < 100) {
          return resolve(null);
        }
        const char0 = searchText.codePointAt(0);
        if (char0 === undefined) {
          return resolve(null);
        }
        const isCapitalized = char0 >= 65 && char0 <= 90;
        const caseInsensitiveSearchText = isCapitalized
          ? String.fromCodePoint(char0 + 32) + searchText.slice(1)
          : searchText;
        const match = this.DATABASE.find((dictionaryWord) =>
          dictionaryWord.startsWith(caseInsensitiveSearchText),
        );
        if (match === undefined) {
          return resolve(null);
        }
        const matchCodePoint0 = match.codePointAt(0);
        if (matchCodePoint0 === undefined) {
          return resolve(null);
        }
        const [, ...matchRestChars] = [...match];
        const matchRest = matchRestChars.join("");
        const matchCapitalized = isCapitalized
          ? String.fromCodePoint(matchCodePoint0 - 32) + matchRest
          : match;
        const autocompleteChunk = matchCapitalized.slice(
          Math.max(0, searchTextLength),
        );
        if (autocompleteChunk === "") {
          return resolve(null);
        }
        return resolve(autocompleteChunk);
      }, this.LATENCY);
    });

    return {
      dismiss,
      promise,
    };
  };
}

// https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears-long.txt
// DICTIONARY đã bị xóa để tắt tính năng autocomplete tự động thay thế text
const DICTIONARY: string[] = [];
