import type { LexicalNode, NodeKey } from "lexical";
import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommandItem, CommandList, CommandRoot } from "@/components/ui/command";
import { Popover } from "@/components/ui/popover";
import { $createCodeNode } from "@lexical/code";
import {
  $createListItemNode,
  $createListNode,
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
  $isRangeSelection,
  COPY_COMMAND,
} from "lexical";
import { ChevronRightIcon, GripVerticalIcon } from "lucide-react";

import { blockTypeToBlockName } from "./toolbar/block-format/block-format-data";

const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

function isOnMenu(element: HTMLElement): boolean {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

export function DraggableBlockPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement | null;
}): JSX.Element | null {
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const [editor] = useLexicalComposerContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTurnIntoOpen, setIsTurnIntoOpen] = useState(false);
  const [currentNodeKey, setCurrentNodeKey] = useState<NodeKey | null>(null);
  const turnIntoMenuRef = useRef<HTMLDivElement>(null);
  const turnIntoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMenuClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const menuElement = event.currentTarget;

      editor.update(() => {
        // Find the closest block node from the menu element's parent
        const parentElement = menuElement.parentElement;
        if (parentElement) {
          const node = $getNearestNodeFromDOMNode(parentElement);
          if (node) {
            const blockNode = node.getTopLevelElementOrThrow();
            setCurrentNodeKey(blockNode.getKey());
          }
        } else {
          // Fallback to selection
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = selection.anchor.getNode();
            const blockNode = node.getTopLevelElementOrThrow();
            setCurrentNodeKey(blockNode.getKey());
          }
        }
      });

      setIsMenuOpen(true);
    },
    [editor],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement | null)?.closest(
          `[data-slot="draggable-block-menu"]`,
        )
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  const handleDelete = useCallback(() => {
    if (!currentNodeKey) return;

    editor.update(() => {
      const node = $getNodeByKey(currentNodeKey);
      if (node) {
        node.remove();
      }
    });

    setIsMenuOpen(false);
  }, [editor, currentNodeKey]);

  const handleDuplicate = useCallback(() => {
    if (!currentNodeKey) return;

    editor.update(() => {
      const node = $getNodeByKey(currentNodeKey);
      if (node) {
        const NodeClass = node.constructor as {
          clone: (node: LexicalNode) => LexicalNode;
        };
        const clone = NodeClass.clone(node);
        node.insertAfter(clone);
      }
    });

    setIsMenuOpen(false);
  }, [editor, currentNodeKey]);

  const handleCopy = useCallback(() => {
    editor.dispatchCommand(COPY_COMMAND, null);
    setIsMenuOpen(false);
  }, [editor]);

  const handleTurnInto = useCallback(
    (blockType: string) => {
      if (!currentNodeKey) return;

      editor.update(() => {
        const node = $getNodeByKey(currentNodeKey);
        if (node) {
          // Select the entire block node
          node.selectStart();
          node.selectEnd();

          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            switch (blockType) {
              case "paragraph": {
                $setBlocksType(selection, () => $createParagraphNode());
                break;
              }
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
              case "check": {
                $setBlocksType(selection, () => {
                  const list = $createListNode("check");
                  const listItem = $createListItemNode();
                  list.append(listItem);
                  return list;
                });
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
            }
          }
        }
      });

      setIsMenuOpen(false);
      setIsTurnIntoOpen(false);
    },
    [editor, currentNodeKey],
  );

  const handleTurnIntoClick = useCallback(() => {
    setIsTurnIntoOpen(true);
  }, []);

  const handleTurnIntoMouseEnter = useCallback(() => {
    if (turnIntoTimeoutRef.current) {
      clearTimeout(turnIntoTimeoutRef.current);
      turnIntoTimeoutRef.current = null;
    }
    setIsTurnIntoOpen(true);
  }, []);

  const handleTurnIntoMouseLeave = useCallback(() => {
    // Delay để cho phép di chuyển chuột vào submenu
    if (turnIntoTimeoutRef.current) {
      clearTimeout(turnIntoTimeoutRef.current);
    }
    turnIntoTimeoutRef.current = setTimeout(() => {
      setIsTurnIntoOpen(false);
      turnIntoTimeoutRef.current = null;
    }, 150);
  }, []);

  if (!anchorElem) {
    return null;
  }

  return (
    <>
      <DraggableBlockPlugin_EXPERIMENTAL
        anchorElem={anchorElem}
        menuRef={menuRef as React.RefObject<HTMLElement>}
        targetLineRef={targetLineRef as React.RefObject<HTMLElement>}
        menuComponent={
          <div
            ref={menuRef}
            data-slot="draggable-block-menu"
            className={`${DRAGGABLE_BLOCK_MENU_CLASSNAME} absolute -top-px left-0 flex cursor-grab items-center justify-center rounded-sm px-px leading-7 opacity-0 will-change-transform group-hover:opacity-100 hover:bg-gray-100 active:cursor-grabbing`}
            onClick={handleMenuClick}
          >
            <GripVerticalIcon className="size-4 opacity-30" />
          </div>
        }
        targetLineComponent={
          <div
            ref={targetLineRef}
            className="bg-secondary-foreground pointer-events-none absolute top-0 left-0 h-1 opacity-0 will-change-transform"
          />
        }
        isOnMenu={isOnMenu}
      />
      {isMenuOpen && (
        <Popover
          open={isMenuOpen}
          onOpenChange={setIsMenuOpen}
          trigger="click"
          placement="left"
          className="w-[180px] p-1"
          arrow={false}
          content={
            <CommandRoot>
              <CommandList>
                <CommandItem onSelect={handleCopy}>Copy</CommandItem>
                <CommandItem onSelect={handleDuplicate}>Duplicate</CommandItem>
                <CommandItem
                  onSelect={handleTurnIntoClick}
                  ref={turnIntoMenuRef}
                  onMouseEnter={handleTurnIntoMouseEnter}
                  onMouseLeave={handleTurnIntoMouseLeave}
                >
                  <div className="flex w-full items-center justify-between">
                    <span>Turn into</span>
                    <ChevronRightIcon className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem onSelect={handleDelete}>Delete</CommandItem>
              </CommandList>
            </CommandRoot>
          }
        >
          <div
            ref={(el) => {
              if (el && menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect();
                el.style.position = "fixed";
                el.style.left = `${rect.left - 188}px`;
                el.style.top = `${rect.top}px`;
                el.style.width = "1px";
                el.style.height = "1px";
                el.style.pointerEvents = "none";
              }
            }}
          />
        </Popover>
      )}
      {isTurnIntoOpen && (
        <Popover
          open={isTurnIntoOpen}
          onOpenChange={setIsTurnIntoOpen}
          trigger="hover"
          placement="left"
          className="w-[180px] p-1"
          arrow={false}
          content={
            <CommandRoot>
              <CommandList>
                {Object.entries(blockTypeToBlockName).map(
                  ([key, { label, icon }]) => (
                    <CommandItem key={key} onSelect={() => handleTurnInto(key)}>
                      <div className="flex items-center gap-2">
                        {icon}
                        <span>{label}</span>
                      </div>
                    </CommandItem>
                  ),
                )}
              </CommandList>
            </CommandRoot>
          }
        >
          <div
            ref={(el) => {
              if (el && turnIntoMenuRef.current) {
                const rect = turnIntoMenuRef.current.getBoundingClientRect();
                el.style.position = "fixed";
                el.style.left = `${rect.left - 180}px`;
                el.style.top = `${rect.top}px`;
                el.style.width = "1px";
                el.style.height = "1px";
                el.style.pointerEvents = "none";
              }
            }}
            onMouseEnter={() => {
              if (turnIntoTimeoutRef.current) {
                clearTimeout(turnIntoTimeoutRef.current);
                turnIntoTimeoutRef.current = null;
              }
              setIsTurnIntoOpen(true);
            }}
            onMouseLeave={() => {
              if (turnIntoTimeoutRef.current) {
                clearTimeout(turnIntoTimeoutRef.current);
              }
              turnIntoTimeoutRef.current = setTimeout(() => {
                setIsTurnIntoOpen(false);
                turnIntoTimeoutRef.current = null;
              }, 150);
            }}
          />
        </Popover>
      )}
    </>
  );
}
