/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { ListType } from "@lexical/list";
import type { LexicalEditor } from "lexical";
import type { Dispatch, JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@acme/ui/components/button";
import { Separator } from "@acme/ui/components/divider";
import { Dropdown } from "@acme/ui/components/dropdown";
import { $createCodeNode, $isCodeHighlightNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $patchStyleText, $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  $createParagraphNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
  AlignLeftIcon,
  ArrowRightLeftIcon,
  ArrowUpDownIcon,
  BoldIcon,
  BookOpenIcon,
  CheckSquareIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  CircleIcon,
  ClipboardCopyIcon,
  CodeIcon,
  FileIcon,
  FileOutputIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  ListTreeIcon,
  MessageSquarePlusIcon,
  MoreHorizontalIcon,
  PaletteIcon,
  QuoteIcon,
  SparklesIcon,
  SquareIcon,
  StrikethroughIcon,
  SuperscriptIcon,
  TrashIcon,
  TypeIcon,
  UnderlineIcon,
} from "lucide-react";
import { createPortal } from "react-dom";

import { ToggleGroup, ToggleGroupItem } from "@acme/ui/shadcn/toggle-group";
import { message } from "../../message";
import { useFloatingLinkContext } from "../context/floating-link-context";
import { INSERT_COLLAPSIBLE_COMMAND } from "./collapsible-plugin";
import { INSERT_EQUATION_COMMAND } from "./equations-plugin";
import { getDOMRangeRect } from "../utils/get-dom-range-rect";
import { getSelectedNode } from "../utils/get-selected-node";
import { setFloatingElemPosition } from "../utils/set-floating-elem-position";

function TextFormatFloatingToolbar({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
  setIsLinkEditMode,
  listLabel,
  onListChange,
  onExplain,
  onAskAI,
  onComment,
  onMath,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isStrikethrough: boolean;
  isUnderline: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
  listLabel: string;
  onListChange: (type: "paragraph" | ListType) => void;
  onExplain: () => void;
  onAskAI: () => void;
  onComment: () => void;
  onMath: () => void;
}): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    if (isLink) {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    }
  }, [editor, isLink, setIsLinkEditMode]);

  function mouseMoveListener(e: MouseEvent) {
    if (
      popupCharStylesEditorRef.current &&
      (e.buttons === 1 || e.buttons === 3) &&
      popupCharStylesEditorRef.current.style.pointerEvents !== "none"
    ) {
      const x = e.clientX;
      const y = e.clientY;
      const elementUnderMouse = document.elementFromPoint(x, y);

      if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
        // Mouse is not over the target element => not a normal click, but probably a drag
        popupCharStylesEditorRef.current.style.pointerEvents = "none";
      }
    }
  }
  function mouseUpListener() {
    if (
      popupCharStylesEditorRef.current &&
      popupCharStylesEditorRef.current.style.pointerEvents !== "auto"
    ) {
      popupCharStylesEditorRef.current.style.pointerEvents = "auto";
    }
  }

  useEffect(() => {
    if (popupCharStylesEditorRef.current) {
      document.addEventListener("mousemove", mouseMoveListener);
      document.addEventListener("mouseup", mouseUpListener);

      return () => {
        document.removeEventListener("mousemove", mouseMoveListener);
        document.removeEventListener("mouseup", mouseUpListener);
      };
    }
  }, [popupCharStylesEditorRef]);

  const $updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = globalThis.getSelection();

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement?.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(
        rangeRect,
        popupCharStylesEditorElem,
        anchorElem,
        isLink,
      );
    } else {
      // Hide toolbar when no selection
      popupCharStylesEditorElem.style.opacity = "0";
      popupCharStylesEditorElem.style.transform =
        "translate(-10000px, -10000px)";
    }
  }, [editor, anchorElem, isLink]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        $updateTextFormatFloatingToolbar();
      });
    };

    window.addEventListener("resize", update);
    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [editor, $updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateTextFormatFloatingToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, $updateTextFormatFloatingToolbar]);

  const textColors = useMemo(
    () => [
      {
        label: "Default",
        value: "default",
        hex: "#000000",
        color: "text-gray-900",
      },
      { label: "Gray", value: "gray", hex: "#6B7280", color: "text-gray-600" },
      {
        label: "Brown",
        value: "brown",
        hex: "#B45309",
        color: "text-amber-700",
      },
      {
        label: "Orange",
        value: "orange",
        hex: "#EA580C",
        color: "text-orange-600",
      },
      {
        label: "Yellow",
        value: "yellow",
        hex: "#CA8A04",
        color: "text-yellow-600",
      },
      {
        label: "Green",
        value: "green",
        hex: "#16A34A",
        color: "text-green-600",
      },
      { label: "Blue", value: "blue", hex: "#2563EB", color: "text-blue-600" },
      {
        label: "Purple",
        value: "purple",
        hex: "#9333EA",
        color: "text-purple-600",
      },
      { label: "Pink", value: "pink", hex: "#DB2777", color: "text-pink-600" },
      { label: "Red", value: "red", hex: "#DC2626", color: "text-red-600" },
    ],
    [],
  );

const backgroundColors = useMemo(
  () => [
    { label: "Default background", value: "default", hex: "#ffffff" },
    { label: "Gray background", value: "gray", hex: "#F3F4F6" },
    { label: "Brown background", value: "brown", hex: "#FEF3C7" },
    { label: "Orange background", value: "orange", hex: "#FFEDD5" },
    { label: "Yellow background", value: "yellow", hex: "#FEF9C3" },
    { label: "Green background", value: "green", hex: "#DCFCE7" },
    { label: "Blue background", value: "blue", hex: "#DBEAFE" },
    { label: "Purple background", value: "purple", hex: "#EDE9FE" },
    { label: "Pink background", value: "pink", hex: "#FCE7F3" },
    { label: "Red background", value: "red", hex: "#FEE2E2" },
  ],
  [],
);
  const handleTextColorChange = useCallback(
    (colorValue: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const color = textColors.find((c) => c.value === colorValue);
          if (color) {
            if (colorValue === "default") {
              // Remove color style
              $patchStyleText(selection, { color: "" });
            } else {
              // Apply color
              $patchStyleText(selection, { color: color.hex });
            }
          }
        }
      });
    },
    [editor, textColors],
  );

const handleBackgroundColorChange = useCallback(
  (colorValue: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const color = backgroundColors.find((c) => c.value === colorValue);
        if (color) {
          if (colorValue === "default") {
            $patchStyleText(selection, { "background-color": "" });
          } else {
            $patchStyleText(selection, { "background-color": color.hex });
          }
        }
      }
    });
  },
  [editor, backgroundColors],
);

const handleListFormatChange = useCallback(
  (style: "default" | "disc" | "circle" | "square") => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }
      const node = getSelectedNode(selection);
      const listNode =
        $findMatchingParent(node, $isListNode) ??
        ($isListNode(node) ? node : null);

      if (!$isListNode(listNode)) {
        message.info("Vui lòng đặt con trỏ trong danh sách để đổi định dạng.");
        return;
      }

      const styleValue =
        style === "default" ? "" : `list-style-type:${style} !important`;
      listNode.setStyle(styleValue);
    });
  },
  [editor],
);

const applyBlockType = useCallback(
  (type: "paragraph" | "h1" | "h2" | "h3" | "quote" | "code") => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }

      switch (type) {
        case "paragraph":
          $setBlocksType(selection, () => $createParagraphNode());
          break;
        case "h1":
          $setBlocksType(selection, () => $createHeadingNode("h1"));
          break;
        case "h2":
          $setBlocksType(selection, () => $createHeadingNode("h2"));
          break;
        case "h3":
          $setBlocksType(selection, () => $createHeadingNode("h3"));
          break;
        case "quote":
          $setBlocksType(selection, () => $createQuoteNode());
          break;
        case "code":
          $setBlocksType(selection, () => $createCodeNode());
          break;
        default:
          break;
      }
    });
  },
  [editor],
);

const handleToggleList = useCallback(() => {
  editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
}, [editor]);

const handleInsertEquationBlock = useCallback(() => {
  editor.dispatchCommand(INSERT_EQUATION_COMMAND, {
    equation: "",
    inline: false,
  });
}, [editor]);

const handlePageAction = useCallback(() => {
  message.info("Tính năng tạo Page đang được phát triển.");
}, []);

const handlePageInAction = useCallback(() => {
  message.info("“Page in” chưa khả dụng trong phiên bản hiện tại.");
}, []);

const handleCalloutAction = useCallback(() => {
  message.info("Callout đang được phát triển.");
}, []);

const handleCopyLinkToBlock = useCallback(() => {
  const baseUrl = window.location.href.split("#")[0];
  const pseudoHash = `block-${Date.now()}`;
  const url = `${baseUrl}#${pseudoHash}`;
  navigator.clipboard
    ?.writeText(url)
    .then(() => {
      message.success("Đã sao chép liên kết khối (giả lập).");
    })
    .catch(() => {
      message.info("Không thể sao chép liên kết, vui lòng thử lại.");
    });
}, []);

const handleDuplicateSelection = useCallback(() => {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      message.info("Chọn nội dung để nhân đôi.");
      return;
    }
    const text = selection.getTextContent();
    if (!text) {
      message.info("Chọn nội dung để nhân đôi.");
      return;
    }
    selection.insertText(`${text}${text}`);
  });
}, [editor]);

const handleMoveToBlock = useCallback(() => {
  message.info("Move to đang được phát triển cho module này.");
}, []);

const handleDeleteSelection = useCallback(() => {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      selection.insertText("");
    }
  });
  message.success("Đã xóa khối đã chọn.");
}, [editor]);

const moreMenu = useMemo(() => {
  const turnIntoItems = [
    {
      type: "item",
      key: "turn-text",
      label: "Text",
      icon: <TypeIcon className="h-4 w-4" />,
      onClick: () => applyBlockType("paragraph"),
    },
    {
      type: "item",
      key: "turn-heading1",
      label: "Heading 1",
      icon: <Heading1Icon className="h-4 w-4" />,
      onClick: () => applyBlockType("h1"),
    },
    {
      type: "item",
      key: "turn-heading2",
      label: "Heading 2",
      icon: <Heading2Icon className="h-4 w-4" />,
      onClick: () => applyBlockType("h2"),
    },
    {
      type: "item",
      key: "turn-heading3",
      label: "Heading 3",
      icon: <Heading3Icon className="h-4 w-4" />,
      onClick: () => applyBlockType("h3"),
    },
    {
      type: "item",
      key: "turn-page",
      label: "Page",
      icon: <FileIcon className="h-4 w-4" />,
      onClick: handlePageAction,
    },
    {
      type: "item",
      key: "turn-page-in",
      label: "Page in",
      icon: <FileOutputIcon className="h-4 w-4" />,
      onClick: handlePageInAction,
    },
    {
      type: "item",
      key: "turn-bulleted",
      label: "Bulleted list",
      icon: <ListIcon className="h-4 w-4" />,
      onClick: () => onListChange("bullet"),
    },
    {
      type: "item",
      key: "turn-numbered",
      label: "Numbered list",
      icon: <ListOrderedIcon className="h-4 w-4" />,
      onClick: () => onListChange("number"),
    },
    {
      type: "item",
      key: "turn-todo",
      label: "To-do list",
      icon: <CheckSquareIcon className="h-4 w-4" />,
      onClick: () => onListChange("check"),
    },
    {
      type: "item",
      key: "turn-toggle",
      label: "Toggle list",
      icon: <ListTreeIcon className="h-4 w-4" />,
      onClick: handleToggleList,
    },
    {
      type: "item",
      key: "turn-code",
      label: "Code",
      icon: <CodeIcon className="h-4 w-4" />,
      onClick: () => applyBlockType("code"),
    },
    {
      type: "item",
      key: "turn-quote",
      label: "Quote",
      icon: <QuoteIcon className="h-4 w-4" />,
      onClick: () => applyBlockType("quote"),
    },
    {
      type: "item",
      key: "turn-callout",
      label: "Callout",
      icon: <BookOpenIcon className="h-4 w-4" />,
      onClick: handleCalloutAction,
    },
    {
      type: "item",
      key: "turn-equation",
      label: "Block equation",
      icon: <SuperscriptIcon className="h-4 w-4" />,
      onClick: handleInsertEquationBlock,
    },
  ];

  const textColorItems = textColors.map((color) => ({
    type: "item",
    key: `menu-text-${color.value}`,
    label: color.label,
    icon: (
      <div
        className="h-4 w-4 rounded border border-gray-300"
        style={{ backgroundColor: color.hex }}
      />
    ),
    onClick: () => handleTextColorChange(color.value),
  }));

  const backgroundColorItems = backgroundColors.map((color) => ({
    type: "item",
    key: `menu-bg-${color.value}`,
    label: color.label,
    icon: (
      <div
        className="h-4 w-4 rounded border border-gray-300"
        style={{ backgroundColor: color.hex }}
      />
    ),
    onClick: () => handleBackgroundColorChange(color.value),
  }));

  const listFormatItems = [
    {
      key: "list-format-default",
      label: "Default",
      icon: <ListIcon className="h-4 w-4" />,
      value: "default",
    },
    {
      key: "list-format-disc",
      label: "Disc",
      icon: <CircleIcon className="h-4 w-4" />,
      value: "disc",
    },
    {
      key: "list-format-circle",
      label: "Circle",
      icon: <CircleIcon className="h-4 w-4" />,
      value: "circle",
    },
    {
      key: "list-format-square",
      label: "Square",
      icon: <SquareIcon className="h-4 w-4" />,
      value: "square",
    },
  ].map((item) => ({
    type: "item" as const,
    key: item.key,
    label: item.label,
    icon: item.icon,
    onClick: () =>
      handleListFormatChange(item.value as "default" | "disc" | "circle" | "square"),
  }));

  const actionItems = [
    {
      type: "item" as const,
      key: "copy-link",
      label: "Copy link to block",
      icon: <LinkIcon className="h-4 w-4" />,
      extra: "⌘+L",
      onClick: handleCopyLinkToBlock,
    },
    {
      type: "item" as const,
      key: "duplicate",
      label: "Duplicate",
      icon: <ClipboardCopyIcon className="h-4 w-4" />,
      extra: "⌘+D",
      onClick: handleDuplicateSelection,
    },
    {
      type: "item" as const,
      key: "move-to",
      label: "Move to",
      icon: <ArrowUpDownIcon className="h-4 w-4" />,
      extra: "⌘+P",
      onClick: handleMoveToBlock,
    },
    {
      type: "item" as const,
      key: "delete",
      label: "Delete",
      icon: <TrashIcon className="h-4 w-4" />,
      danger: true,
      extra: "Del",
      onClick: handleDeleteSelection,
    },
    { type: "divider" as const, key: "actions-divider" },
    {
      type: "item" as const,
      key: "comment",
      label: "Comment",
      icon: <MessageSquarePlusIcon className="h-4 w-4" />,
      extra: "⌘+M",
      onClick: onComment,
    },
    {
      type: "item" as const,
      key: "ask-ai",
      label: "Ask AI",
      icon: <SparklesIcon className="h-4 w-4" />,
      extra: "⌘+J",
      onClick: onAskAI,
    },
  ];

  return {
    className: "min-w-[260px]",
    items: [
      {
        type: "submenu",
        key: "turn-into",
        label: "Turn into",
        icon: <ArrowRightLeftIcon className="h-4 w-4" />,
        children: turnIntoItems,
      },
      {
        type: "submenu",
        key: "color",
        label: "Color",
        icon: <PaletteIcon className="h-4 w-4" />,
        children: [
          {
            type: "group",
            key: "text-color-group",
            label: "Text color",
            children: textColorItems,
          },
          {
            type: "group",
            key: "bg-color-group",
            label: "Background color",
            children: backgroundColorItems,
          },
        ],
      },
      {
        type: "submenu",
        key: "list-format",
        label: "List format",
        icon: <ListIcon className="h-4 w-4" />,
        children: listFormatItems,
      },
      { type: "divider", key: "turn-divider" },
      ...actionItems,
    ],
  };
}, [
  applyBlockType,
  backgroundColors,
  handleBackgroundColorChange,
  handleCalloutAction,
  handleCopyLinkToBlock,
  handleDeleteSelection,
  handleDuplicateSelection,
  handleInsertEquationBlock,
  handleListFormatChange,
  handleMoveToBlock,
  handlePageAction,
  handlePageInAction,
  handleTextColorChange,
  handleToggleList,
  onAskAI,
  onComment,
  onListChange,
  textColors,
]);

  return (
    <div
      ref={popupCharStylesEditorRef}
      className="absolute top-0 left-0 z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-0.5 rounded-lg border border-gray-200 bg-white/95 px-1 py-1.5 shadow-lg backdrop-blur-sm transition-opacity duration-200 will-change-transform sm:max-w-none sm:gap-0.5 sm:bg-white/95 sm:px-1 sm:py-1.5"
      style={{
        opacity: 0,
        transform: "translate(-10000px, -10000px)",
      }}
    >
      {editor.isEditable() && (
        <>
          <div className="flex items-center gap-1 pr-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs font-medium sm:h-7"
              onClick={onExplain}
            >
              <CircleHelpIcon className="h-4 w-4" />
              <span>Explain</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs font-medium sm:h-7"
              onClick={onAskAI}
            >
              <SparklesIcon className="h-4 w-4" />
              <span>Ask AI</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs font-medium sm:h-7"
              onClick={onComment}
            >
              <MessageSquarePlusIcon className="h-4 w-4" />
              <span>Comment</span>
            </Button>
          </div>

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          <Dropdown
            menu={{
              items: [
                {
                  key: "paragraph",
                  label: "Normal text",
                  onClick: () => onListChange("paragraph"),
                },
                {
                  key: "bullet",
                  label: "Bulleted list",
                  onClick: () => onListChange("bullet"),
                },
                {
                  key: "number",
                  label: "Numbered list",
                  onClick: () => onListChange("number"),
                },
                {
                  key: "check",
                  label: "To-do list",
                  onClick: () => onListChange("check"),
                },
              ],
            }}
            placement="bottomLeft"
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-xs font-medium sm:h-7"
            >
              <AlignLeftIcon className="h-4 w-4" />
              <span>{listLabel}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </Dropdown>

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          <ToggleGroup
            type="multiple"
            value={
              [
                isBold ? "bold" : null,
                isItalic ? "italic" : null,
                isUnderline ? "underline" : null,
                isStrikethrough ? "strikethrough" : null,
                isCode ? "code" : null,
                isLink ? "link" : null,
              ].filter(Boolean) as string[]
            }
          >
            <ToggleGroupItem
              value="bold"
              aria-label="Toggle bold"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
              }}
              size="sm"
              className="h-8 w-8 touch-manipulation p-0 active:bg-gray-200 sm:h-7 sm:w-7"
            >
              <BoldIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="italic"
              aria-label="Toggle italic"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
              }}
              size="sm"
              className="h-8 w-8 touch-manipulation p-0 active:bg-gray-200 sm:h-7 sm:w-7"
            >
              <ItalicIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="underline"
              aria-label="Toggle underline"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
              }}
              size="sm"
              className="h-8 w-8 touch-manipulation p-0 active:bg-gray-200 sm:h-7 sm:w-7"
            >
              <UnderlineIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="strikethrough"
              aria-label="Toggle strikethrough"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
              }}
              size="sm"
              className="h-8 w-8 touch-manipulation p-0 active:bg-gray-200 sm:h-7 sm:w-7"
            >
              <StrikethroughIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </ToggleGroupItem>
            <Separator orientation="vertical" className="mx-0.5 h-5" />
            <ToggleGroupItem
              value="code"
              aria-label="Toggle code"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
              }}
              size="sm"
              className="h-8 w-8 touch-manipulation p-0 active:bg-gray-200 sm:h-7 sm:w-7"
            >
              <CodeIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="link"
              aria-label="Toggle link"
              onClick={insertLink}
              size="sm"
              className="h-8 w-8 touch-manipulation p-0 active:bg-gray-200 sm:h-7 sm:w-7"
            >
              <LinkIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 touch-manipulation p-0 active:bg-gray-200 sm:h-7 sm:w-7"
            title="Inline Math"
            onClick={onMath}
          >
            <SuperscriptIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </Button>

          <Separator orientation="vertical" className="mx-0.5 h-5" />

          <Dropdown
            menu={{
              items: textColors.map((color) => ({
                key: color.value,
                label: (
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded border border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.label}</span>
                  </div>
                ),
                onClick: () => {
                  handleTextColorChange(color.value);
                },
              })),
            }}
            placement="bottomLeft"
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 touch-manipulation p-0 active:bg-gray-200 sm:h-7 sm:w-7"
              title="Text color"
            >
              <div className="flex h-4 w-4 items-center justify-center sm:h-3.5 sm:w-3.5">
                <span className="text-xs font-bold">A</span>
              </div>
            </Button>
          </Dropdown>

          <Separator orientation="vertical" className="mx-0.5 h-5 sm:h-5" />

          <Dropdown menu={moreMenu} placement="bottomLeft">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 touch-manipulation p-0 active:bg-gray-200 sm:h-7 sm:w-7"
              title="More options"
            >
              <MoreHorizontalIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </Button>
          </Dropdown>
        </>
      )}
    </div>
  );
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLDivElement | null,
  setIsLinkEditMode: Dispatch<boolean>,
): JSX.Element | null {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [listType, setListType] = useState<"paragraph" | ListType>("paragraph");

  const listLabel = useMemo(() => {
    switch (listType) {
      case "bullet": {
        return "Bulleted list";
      }
      case "number": {
        return "Numbered list";
      }
      case "check": {
        return "To-do list";
      }
      default: {
        return "Normal text";
      }
    }
  }, [listType]);

  const handleListChange = useCallback(
    (type: "paragraph" | ListType) => {
      if (type === "paragraph") {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        });
        setListType("paragraph");
        return;
      }

      const commandMap: Record<ListType, typeof INSERT_UNORDERED_LIST_COMMAND> =
        {
          bullet: INSERT_UNORDERED_LIST_COMMAND,
          number: INSERT_ORDERED_LIST_COMMAND,
          check: INSERT_CHECK_LIST_COMMAND,
        };

      editor.dispatchCommand(commandMap[type], void 0);
      setListType(type);
    },
    [editor],
  );

  const selectionToast = useCallback(
    (label: string) => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        const text = $isRangeSelection(selection)
          ? selection.getTextContent().trim()
          : "";
        const snippet = text.length > 120 ? `${text.slice(0, 120)}…` : text;

        if (text) {
          message.info(`${label}: “${snippet}”`);
        } else {
          message.info(`${label}: hãy chọn nội dung để thao tác.`);
        }
      });
    },
    [editor],
  );

  const handleExplain = useCallback(() => {
    selectionToast("Explain (đang phát triển)");
  }, [selectionToast]);

  const handleAskAI = useCallback(() => {
    selectionToast("Ask AI (đang phát triển)");
  }, [selectionToast]);

  const handleComment = useCallback(() => {
    selectionToast("Comment (đang phát triển)");
  }, [selectionToast]);

  const handleMath = useCallback(() => {
    selectionToast("Inline math (đang phát triển)");
  }, [selectionToast]);

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = globalThis.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          !rootElement?.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      const topLevelElement = node.getTopLevelElementOrThrow();
      if ($isListNode(topLevelElement)) {
        setListType(topLevelElement.getListType());
      } else {
        setListType("paragraph");
      }

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ""
      ) {
        setIsText($isTextNode(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replaceAll("\n", "");
      if (!selection.isCollapsed() && rawTextContent === "") {
        setIsText(false);
        return;
      }
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener("selectionchange", updatePopup);
    return () => {
      document.removeEventListener("selectionchange", updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      }),
    );
  }, [editor, updatePopup]);

  if (!isText || !anchorElem) {
    return null;
  }

  return createPortal(
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isStrikethrough={isStrikethrough}
      isUnderline={isUnderline}
      isCode={isCode}
      setIsLinkEditMode={setIsLinkEditMode}
      listLabel={listLabel}
      onListChange={handleListChange}
      onExplain={handleExplain}
      onAskAI={handleAskAI}
      onComment={handleComment}
      onMath={handleMath}
    />,
    anchorElem,
  );
}

export function FloatingTextFormatToolbarPlugin({
  anchorElem,
}: {
  anchorElem: HTMLDivElement | null;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const { setIsLinkEditMode } = useFloatingLinkContext();

  return useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode);
}
