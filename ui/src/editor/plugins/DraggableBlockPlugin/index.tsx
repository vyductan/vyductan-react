"use client";

import type { LexicalEditor } from "lexical";
import type { DragEvent as ReactDragEvent } from "react";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { eventFiles } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getRoot,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
} from "lexical";
import { createPortal } from "react-dom";

import { clsm } from "@acme/ui";

import { Icon } from "../../../icons";
import { isHTMLElement } from "../../utils/guard";
import { Point } from "../../utils/point";
import { Rect } from "../../utils/rect";

const SPACE = 4;
const TARGET_LINE_HALF_HEIGHT = 2;
const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";
const DRAG_DATA_FORMAT = "application/x-lexical-drag-block";
const TEXT_BOX_HORIZONTAL_PADDING = 28;

const Downward = 1;
const Upward = -1;
const Indeterminate = 0;

let prevIndex = Infinity;

function getCurrentIndex(keysLength: number): number {
  if (keysLength === 0) {
    return Infinity;
  }
  if (prevIndex >= 0 && prevIndex < keysLength) {
    return prevIndex;
  }

  return Math.floor(keysLength / 2);
}

function getTopLevelNodeKeys(editor: LexicalEditor): string[] {
  return editor.getEditorState().read(() => $getRoot().getChildrenKeys());
}

function getCollapsedMargins(element: HTMLElement): {
  marginTop: number;
  marginBottom: number;
} {
  const getMargin = (
    element: Element | null,
    margin: "marginTop" | "marginBottom",
  ): number =>
    element ? Number.parseFloat(window.getComputedStyle(element)[margin]) : 0;

  const { marginTop, marginBottom } = window.getComputedStyle(element);
  const prevElementSiblingMarginBottom = getMargin(
    element.previousElementSibling,
    "marginBottom",
  );
  const nextElementSiblingMarginTop = getMargin(
    element.nextElementSibling,
    "marginTop",
  );
  const collapsedTopMargin = Math.max(
    Number.parseFloat(marginTop),
    prevElementSiblingMarginBottom,
  );
  const collapsedBottomMargin = Math.max(
    Number.parseFloat(marginBottom),
    nextElementSiblingMarginTop,
  );

  return { marginBottom: collapsedBottomMargin, marginTop: collapsedTopMargin };
}

function getBlockElement(
  anchorElement: HTMLElement,
  editor: LexicalEditor,
  event: MouseEvent,
  useEdgeAsDefault = false,
): HTMLElement | null {
  const anchorElementRect = anchorElement.getBoundingClientRect();
  const topLevelNodeKeys = getTopLevelNodeKeys(editor);

  let blockElement: HTMLElement | null = null;
  editor.getEditorState().read(() => {
    if (useEdgeAsDefault) {
      const [firstNode, lastNode] = [
        editor.getElementByKey(topLevelNodeKeys[0]!),
        editor.getElementByKey(topLevelNodeKeys.at(-1)!),
      ];

      const [firstNodeRect, lastNodeRect] = [
        firstNode?.getBoundingClientRect(),
        lastNode?.getBoundingClientRect(),
      ];

      if (firstNodeRect && lastNodeRect) {
        if (event.y < firstNodeRect.top) {
          blockElement = firstNode;
        } else if (event.y > lastNodeRect.bottom) {
          blockElement = lastNode;
        }

        if (blockElement) {
          return;
        }
      }
    }

    let index = getCurrentIndex(topLevelNodeKeys.length);
    let direction = Indeterminate;

    while (index >= 0 && index < topLevelNodeKeys.length) {
      const key = topLevelNodeKeys[index];
      const element = editor.getElementByKey(key!);
      if (element === null) {
        break;
      }
      const point = new Point(event.x, event.y);
      const domRect = Rect.fromDOM(element);
      const { marginTop, marginBottom } = getCollapsedMargins(element);

      const rect = domRect.generateNewRect({
        bottom: domRect.bottom + marginBottom,
        left: anchorElementRect.left,
        right: anchorElementRect.right,
        top: domRect.top - marginTop,
      });

      const {
        result,
        reason: { isOnTopSide, isOnBottomSide },
      } = rect.contains(point);

      if (result) {
        blockElement = element;
        prevIndex = index;
        break;
      }

      if (direction === Indeterminate) {
        if (isOnTopSide) {
          direction = Upward;
        } else if (isOnBottomSide) {
          direction = Downward;
        } else {
          // stop search block element
          direction = Infinity;
        }
      }

      index += direction;
    }
  });

  return blockElement;
}

function isOnMenu(element: HTMLElement): boolean {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

function setMenuPosition(
  targetElement: HTMLElement | null,
  floatingElement: HTMLElement,
  anchorElement: HTMLElement,
) {
  if (!targetElement) {
    floatingElement.style.opacity = "0";
    floatingElement.style.transform = "translate(-10000px, -10000px)";
    return;
  }

  const targetRect = targetElement.getBoundingClientRect();
  const targetStyle = window.getComputedStyle(targetElement);
  const floatingElementRect = floatingElement.getBoundingClientRect();
  const anchorElementRect = anchorElement.getBoundingClientRect();

  const top =
    targetRect.top +
    (Number.parseInt(targetStyle.lineHeight, 10) - floatingElementRect.height) / 2 -
    anchorElementRect.top;

  const left = SPACE;

  floatingElement.style.opacity = "1";
  floatingElement.style.transform = `translate(${left}px, ${top}px)`;
}

function setDragImage(
  dataTransfer: DataTransfer,
  draggableBlockElement: HTMLElement,
) {
  const { transform } = draggableBlockElement.style;

  // Remove dragImage borders
  draggableBlockElement.style.transform = "translateZ(0)";
  dataTransfer.setDragImage(draggableBlockElement, 0, 0);

  setTimeout(() => {
    draggableBlockElement.style.transform = transform;
  });
}

function setTargetLine(
  targetLineElement: HTMLElement,
  targetBlockElement: HTMLElement,
  mouseY: number,
  anchorElement: HTMLElement,
) {
  const { top: targetBlockElementTop, height: targetBlockElementHeight } =
    targetBlockElement.getBoundingClientRect();
  const { top: anchorTop, width: anchorWidth } =
    anchorElement.getBoundingClientRect();

  const { marginTop, marginBottom } = getCollapsedMargins(targetBlockElement);
  let lineTop = targetBlockElementTop;
  if (mouseY >= targetBlockElementTop) {
    lineTop += targetBlockElementHeight + marginBottom / 2;
  } else {
    lineTop -= marginTop / 2;
  }

  const top = lineTop - anchorTop - TARGET_LINE_HALF_HEIGHT;
  const left = TEXT_BOX_HORIZONTAL_PADDING - SPACE;

  targetLineElement.style.transform = `translate(${left}px, ${top}px)`;
  targetLineElement.style.width = `${
    anchorWidth - (TEXT_BOX_HORIZONTAL_PADDING - SPACE) * 2
  }px`;
  targetLineElement.style.opacity = ".4";
}

function hideTargetLine(targetLineElement: HTMLElement | null) {
  if (targetLineElement) {
    targetLineElement.style.opacity = "0";
    targetLineElement.style.transform = "translate(-10000px, -10000px)";
  }
}

function useDraggableBlockMenu(
  editor: LexicalEditor,
  anchorElement: HTMLElement,
  isEditable: boolean,
): JSX.Element {
  const scrollerElement = anchorElement.parentElement;

  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const isDraggingBlockRef = useRef<boolean>(false);
  const [draggableBlockElement, setDraggableBlockElement] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      const target = event.target;
      if (!isHTMLElement(target)) {
        setDraggableBlockElement(null);
        return;
      }

      if (isOnMenu(target)) {
        return;
      }

      const _draggableBlockElement = getBlockElement(anchorElement, editor, event);

      setDraggableBlockElement(_draggableBlockElement);
    }

    function onMouseLeave() {
      setDraggableBlockElement(null);
    }

    scrollerElement?.addEventListener("mousemove", onMouseMove);
    scrollerElement?.addEventListener("mouseleave", onMouseLeave);

    return () => {
      scrollerElement?.removeEventListener("mousemove", onMouseMove);
      scrollerElement?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [scrollerElement, anchorElement, editor]);

  useEffect(() => {
    if (menuRef.current) {
      setMenuPosition(draggableBlockElement, menuRef.current, anchorElement);
    }
  }, [anchorElement, draggableBlockElement]);

  useEffect(() => {
    function onDragover(event: DragEvent): boolean {
      if (!isDraggingBlockRef.current) {
        return false;
      }
      const [isFileTransfer] = eventFiles(event);
      if (isFileTransfer) {
        return false;
      }
      const { pageY, target } = event;
      if (!isHTMLElement(target)) {
        return false;
      }
      const targetBlockElement = getBlockElement(anchorElement, editor, event, true);
      const targetLineElement = targetLineRef.current;
      if (targetBlockElement === null || targetLineElement === null) {
        return false;
      }
      setTargetLine(targetLineElement, targetBlockElement, pageY, anchorElement);
      // Prevent default event to be able to trigger onDrop events
      event.preventDefault();
      return true;
    }

    function onDrop(event: DragEvent): boolean {
      if (!isDraggingBlockRef.current) {
        return false;
      }
      const [isFileTransfer] = eventFiles(event);
      if (isFileTransfer) {
        return false;
      }
      const { target, dataTransfer, pageY } = event;
      const dragData = dataTransfer?.getData(DRAG_DATA_FORMAT) ?? "";
      const draggedNode = $getNodeByKey(dragData);
      if (!draggedNode) {
        return false;
      }
      if (!isHTMLElement(target)) {
        return false;
      }
      const targetBlockElement = getBlockElement(anchorElement, editor, event, true);
      if (!targetBlockElement) {
        return false;
      }
      const targetNode = $getNearestNodeFromDOMNode(targetBlockElement);
      if (!targetNode) {
        return false;
      }
      if (targetNode === draggedNode) {
        return true;
      }
      const targetBlockElementTop = targetBlockElement.getBoundingClientRect().top;
      if (pageY >= targetBlockElementTop) {
        targetNode.insertAfter(draggedNode);
      } else {
        targetNode.insertBefore(draggedNode);
      }
      setDraggableBlockElement(null);

      return true;
    }

    return mergeRegister(
      editor.registerCommand(
        DRAGOVER_COMMAND,
        (event) => {
          return onDragover(event);
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DROP_COMMAND,
        (event) => {
          return onDrop(event);
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [anchorElement, editor]);

  function onDragStart(event: ReactDragEvent<HTMLDivElement>): void {
    const dataTransfer = event.dataTransfer;
    if (!draggableBlockElement) {
      return;
    }
    setDragImage(dataTransfer, draggableBlockElement);
    let nodeKey = "";
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(draggableBlockElement);
      if (node) {
        nodeKey = node.getKey();
      }
    });
    isDraggingBlockRef.current = true;
    dataTransfer.setData(DRAG_DATA_FORMAT, nodeKey);
  }

  function onDragEnd(): void {
    isDraggingBlockRef.current = false;
    hideTargetLine(targetLineRef.current);
  }

  return createPortal(
    <>
      <div
        className={clsm(
          "absolute left-0 top-0 cursor-grab p-px will-change-transform",
          "active:cursor-grabbing",
          "hover:bg-gray-100",
        )}
        ref={menuRef}
        draggable={true}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {/* <div className="h-4 w-4 bg-[url('https://playground.lexical.dev/assets/draggable-block-menu.a5121e96.svg')]"></div> */}
        {isEditable && (
          <Icon
            icon="uil:draggabledots"
            className="pointer-events-none size-4 opacity-80"
          />
        )}
      </div>
      <div
        className="pointer-events-none absolute left-0 top-0 h-1 bg-blue-300 opacity-0 will-change-transform"
        ref={targetLineRef}
      />
    </>,
    anchorElement,
  );
}

export const DraggableBlockPlugin = ({
  anchorElem,
}: {
  anchorElem: HTMLElement | null;
}): JSX.Element => {
  const [editor] = useLexicalComposerContext();
  return useDraggableBlockMenu(
    editor,
    anchorElem ?? document.body,
    editor._editable,
  );
};
