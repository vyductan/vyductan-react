/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react-hooks/set-state-in-effect */

"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { MenuTextMatch } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import type { TextNode } from "lexical";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { CircleUserRoundIcon } from "lucide-react";
import { createPortal } from "react-dom";

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@acme/ui/components/command";

import { $createMentionNode } from "../nodes/mention-node";
import { LexicalTypeaheadMenuPlugin } from "./default/lexical-typeahead-menu-plugin";

const PUNCTUATION = String.raw`\.,\+\*\?\$\@\|#{}\(\)\^\-\[\]\\/!%'"~=<>_:;`;
const NAME = String.raw`\b[A-Z][^\s` + PUNCTUATION + "]";

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

const PUNC = DocumentMentionsRegex.PUNCTUATION;

const TRIGGERS = ["@"].join("");

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = "[^" + TRIGGERS + PUNC + String.raw`\s]`;

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  "(?:" +
  String.raw`\.[ |$]|` + // E.g. "r. " in "Mr. Smith"
  " |" + // E.g. " " in "Josh Duck"
  "[" +
  PUNC +
  "]|" + // E.g. "-' in "Salier-Hellendag"
  ")";

const LENGTH_LIMIT = 75;

const AtSignMentionsRegex = new RegExp(
  String.raw`(^|\s|\()(` +
    "[" +
    TRIGGERS +
    "]" +
    "((?:" +
    VALID_CHARS +
    VALID_JOINS +
    "){0," +
    LENGTH_LIMIT +
    "})" +
    ")$",
);

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50;

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
  String.raw`(^|\s|\()(` +
    "[" +
    TRIGGERS +
    "]" +
    "((?:" +
    VALID_CHARS +
    "){0," +
    ALIAS_LENGTH_LIMIT +
    "})" +
    ")$",
);

// At most, 5 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 5;

export interface MentionData {
  name: string;
  avatar?: string;
  email?: string;
}

const mentionsCache = new Map();

function useMentionLookupService(
  mentionString: string | null,
  mentionsData: MentionData[] = [],
) {
  const [results, setResults] = useState<Array<MentionData>>([]);

  useEffect(() => {
    const cachedResults = mentionsCache.get(mentionString);

    if (mentionString == null) {
      setResults((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    if (cachedResults === null) {
      return;
    } else if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    mentionsCache.set(mentionString, null);
    setTimeout(() => {
      const results = mentionsData.filter((mention) =>
        mention.name.toLowerCase().includes(mentionString.toLowerCase()),
      );
      mentionsCache.set(mentionString, results);
      setResults(results);
    }, 100);
  }, [mentionString, mentionsData]);

  return results;
}

function checkForAtSignMentions(
  text: string,
  minMatchLength: number,
): MenuTextMatch | null {
  let match = AtSignMentionsRegex.exec(text);

  match ??= AtSignMentionsRegexAliasRegex.exec(text);
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset

    const maybeLeadingWhitespace = match[1];

    const matchingString = match[3];
    if (matchingString && matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + (maybeLeadingWhitespace?.length ?? 0),
        matchingString,
        replaceableString: match[2]!,
      };
    }
  }
  return null;
}

function getPossibleQueryMatch(text: string): MenuTextMatch | null {
  return checkForAtSignMentions(text, 1);
}

class MentionTypeaheadOption extends MenuOption {
  name: string;
  picture: JSX.Element;

  constructor(name: string, picture: JSX.Element) {
    super(name);
    this.name = name;
    this.picture = picture;
  }
}

export function MentionsPlugin({
  mentionsData = [],
}: {
  mentionsData?: MentionData[];
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const results = useMentionLookupService(queryString, mentionsData);

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(
    () =>
      results
        .map(
          (result) =>
            new MentionTypeaheadOption(
              result.name,
              result.avatar ? (
                <picture>
                  <img
                    src={result.avatar}
                    className="size-4 rounded-full object-cover"
                    alt={result.name}
                  />
                </picture>
              ) : (
                <CircleUserRoundIcon className="size-4" />
              ),
            ),
        )
        .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results],
  );

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(selectedOption.name);
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        mentionNode.select();
        closeMenu();
      });
    },
    [editor],
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      if (slashMatch !== null) {
        return null;
      }
      return getPossibleQueryMatch(text);
    },
    [checkForSlashTriggerMatch, editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        return anchorElementRef.current && results.length > 0
          ? createPortal(
              <div className="fixed z-10 w-[200px] rounded-md shadow-md">
                <Command
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setHighlightedIndex(
                        selectedIndex === null
                          ? options.length - 1
                          : (selectedIndex - 1 + options.length) %
                              options.length,
                      );
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setHighlightedIndex(
                        selectedIndex === null
                          ? 0
                          : (selectedIndex + 1) % options.length,
                      );
                    }
                  }}
                >
                  <CommandList>
                    <CommandGroup>
                      {options.map((option, index) => (
                        <CommandItem
                          key={option.key}
                          value={option.name}
                          onSelect={() => {
                            selectOptionAndCleanUp(option);
                          }}
                          className={`flex items-center gap-2 ${
                            selectedIndex === index
                              ? "bg-accent"
                              : "bg-transparent!"
                          }`}
                        >
                          {option.picture}
                          {option.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>,
              anchorElementRef.current,
            )
          : null;
      }}
    />
  );
}
