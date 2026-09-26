/* eslint-disable react-hooks/set-state-in-effect -- usePageLinkSearch */

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
import type { JSX, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { COMMAND_PRIORITY_CRITICAL } from "lexical";
import { CircleUserRoundIcon, PlusIcon } from "lucide-react";
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

/**
 * Case- and diacritic-insensitive: "thuan" finds "Thuận". đ is its own letter,
 * not d plus a mark, so NFD leaves it and it is mapped by hand.
 */
export function foldMentionName(value: string): string {
  return value
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036F]/g, "")
    .replaceAll("đ", "d")
    .replaceAll("Đ", "D")
    .toLowerCase()
    .trim();
}

/**
 * People whose name contains the query. A bare "@" (empty query) lists the
 * first few, so the menu can offer names before anything is typed.
 *
 * This used to cache results per query in a module-level Map, which never
 * saw `mentionsData` change: a host whose people load asynchronously got the
 * empty answer computed before they arrived, for good. Filtering a short
 * list is cheaper than keeping that cache honest.
 */
function useMentionLookupService(
  mentionString: string | null,
  mentionsData: MentionData[] = [],
) {
  return useMemo(() => {
    if (mentionString === null) return [];
    const query = foldMentionName(mentionString);
    return mentionsData.filter((mention) =>
      foldMentionName(mention.name).includes(query),
    );
  }, [mentionString, mentionsData]);
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

/** "Create …" for a name the host does not know yet — inserts it as a mention. */
class CreateMentionTypeaheadOption extends MenuOption {
  readonly kind = "create";
  name: string;

  constructor(name: string) {
    super(`create:${name}`);
    this.name = name;
  }
}

type AtMenuOption =
  | MentionTypeaheadOption
  | PageLinkTypeaheadOption
  | CreateMentionTypeaheadOption;

/**
 * The menu opens under the caret. At the bottom of the viewport — a chat
 * composer, always — that put it off-screen, and Lexical's own flip never
 * fires there: it only flips when the editor itself has room above the caret,
 * which a one-line box does not. So: measure after render, and if the menu
 * would run past the viewport (or the caret sits in the lower half), pin it
 * above the caret instead.
 */
function FlipAboveWhenClipped({
  anchor,
  deps,
  className,
  children,
}: {
  anchor: HTMLElement;
  deps: unknown;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    menu.style.top = "";
    const anchorRect = anchor.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    // Past the viewport, or merely in its lower half: a box down there is a
    // chat composer, and a menu dropped over the row under it (model picker,
    // hints) reads as broken even when it technically fits.
    const clipped = menuRect.bottom > window.innerHeight - 8;
    const lowerHalf = anchorRect.top > window.innerHeight / 2;
    if (!clipped && !lowerHalf) return;
    // Lexical puts the anchor 3px under a box as tall as the caret line.
    const caretTop = anchorRect.top - anchorRect.height - 3;
    menu.style.top = `${Math.max(8, caretTop - menuRect.height - 4)}px`;
  }, [anchor, deps]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function MentionsPlugin({
  mentionsData = [],
  searchPageLinks,
  createMentionLabel,
}: {
  mentionsData?: MentionData[];
  searchPageLinks?: SearchPageLinks;
  /**
   * Offer a last option that inserts the typed text as a new mention, labelled
   * by this function (e.g. `(name) => \`Create "\${name}"\``). Omitted, only
   * known people and pages are offered. Nothing is created by the plugin — it
   * inserts the mention; the host decides what a new name means.
   */
  createMentionLabel?: (name: string) => string;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const people = useMentionLookupService(queryString, mentionsData);
  const pages = usePageLinkSearch(queryString, searchPageLinks);

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  // Only for a single word that no known name already equals. Multi-word
  // text is the one case left out on purpose: in a chat box the menu stays
  // open while "@Thuận cho mượn 1m" is typed, and Enter picks the highlighted
  // option — a create option there would swallow the message as a name.
  const createOption = useMemo(() => {
    const name = queryString?.trim() ?? "";
    if (!createMentionLabel || name === "" || /\s/.test(name)) return null;
    const folded = foldMentionName(name);
    if (mentionsData.some((m) => foldMentionName(m.name) === folded)) {
      return null;
    }
    return new CreateMentionTypeaheadOption(name);
  }, [createMentionLabel, queryString, mentionsData]);

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
      ...(createOption ? [createOption] : []),
    ],
    [people, pages, createOption],
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
            : $createMentionNode(
                selectedOption.name,
                `@${selectedOption.name}`,
              );
        if (nodeToReplace) {
          nodeToReplace.replace(node);
        }
        node.selectEnd();
        closeMenu();
      });
    },
    [editor],
  );

  // A bare "@" opens the menu when there is something to list before a letter
  // is typed: pages, or the host's people.
  const minMatchLength = searchPageLinks || mentionsData.length > 0 ? 0 : 1;

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
      // Above the composer's Enter-to-send and Arrow-Up history (both HIGH):
      // at the default LOW, Enter sent the message instead of picking the
      // highlighted name. The menu only claims keys while it is open.
      commandPriority={COMMAND_PRIORITY_CRITICAL}
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
            ) : option.kind === "create" ? (
              <>
                <PlusIcon className="size-4" />
                <span className="truncate">
                  {createMentionLabel?.(option.name) ?? option.name}
                </span>
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
        const pageCount = options.filter(
          (option) => option.kind === "page",
        ).length;
        const createIndex = peopleCount + pageCount;

        return createPortal(
          // z-50 like the "/" menu: at z-10 the list opened behind any Modal
          // (itself z-50), so "@" looked dead in an editor inside a dialog.
          <FlipAboveWhenClipped
            anchor={anchorElementReference.current}
            // Re-measure when the list changes height.
            deps={options.length}
            className="bg-popover fixed z-50 w-72 rounded-md shadow-md"
          >
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
                {pageCount > 0 && (
                  <CommandGroup heading="Link to page">
                    {options
                      .slice(peopleCount, createIndex)
                      .map((option, index) =>
                        renderItem(option, peopleCount + index),
                      )}
                  </CommandGroup>
                )}
                {options.length > createIndex && (
                  <CommandGroup>
                    {options
                      .slice(createIndex)
                      .map((option, index) =>
                        renderItem(option, createIndex + index),
                      )}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </FlipAboveWhenClipped>,
          anchorElementReference.current,
        );
      }}
    />
  );
}
