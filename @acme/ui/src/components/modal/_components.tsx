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

// Regions whose text we drive manually while a modal is open. Toasts live in a
// separate portal OUTSIDE the dialog's focus scope, where Radix's trapped
// FocusScope + scroll-lock stop the browser from ever starting a native
// selection (no `selectstart` fires). The dialog's own title/description select
// natively, but a native drag/triple-click there spills across block
// boundaries and copies stray "\n". Driving all of them by hand with a Range
// clamped to a single element gives clean, newline-free copies everywhere.
const SELECTABLE_TEXT_SELECTOR = [
  "[data-sonner-toast]",
  "[data-slot='dialog-title']",
  "[data-slot='dialog-description']",
].join(", ");

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

function useDialogTextSelection() {
  React.useEffect(() => {
    let anchor: Range | null = null;
    let root: Element | null = null;

    const selectableTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      if (target.closest(INTERACTIVE_SELECTOR)) return null;
      return target.closest(SELECTABLE_TEXT_SELECTOR);
    };

    const onPointerDown = (event: PointerEvent) => {
      const hit = selectableTarget(event.target);
      if (!hit) return;
      // Take over: block Radix / sonner from swallowing the gesture.
      event.preventDefault();
      anchor = caretRangeFromPoint(event.clientX, event.clientY);
      root = hit;
      if (anchor) setSelection(anchor.cloneRange());
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!anchor || event.buttons !== 1) return;
      const focus = caretRangeFromPoint(event.clientX, event.clientY);
      // Clamp the selection to the element the drag started on so it never
      // spills across block boundaries (which would copy a stray "\n").
      if (
        !focus ||
        !(focus.startContainer instanceof Node) ||
        !root?.contains(focus.startContainer)
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
      setSelection(range);
    };

    const onPointerUp = () => {
      anchor = null;
      root = null;
    };

    // Multi-click (native selection is suppressed by the preventDefault above):
    // 2 clicks = word (Unicode-aware, works on non-ASCII), 3+ = whole element.
    const isWordChar = (character: string) => /[\p{L}\p{N}_]/u.test(character);
    const onClick = (event: MouseEvent) => {
      const hit = selectableTarget(event.target);
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

function DialogContent({
  onInteractOutside,
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnDialogContent>) {
  // Drive text selection for toasts + the dialog's own title/description so
  // copies are clean (no stray "\n") while the modal traps focus.
  useDialogTextSelection();

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
