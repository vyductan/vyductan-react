import type { LexicalNode, NodeKey } from "lexical";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { $createCodeNode } from "@lexical/code";
import { $generateNodesFromDOM } from "@lexical/html";
import { $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from "@lexical/rich-text";
import {
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isRootNode,
  $isTextNode,
  $setState,
  COPY_COMMAND,
} from "lexical";
import { GripVerticalIcon, PlusIcon } from "lucide-react";
import { createPortal } from "react-dom";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@acme/ui/components/command";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@acme/ui/components/popover";
import { cn } from "@acme/ui/lib/utils";

import type { SizeType } from "../../config-provider/size-context";
import { $createCheckBlockNode } from "../nodes/check-block-node";
import {
  blockColorState,
  cssForNotionColor,
  NOTION_COLOR_NAMES,
} from "../transformers/markdown-nfm-colors-transformer";
import {
  $lineOf,
  $selectedBlocks,
  $turnSelectedBlocksIntoList,
} from "../utils/block-selection";
import { BLOCK_TYPE_ICONS } from "../utils/block-type-icons";
import { $setBlocksTypeLiftingChildren } from "../utils/set-blocks-type-lifting-children";
import { DraggableBlockPlugin_EXPERIMENTAL } from "./default/lexical-draggable-block-plugin";

const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

/**
 * The block the drag handle belongs to for a hovered node, or null when there
 * is no block to drag.
 *
 * Null is a real answer, not a defensive one: the pointer resting on the
 * editor's own padding resolves to the ROOT node, and a root has no top-level
 * element by definition. Asking it for one used to throw
 * "root nodes are not top level elements" out of a mousemove listener, which
 * surfaced as a runtime error overlay the moment a page with the editor was
 * opened.
 *
 * The block is the root's own child, not `getTopLevelElement()`: that stops at
 * a shadow root, and a table cell, a callout and a toggle's body are shadow
 * roots. The handle stands beside the root's children (getBlockElement), so
 * inside a table it acted on the paragraph in a cell — "+" put its new line,
 * and the "/", into the cell.
 */
export function $draggableBlockForNode(node: LexicalNode): LexicalNode | null {
  let topLevel: LexicalNode | null = node;
  while (topLevel && !$isRootNode(topLevel.getParent())) {
    topLevel = topLevel.getParent();
  }

  if (!topLevel) {
    return null;
  }

  if (!$isListNode(topLevel)) {
    return topLevel;
  }

  // Inside a list it is the item that gets dragged, not the whole list.
  let current: LexicalNode | null = node;

  while (current && current !== topLevel) {
    if ($isListItemNode(current)) {
      return current;
    }
    current = current.getParent();
  }

  return topLevel;
}

/**
 * The block colors "Color" offers, as Notion names them (see
 * transformers/markdown-nfm-colors-transformer.ts): text colors, then
 * backgrounds. Only paragraphs, headings and quotes take one — the blocks
 * whose color Notion-flavored Markdown can carry back.
 */
const BLOCK_COLORS: { color: string | null; label: string }[] = [
  { color: null, label: "Default" },
  ...NOTION_COLOR_NAMES.map((name) => ({
    color: name,
    label: name[0]!.toUpperCase() + name.slice(1),
  })),
  ...NOTION_COLOR_NAMES.map((name) => ({
    color: `${name}_bg`,
    label: `${name[0]!.toUpperCase() + name.slice(1)} background`,
  })),
];

function $isColorable(node: LexicalNode | null): node is LexicalNode {
  return $isParagraphNode(node) || $isHeadingNode(node) || $isQuoteNode(node);
}

/**
 * What "Turn into" offers, each with the icon and name the slash menu gives
 * it — so a type reads the same wherever it is chosen, and is picked out at a
 * glance rather than read. Notion's order.
 */
const TURN_INTO_CHOICES: ReadonlyArray<{
  type: keyof typeof BLOCK_TYPE_ICONS;
  label: string;
}> = [
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

export function DraggableBlockPlugin({
  anchorElem,
  size = "middle",
}: {
  anchorElem: HTMLElement | null;
  size?: SizeType;
}): JSX.Element | null {
  const menuReference = useRef<HTMLDivElement>(null);
  const targetLineReference = useRef<HTMLDivElement>(null);
  const [editor] = useLexicalComposerContext();
  /* Use Ref for currentNodeKey to prevent re-renders when hovering different blocks */
  const currentNodeKeyReference = useRef<NodeKey | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTurnIntoOpen, setIsTurnIntoOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  // The block the menu is open on can take a color (see BLOCK_COLORS).
  const [canColor, setCanColor] = useState(false);
  /**
   * Mirrors the two above for the mousemove listener, which is bound once and
   * would otherwise close over their first values. Synced in an effect rather
   * than during render, and read only from a pointer event, which is always
   * later than the commit that opened the menu.
   */
  const isMenuShowingReference = useRef(false);
  useEffect(() => {
    isMenuShowingReference.current =
      isMenuOpen || isTurnIntoOpen || isColorOpen;
  }, [isMenuOpen, isTurnIntoOpen, isColorOpen]);
  const turnIntoAnchorReference = useRef<HTMLDivElement>(null);

  /**
   * Where the handle was standing when the menu was opened.
   *
   * The menu cannot be anchored to the handle itself. @lexical/react drops the
   * handle on a `mouseleave` of the editor's scroller — with no `isOnMenu`
   * guard — and then hides it, collapsing its rect to 0,0. Reaching for a menu
   * item takes the pointer off the editor, so the anchor disappeared mid-reach
   * and the menu jumped to the top-left corner of the screen on the next
   * render. Freezing the position at open time and anchoring to a node of our
   * own, outside the editor, leaves nothing for the plugin to take away.
   */
  const [anchorBox, setAnchorBox] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const handleMenuOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        const rect = menuReference.current?.getBoundingClientRect();
        if (rect) {
          setAnchorBox({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
        }
        const key = currentNodeKeyReference.current;
        setCanColor(
          key !== null && editor.read(() => $isColorable($getNodeByKey(key))),
        );
      } else {
        setIsColorOpen(false);
      }
      setIsMenuOpen(next);
    },
    [editor],
  );

  const isOnMenu = useCallback(
    (element: HTMLElement): boolean => {
      // 1. Check state ref (primary source of truth)
      if (isMenuOpen || isTurnIntoOpen || isColorOpen) return true;

      // 2. Fallback: Check if the trigger inside the menu indicates it's open
      if (
        menuReference.current?.querySelector(
          '[data-slot="popover-trigger"][data-state="open"]',
        )
      ) {
        return true;
      }

      // 3. Fallback: Check if we are interacting with the popover content itself
      return (
        !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`) ||
        !!element.closest('[data-slot="draggable-block-menu"]') ||
        !!element.closest('[data-slot="popover-content"]')
      );
    },
    [isMenuOpen, isTurnIntoOpen, isColorOpen],
  );

  // Update currentNodeKey when hovering blocks
  useEffect(() => {
    if (!anchorElem) return;

    const handleMouseMove = (event: MouseEvent) => {
      // Reaching for a menu item drags the pointer across the blocks in
      // between, and each crossing used to retarget the handle — so "Turn into"
      // landed on whatever the pointer last passed over rather than the block
      // the menu was opened on. While the menu is showing, the block it was
      // opened on is the answer, whatever the pointer is over now.
      if (isMenuShowingReference.current) return;

      const target = event.target as Node | null;
      if (!target) return;

      editor.read(() => {
        const node = $getNearestNodeFromDOMNode(target);
        if (!node) return;

        const block = $draggableBlockForNode(node);

        // Keep the last block rather than clearing it: the pointer crossing the
        // padding between two blocks should not drop the handle.
        if (block) {
          currentNodeKeyReference.current = block.getKey();
        }
      });
    };

    anchorElem.addEventListener("mousemove", handleMouseMove);
    return () => {
      anchorElem.removeEventListener("mousemove", handleMouseMove);
    };
  }, [anchorElem, editor]);

  // Insert a new paragraph below the current block and trigger component picker
  const handleAddBlockBelow = useCallback(() => {
    const key = currentNodeKeyReference.current;
    if (!key) return;

    editor.update(() => {
      const node = $getNodeByKey(key);
      if (node) {
        const paragraph = $createParagraphNode();
        node.insertAfter(paragraph);
        paragraph.select();

        // Insert "/" to trigger the component picker menu
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText("/");
        }
      }
    });
  }, [editor]);

  const handleDelete = useCallback(() => {
    const key = currentNodeKeyReference.current;
    if (!key) return;

    editor.update(() => {
      const node = $getNodeByKey(key);
      if ($isRangeSelection($getSelection())) {
        const selection = $getSelection();
        if (selection) {
          node?.remove();
        }
      } else {
        node?.remove();
      }
    });
    setIsMenuOpen(false);
  }, [editor]);

  const handleDuplicate = useCallback(() => {
    const key = currentNodeKeyReference.current;
    if (!key) return;

    editor.update(() => {
      const node = $getNodeByKey(key);
      if (node) {
        // Clone the node
        let html = "";
        if ($isElementNode(node)) {
          const dom = node.exportDOM(editor);
          if (dom.element instanceof HTMLElement) {
            html = dom.element.outerHTML;
          }
        }

        if (html) {
          const clonedNodes = $generateNodesFromDOM(
            editor,
            new DOMParser().parseFromString(html, "text/html"),
          );

          if (clonedNodes[0]) {
            node.insertAfter(clonedNodes[0]);
          }
        } else {
          // Fallback usually not needed for standard blocks
        }
      }
    });
    setIsMenuOpen(false);
  }, [editor]);

  const handleCopy = useCallback(() => {
    const key = currentNodeKeyReference.current;
    if (!key) return;

    editor.update(() => {
      const node = $getNodeByKey(key);
      if (node) {
        if ($isElementNode(node)) {
          node.select();
        } else if ($isTextNode(node)) {
          node.select();
        }

        editor.dispatchCommand(COPY_COMMAND, null);
      }
    });
    setIsMenuOpen(false);
  }, [editor]);

  const handleColor = useCallback(
    (color: string | null) => {
      const key = currentNodeKeyReference.current;
      if (!key) return;
      editor.update(() => {
        const node = $getNodeByKey(key);
        if ($isColorable(node)) $setState(node, blockColorState, color);
      });
      setIsColorOpen(false);
      setIsMenuOpen(false);
    },
    [editor],
  );

  const handleTurnInto = useCallback(
    (type: string) => {
      console.log("handleTurnInto called with type:", type);
      const key = currentNodeKeyReference.current;
      console.log("Current node key:", key);

      if (!key) {
        console.warn("No current node key found!");
        return;
      }

      editor.update(() => {
        const node = $getNodeByKey(key);
        if (!node) {
          console.warn("Node not found for key:", key);
          return;
        }

        // Ensure editor is focused and node is selected
        // This is critical because clicking the menu might have stolen focus
        editor.focus();

        // Opened on a line of a block selection, the choice is for every
        // selected line, as in Notion — so the selection is kept. Otherwise
        // it is for the line the menu was opened on.
        const line = $lineOf(node);
        const inBlockSelection = $selectedBlocks().some(
          (selected) => line !== null && selected.is(line),
        );
        if (!inBlockSelection && ($isElementNode(node) || $isTextNode(node))) {
          node.select();
        }

        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          // Fallback: try to select again or force selection logic
          // But normally focus() + node.select() works
          return;
        }

        switch (type) {
          case "h1": {
            $setBlocksTypeLiftingChildren(selection, () =>
              $createHeadingNode("h1"),
            );
            break;
          }
          case "h2": {
            $setBlocksTypeLiftingChildren(selection, () =>
              $createHeadingNode("h2"),
            );
            break;
          }
          case "h3": {
            $setBlocksTypeLiftingChildren(selection, () =>
              $createHeadingNode("h3"),
            );
            break;
          }
          // Lexical's list commands turned a whole list, or nothing inside a
          // nested one; these turn just the lines chosen.
          case "bullet": {
            $turnSelectedBlocksIntoList("bullet");
            break;
          }
          case "number": {
            $turnSelectedBlocksIntoList("number");
            break;
          }
          case "quote": {
            $setBlocksTypeLiftingChildren(selection, () => $createQuoteNode());
            break;
          }
          case "code": {
            $setBlocksTypeLiftingChildren(selection, () => $createCodeNode());
            break;
          }
          case "paragraph": {
            $setBlocksTypeLiftingChildren(selection, () =>
              $createParagraphNode(),
            );
            break;
          }
          case "check": {
            $setBlocksTypeLiftingChildren(selection, () =>
              $createCheckBlockNode(),
            );
            break;
          }
        }
      });
      setIsTurnIntoOpen(false);
      setIsMenuOpen(false);
    },
    [editor],
  );

  /* Memoized Menu Component to prevent re-renders */
  const menuComponent = useMemo(() => {
    const isSmall = size === "small";

    return (
      <div
        ref={menuReference}
        data-slot="draggable-block-menu"
        className={`${DRAGGABLE_BLOCK_MENU_CLASSNAME} absolute top-0 left-0 -ml-1 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
      >
        {/* Plus Button */}
        <div
          className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded p-1 transition-colors"
          onClick={handleAddBlockBelow}
        >
          <PlusIcon className={isSmall ? "size-3" : "size-4"} />
        </div>

        {/* Drag Handle with Popover */}
        <Popover open={isMenuOpen} onOpenChange={handleMenuOpenChange}>
          {anchorBox &&
            createPortal(
              <PopoverAnchor asChild>
                <div
                  aria-hidden
                  style={{
                    position: "fixed",
                    top: anchorBox.top,
                    left: anchorBox.left,
                    width: anchorBox.width,
                    height: anchorBox.height,
                    pointerEvents: "none",
                  }}
                />
              </PopoverAnchor>,
              document.body,
            )}
          <PopoverTrigger asChild>
            <div
              className={cn(
                "group/drag text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-muted flex cursor-grab items-center justify-center rounded transition-all duration-200 active:scale-95 active:cursor-grabbing",
                isSmall ? "h-4 w-3.5" : "h-6 w-5",
              )}
            >
              <GripVerticalIcon className={isSmall ? "size-3" : "size-4"} />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="left"
            sideOffset={5}
            collisionPadding={8}
            className="w-64 p-0"
          >
            <Command>
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem onSelect={handleCopy}>Copy</CommandItem>
                  <CommandItem onSelect={handleDuplicate}>
                    Duplicate
                  </CommandItem>
                  <Popover
                    open={isTurnIntoOpen}
                    onOpenChange={setIsTurnIntoOpen}
                  >
                    <PopoverTrigger asChild>
                      <CommandItem
                        ref={turnIntoAnchorReference}
                        onMouseEnter={() => {
                          setIsColorOpen(false);
                          setIsTurnIntoOpen(true);
                        }}
                        onSelect={() => {
                          setIsTurnIntoOpen(true);
                        }}
                      >
                        <span>Turn into</span>
                        <span className="ml-auto">›</span>
                      </CommandItem>
                    </PopoverTrigger>
                    <PopoverContent
                      // The menu itself opens into the left margin, so the
                      // submenu unfolds back across it rather than pushing
                      // further left into the app's sidebar. Notion reads the
                      // same way round.
                      side="right"
                      align="start"
                      sideOffset={0}
                      collisionPadding={8}
                      className="w-48 p-0"
                    >
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {TURN_INTO_CHOICES.map(({ type, label }) => {
                              const Icon = BLOCK_TYPE_ICONS[type];
                              return (
                                <CommandItem
                                  key={type}
                                  onSelect={() => handleTurnInto(type)}
                                >
                                  <Icon className="size-4" />
                                  {label}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {canColor && (
                    <Popover open={isColorOpen} onOpenChange={setIsColorOpen}>
                      <PopoverTrigger asChild>
                        <CommandItem
                          onMouseEnter={() => {
                            setIsTurnIntoOpen(false);
                            setIsColorOpen(true);
                          }}
                          onSelect={() => setIsColorOpen(true)}
                        >
                          <span>Color</span>
                          <span className="ml-auto">›</span>
                        </CommandItem>
                      </PopoverTrigger>
                      <PopoverContent
                        side="right"
                        align="start"
                        sideOffset={0}
                        collisionPadding={8}
                        className="w-52 p-0"
                      >
                        <Command>
                          <CommandList className="max-h-80">
                            <CommandGroup>
                              {BLOCK_COLORS.map(({ color, label }) => {
                                const css = color
                                  ? cssForNotionColor(color)
                                  : undefined;
                                return (
                                  <CommandItem
                                    key={label}
                                    onSelect={() => handleColor(color)}
                                  >
                                    <span
                                      aria-hidden
                                      className="border-border inline-flex size-5 items-center justify-center rounded border text-xs font-medium"
                                      style={
                                        css
                                          ? {
                                              [css.property === "color"
                                                ? "color"
                                                : "backgroundColor"]: css.value,
                                            }
                                          : undefined
                                      }
                                    >
                                      A
                                    </span>
                                    {label}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                  <CommandItem onSelect={handleDelete}>
                    <span className="text-red-500">Delete</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }, [
    handleCopy,
    handleDelete,
    handleDuplicate,
    handleTurnInto,
    handleColor,
    handleAddBlockBelow,
    handleMenuOpenChange,
    anchorBox,
    isMenuOpen,
    isTurnIntoOpen,
    isColorOpen,
    canColor,
    size,
  ]);

  // Hide target line when dragging outside the editor
  useEffect(() => {
    if (!anchorElem) return;

    const handleDragLeave = (event: DragEvent) => {
      // Check if we're leaving the anchor element bounds
      const relatedTarget = event.relatedTarget as HTMLElement | null;

      // If relatedTarget is not null and within anchorElem, we're still in the editor
      if (relatedTarget && anchorElem.contains(relatedTarget)) {
        return;
      }

      // We've left the editor, hide the target line
      if (targetLineReference.current) {
        targetLineReference.current.style.opacity = "0";
      }
    };
    const handleDragOver = (event: DragEvent) => {
      // Reset opacity when dragging back into editor
      // The DraggableBlockPlugin will handle showing it at the right position
      event.preventDefault();
    };

    anchorElem.addEventListener("dragleave", handleDragLeave);
    anchorElem.addEventListener("dragover", handleDragOver);

    return () => {
      anchorElem.removeEventListener("dragleave", handleDragLeave);
      anchorElem.removeEventListener("dragover", handleDragOver);
    };
  }, [anchorElem]);

  if (!anchorElem) {
    return null;
  }

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={anchorElem}
      menuRef={menuReference}
      targetLineRef={targetLineReference}
      menuComponent={menuComponent}
      targetLineComponent={
        <div
          ref={targetLineReference}
          data-slot="draggable-block-target-line"
          className="bg-primary/50 pointer-events-none absolute top-0 left-0 h-1 w-full opacity-0 transition-opacity duration-200"
        />
      }
      isOnMenu={isOnMenu}
    />
  );
}
