import type * as React from "react";

import {
  DIALOG_SELECTION_SLOTS,
  useDialogSelectionContainment,
  useToastTextSelection,
} from "@acme/ui/hooks/use-dialog-text-selection";
import { cn } from "@acme/ui/lib/utils";
import {
  DialogContent as ShadcnDialogContent,
  DialogDescription as ShadcnDialogDescription,
  DialogFooter as ShadcnDialogFooter,
  DialogHeader as ShadcnDialogHeader,
  DialogOverlay as ShadcnDialogOverlay,
  DialogTitle as ShadcnDialogTitle,
} from "@acme/ui/shadcn/dialog";

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

function DialogContent({
  onInteractOutside,
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnDialogContent>) {
  // Toasts: native selection is impossible outside the focus scope → drive it.
  // Content: native selection (cross-block, like AntD), just kept from spilling
  // onto the overlay/page behind while dragging.
  useToastTextSelection();
  useDialogSelectionContainment(DIALOG_SELECTION_SLOTS);

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

function DialogFooter({
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnDialogFooter>) {
  return (
    <ShadcnDialogFooter
      // Button labels are chrome, not content: keep them out of a selection
      // that runs to the end of the dialog.
      className={cn("select-none", className)}
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
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  shouldKeepDialogOpen,
};
export {
  Dialog,
  DialogClose,
  DialogTrigger,
  DialogPortal,
} from "@acme/ui/shadcn/dialog";
