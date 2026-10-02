/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { LexicalEditor, TextFormatType } from "lexical";
import type { ComponentProps, Dispatch, JSX, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  $createCodeNode,
  $isCodeHighlightNode,
  $isCodeNode,
} from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isListNode, INSERT_CHECK_LIST_COMMAND } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from "@lexical/rich-text";
import { $patchStyleText } from "@lexical/selection";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
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
  ArrowUpDownIcon,
  BoldIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  CircleIcon,
  ClipboardCopyIcon,
  CodeIcon,
  EraserIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListTreeIcon,
  MessageSquarePlusIcon,
  MoreHorizontalIcon,
  PaletteIcon,
  SigmaIcon,
  SparklesIcon,
  SquareIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  TrashIcon,
  UnderlineIcon,
} from "lucide-react";
import { createPortal } from "react-dom";

import type { ItemType } from "@acme/ui/components/menu";
import { Button } from "@acme/ui/components/button";
import { Separator } from "@acme/ui/components/divider";
import { Dropdown } from "@acme/ui/components/dropdown";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@acme/ui/components/tooltip";
import { cn } from "@acme/ui/lib/utils";

import { ToggleGroup, ToggleGroupItem } from "../../../shadcn/toggle-group";
import { message } from "../../message";
import { useFloatingLinkContext } from "../context/floating-link-context";
import { $turnSelectedBlocksIntoList } from "../utils/block-selection";
import { BLOCK_TYPE_ICONS } from "../utils/block-type-icons";
import { getDOMRangeRect } from "../utils/get-dom-range-rect";
import { getSelectedNode } from "../utils/get-selected-node";
import {
  getFormatToolbarBounds,
  positionFormatToolbar,
} from "../utils/position-format-toolbar";
import { $setBlocksTypeLiftingChildren } from "../utils/set-blocks-type-lifting-children";
import { INSERT_COLLAPSIBLE_COMMAND } from "./collapsible-plugin";
import { INSERT_EQUATION_COMMAND } from "./equations-plugin";

type BlockType = keyof typeof BLOCK_TYPE_ICONS;

/**
 * The bar's type menu — Notion's "Text ▾" — with the names and icons the block
 * menu's Turn into and the slash menu give each type.
 */
const BLOCK_TYPE_CHOICES: ReadonlyArray<{ type: BlockType; label: string }> = [
  { type: "paragraph", label: "Text" },
  { type: "h1", label: "Heading 1" },
  { type: "h2", label: "Heading 2" },
  { type: "h3", label: "Heading 3" },
  { type: "bullet", label: "Bulleted list" },
  { type: "number", label: "Numbered list" },
  { type: "check", label: "To-do list" },
  { type: "code", label: "Code" },
  { type: "quote", label: "Quote" },
];

const BLOCK_TYPE_LABELS = Object.fromEntries(
  BLOCK_TYPE_CHOICES.map(({ type, label }) => [type, label]),
) as Record<BlockType, string>;

const IS_MAC =
  globalThis.navigator !== undefined &&
  /mac|iphone|ipad/i.test(globalThis.navigator.platform);
const MOD = IS_MAC ? "⌘" : "Ctrl+";

/**
 * How much the bar has folded to fit its editor: 0 is the full bar, 1 drops
 * the type's name (its icon stays), 2 also moves underline, strikethrough and
 * inline code into "More". It never wraps — a second row is what made the old
 * bar heavy, and what slid it over the blocks beside a selection.
 */
type FoldLevel = 0 | 1 | 2;

/** The marks that move into "More" at fold level 2. */
const FOLDING_MARKS: ReadonlyArray<{
  format: TextFormatType;
  label: string;
  shortcut?: string;
  Icon: typeof BoldIcon;
}> = [
  {
    format: "underline",
    label: "Underline",
    shortcut: `${MOD}U`,
    Icon: UnderlineIcon,
  },
  { format: "strikethrough", label: "Strikethrough", Icon: StrikethroughIcon },
  { format: "code", label: "Inline code", Icon: CodeIcon },
];

/** A tooltip of a name and, when it has one, a shortcut — Notion's. */
function Hint({
  title,
  shortcut,
  children,
  ...triggerProps
}: Omit<ComponentProps<typeof TooltipTrigger>, "title"> & {
  title: string;
  shortcut?: string;
  children: ReactNode;
}) {
  return (
    <TooltipRoot>
      {/* A Dropdown's trigger props come in here and go on to the button. */}
      <TooltipTrigger asChild {...triggerProps}>
        {children}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="flex items-center gap-1.5 px-2 py-1"
      >
        <span>{title}</span>
        {shortcut && <span className="opacity-60">{shortcut}</span>}
      </TooltipContent>
    </TooltipRoot>
  );
}

/** Every control on the bar is 28px tall; the icon buttons are 28px square. */
const BUTTON_CLASS =
  "h-7 min-w-7 shrink-0 touch-manipulation rounded-md px-0 text-foreground active:bg-accent";

function ToolbarButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="text"
      size="small"
      className={cn(BUTTON_CLASS, "w-7", className)}
      {...props}
    />
  );
}

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
  blockType,
  onBlockTypeChange,
  onExplain,
  onAskAI,
  onComment,
  onMath,
  variant,
  isTouchSelection,
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
  blockType: BlockType;
  onBlockTypeChange: (type: BlockType) => void;
  onExplain: () => void;
  onAskAI: () => void;
  onComment: () => void;
  onMath: () => void;
  variant: "default" | "simple";
  isTouchSelection: () => boolean;
}): JSX.Element {
  // The button shows the current type's icon, not one icon for every type.
  const BlockTypeIcon = BLOCK_TYPE_ICONS[blockType];
  const popupCharStylesEditorReference = useRef<HTMLDivElement | null>(null);
  const typeLabelReference = useRef<HTMLSpanElement | null>(null);

  const [foldLevel, setFoldLevel] = useState<FoldLevel>(0);
  const foldLevelReference = useRef<FoldLevel>(0);
  /** The bar's widths unfolded, measured whenever it is shown at level 0. */
  const widthsReference = useRef<{
    full: number;
    label: number;
    marks: number;
  }>({ full: 0, label: 0, marks: 0 });

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
      popupCharStylesEditorReference.current &&
      (e.buttons === 1 || e.buttons === 3) &&
      popupCharStylesEditorReference.current.style.pointerEvents !== "none"
    ) {
      const x = e.clientX;
      const y = e.clientY;
      const elementUnderMouse = document.elementFromPoint(x, y);

      if (!popupCharStylesEditorReference.current.contains(elementUnderMouse)) {
        // Mouse is not over the target element => not a normal click, but probably a drag
        popupCharStylesEditorReference.current.style.pointerEvents = "none";
      }
    }
  }
  function mouseUpListener() {
    if (
      popupCharStylesEditorReference.current &&
      popupCharStylesEditorReference.current.style.pointerEvents !== "auto"
    ) {
      popupCharStylesEditorReference.current.style.pointerEvents = "auto";
    }
  }

  /*
   * The same "let the pointer through" for a BLOCK drag. The mousemove check
   * above only sees a text drag: a handle drag is native drag-and-drop, which
   * fires dragover instead of mousemove, so the toolbar kept taking the
   * pointer — and a drop onto a block under it landed on the toolbar, outside
   * the editable, and was lost. Any drag in flight passes through; the end of
   * it (dragend, or a drop) takes the pointer back.
   */
  useEffect(() => {
    const setPointer = (value: "none" | "auto") => () => {
      const popup = popupCharStylesEditorReference.current;
      if (popup && popup.style.pointerEvents !== value) {
        popup.style.pointerEvents = value;
      }
    };
    const onDragStart = setPointer("none");
    const onDragEnd = setPointer("auto");
    document.addEventListener("dragstart", onDragStart, true);
    document.addEventListener("dragend", onDragEnd, true);
    document.addEventListener("drop", onDragEnd, true);
    return () => {
      document.removeEventListener("dragstart", onDragStart, true);
      document.removeEventListener("dragend", onDragEnd, true);
      document.removeEventListener("drop", onDragEnd, true);
    };
  }, []);

  useEffect(() => {
    if (popupCharStylesEditorReference.current) {
      document.addEventListener("mousemove", mouseMoveListener);
      document.addEventListener("mouseup", mouseUpListener);

      return () => {
        document.removeEventListener("mousemove", mouseMoveListener);
        document.removeEventListener("mouseup", mouseUpListener);
      };
    }
  }, [popupCharStylesEditorReference]);

  const $updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElement = popupCharStylesEditorReference.current;
    const nativeSelection = globalThis.getSelection();

    if (popupCharStylesEditorElement === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    const scroller = anchorElem.parentElement;
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement?.contains(nativeSelection.anchorNode) &&
      scroller
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      /*
       * Stay out of the handle gutter. Pushed left to fit the scroller, a wide
       * bar used to slide into the left padding where each block's drag
       * handle lives, and covered the handle of the block beside a selection.
       * The bar now keeps between the text's start and the scroller's right
       * edge (and the viewport), and folds to fit rather than wrapping.
       */
      const textStart =
        rootElement.getBoundingClientRect().left +
        Number.parseFloat(getComputedStyle(rootElement).paddingLeft || "0");
      const bounds = getFormatToolbarBounds(scroller, textStart);
      const room = bounds.right - bounds.left;
      if (room > 0) popupCharStylesEditorElement.style.maxWidth = `${room}px`;

      if (foldLevelReference.current === 0) {
        const marks = [
          ...popupCharStylesEditorElement.querySelectorAll<HTMLElement>(
            "[data-folding-mark]",
          ),
        ].reduce((sum, element) => sum + element.offsetWidth + 2, 0);
        widthsReference.current = {
          full: popupCharStylesEditorElement.scrollWidth,
          // The name plus the gap before it.
          label: (typeLabelReference.current?.offsetWidth ?? 0) + 4,
          marks,
        };
      }
      const { full, label, marks } = widthsReference.current;
      let next: FoldLevel = 2;
      if (full <= room) next = 0;
      else if (full - label <= room) next = 1;
      if (next === 2 && marks === 0) next = 1;
      if (next !== foldLevelReference.current) {
        foldLevelReference.current = next;
        setFoldLevel(next);
      }

      positionFormatToolbar({
        selectionRect: rangeRect,
        toolbar: popupCharStylesEditorElement,
        anchor: anchorElem,
        scroller,
        minLeft: textStart,
        preferBelow: isTouchSelection(),
        isLink,
      });
    } else {
      // Hide toolbar when no selection
      popupCharStylesEditorElement.style.opacity = "0";
      popupCharStylesEditorElement.style.transform =
        "translate(-10000px, -10000px)";
    }
  }, [editor, anchorElem, isLink, isTouchSelection]);

  // A fold changes the bar's width, so it is placed again.
  useLayoutEffect(() => {
    editor.getEditorState().read(() => {
      $updateTextFormatFloatingToolbar();
    });
  }, [editor, foldLevel, $updateTextFormatFloatingToolbar]);

  useEffect(() => {
    const scrollerElement = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        $updateTextFormatFloatingToolbar();
      });
    };

    window.addEventListener("resize", update);
    if (scrollerElement) {
      scrollerElement.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (scrollerElement) {
        scrollerElement.removeEventListener("scroll", update);
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

  /** Drops every mark and inline color/highlight from the selected text. */
  const handleClearFormatting = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || selection.isCollapsed()) return;
      // extract() splits the edge nodes, so only the selected text changes.
      for (const node of selection.extract()) {
        if (!$isTextNode(node)) continue;
        if (node.getFormat() !== 0) node.setFormat(0);
        if (node.getStyle() !== "") node.setStyle("");
      }
    });
  }, [editor]);

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
          message.info(
            "Vui lòng đặt con trỏ trong danh sách để đổi định dạng.",
          );
          return;
        }

        const styleValue =
          style === "default" ? "" : `list-style-type:${style} !important`;
        listNode.setStyle(styleValue);
      });
    },
    [editor],
  );

  const handleToggleList = useCallback(() => {
    editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, void 0);
  }, [editor]);

  const handleInsertEquationBlock = useCallback(() => {
    editor.dispatchCommand(INSERT_EQUATION_COMMAND, {
      equation: "",
      inline: false,
    });
  }, [editor]);

  const handleCopyLinkToBlock = useCallback(() => {
    const baseUrl = globalThis.location.href.split("#")[0];
    const pseudoHash = `block-${Date.now()}`;
    const url = `${baseUrl}#${pseudoHash}`;
    navigator.clipboard
      .writeText(url)
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

  /** Notion's "Text ▾": every type the selection can be turned into. */
  const typeMenu = useMemo(
    () => ({
      className: "min-w-[220px]",
      items: [
        ...BLOCK_TYPE_CHOICES.map(({ type, label }) => {
          const Icon = BLOCK_TYPE_ICONS[type];
          return {
            key: type,
            label,
            icon: <Icon className="h-4 w-4" />,
            extra:
              type === blockType ? (
                <CheckIcon className="h-4 w-4" />
              ) : undefined,
            onClick: () => onBlockTypeChange(type),
          };
        }),
        { type: "divider" as const, key: "type-divider" },
        {
          key: "toggle",
          label: "Toggle list",
          icon: <ListTreeIcon className="h-4 w-4" />,
          onClick: handleToggleList,
        },
        {
          key: "equation",
          label: "Block equation",
          icon: <SigmaIcon className="h-4 w-4" />,
          onClick: handleInsertEquationBlock,
        },
      ] as ItemType[],
    }),
    [blockType, handleInsertEquationBlock, handleToggleList, onBlockTypeChange],
  );

  const moreMenu = useMemo(() => {
    const markState: Partial<Record<TextFormatType, boolean>> = {
      underline: isUnderline,
      strikethrough: isStrikethrough,
      code: isCode,
    };
    const foldedMarkItems: ItemType[] =
      foldLevel === 2
        ? FOLDING_MARKS.map(({ format, label, shortcut, Icon }) => ({
            type: "item" as const,
            key: `mark-${format}`,
            label,
            icon: <Icon className="h-4 w-4" />,
            extra: markState[format] ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              shortcut
            ),
            onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format),
          }))
        : [];

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
        handleListFormatChange(
          item.value as "default" | "disc" | "circle" | "square",
        ),
    }));

    const formatItems: ItemType[] = [
      ...foldedMarkItems,
      {
        type: "item" as const,
        key: "superscript",
        label: "Superscript",
        icon: <SuperscriptIcon className="h-4 w-4" />,
        onClick: () =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript"),
      },
      {
        type: "item" as const,
        key: "subscript",
        label: "Subscript",
        icon: <SubscriptIcon className="h-4 w-4" />,
        onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript"),
      },
      variant !== "simple" && {
        type: "item" as const,
        key: "inline-math",
        label: "Inline math",
        icon: <SigmaIcon className="h-4 w-4" />,
        onClick: onMath,
      },
      variant !== "simple" && {
        type: "submenu" as const,
        key: "color",
        label: "Color",
        icon: <PaletteIcon className="h-4 w-4" />,
        children: [
          {
            type: "group" as const,
            key: "text-color-group",
            label: "Text color",
            children: textColorItems as ItemType[],
          },
          {
            type: "group" as const,
            key: "bg-color-group",
            label: "Background color",
            children: backgroundColorItems as ItemType[],
          },
        ],
      },
      {
        type: "item" as const,
        key: "clear-formatting",
        label: "Clear formatting",
        icon: <EraserIcon className="h-4 w-4" />,
        onClick: handleClearFormatting,
      },
    ].filter(Boolean) as ItemType[];

    const assistItems =
      variant === "simple"
        ? []
        : ([
            { type: "divider" as const, key: "assist-divider" },
            {
              type: "item" as const,
              key: "explain",
              label: "Explain",
              icon: <CircleHelpIcon className="h-4 w-4" />,
              onClick: onExplain,
            },
            {
              type: "item" as const,
              key: "ask-ai",
              label: "Ask AI",
              icon: <SparklesIcon className="h-4 w-4" />,
              extra: "⌘+J",
              onClick: onAskAI,
            },
            {
              type: "item" as const,
              key: "comment",
              label: "Comment",
              icon: <MessageSquarePlusIcon className="h-4 w-4" />,
              extra: "⌘+M",
              onClick: onComment,
            },
            { type: "divider" as const, key: "list-divider" },
            {
              type: "submenu" as const,
              key: "list-format",
              label: "List format",
              icon: <ListIcon className="h-4 w-4" />,
              children: listFormatItems as ItemType[],
            },
          ] as ItemType[]);

    const blockItems = [
      { type: "divider" as const, key: "actions-divider" },
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
    ] as ItemType[];

    return {
      className: "min-w-[240px]",
      items: [...formatItems, ...assistItems, ...blockItems],
    };
  }, [
    backgroundColors,
    editor,
    foldLevel,
    handleBackgroundColorChange,
    handleClearFormatting,
    handleCopyLinkToBlock,
    handleDeleteSelection,
    handleDuplicateSelection,
    handleListFormatChange,
    handleMoveToBlock,
    handleTextColorChange,
    isCode,
    isStrikethrough,
    isUnderline,
    onAskAI,
    onComment,
    onExplain,
    onMath,
    textColors,
    variant,
  ]);

  const markButton = (
    format: TextFormatType,
    label: string,
    Icon: typeof BoldIcon,
    shortcut?: string,
    folding = false,
  ) => (
    <Hint key={format} title={label} shortcut={shortcut}>
      <ToggleGroupItem
        value={format}
        aria-label={`Toggle ${format}`}
        data-folding-mark={folding ? "" : undefined}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
        }}
        className={cn(BUTTON_CLASS, "w-7 p-0")}
      >
        <Icon className="h-4 w-4" />
      </ToggleGroupItem>
    </Hint>
  );

  const separator = (
    <Separator orientation="vertical" className="mx-0.5 h-4 shrink-0" />
  );

  return (
    <div
      ref={popupCharStylesEditorReference}
      data-slot="format-toolbar"
      data-fold={foldLevel}
      role="toolbar"
      aria-label="Text formatting"
      className="border-border bg-popover text-popover-foreground absolute top-0 left-0 z-50 flex flex-nowrap items-center gap-0.5 overflow-hidden rounded-lg border p-1 shadow-lg transition-opacity duration-200 will-change-transform"
      style={{
        opacity: 0,
        transform: "translate(-10000px, -10000px)",
      }}
    >
      {editor.isEditable() && (
        <>
          {variant !== "simple" && (
            <>
              <Dropdown asChild menu={typeMenu} placement="bottomLeft">
                <Hint title="Turn into">
                  <ToolbarButton
                    aria-label="Turn into"
                    className="w-auto gap-1 px-1.5 text-sm font-normal"
                  >
                    <BlockTypeIcon className="h-4 w-4" />
                    {foldLevel === 0 && (
                      <span ref={typeLabelReference}>
                        {BLOCK_TYPE_LABELS[blockType]}
                      </span>
                    )}
                    <ChevronDownIcon className="h-3 w-3 opacity-60" />
                  </ToolbarButton>
                </Hint>
              </Dropdown>
              {separator}
            </>
          )}

          <ToggleGroup
            type="multiple"
            spacing={0.5}
            className="shrink-0"
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
            {markButton("bold", "Bold", BoldIcon, `${MOD}B`)}
            {markButton("italic", "Italic", ItalicIcon, `${MOD}I`)}
            {foldLevel < 2 &&
              FOLDING_MARKS.map(({ format, label, shortcut, Icon }) =>
                markButton(format, label, Icon, shortcut, true),
              )}
            <Hint title="Link" shortcut={`${MOD}K`}>
              <ToggleGroupItem
                value="link"
                aria-label="Toggle link"
                onClick={insertLink}
                className={cn(BUTTON_CLASS, "w-7 p-0")}
              >
                <LinkIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </Hint>
          </ToggleGroup>

          {separator}

          <Dropdown asChild menu={moreMenu} placement="bottomRight">
            <Hint title="More">
              <ToolbarButton aria-label="More options">
                <MoreHorizontalIcon className="h-4 w-4" />
              </ToolbarButton>
            </Hint>
          </Dropdown>
        </>
      )}
    </div>
  );
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElement: HTMLDivElement | null,
  setIsLinkEditMode: Dispatch<boolean>,
  variant: "default" | "simple" = "default",
): JSX.Element | null {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [blockType, setBlockType] = useState<BlockType>("paragraph");

  /**
   * Whether the selection was made by touch, from the last pointer that went
   * down. Before any, a device whose main pointer is a finger counts as touch.
   */
  const lastPointerTypeReference = useRef<string | null>(null);
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      lastPointerTypeReference.current = event.pointerType;
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);
  const isTouchSelection = useCallback(() => {
    const last = lastPointerTypeReference.current;
    if (last) return last === "touch";
    return globalThis.matchMedia?.("(pointer: coarse)").matches ?? false;
  }, []);

  const handleBlockTypeChange = useCallback(
    (type: BlockType) => {
      if (type === "check") {
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, void 0);
      } else if (type === "bullet" || type === "number") {
        // Lexical's list commands turned a whole list, or nothing of a
        // nested one; this turns just the selected lines.
        editor.update(() => {
          $turnSelectedBlocksIntoList(type);
        });
      } else {
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          $setBlocksTypeLiftingChildren(selection, () => {
            switch (type) {
              case "h1":
              case "h2":
              case "h3": {
                return $createHeadingNode(type);
              }
              case "quote": {
                return $createQuoteNode();
              }
              case "code": {
                return $createCodeNode();
              }
              default: {
                return $createParagraphNode();
              }
            }
          });
        });
      }
      setBlockType(type);
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

      // Null when the caret is on the root — the toolbar then reports a plain
      // paragraph. Headings below h3 read as h3, the smallest offered.
      const topLevelElement = node.getTopLevelElement();
      if ($isListNode(topLevelElement)) {
        setBlockType(topLevelElement.getListType());
      } else if ($isHeadingNode(topLevelElement)) {
        const tag = topLevelElement.getTag();
        setBlockType(tag === "h1" || tag === "h2" ? tag : "h3");
      } else if ($isQuoteNode(topLevelElement)) {
        setBlockType("quote");
      } else if ($isCodeNode(topLevelElement)) {
        setBlockType("code");
      } else {
        setBlockType("paragraph");
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

  if (!isText || !anchorElement) {
    return null;
  }

  return createPortal(
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchorElement}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isStrikethrough={isStrikethrough}
      isUnderline={isUnderline}
      isCode={isCode}
      setIsLinkEditMode={setIsLinkEditMode}
      blockType={blockType}
      onBlockTypeChange={handleBlockTypeChange}
      onExplain={handleExplain}
      onAskAI={handleAskAI}
      onComment={handleComment}
      onMath={handleMath}
      variant={variant}
      isTouchSelection={isTouchSelection}
    />,
    anchorElement,
  );
}

export function FloatingTextFormatToolbarPlugin({
  anchorElem,
  variant = "default",
}: {
  anchorElem: HTMLDivElement | null;
  variant?: "default" | "simple";
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const { setIsLinkEditMode } = useFloatingLinkContext();

  return useFloatingTextFormatToolbar(
    editor,
    anchorElem,
    setIsLinkEditMode,
    variant,
  );
}
