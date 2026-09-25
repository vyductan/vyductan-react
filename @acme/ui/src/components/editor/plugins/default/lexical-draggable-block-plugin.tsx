/**
 * Fork of @lexical/react's DraggableBlockPlugin_EXPERIMENTAL (0.49, MIT,
 * Copyright (c) Meta Platforms, Inc. and affiliates).
 *
 * Why a fork: upstream only knows top-level blocks. A whole list is one block
 * to it, so hovering the fifth item of a nested list put the handle on the
 * list's first line, and dragging moved the entire list. Notion treats every
 * list item as a block. Upstream exposes no hook for choosing the block, so
 * the lookup and the drop are reimplemented here; the rest (menu positioning,
 * target line, Firefox focus handling) follows upstream closely.
 *
 * Changes from upstream:
 * - `getBlockElement` descends into lists and returns the innermost list item
 *   under the pointer (skipping items that only wrap a nested list).
 * - `$moveBlock` moves a list item together with its nested children, wraps
 *   an item dropped among non-list blocks in a new list of its own type, and
 *   removes the lists it leaves empty.
 * - Drops use the target's upper/lower half, and the moved block flashes.
 */
import type { ListItemNode } from "@lexical/list";
import type { LexicalEditor, LexicalNode } from "lexical";
import type {
  JSX,
  DragEvent as ReactDragEvent,
  ReactNode,
  RefObject,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { $createListNode, $isListItemNode, $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { eventFiles } from "@lexical/rich-text";
import { calculateZoomLevel, mergeRegister } from "@lexical/utils";
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $onUpdate,
  BLUR_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
  IS_FIREFOX,
  isHTMLElement,
} from "lexical";
import { createPortal } from "react-dom";

import { $selectedTopLevelBlocks } from "../../utils/block-selection";
import { flashNodeKeys } from "../../utils/flash-block";

const SPACE = 4;
const TARGET_LINE_HALF_HEIGHT = 2;
const DRAG_DATA_FORMAT = "application/x-lexical-drag-block";

function getCollapsedMargins(element: HTMLElement) {
  const view = element.ownerDocument.defaultView;
  const marginOf = (
    target: Element | null,
    side: "marginTop" | "marginBottom",
  ) =>
    target && view ? Number.parseFloat(view.getComputedStyle(target)[side]) : 0;
  const style = view?.getComputedStyle(element);
  return {
    marginTop: Math.max(
      Number.parseFloat(style?.marginTop ?? "0"),
      marginOf(element.previousElementSibling, "marginBottom"),
    ),
    marginBottom: Math.max(
      Number.parseFloat(style?.marginBottom ?? "0"),
      marginOf(element.nextElementSibling, "marginTop"),
    ),
  };
}

const isListElement = (element: Element) =>
  element.tagName === "OL" || element.tagName === "UL";

/** An item that exists only to hold a nested list, e.g. `<li><ol>…</ol></li>`. */
const isWrapperItem = (element: Element) =>
  element.children.length > 0 && [...element.children].every(isListElement);

/**
 * The innermost real list item of `list` under `y`, or the nearest one when
 * `y` falls in a gap between items.
 */
function listItemAt(list: HTMLElement, y: number): HTMLElement {
  const items = [...list.querySelectorAll<HTMLElement>("li")].filter(
    (item) => !isWrapperItem(item),
  );
  let best: HTMLElement | null = null;
  let bestDepth = -1;
  let nearest: HTMLElement | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const item of items) {
    const zoom = calculateZoomLevel(item);
    const rect = item.getBoundingClientRect();
    const pointY = y / zoom;
    if (pointY >= rect.top && pointY <= rect.bottom) {
      let depth = 0;
      for (
        let parent = item.parentElement;
        parent;
        parent = parent.parentElement
      ) {
        if (parent === list) break;
        if (parent.tagName === "LI") depth += 1;
      }
      if (depth > bestDepth) {
        best = item;
        bestDepth = depth;
      }
    }
    const distance = Math.min(
      Math.abs(pointY - rect.top),
      Math.abs(pointY - rect.bottom),
    );
    if (distance < nearestDistance) {
      nearest = item;
      nearestDistance = distance;
    }
  }

  return best ?? nearest ?? list;
}

/**
 * The block under the pointer: a top-level block, or inside a list the list
 * item. `useEdgeAsDefault` answers the first/last block for a pointer above or
 * below all of them, which keeps a drag near the edges droppable.
 */
function getBlockElement(
  anchorElem: HTMLElement,
  editor: LexicalEditor,
  event: MouseEvent,
  useEdgeAsDefault = false,
): HTMLElement | null {
  const anchorRect = anchorElem.getBoundingClientRect();
  // Read the committed state rather than editor.read(): this runs inside the
  // DROP_COMMAND update, and editor.read() would commit that update early —
  // the move that follows then hit "Cannot call set() on a frozen node map".
  const keys = editor.getEditorState().read(() => $getRoot().getChildrenKeys());
  const elements = keys
    .map((key) => editor.getElementByKey(key))
    .filter((element): element is HTMLElement => element !== null);
  if (elements.length === 0) return null;

  let topLevel: HTMLElement | null = null;

  if (useEdgeAsDefault) {
    const first = elements[0]!;
    const last = elements.at(-1)!;
    if (
      event.y / calculateZoomLevel(first) <
      first.getBoundingClientRect().top
    ) {
      topLevel = first;
    } else if (
      event.y / calculateZoomLevel(last) >
      last.getBoundingClientRect().bottom
    ) {
      topLevel = last;
    }
  }

  if (!topLevel) {
    for (const element of elements) {
      const zoom = calculateZoomLevel(element);
      const x = event.x / zoom;
      const y = event.y / zoom;
      const rect = element.getBoundingClientRect();
      const { marginTop, marginBottom } = getCollapsedMargins(element);
      if (
        x >= anchorRect.left &&
        x <= anchorRect.right &&
        y >= rect.top - marginTop &&
        y <= rect.bottom + marginBottom
      ) {
        topLevel = element;
        break;
      }
    }
  }

  if (topLevel && isListElement(topLevel)) {
    return listItemAt(topLevel, event.y);
  }
  return topLevel;
}

/**
 * Before or after the target: the upper half of a block means before, the
 * lower half after. Upstream only said "before" for a pointer above the
 * block's top edge, which inside a list (items have no margin to aim at) left
 * no way to drop above an item.
 */
function placementFor(
  targetBlockElem: HTMLElement,
  mouseY: number,
): "before" | "after" {
  const rect = targetBlockElem.getBoundingClientRect();
  return mouseY < rect.top + rect.height / 2 ? "before" : "after";
}

function setMenuPosition(
  targetElem: HTMLElement | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  zoomLevel: number,
) {
  if (!targetElem) {
    floatingElem.style.display = "none";
    return;
  }
  const targetRect = targetElem.getBoundingClientRect();
  const targetStyle =
    targetElem.ownerDocument.defaultView?.getComputedStyle(targetElem);
  const floatingRect = floatingElem.getBoundingClientRect();
  const anchorRect = anchorElem.getBoundingClientRect();

  // Centre on the first line, not the whole block, so a long paragraph or a
  // multi-line item keeps its handle beside where it starts.
  let lineHeight = targetStyle
    ? Number.parseInt(targetStyle.lineHeight, 10)
    : Number.NaN;
  if (Number.isNaN(lineHeight)) {
    lineHeight = targetRect.bottom - targetRect.top;
  }
  const top =
    (targetRect.top +
      (lineHeight - (floatingRect.height || lineHeight)) / 2 -
      anchorRect.top +
      anchorElem.scrollTop) /
    zoomLevel;
  floatingElem.style.display = "flex";
  floatingElem.style.opacity = "1";
  floatingElem.style.transform = `translate(${SPACE}px, ${top}px)`;
}

function setDragImage(dataTransfer: DataTransfer, blockElem: HTMLElement) {
  const { transform } = blockElem.style;
  // Remove drag image borders.
  blockElem.style.transform = "translateZ(0)";
  dataTransfer.setDragImage(blockElem, 0, 0);
  setTimeout(() => {
    blockElem.style.transform = transform;
  });
}

function setTargetLine(
  targetLineElem: HTMLElement,
  targetBlockElem: HTMLElement,
  mouseY: number,
  anchorElem: HTMLElement,
) {
  const blockRect = targetBlockElem.getBoundingClientRect();
  const anchorRect = anchorElem.getBoundingClientRect();
  const { marginTop, marginBottom } = getCollapsedMargins(targetBlockElem);
  const lineTop =
    placementFor(targetBlockElem, mouseY) === "after"
      ? blockRect.bottom + marginBottom / 2
      : blockRect.top - marginTop / 2;
  const top =
    lineTop - anchorRect.top - TARGET_LINE_HALF_HEIGHT + anchorElem.scrollTop;
  // Start at the block's own left edge, so a line for a nested item shows how
  // deep it will land.
  const left = blockRect.left - anchorRect.left;
  targetLineElem.style.transform = `translate(${left}px, ${top}px)`;
  targetLineElem.style.width = `${Math.max(0, anchorRect.right - blockRect.left - SPACE * 2)}px`;
  targetLineElem.style.opacity = ".4";
}

function hideTargetLine(targetLineElem: HTMLElement | null) {
  if (targetLineElem) {
    targetLineElem.style.opacity = "0";
    targetLineElem.style.transform = "translate(-10000px, -10000px)";
  }
}

/** The item wrapping `item`'s nested list, if it has one. */
function $nestedChildrenOf(item: ListItemNode): ListItemNode | null {
  const next = item.getNextSibling();
  return $isListItemNode(next) &&
    next.getChildrenSize() === 1 &&
    $isListNode(next.getFirstChild())
    ? next
    : null;
}

/** Remove lists (and wrapper items) a move left with no items. */
function $pruneEmptyLists(start: LexicalNode | null) {
  let node = start;
  while (node && ($isListNode(node) || $isListItemNode(node))) {
    const parent: LexicalNode | null = node.getParent();
    if ($isListNode(node) && node.getChildrenSize() === 0) node.remove();
    else if ($isListItemNode(node) && node.getChildrenSize() === 0)
      node.remove();
    else break;
    node = parent;
  }
}

/**
 * Move `dragged` before or after `target`. A list item keeps its nested
 * children with it; dropped next to a non-list block it becomes the only item
 * of a new list of the same type; a non-item dropped on an item goes beside
 * the item's top-level list instead of into it.
 */
function $moveBlock(
  dragged: LexicalNode,
  target: LexicalNode,
  placement: "before" | "after",
) {
  const oldParent = dragged.getParent();

  if ($isListItemNode(dragged)) {
    const children = $nestedChildrenOf(dragged);

    if (!$isListItemNode(target)) {
      const list = oldParent;
      const wrapper = $createListNode(
        $isListNode(list) ? list.getListType() : "bullet",
      );
      wrapper.append(dragged);
      if (children) wrapper.append(children);
      if (placement === "before") target.insertBefore(wrapper);
      else target.insertAfter(wrapper);
    } else {
      if (placement === "before") target.insertBefore(dragged);
      else {
        // After an item that has nested children means after those children.
        const after = $nestedChildrenOf(target) ?? target;
        after.insertAfter(dragged);
      }
      if (children) dragged.insertAfter(children);
    }
    $pruneEmptyLists(oldParent);
    return;
  }

  let anchor = target;
  if ($isListItemNode(target)) {
    anchor = target.getTopLevelElementOrThrow();
  }
  if (placement === "before") anchor.insertBefore(dragged);
  else anchor.insertAfter(dragged);
}

/**
 * Move a run of top-level blocks — a block selection — beside `target`'s
 * top-level block, keeping their order. Dropped on one of themselves, nothing
 * moves.
 */
function $moveBlocks(
  blocks: LexicalNode[],
  target: LexicalNode,
  placement: "before" | "after",
): boolean {
  const anchor = target.getTopLevelElement() ?? target;
  if (blocks.some((block) => block.is(anchor))) return false;
  if (placement === "before") {
    for (const block of blocks) anchor.insertBefore(block);
  } else {
    let previous: LexicalNode = anchor;
    for (const block of blocks) {
      previous.insertAfter(block);
      previous = block;
    }
  }
  return true;
}

function useDraggableBlockMenu(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  menuRef: RefObject<HTMLElement | null>,
  targetLineRef: RefObject<HTMLElement | null>,
  isEditable: boolean,
  menuComponent: ReactNode,
  targetLineComponent: ReactNode,
  isOnMenu: (element: HTMLElement) => boolean,
  onElementChanged?: (element: HTMLElement | null) => void,
): JSX.Element {
  const scrollerElem = anchorElem.parentElement;
  const isDraggingBlockRef = useRef(false);
  const [draggableBlockElem, setDraggableBlockElemState] =
    useState<HTMLElement | null>(null);

  const setDraggableBlockElem = useCallback(
    (element: HTMLElement | null) => {
      setDraggableBlockElemState(element);
      onElementChanged?.(element);
    },
    [onElementChanged],
  );

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      // isHTMLElement, like upstream: it accepts any element. The handle's
      // grip is an SVG icon, and an `instanceof HTMLElement` check hid the
      // handle the moment the pointer reached it, so no drag could start.
      const target = event.target;
      if (!isHTMLElement(target)) {
        setDraggableBlockElem(null);
        return;
      }
      if (isOnMenu(target)) return;
      setDraggableBlockElem(getBlockElement(anchorElem, editor, event));
    }
    function onMouseLeave() {
      setDraggableBlockElem(null);
    }
    if (!scrollerElem) return;
    scrollerElem.addEventListener("mousemove", onMouseMove);
    scrollerElem.addEventListener("mouseleave", onMouseLeave);
    return () => {
      scrollerElem.removeEventListener("mousemove", onMouseMove);
      scrollerElem.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [scrollerElem, anchorElem, editor, isOnMenu, setDraggableBlockElem]);

  useEffect(() => {
    const zoomLevel = calculateZoomLevel(editor.getRootElement());
    if (menuRef.current) {
      setMenuPosition(
        draggableBlockElem,
        menuRef.current,
        anchorElem,
        zoomLevel,
      );
    }
  }, [editor, anchorElem, draggableBlockElem, menuRef]);

  useEffect(() => {
    function onDragover(event: DragEvent): boolean {
      if (!isDraggingBlockRef.current) return false;
      const [isFileTransfer] = eventFiles(event);
      if (isFileTransfer) return false;
      const target = event.target;
      if (!isHTMLElement(target)) return false;
      const targetBlockElem = getBlockElement(anchorElem, editor, event, true);
      const targetLineElem = targetLineRef.current;
      if (targetBlockElem === null || targetLineElem === null) return false;
      setTargetLine(
        targetLineElem,
        targetBlockElem,
        event.clientY / calculateZoomLevel(target),
        anchorElem,
      );
      // Prevent default so the drop event fires.
      event.preventDefault();
      return true;
    }

    function $onDrop(event: DragEvent): boolean {
      if (!isDraggingBlockRef.current) return false;
      const [isFileTransfer] = eventFiles(event);
      if (isFileTransfer) return false;
      const { dataTransfer } = event;
      const target = event.target;
      // One key, or several comma-separated for a block selection.
      const draggedNodes = (dataTransfer?.getData(DRAG_DATA_FORMAT) ?? "")
        .split(",")
        .map((key) => $getNodeByKey(key))
        .filter((node): node is LexicalNode => node !== null);
      const [draggedNode] = draggedNodes;
      if (!draggedNode || !isHTMLElement(target)) return false;
      const targetBlockElem = getBlockElement(anchorElem, editor, event, true);
      if (!targetBlockElem) return false;
      const targetNode = $getNearestNodeFromDOMNode(targetBlockElem);
      if (!targetNode) return false;

      if (draggedNodes.length > 1) {
        const moved = $moveBlocks(
          draggedNodes,
          targetNode,
          placementFor(
            targetBlockElem,
            event.clientY / calculateZoomLevel(target),
          ),
        );
        setDraggableBlockElem(null);
        if (moved) {
          const movedKeys = draggedNodes.map((node) => node.getKey());
          $onUpdate(() => {
            flashNodeKeys(editor, movedKeys);
            if (IS_FIREFOX) editor.focus();
          });
        }
        return true;
      }
      if (targetNode === draggedNode || targetNode.isParentOf(draggedNode)) {
        if (IS_FIREFOX) editor.focus();
        return true;
      }
      // Dropping an item into its own nested children would detach it.
      if (draggedNode.isParentOf(targetNode)) return true;

      $moveBlock(
        draggedNode,
        targetNode,
        placementFor(
          targetBlockElem,
          event.clientY / calculateZoomLevel(target),
        ),
      );
      setDraggableBlockElem(null);
      // Highlight what moved once it is in its new place, as Notion does.
      const movedKey = draggedNode.getKey();
      $onUpdate(() => {
        flashNodeKeys(editor, [movedKey]);
        if (IS_FIREFOX) editor.focus();
      });
      return true;
    }

    return mergeRegister(
      editor.registerCommand(
        DRAGOVER_COMMAND,
        onDragover,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(DROP_COMMAND, $onDrop, COMMAND_PRIORITY_HIGH),
    );
  }, [anchorElem, editor, targetLineRef, setDraggableBlockElem]);

  // Firefox fires blur before dragstart; keep the caret when the blur is the
  // drag handle taking focus. Same as upstream.
  useEffect(() => {
    if (!IS_FIREFOX || !isEditable) return;
    const markSelectionDirty = () =>
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null && !selection.dirty) selection.dirty = true;
      });
    return mergeRegister(
      editor.registerRootListener((rootElement) => {
        if (!rootElement) return;
        const onBlur = (event: FocusEvent) => {
          const related = event.relatedTarget;
          if (isHTMLElement(related) && isOnMenu(related)) {
            rootElement.focus({ preventScroll: true });
            markSelectionDirty();
            event.stopImmediatePropagation();
          }
        };
        rootElement.addEventListener("blur", onBlur, true);
        return () => rootElement.removeEventListener("blur", onBlur, true);
      }),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          const rootElement = editor.getRootElement();
          const active = rootElement?.ownerDocument.activeElement;
          if (rootElement && isHTMLElement(active) && isOnMenu(active)) {
            rootElement.focus({ preventScroll: true });
            markSelectionDirty();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, isEditable, isOnMenu]);

  /*
   * The block selection as it was when the handle was pressed. Read on
   * mousedown, not dragstart: pressing a handle outside the editable can move
   * the page's selection before the drag begins.
   */
  const selectedBlockKeysRef = useRef<string[]>([]);
  function onMouseDown() {
    selectedBlockKeysRef.current = editor
      .getEditorState()
      .read(() => $selectedTopLevelBlocks().map((node) => node.getKey()));
  }

  function onDragStart(event: ReactDragEvent<HTMLDivElement>) {
    const { dataTransfer } = event;
    if (!draggableBlockElem) return;
    setDragImage(dataTransfer, draggableBlockElem);
    let nodeKeys = "";
    editor.read(() => {
      const node = $getNearestNodeFromDOMNode(draggableBlockElem);
      if (!node) return;
      nodeKeys = node.getKey();
      // The handle of a block inside a block selection drags the selection.
      const selected = selectedBlockKeysRef.current;
      const block = node.getTopLevelElement() ?? node;
      if (selected.length > 1 && selected.includes(block.getKey())) {
        nodeKeys = selected.join(",");
      }
    });
    isDraggingBlockRef.current = true;
    dataTransfer.setData(DRAG_DATA_FORMAT, nodeKeys);
    if (IS_FIREFOX) {
      const rootElement = editor.getRootElement();
      if (
        rootElement &&
        rootElement.ownerDocument.activeElement !== rootElement
      ) {
        rootElement.focus({ preventScroll: true });
      }
    }
  }

  function onDragEnd() {
    isDraggingBlockRef.current = false;
    hideTargetLine(targetLineRef.current);
    if (IS_FIREFOX) editor.focus();
  }

  return createPortal(
    <>
      <div
        draggable
        onMouseDown={onMouseDown}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {isEditable && menuComponent}
      </div>
      {targetLineComponent}
    </>,
    anchorElem,
  );
}

export function DraggableBlockPlugin_EXPERIMENTAL({
  anchorElem = document.body,
  menuRef,
  targetLineRef,
  menuComponent,
  targetLineComponent,
  isOnMenu,
  onElementChanged,
}: {
  anchorElem?: HTMLElement;
  menuRef: RefObject<HTMLElement | null>;
  targetLineRef: RefObject<HTMLElement | null>;
  menuComponent: ReactNode;
  targetLineComponent: ReactNode;
  isOnMenu: (element: HTMLElement) => boolean;
  onElementChanged?: (element: HTMLElement | null) => void;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  useEffect(() => editor.registerEditableListener(setIsEditable), [editor]);
  return useDraggableBlockMenu(
    editor,
    anchorElem,
    menuRef,
    targetLineRef,
    isEditable,
    menuComponent,
    targetLineComponent,
    isOnMenu,
    onElementChanged,
  );
}
