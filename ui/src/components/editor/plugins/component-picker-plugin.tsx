/* eslint-disable @typescript-eslint/ban-ts-comment */

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { LexicalEditor, TextNode } from "lexical";
import type { JSX } from "react";
import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandRoot,
} from "@/components/ui/command";
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
  QuoteIcon,
  ScissorsIcon,
  TableIcon,
  TextIcon,
} from "lucide-react";
import { createPortal } from "react-dom";

import { useEditorModal } from "../editor-hooks/use-modal";
import { INSERT_COLLAPSIBLE_COMMAND } from "../plugins/collapsible-plugin";
import { EmbedConfigs } from "../plugins/embeds/auto-embed-plugin";
import { InsertEquationDialog } from "../plugins/equations-plugin";
import { INSERT_EXCALIDRAW_COMMAND } from "../plugins/excalidraw-plugin";
import { InsertImageDialog } from "../plugins/images-plugin";
import { InsertLayoutDialog } from "../plugins/layout-plugin";
import { INSERT_PAGE_BREAK } from "../plugins/page-break-plugin";
import { InsertPollDialog } from "../plugins/poll-plugin";
import { InsertTableDialog } from "../plugins/table-plugin";

const LexicalTypeaheadMenuPlugin = dynamic(
  () => import("./default/lexical-typeahead-menu-plugin"),
  { ssr: false },
);

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

function getBaseOptions(editor: LexicalEditor, showModal: ShowModal) {
  return [
    new ComponentPickerOption("Paragraph", {
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
    ...([1, 2, 3] as const).map(
      (n) =>
        new ComponentPickerOption(`Heading ${n}`, {
          icon: <HeadingIcons n={n} />,
          keywords: ["heading", "header", `h${n}`],
          onSelect: () =>
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(`h${n}`));
              }
            }),
        }),
    ),
    new ComponentPickerOption("Table", {
      icon: <TableIcon className="size-4" />,
      keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
      onSelect: () =>
        showModal("Insert Table", (onClose) => (
          <InsertTableDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    new ComponentPickerOption("Numbered List", {
      icon: <ListOrderedIcon className="size-4" />,
      keywords: ["numbered list", "ordered list", "ol"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0),
    }),
    new ComponentPickerOption("Bulleted List", {
      icon: <ListIcon className="size-4" />,
      keywords: ["bulleted list", "unordered list", "ul"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0),
    }),
    new ComponentPickerOption("Check List", {
      icon: <ListTodoIcon className="size-4" />,
      keywords: ["check list", "todo list"],
      onSelect: () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, void 0),
    }),
    new ComponentPickerOption("Quote", {
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
    new ComponentPickerOption("Code", {
      icon: <CodeIcon className="size-4" />,
      keywords: ["javascript", "python", "js", "codeblock"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, () => $createCodeNode());
            } else {
              // Will this ever happen?
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode();
              selection.insertNodes([codeNode]);
              selection.insertRawText(textContent);
            }
          }
        }),
    }),
    new ComponentPickerOption("Divider", {
      icon: <MinusIcon className="size-4" />,
      keywords: ["horizontal rule", "divider", "hr"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, void 0),
    }),
    new ComponentPickerOption("Page Break", {
      icon: <ScissorsIcon className="size-4" />,
      keywords: ["page break", "divider"],
      onSelect: () => editor.dispatchCommand(INSERT_PAGE_BREAK, void 0),
    }),
    new ComponentPickerOption("Excalidraw", {
      icon: <FrameIcon className="size-4" />,
      keywords: ["excalidraw", "diagram", "drawing"],
      onSelect: () => editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, void 0),
    }),
    new ComponentPickerOption("Poll", {
      icon: <ListChecksIcon className="size-4" />,
      keywords: ["poll", "vote"],
      onSelect: () =>
        showModal("Insert Poll", (onClose) => (
          <InsertPollDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    ...EmbedConfigs.map(
      (embedConfig) =>
        new ComponentPickerOption(`Embed ${embedConfig.contentName}`, {
          icon: embedConfig.icon,
          keywords: [...embedConfig.keywords, "embed"],
          onSelect: () =>
            editor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type),
        }),
    ),
    new ComponentPickerOption("Equation", {
      icon: <DiffIcon className="size-4" />,
      keywords: ["equation", "latex", "math"],
      onSelect: () =>
        showModal("Insert Equation", (onClose) => (
          <InsertEquationDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    new ComponentPickerOption("Image", {
      icon: <ImageIcon className="size-4" />,
      keywords: ["image", "photo", "picture", "file"],
      onSelect: () =>
        showModal("Insert Image", (onClose) => (
          <InsertImageDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    new ComponentPickerOption("Collapsible", {
      icon: <ListCollapseIcon className="size-4" />,
      keywords: ["collapse", "collapsible", "toggle"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, void 0),
    }),
    new ComponentPickerOption("Columns Layout", {
      icon: <Columns3Icon className="size-4" />,
      keywords: ["columns", "layout", "grid"],
      onSelect: () =>
        showModal("Insert Columns Layout", (onClose) => (
          <InsertLayoutDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    ...(["left", "center", "right", "justify"] as const).map(
      (alignment) =>
        new ComponentPickerOption(`Align ${alignment}`, {
          icon: <AlignIcons alignment={alignment} />,
          keywords: ["align", "justify", alignment],
          onSelect: () =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment),
        }),
    ),
  ];
}

export function ComponentPickerMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useEditorModal();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    const baseOptions = getBaseOptions(editor, showModal);

    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return [
      ...getDynamicOptions(editor, queryString),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) ||
          option.keywords.some((keyword) => regex.test(keyword)),
      ),
    ];
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

  return (
    <>
      {modal}
      {/* @ts-expect-error */}
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
        ) => {
          return anchorElementRef.current && options.length > 0
            ? createPortal(
                <div className="fixed w-[250px] rounded-md shadow-md">
                  <CommandRoot
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
                            value={option.title}
                            onSelect={() => {
                              selectOptionAndCleanUp(option);
                            }}
                            className={`flex items-center gap-2 ${
                              selectedIndex === index
                                ? "bg-accent"
                                : "!bg-transparent"
                            }`}
                          >
                            {option.icon}
                            {option.title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </CommandRoot>
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
