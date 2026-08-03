import * as React from "react";

/**
 * Text selection inside modal layers (Dialog / AlertDialog).
 *
 * Radix does not disable selection — a drag that stays inside the content
 * selects natively. Two things still break it, and both are fixed here:
 *
 * 1. A drag that strays onto the overlay / the page behind loses the anchor and
 *    collapses the selection to garbage → `useDialogSelectionContainment`.
 * 2. Toasts live outside the dialog's focus scope, where the browser never
 *    starts a native selection at all → `useToastTextSelection`.
 *
 * Both are keyed by `data-slot`, so every modal family that wants the behaviour
 * must pass its own slot names (see `DIALOG_SELECTION_SLOTS` /
 * `ALERT_DIALOG_SELECTION_SLOTS`) — a family that forgets silently gets none of
 * it.
 */

export const INTERACTIVE_SELECTOR = [
  "button",
  "[role='button']",
  "a",
  "[role='link']",
  "input",
  "textarea",
  "select",
  "option",
  "label",
  "[contenteditable='true']",
  "[data-slot='dialog-close']",
].join(", ");

export type DialogSelectionSlots = {
  /** `data-slot` of the content element — the region that stays selectable. */
  content: string;
  /** `data-slot` of the overlay — muted mid-drag so it can't steal the gesture. */
  overlay: string;
};

export const DIALOG_SELECTION_SLOTS: DialogSelectionSlots = {
  content: "dialog-content",
  overlay: "dialog-overlay",
};

export const ALERT_DIALOG_SELECTION_SLOTS: DialogSelectionSlots = {
  content: "alert-dialog-content",
  overlay: "alert-dialog-overlay",
};

function caretRangeFromPoint(x: number, y: number): Range | null {
  // Firefox/Chrome: caretPositionFromPoint; WebKit: caretRangeFromPoint.
  const documentWithCaret = document as Document & {
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node; offset: number } | null;
  };
  if (typeof documentWithCaret.caretPositionFromPoint === "function") {
    const position = documentWithCaret.caretPositionFromPoint(x, y);
    if (!position) return null;
    const range = document.createRange();
    range.setStart(position.offsetNode, position.offset);
    range.collapse(true);
    return range;
  }
  return typeof document.caretRangeFromPoint === "function"
    ? document.caretRangeFromPoint(x, y)
    : null;
}

function setSelection(range: Range) {
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/**
 * Sonner toasts render in their own portal, OUTSIDE the dialog's focus scope.
 * While a modal is open, Radix's trapped FocusScope + scroll-lock stop the
 * browser from ever starting a native selection there (no `selectstart` fires),
 * so drag/double-click can't select toast text. Programmatic Range selection
 * still works, so we drive it by hand — clamped to the toast so it stays clean.
 * Interactive controls (close/action buttons) are skipped so they keep working.
 */
export function useToastTextSelection() {
  React.useEffect(() => {
    let anchor: Range | null = null;
    let toast: Element | null = null;

    const hitToast = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      if (target.closest(INTERACTIVE_SELECTOR)) return null;
      return target.closest("[data-sonner-toast]");
    };

    const onPointerDown = (event: PointerEvent) => {
      const hit = hitToast(event.target);
      if (!hit) return;
      event.preventDefault();
      anchor = caretRangeFromPoint(event.clientX, event.clientY);
      toast = hit;
      if (anchor) setSelection(anchor.cloneRange());
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!anchor || event.buttons !== 1) return;
      const focus = caretRangeFromPoint(event.clientX, event.clientY);
      if (!focus || !toast?.contains(focus.startContainer)) return;
      const range = document.createRange();
      const anchorBeforeFocus =
        anchor.compareBoundaryPoints(Range.START_TO_START, focus) <= 0;
      if (anchorBeforeFocus) {
        range.setStart(anchor.startContainer, anchor.startOffset);
        range.setEnd(focus.startContainer, focus.startOffset);
      } else {
        range.setStart(focus.startContainer, focus.startOffset);
        range.setEnd(anchor.startContainer, anchor.startOffset);
      }
      setSelection(range);
    };

    const onPointerUp = () => {
      anchor = null;
      toast = null;
    };

    // Multi-click (native is suppressed by preventDefault): 2 = word
    // (Unicode-aware), 3+ = whole toast.
    const isWordChar = (character: string) => /[\p{L}\p{N}_]/u.test(character);
    const onClick = (event: MouseEvent) => {
      const hit = hitToast(event.target);
      if (!hit || event.detail < 2) return;
      if (event.detail >= 3) {
        const range = document.createRange();
        range.selectNodeContents(hit);
        setSelection(range);
        return;
      }
      const caret = caretRangeFromPoint(event.clientX, event.clientY);
      const node = caret?.startContainer;
      if (!node || node.nodeType !== Node.TEXT_NODE) return;
      const text = node.textContent ?? "";
      let start = caret.startOffset;
      let end = caret.startOffset;
      while (start > 0 && isWordChar(text[start - 1]!)) start--;
      while (end < text.length && isWordChar(text[end]!)) end++;
      if (start === end) return;
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, end);
      setSelection(range);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerUp, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerUp, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
}

/**
 * First and last text node of `root` that the user is actually allowed to
 * select — `user-select: none` subtrees (header chrome, footer buttons) are
 * skipped so a clamped selection never copies button labels. Computed once per
 * gesture: `getComputedStyle` per text node is too costly for a pointermove.
 */
function selectableBounds(root: Element): { first: Text; last: Text } | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      return getComputedStyle(parent).userSelect === "none"
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });
  let first: Text | null = null;
  let last: Text | null = null;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    first ??= node as Text;
    last = node as Text;
  }
  return first && last ? { first, last } : null;
}

/** Range between two boundary points, ordered; null when empty/invalid. */
function rangeBetween(
  start: { node: Node; offset: number },
  end: { node: Node; offset: number },
): Range | null {
  try {
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    return range.collapsed ? null : range;
  } catch {
    return null;
  }
}

/**
 * The dialog's own content selects natively — including across the title,
 * description, and body in one drag (matches AntD). Two things break once the
 * pointer leaves the content: the browser starts grabbing the page behind
 * (stray "\n"), and with the page locked it collapses the selection instead.
 *
 * So for a drag that STARTED inside the content:
 * - lock everything else out — body `user-select: none` (the content keeps its
 *   own `select-text`, so its text, and only its text, stays selectable) and
 *   overlay `pointer-events: none`;
 * - while the pointer is outside, drive the selection ourselves, clamped to the
 *   content's own selectable text: past the bottom/right selects through to its
 *   end, past the top/left back to its start. Dragging out is a "select the
 *   rest" gesture instead of a wiped selection.
 *
 * All imperative (no React state) so it never re-renders mid-gesture and
 * interrupts the selection.
 */
export function useDialogSelectionContainment({
  content: contentSlot,
  overlay: overlaySlot,
}: DialogSelectionSlots) {
  React.useEffect(() => {
    let release: (() => void) | null = null;
    let content: Element | null = null;
    let bounds: { first: Text; last: Text } | null = null;
    let anchor: { node: Node; offset: number } | null = null;

    /** Selection from the anchor out to the edge the pointer left through. */
    const clampToContent = (event: PointerEvent) => {
      if (!content || !bounds) return;
      const rect = content.getBoundingClientRect();
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        return; // still inside — the browser handles it natively
      }
      const backward =
        event.clientY < rect.top ||
        (event.clientY <= rect.bottom && event.clientX < rect.left);
      const contentStart = { node: bounds.first, offset: 0 };
      const contentEnd = { node: bounds.last, offset: bounds.last.length };
      const range = backward
        ? rangeBetween(contentStart, anchor ?? contentEnd)
        : rangeBetween(anchor ?? contentStart, contentEnd);
      if (range) setSelection(range);
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-sonner-toast]")) return; // toasts: other hook
      const hit = target.closest(`[data-slot='${contentSlot}']`);
      if (!hit) return;
      if (target.closest(INTERACTIVE_SELECTOR)) return;

      // Arm only. Locking the page HERE would shift the anchor the browser is
      // about to compute for this very mousedown — enough to drop the first
      // character of the selection — so the lock waits for the first move.
      content = hit;
      bounds = selectableBounds(hit);
      const caret = caretRangeFromPoint(event.clientX, event.clientY);
      anchor = caret
        ? { node: caret.startContainer, offset: caret.startOffset }
        : null;
    };

    const lock = () => {
      const { body } = document;
      const overlay = document.querySelector<HTMLElement>(
        `[data-slot='${overlaySlot}'][data-state='open']`,
      );
      const previous = {
        userSelect: body.style.userSelect,
        webkitUserSelect: body.style.webkitUserSelect,
        overlayPointerEvents: overlay?.style.pointerEvents,
      };
      body.style.userSelect = "none";
      body.style.webkitUserSelect = "none";
      if (overlay) overlay.style.pointerEvents = "none";

      release = () => {
        body.style.userSelect = previous.userSelect;
        body.style.webkitUserSelect = previous.webkitUserSelect;
        if (overlay) {
          overlay.style.pointerEvents = previous.overlayPointerEvents ?? "";
        }
        release = null;
      };
    };

    const disarm = () => {
      release?.();
      content = null;
      bounds = null;
      anchor = null;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!content || event.buttons !== 1) return;
      if (!release) lock(); // the gesture is a drag now — contain it
      clampToContent(event);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!content) return;
      if (release) clampToContent(event); // may end outside — clamp once more
      disarm();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerUp, true);
    return () => {
      release?.();
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerUp, true);
    };
  }, [contentSlot, overlaySlot]);
}
