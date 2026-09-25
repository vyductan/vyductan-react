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

import type { PageLinkTarget } from "../utils/page-link";
import { $createMentionNode } from "../nodes/mention-node";
import { $createPageLinkNode, DEFAULT_PAGE_ICON } from "../utils/page-link";
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

// At most, 5 people are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 5;
// Pages get more room: a title is what the writer is scanning for.
const PAGE_LIST_LENGTH_LIMIT = 8;
// Long enough to skip the requests a fast typist makes obsolete mid-word.
const PAGE_SEARCH_DEBOUNCE_MS = 120;

export interface MentionData {
  name: string;
  avatar?: string;
  email?: string;
}

/** A page the host offers under "Link to page". */
export interface PageLinkOption extends PageLinkTarget {
  /** Muted second line, e.g. the folder the page lives in. */
  description?: string;
}

/**
 * Find pages for the @ menu. Called with "" on a bare "@", so the host can
 * offer recent pages before anything is typed.
 */
export type SearchPageLinks = (
  query: string,
) => Promise<PageLinkOption[]> | PageLinkOption[];

const mentionsCache = new Map();

function useMentionLookupService(
  mentionString: string | null,
  mentionsData: MentionData[] = [],
) {
  const [results, setResults] = useState<Array<MentionData>>([]);

  useEffect(() => {
    const cachedResults = mentionsCache.get(mentionString);

    if (mentionString == undefined) {
      setResults((previous) => (previous.length === 0 ? previous : []));
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

/**
 * Pages matching the query, from the host. Not cached like people: pages are
 * created and renamed while the editor is open, so a cached answer goes stale.
 * A response that arrives after a newer query has been asked is dropped, so a
 * slow request for "to" cannot overwrite the answer for "tour".
 */
function usePageLinkSearch(
  query: string | null,
  searchPageLinks: SearchPageLinks | undefined,
) {
  const [results, setResults] = useState<PageLinkOption[]>([]);

  useEffect(() => {
    if (query === null || !searchPageLinks) {
      setResults((previous) => (previous.length === 0 ? previous : []));
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      void Promise.resolve(searchPageLinks(query))
        .then((pages) => {
          if (!cancelled) setResults(pages.slice(0, PAGE_LIST_LENGTH_LIMIT));
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        });
    }, PAGE_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, searchPageLinks]);

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
    if (
      matchingString !== undefined &&
      matchingString.length >= minMatchLength
    ) {
      return {
        leadOffset: match.index + (maybeLeadingWhitespace?.length ?? 0),
        matchingString,
        replaceableString: match[2]!,
      };
    }
  }
  return null;
}

class MentionTypeaheadOption extends MenuOption {
  readonly kind = "person";
  name: string;
  picture: JSX.Element;

  constructor(name: string, picture: JSX.Element) {
    super(`person:${name}`);
    this.name = name;
    this.picture = picture;
  }
}

class PageLinkTypeaheadOption extends MenuOption {
  readonly kind = "page";
  page: PageLinkOption;

  constructor(page: PageLinkOption) {
    super(`page:${page.url}`);
    this.page = page;
  }
}

type AtMenuOption = MentionTypeaheadOption | PageLinkTypeaheadOption;

export function MentionsPlugin({
  mentionsData = [],
  searchPageLinks,
}: {
  mentionsData?: MentionData[];
  searchPageLinks?: SearchPageLinks;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const people = useMentionLookupService(queryString, mentionsData);
  const pages = usePageLinkSearch(queryString, searchPageLinks);

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  // One flat list, people first, because the typeahead tracks a single
  // highlighted index; the menu below splits it back into sections.
  const options = useMemo<AtMenuOption[]>(
    () => [
      ...people.slice(0, SUGGESTION_LIST_LENGTH_LIMIT).map(
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
      ),
      ...pages.map((page) => new PageLinkTypeaheadOption(page)),
    ],
    [people, pages],
  );

  const onSelectOption = useCallback(
    (
      selectedOption: AtMenuOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const node =
          selectedOption.kind === "page"
            ? $createPageLinkNode(selectedOption.page)
            : $createMentionNode(selectedOption.name);
        if (nodeToReplace) {
          nodeToReplace.replace(node);
        }
        node.selectEnd();
        closeMenu();
      });
    },
    [editor],
  );

  // A bare "@" opens the menu only when there are pages to offer: people are
  // matched on what is typed, so an empty query would list nobody useful.
  const minMatchLength = searchPageLinks ? 0 : 1;

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      if (slashMatch !== null) {
        return null;
      }
      return checkForAtSignMentions(text, minMatchLength);
    },
    [checkForSlashTriggerMatch, editor, minMatchLength],
  );

  return (
    <LexicalTypeaheadMenuPlugin<AtMenuOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementReference,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        if (!anchorElementReference.current || options.length === 0) {
          return null;
        }

        const renderItem = (option: AtMenuOption, index: number) => (
          <CommandItem
            key={option.key}
            value={option.key}
            onSelect={() => {
              selectOptionAndCleanUp(option);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={`flex items-center gap-2 ${
              selectedIndex === index ? "bg-accent" : "bg-transparent!"
            }`}
          >
            {option.kind === "person" ? (
              <>
                {option.picture}
                {option.name}
              </>
            ) : (
              <>
                <span className="w-4 shrink-0 text-center" aria-hidden>
                  {option.page.icon ?? DEFAULT_PAGE_ICON}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{option.page.title}</span>
                  {option.page.description && (
                    <span className="text-muted-foreground truncate text-xs">
                      {option.page.description}
                    </span>
                  )}
                </span>
              </>
            )}
          </CommandItem>
        );

        const peopleCount = options.filter(
          (option) => option.kind === "person",
        ).length;

        return createPortal(
          // z-50 like the "/" menu: at z-10 the list opened behind any Modal
          // (itself z-50), so "@" looked dead in an editor inside a dialog.
          <div className="bg-popover fixed z-50 w-72 rounded-md shadow-md">
            <Command
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightedIndex(
                    selectedIndex === null
                      ? options.length - 1
                      : (selectedIndex - 1 + options.length) % options.length,
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
                {peopleCount > 0 && (
                  <CommandGroup heading="People">
                    {options
                      .slice(0, peopleCount)
                      .map((option, index) => renderItem(option, index))}
                  </CommandGroup>
                )}
                {options.length > peopleCount && (
                  <CommandGroup heading="Link to page">
                    {options
                      .slice(peopleCount)
                      .map((option, index) =>
                        renderItem(option, peopleCount + index),
                      )}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>,
          anchorElementReference.current,
        );
      }}
    />
  );
}
