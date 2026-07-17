import * as React from "react";

import { cn } from "@acme/ui/lib/utils";
import {
  DialogContent as ShadcnDialogContent,
  DialogDescription as ShadcnDialogDescription,
  DialogHeader as ShadcnDialogHeader,
  DialogOverlay as ShadcnDialogOverlay,
  DialogTitle as ShadcnDialogTitle,
} from "@acme/ui/shadcn/dialog";

const INTERACTIVE_SELECTOR = [
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

const FLOATING_CONTENT_SELECTOR = [
  "[data-slot='combobox-content']",
  "[data-slot='select-content']",
  "[data-slot='popover-content']",
].join(", ");

/**
 * Keep the dialog open when an "interact outside" actually landed on something
 * that is inside from the user's point of view: a Sonner toast, floating
 * content (select/combobox/popover), or another dialog stacked on top (its
 * content). Radix reports these as outside because they live in separate
 * portals. A bare backdrop / outside click matches none of these → the dialog
 * closes as normal (Esc + close button are separate handlers, unaffected).
 *
 * Note: we do NOT rely on a `[data-slot='dialog-portal']` wrapper — Radix's
 * Dialog.Portal renders via `asChild`, so no such element exists in the DOM;
 * overlay and content are portaled into <body> as bare siblings.
 */
function shouldKeepDialogOpen(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("[data-sonner-toast]") ||
      target.closest(FLOATING_CONTENT_SELECTOR) ||
      target.closest("[data-slot='dialog-content']"),
  );
}

/**
 * Sonner toasts render in their own portal, OUTSIDE the dialog's focus scope.
 * While a modal dialog is open, Radix's trapped FocusScope + scroll-lock stop
 * the browser from starting a native text selection on that outside content
 * (a `selectstart` never fires), so users can't drag-select or double-click
 * toast text. Programmatic Range selection still works, so we drive it by hand:
 * anchor a caret on pointerdown over a toast, then extend it on pointermove.
 * Scoped to `[data-sonner-toast]` and non-interactive targets so toast buttons
 * (close/action) keep working; only runs while a DialogContent is mounted.
 */
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

function useToastSelectionDrag() {
  React.useEffect(() => {
    let anchor: Range | null = null;
    let toastRoot: Element | null = null;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const toast = target.closest("[data-sonner-toast]");
      if (!toast || target.closest(INTERACTIVE_SELECTOR)) return;
      // Take over: block Radix / sonner from swallowing the gesture.
      event.preventDefault();
      anchor = caretRangeFromPoint(event.clientX, event.clientY);
      toastRoot = toast;
      if (anchor) {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(anchor.cloneRange());
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!anchor || event.buttons !== 1) return;
      const focus = caretRangeFromPoint(event.clientX, event.clientY);
      // Keep the selection inside the toast the drag started on.
      if (
        !focus ||
        !(focus.startContainer instanceof Node) ||
        !toastRoot?.contains(focus.startContainer)
      ) {
        return;
      }
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
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    };

    const onPointerUp = () => {
      anchor = null;
      toastRoot = null;
    };

    // Double-click selects the whole word (native word-select is suppressed by
    // the preventDefault above). Unicode-aware so it works on non-ASCII text.
    const isWordChar = (character: string) => /[\p{L}\p{N}_]/u.test(character);
    const onDoubleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("[data-sonner-toast]")) return;
      if (target.closest(INTERACTIVE_SELECTOR)) return;
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
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerUp, true);
    document.addEventListener("dblclick", onDoubleClick, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerUp, true);
      document.removeEventListener("dblclick", onDoubleClick, true);
    };
  }, []);
}

function DialogContent({
  onInteractOutside,
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnDialogContent>) {
  // The dialog's own title/description select natively (they live inside the
  // focus scope). Only toasts need help — see useToastSelectionDrag.
  useToastSelectionDrag();

  return (
    <ShadcnDialogContent
      className={cn("select-text", className)}
      onInteractOutside={(e) => {
        // Keep the dialog open when the "outside" interaction actually landed
        // on a toast / floating content / stacked dialog (separate portals).
        // https://github.com/radix-ui/primitives/issues/2690
        if (shouldKeepDialogOpen(e.target)) {
          e.preventDefault();
        }
        onInteractOutside?.(e);
      }}
      {...properties}
    />
  );
}

function DialogHeader({
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnDialogHeader>) {
  return (
    <ShadcnDialogHeader
      className={cn("select-none", className)}
      {...properties}
    />
  );
}

function DialogTitle({
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnDialogTitle>) {
  return (
    <ShadcnDialogTitle
      className={cn("inline-block select-text", className)}
      {...properties}
    />
  );
}

function DialogDescription({
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnDialogDescription>) {
  return (
    <ShadcnDialogDescription
      className={cn("select-text", className)}
      {...properties}
    />
  );
}

function DialogOverlay({
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnDialogOverlay>) {
  return (
    <ShadcnDialogOverlay
      className={cn("select-none", className)}
      {...properties}
    />
  );
}

export {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  shouldKeepDialogOpen,
};
export {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogTrigger,
  DialogPortal,
} from "@acme/ui/shadcn/dialog";
