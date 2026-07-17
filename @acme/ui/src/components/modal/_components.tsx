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
function useToastTextSelection() {
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
 * The dialog's own content selects natively — including across the title,
 * description, and body in one drag (matches AntD). The only defect is that a
 * drag straying onto the overlay / the page behind the modal grabs garbage
 * (stray "\n"). While a selection drag that started inside the content is
 * active, lock everything else out: body `user-select: none` (the content
 * keeps its own `select-text`, so its text — and only its text — stays
 * selectable) and overlay `pointer-events: none`. Done imperatively (no React
 * state) so it never re-renders mid-gesture and interrupts the selection.
 */
function useDialogSelectionContainment() {
  React.useEffect(() => {
    let release: (() => void) | null = null;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-sonner-toast]")) return; // toasts: other hook
      if (!target.closest("[data-slot='dialog-content']")) return;
      if (target.closest(INTERACTIVE_SELECTOR)) return;

      const { body } = document;
      const overlay = document.querySelector<HTMLElement>(
        "[data-slot='dialog-overlay'][data-state='open']",
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

    const onPointerUp = () => release?.();

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerUp, true);
    return () => {
      release?.();
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerUp, true);
    };
  }, []);
}

function DialogContent({
  onInteractOutside,
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnDialogContent>) {
  // Toasts: native selection is impossible outside the focus scope → drive it.
  // Content: native selection (cross-block, like AntD), just kept from spilling
  // onto the overlay/page behind while dragging.
  useToastTextSelection();
  useDialogSelectionContainment();

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
