/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { EditorState, LexicalEditor, TextNode } from "lexical";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  FORMAT_ELEMENT_COMMAND,
} from "lexical";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  CodeIcon,
  Columns3Icon,
  DiffIcon,
  FrameIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ListChecksIcon,
  ListCollapseIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  MinusIcon,
  PaperclipIcon,
  QuoteIcon,
  ScissorsIcon,
  TableIcon,
  TextIcon,
  VideoIcon,
} from "lucide-react";
import { createPortal } from "react-dom";

import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandRoot,
} from "@acme/ui/components/command";

import { useComponentPickerContext } from "../context/component-picker-context";
import { useEditorModal } from "../editor-hooks/use-modal";
import { INSERT_COLLAPSIBLE_COMMAND } from "../plugins/collapsible-plugin";
import { EmbedConfigs } from "../plugins/embeds/auto-embed-plugin";
import { InsertEquationDialog } from "../plugins/equations-plugin";
import { INSERT_EXCALIDRAW_COMMAND } from "../plugins/excalidraw-plugin";
import { InsertFileAttachmentDialog } from "../plugins/file-attachment-plugin";
import { InsertImageDialog } from "../plugins/images-plugin";
import { InsertLayoutDialog } from "../plugins/layout-plugin";
import { INSERT_PAGE_BREAK } from "../plugins/page-break-plugin";
import { InsertPollDialog } from "../plugins/poll-plugin";
import { InsertTableDialog } from "../plugins/table-plugin";
import { INSERT_TOC_COMMAND } from "../plugins/toc-plugin";
import { InsertVideoDialog } from "../plugins/video-plugin";
import { LexicalTypeaheadMenuPlugin } from "./default/lexical-typeahead-menu-plugin";

// const LexicalTypeaheadMenuPlugin = dynamic(
//   () => import("./default/lexical-typeahead-menu-plugin"),
//   { ssr: false },
// );

class ComponentPickerOption extends MenuOption {
  // What shows up in the editor
  title: string;
  // Icon for display
  icon?: JSX.Element;
  // For extra searching.
  keywords: Array<string>;
  // TBD
  keyboardShortcut?: string;
  // What happens when you select this option?
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    },
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords ?? [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }
}

function getDynamicOptions(editor: LexicalEditor, queryString: string) {
  const options: Array<ComponentPickerOption> = [];

  if (queryString == null) {
    return options;
  }

  const tableMatch = /^([1-9]\d?)(?:x([1-9]\d?)?)?$/.exec(queryString);

  if (tableMatch !== null) {
    const rows = tableMatch[1];
    const colOptions = tableMatch[2]
      ? [tableMatch[2]]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);

    options.push(
      ...colOptions.map(
        (columns) =>
          new ComponentPickerOption(`${rows}x${columns} Table`, {
            icon: <i className="icon table" />,
            keywords: ["table"],
            onSelect: () =>
              editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                columns,
                rows: rows!,
              }),
          }),
      ),
    );
  }

  return options;
}

type ShowModal = ReturnType<typeof useEditorModal>[1];

type OptionCategory = "basic" | "media" | "embeds" | "advanced";

interface CategorizedOption {
  option: ComponentPickerOption;
  category: OptionCategory;
}

function getBaseOptions(
  editor: LexicalEditor,
  showModal: ShowModal,
): CategorizedOption[] {
  const options: CategorizedOption[] = [
    // Basic Blocks
    {
      category: "basic",
      option: new ComponentPickerOption("Text", {
        icon: <TextIcon className="size-4" />,
        keywords: ["normal", "paragraph", "p", "text"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
          }),
      }),
    },
    ...([1, 2, 3] as const).map((n) => ({
      category: "basic" as OptionCategory,
      option: new ComponentPickerOption(`Heading ${n}`, {
        icon: <HeadingIcons n={n} />,
        keywords: ["heading", "header", `h${n}`],
        keyboardShortcut: "#".repeat(n),
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode(`h${n}`));
            }
          }),
      }),
    })),
    {
      category: "basic",
      option: new ComponentPickerOption("Numbered list", {
        icon: <ListOrderedIcon className="size-4" />,
        keywords: ["numbered list", "ordered list", "ol"],
        keyboardShortcut: "1.",
        onSelect: () =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0),
      }),
    },
    {
      category: "basic",
      option: new ComponentPickerOption("Bulleted list", {
        icon: <ListIcon className="size-4" />,
        keywords: ["bulleted list", "unordered list", "ul"],
        keyboardShortcut: "-",
        onSelect: () =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0),
      }),
    },
    {
      category: "basic",
      option: new ComponentPickerOption("To-do list", {
        icon: <ListTodoIcon className="size-4" />,
        keywords: ["check list", "todo list", "checkbox"],
        keyboardShortcut: "[]",
        onSelect: () =>
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, void 0),
      }),
    },
    {
      category: "basic",
      option: new ComponentPickerOption("Quote", {
        icon: <QuoteIcon className="size-4" />,
        keywords: ["block quote"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
          }),
      }),
    },
    {
      category: "basic",
      option: new ComponentPickerOption("Code", {
        icon: <CodeIcon className="size-4" />,
        keywords: ["javascript", "python", "js", "codeblock"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              if (selection.isCollapsed()) {
                $setBlocksType(selection, () => $createCodeNode());
              } else {
                const textContent = selection.getTextContent();
                const codeNode = $createCodeNode();
                selection.insertNodes([codeNode]);
                selection.insertRawText(textContent);
              }
            }
          }),
      }),
    },
    {
      category: "basic",
      option: new ComponentPickerOption("Divider", {
        icon: <MinusIcon className="size-4" />,
        keywords: ["horizontal rule", "divider", "hr"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, void 0),
      }),
    },
    {
      category: "basic",
      option: new ComponentPickerOption("Table", {
        icon: <TableIcon className="size-4" />,
        keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
        onSelect: () =>
          showModal("Insert Table", (onClose) => (
            <InsertTableDialog activeEditor={editor} onClose={onClose} />
          )),
      }),
    },
    {
      category: "basic",
      option: new ComponentPickerOption("Collapsible", {
        icon: <ListCollapseIcon className="size-4" />,
        keywords: ["collapse", "collapsible", "toggle"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, void 0),
      }),
    },
    {
      category: "basic",
      option: new ComponentPickerOption("Columns Layout", {
        icon: <Columns3Icon className="size-4" />,
        keywords: ["columns", "layout", "grid"],
        onSelect: () =>
          showModal("Insert Columns Layout", (onClose) => (
            <InsertLayoutDialog activeEditor={editor} onClose={onClose} />
          )),
      }),
    },
    ...(["left", "center", "right", "justify"] as const).map((alignment) => ({
      category: "basic" as OptionCategory,
      option: new ComponentPickerOption(`Align ${alignment}`, {
        icon: <AlignIcons alignment={alignment} />,
        keywords: ["align", "justify", alignment],
        onSelect: () =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment),
      }),
    })),

    // Media
    {
      category: "media",
      option: new ComponentPickerOption("Image", {
        icon: <ImageIcon className="size-4" />,
        keywords: ["image", "photo", "picture", "file"],
        onSelect: () =>
          showModal("Insert Image", (onClose) => (
            <InsertImageDialog activeEditor={editor} onClose={onClose} />
          )),
      }),
    },
    {
      category: "media",
      option: new ComponentPickerOption("Video", {
        icon: <VideoIcon className="size-4" />,
        keywords: ["video", "movie", "mp4", "webm"],
        onSelect: () =>
          showModal("Insert Video", (onClose) => (
            <InsertVideoDialog activeEditor={editor} onClose={onClose} />
          )),
      }),
    },
    {
      category: "media",
      option: new ComponentPickerOption("File Attachment", {
        icon: <PaperclipIcon className="size-4" />,
        keywords: ["file", "attachment", "pdf", "docx", "xlsx", "pptx", "zip"],
        onSelect: () =>
          showModal("Insert File Attachment", (onClose) => (
            <InsertFileAttachmentDialog
              activeEditor={editor}
              onClose={onClose}
            />
          )),
      }),
    },

    // Embeds
    ...EmbedConfigs.map((embedConfig) => ({
      category: "embeds" as OptionCategory,
      option: new ComponentPickerOption(`Embed ${embedConfig.contentName}`, {
        icon: embedConfig.icon,
        keywords: [...embedConfig.keywords, "embed"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type),
      }),
    })),

    // Advanced
    {
      category: "advanced",
      option: new ComponentPickerOption("Table of Contents", {
        icon: <ListIcon className="size-4" />,
        keywords: ["toc", "table of contents", "contents", "index"],
        onSelect: () => editor.dispatchCommand(INSERT_TOC_COMMAND, void 0),
      }),
    },
    {
      category: "advanced",
      option: new ComponentPickerOption("Page Break", {
        icon: <ScissorsIcon className="size-4" />,
        keywords: ["page break", "divider"],
        onSelect: () => editor.dispatchCommand(INSERT_PAGE_BREAK, void 0),
      }),
    },
    {
      category: "advanced",
      option: new ComponentPickerOption("Excalidraw", {
        icon: <FrameIcon className="size-4" />,
        keywords: ["excalidraw", "diagram", "drawing"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, void 0),
      }),
    },
    {
      category: "advanced",
      option: new ComponentPickerOption("Poll", {
        icon: <ListChecksIcon className="size-4" />,
        keywords: ["poll", "vote"],
        onSelect: () =>
          showModal("Insert Poll", (onClose) => (
            <InsertPollDialog activeEditor={editor} onClose={onClose} />
          )),
      }),
    },
    {
      category: "advanced",
      option: new ComponentPickerOption("Equation", {
        icon: <DiffIcon className="size-4" />,
        keywords: ["equation", "latex", "math"],
        onSelect: () =>
          showModal("Insert Equation", (onClose) => (
            <InsertEquationDialog activeEditor={editor} onClose={onClose} />
          )),
      }),
    },
  ];

  return options;
}

const CATEGORY_LABELS: Record<OptionCategory, string> = {
  basic: "Basic blocks",
  media: "Media",
  embeds: "Embeds",
  advanced: "Advanced",
};

export function ComponentPickerMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useEditorModal();
  const [queryString, setQueryString] = useState<string | null>(null);
  const [, setIsComponentPickerOpen] = useComponentPickerContext();

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    const categorizedOptions = getBaseOptions(editor, showModal);

    if (!queryString) {
      return categorizedOptions;
    }

    const regex = new RegExp(queryString, "i");

    const filteredOptions = categorizedOptions.filter(
      (item) =>
        regex.test(item.option.title) ||
        item.option.keywords.some((keyword) => regex.test(keyword)),
    );

    const dynamicOptions = getDynamicOptions(editor, queryString).map(
      (option) => ({ category: "basic" as OptionCategory, option }),
    );

    return [...dynamicOptions, ...filteredOptions];
  }, [editor, queryString, showModal]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor],
  );

  // Group options by category
  const groupedOptions = useMemo(() => {
    const groups: Record<OptionCategory, CategorizedOption[]> = {
      basic: [],
      media: [],
      embeds: [],
      advanced: [],
    };

    for (const item of options) {
      groups[item.category].push(item);
    }

    return groups;
  }, [options]);

  // Calculate selected index across all options
  const flatOptions = useMemo(() => {
    return options.map((item) => item.option);
  }, [options]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Refs to access latest state in Lexical update listener (registered once)
  const isMenuOpenRef = useRef(isMenuOpen);
  const queryStringRef = useRef(queryString);

  // Track when menu opens/closes
  const handleQueryChange = useCallback(
    (query: string | null) => {
      const isOpen = query !== null;
      setQueryString(query);
      setIsMenuOpen(isOpen);

      // Keep refs in sync immediately so Lexical listeners don't lag behind React.
      queryStringRef.current = query;
      isMenuOpenRef.current = isOpen;

      // Publish menu state to context
      setIsComponentPickerOpen(isOpen);
    },
    [setIsComponentPickerOpen],
  );

  const styledElementRef = useRef<HTMLElement | null>(null);
  const styledKeyRef = useRef<string | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const CLASS_NAME = "lexical-slash-trigger";
  const VAR_CONTENT = "--pseudoAfter--content";
  const VAR_COLOR = "--pseudoAfter--color";
  const FILTER_COLOR = "rgb(156, 163, 175)";

  const clearStyled = useCallback(() => {
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const el = styledElementRef.current;
    if (el) {
      el.classList.remove(CLASS_NAME);
      el.style.removeProperty(VAR_CONTENT);
      el.style.removeProperty(VAR_COLOR);
    }
    styledElementRef.current = null;
    styledKeyRef.current = null;
  }, []);

  const scheduleApplyStyled = useCallback(
    (nextKey: string, shouldShowFilter: boolean) => {
      // Style after Lexical commits the DOM for the current update.
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;

        if (!isMenuOpenRef.current) {
          clearStyled();
          return;
        }

        const nextEl = editor.getElementByKey(nextKey);
        if (!nextEl) {
          // DOM might not be ready yet for this key; next update / state change will retry.
          return;
        }

        if (styledKeyRef.current !== nextKey) {
          clearStyled();
        }

        nextEl.classList.add(CLASS_NAME);
        if (shouldShowFilter) {
          nextEl.style.setProperty(VAR_CONTENT, '"Filter..."');
          nextEl.style.setProperty(VAR_COLOR, FILTER_COLOR);
        } else {
          nextEl.style.removeProperty(VAR_CONTENT);
          nextEl.style.removeProperty(VAR_COLOR);
        }

        styledElementRef.current = nextEl;
        styledKeyRef.current = nextKey;
      });
    },
    [clearStyled, editor],
  );

  const refreshSlashStyling = useCallback(
    (editorState: EditorState) => {
      if (!isMenuOpenRef.current) {
        clearStyled();
        return;
      }

      const currentQuery = queryStringRef.current;
      const shouldShowFilter =
        currentQuery == null || currentQuery === "" || currentQuery === "/";

      let nextKey: string | null = null;

      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return;
        }

        const query = currentQuery ?? "";
        const anchorNode = selection.anchor.getNode();

        // Prefer styling the text node that contains the "/" trigger relative to caret.
        if ($isTextNode(anchorNode)) {
          const text = anchorNode.getTextContent();
          const anchorOffset = selection.anchor.offset;
          const slashIndex = anchorOffset - query.length - 1;

          if (slashIndex >= 0 && text.charAt(slashIndex) === "/") {
            nextKey = anchorNode.getKey();
            return;
          }

          // If caret is at the beginning of this text node, the "/" might be in a previous text sibling.
          if (anchorOffset === 0 && query.length === 0) {
            const prev = anchorNode.getPreviousSibling();
            if (prev != null && $isTextNode(prev)) {
              const prevText = prev.getTextContent();
              if (prevText.endsWith("/")) {
                nextKey = prev.getKey();
              }
            }
          }
        }
      });

      if (nextKey == null) {
        clearStyled();
        return;
      }

      scheduleApplyStyled(nextKey, shouldShowFilter);
    },
    [clearStyled, scheduleApplyStyled],
  );

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      refreshSlashStyling(editorState);
    });

    return () => {
      unregister();
      clearStyled();
    };
  }, [clearStyled, editor, refreshSlashStyling]);

  // React state can flip without a new Lexical update (notably the first "/"),
  // so also re-evaluate when menu/query changes.
  useEffect(() => {
    // Update refs inline before using them in the callback
    queryStringRef.current = queryString;
    isMenuOpenRef.current = isMenuOpen;
    refreshSlashStyling(editor.getEditorState());
  }, [editor, isMenuOpen, queryString, refreshSlashStyling]);

  return (
    <>
      {modal}
      {/* Add styling for "/Filter..." when menu is active */}
      <style>
        {`
          /* Style the "/" character with background */
          .lexical-slash-trigger {
            background-color: rgba(0, 0, 0, 0.04);
            border-radius: 3px;
            padding: 2px 4px;
          }
          
          /* Use CSS custom properties for ::after content (like Notion) */
          .lexical-slash-trigger::after {
            content: var(--pseudoAfter--content, "");
            color: var(--pseudoAfter--color, transparent);
            font-weight: 400;
          }
        `}
      </style>
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={handleQueryChange}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={flatOptions}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
        ) => {
          return anchorElementRef.current && flatOptions.length > 0
            ? createPortal(
                <div className="absolute z-50 mt-1 -ml-2 w-full max-w-[min(calc(100vw-2rem),680px)] sm:w-[680px]">
                  {/* Menu */}
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    <CommandRoot
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setHighlightedIndex(
                            selectedIndex === null
                              ? flatOptions.length - 1
                              : (selectedIndex - 1 + flatOptions.length) %
                                  flatOptions.length,
                          );
                        } else if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setHighlightedIndex(
                            selectedIndex === null
                              ? 0
                              : (selectedIndex + 1) % flatOptions.length,
                          );
                        }
                      }}
                    >
                      <CommandList className="max-h-[60vh] overflow-y-auto p-1 sm:max-h-[400px]">
                        {queryString ? (
                          // When searching, show all results without categories
                          <CommandGroup>
                            {flatOptions.map((option, index) => (
                              <CommandItem
                                key={option.key}
                                value={option.title}
                                onSelect={() => {
                                  selectOptionAndCleanUp(option);
                                }}
                                className={`flex touch-manipulation items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                                  selectedIndex === index
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="shrink-0 text-gray-500">
                                    {option.icon}
                                  </span>
                                  <span className="flex-1">{option.title}</span>
                                </div>
                                {option.keyboardShortcut && (
                                  <span className="text-xs text-gray-400">
                                    {option.keyboardShortcut}
                                  </span>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ) : (
                          // When not searching, show grouped by category
                          <>
                            {(
                              Object.keys(groupedOptions) as OptionCategory[]
                            ).map((category) => {
                              const categoryOptions = groupedOptions[category];
                              if (categoryOptions.length === 0) return null;

                              let categoryStartIndex = 0;
                              for (const cat of Object.keys(
                                groupedOptions,
                              ) as OptionCategory[]) {
                                if (cat === category) break;
                                categoryStartIndex +=
                                  groupedOptions[cat].length;
                              }

                              return (
                                <CommandGroup key={category}>
                                  <div className="px-3 py-1.5 text-xs font-medium text-gray-500">
                                    {CATEGORY_LABELS[category]}
                                  </div>
                                  {categoryOptions.map((item, itemIndex) => {
                                    const globalIndex =
                                      categoryStartIndex + itemIndex;
                                    return (
                                      <CommandItem
                                        key={item.option.key}
                                        value={item.option.title}
                                        onSelect={() => {
                                          selectOptionAndCleanUp(item.option);
                                        }}
                                        className={`flex touch-manipulation items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                                          selectedIndex === globalIndex
                                            ? "bg-gray-100 text-gray-900"
                                            : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className="shrink-0 text-gray-500">
                                            {item.option.icon}
                                          </span>
                                          <span className="flex-1">
                                            {item.option.title}
                                          </span>
                                        </div>
                                        {item.option.keyboardShortcut && (
                                          <span className="text-xs text-gray-400">
                                            {item.option.keyboardShortcut}
                                          </span>
                                        )}
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              );
                            })}
                          </>
                        )}
                      </CommandList>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs text-gray-400">
                        <span>Type '' on the page</span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-500">
                          esc
                        </span>
                      </div>
                    </CommandRoot>
                  </div>
                </div>,
                anchorElementRef.current,
              )
            : null;
        }}
      />
    </>
  );
}

function HeadingIcons({ n }: { n: number }) {
  switch (n) {
    case 1: {
      return <Heading1Icon className="size-4" />;
    }
    case 2: {
      return <Heading2Icon className="size-4" />;
    }
    case 3: {
      return <Heading3Icon className="size-4" />;
    }
  }
}

function AlignIcons({
  alignment,
}: {
  alignment: "left" | "center" | "right" | "justify";
}) {
  switch (alignment) {
    case "left": {
      return <AlignLeftIcon className="size-4" />;
    }
    case "center": {
      return <AlignCenterIcon className="size-4" />;
    }
    case "right": {
      return <AlignRightIcon className="size-4" />;
    }
    case "justify": {
      return <AlignJustifyIcon className="size-4" />;
    }
  }
}
