import type { LexicalNode, NodeKey } from "lexical";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { $createCodeNode } from "@lexical/code";
import { $generateNodesFromDOM } from "@lexical/html";
import {
  $isListItemNode,
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  COPY_COMMAND,
} from "lexical";
import { GripVerticalIcon, PlusIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@acme/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@acme/ui/components/popover";
import { cn } from "@acme/ui/lib/utils";

import type { SizeType } from "../../config-provider/size-context";
import { $createCheckBlockNode } from "../nodes/check-block-node";

const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

export function DraggableBlockPlugin({
  anchorElem,
  size = "middle",
}: {
  anchorElem: HTMLElement | null;
  size?: SizeType;
}): JSX.Element | null {
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const [editor] = useLexicalComposerContext();
  /* Use Ref for currentNodeKey to prevent re-renders when hovering different blocks */
  const currentNodeKeyRef = useRef<NodeKey | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTurnIntoOpen, setIsTurnIntoOpen] = useState(false);
  const [menuElement, setMenuElement] = useState<HTMLElement | null>(null);
  const turnIntoAnchorRef = useRef<HTMLDivElement>(null);

  const setMenuRef = useCallback((element: HTMLDivElement | null) => {
    menuRef.current = element;
    setMenuElement(element);
  }, []);

  const isOnMenu = useCallback(
    (element: HTMLElement): boolean => {
      // 1. Check state ref (primary source of truth)
      if (isMenuOpen || isTurnIntoOpen) return true;

      // 2. Fallback: Check if the trigger inside the menu indicates it's open
      if (
        menuRef.current?.querySelector(
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
    [isMenuOpen, isTurnIntoOpen],
  );

  // Update currentNodeKey when hovering blocks
  useEffect(() => {
    if (!anchorElem) return;

    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      editor.read(() => {
        const node = $getNearestNodeFromDOMNode(target);
        if (node) {
          // If the node is inside a list, we want the ListItemNode, not the whole List
          let block = node;
          const topLevel = node.getTopLevelElementOrThrow();

          if ($isListNode(topLevel)) {
            // Traverse up to find ListItemNode
            let current: LexicalNode | null = node;
            while (current && current !== topLevel) {
              if ($isListItemNode(current)) {
                block = current;
                break;
              }
              current = current.getParent();
            }
            // If we didn't find ListItem (e.g. hovering the List itself), fallback to topLevel
            if (current === topLevel) {
              block = topLevel;
            }
          } else {
            block = topLevel;
          }

          const key = block.getKey();

          // Only update if it's a valid block key to prevent flickering or losing state
          if (key) {
            currentNodeKeyRef.current = key;
          }
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
    const key = currentNodeKeyRef.current;
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
    const key = currentNodeKeyRef.current;
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
    const key = currentNodeKeyRef.current;
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
    const key = currentNodeKeyRef.current;
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

  const handleTurnInto = useCallback(
    (type: string) => {
      console.log("handleTurnInto called with type:", type);
      const key = currentNodeKeyRef.current;
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

        if ($isElementNode(node)) {
          node.select();
        } else if ($isTextNode(node)) {
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
            $setBlocksType(selection, () => $createHeadingNode("h1"));
            break;
          }
          case "h2": {
            $setBlocksType(selection, () => $createHeadingNode("h2"));
            break;
          }
          case "h3": {
            $setBlocksType(selection, () => $createHeadingNode("h3"));
            break;
          }
          case "bullet": {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0);
            break;
          }
          case "number": {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0);
            break;
          }
          case "quote": {
            $setBlocksType(selection, () => $createQuoteNode());
            break;
          }
          case "code": {
            $setBlocksType(selection, () => $createCodeNode());
            break;
          }
          case "paragraph": {
            $setBlocksType(selection, () => $createParagraphNode());
            break;
          }
          case "check": {
            $setBlocksType(selection, () => $createCheckBlockNode());
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
        ref={setMenuRef}
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
        <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <PopoverTrigger asChild>
            <div
              className={cn(
                "group/drag flex cursor-grab items-center justify-center rounded text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 active:scale-95 active:cursor-grabbing active:bg-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-300",
                isSmall ? "h-4 w-3.5" : "h-6 w-5",
              )}
            >
              <GripVerticalIcon className={isSmall ? "size-3" : "size-4"} />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="right"
            sideOffset={5}
            container={menuElement}
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
                        ref={turnIntoAnchorRef}
                        onMouseEnter={() => {
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
                      side="right"
                      align="start"
                      sideOffset={0}
                      container={menuElement}
                      className="w-48 p-0"
                    >
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            <CommandItem onSelect={() => handleTurnInto("h1")}>
                              Heading 1
                            </CommandItem>
                            <CommandItem onSelect={() => handleTurnInto("h2")}>
                              Heading 2
                            </CommandItem>
                            <CommandItem onSelect={() => handleTurnInto("h3")}>
                              Heading 3
                            </CommandItem>
                            <CommandItem
                              onSelect={() => handleTurnInto("bullet")}
                            >
                              Bullet list
                            </CommandItem>
                            <CommandItem
                              onSelect={() => handleTurnInto("number")}
                            >
                              Numbered list
                            </CommandItem>
                            <CommandItem
                              onSelect={() => handleTurnInto("quote")}
                            >
                              Quote
                            </CommandItem>
                            <CommandItem
                              onSelect={() => handleTurnInto("code")}
                            >
                              Code
                            </CommandItem>
                            <CommandItem
                              onSelect={() => handleTurnInto("paragraph")}
                            >
                              Paragraph
                            </CommandItem>
                            <CommandItem
                              onSelect={() => handleTurnInto("check")}
                            >
                              Check list
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
    handleAddBlockBelow,
    setMenuRef,
    menuElement,
    isMenuOpen,
    isTurnIntoOpen,
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
      if (targetLineRef.current) {
        targetLineRef.current.style.opacity = "0";
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
      menuRef={menuRef}
      targetLineRef={targetLineRef}
      menuComponent={menuComponent}
      targetLineComponent={
        <div
          ref={targetLineRef}
          data-slot="draggable-block-target-line"
          className="bg-primary/50 pointer-events-none absolute top-0 left-0 h-1 w-full transition-opacity duration-200"
        />
      }
      isOnMenu={isOnMenu}
    />
  );
}
