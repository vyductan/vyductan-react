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

function shouldStartSelectionDrag(target: Element) {
  if (target.closest(INTERACTIVE_SELECTOR)) {
    return false;
  }

  return Boolean(
    target.closest("[data-slot='dialog-title'], [data-slot='dialog-description']"),
  );
}

function DialogContent({
  onInteractOutside,
  onPointerDownCapture,
  className,
  ...props
}: React.ComponentProps<typeof ShadcnDialogContent>) {
  const [selectionDragActive, setSelectionDragActive] = React.useState(false);

  React.useEffect(() => {
    if (!selectionDragActive) {
      return;
    }

    const stopSelectionDrag = () => setSelectionDragActive(false);

    globalThis.addEventListener("pointerup", stopSelectionDrag);
    globalThis.addEventListener("pointercancel", stopSelectionDrag);
    globalThis.addEventListener("blur", stopSelectionDrag);

    return () => {
      globalThis.removeEventListener("pointerup", stopSelectionDrag);
      globalThis.removeEventListener("pointercancel", stopSelectionDrag);
      globalThis.removeEventListener("blur", stopSelectionDrag);
    };
  }, [selectionDragActive]);

  React.useEffect(() => {
    if (!selectionDragActive) {
      return;
    }

    const { body } = document;
    const previousUserSelect = body.style.userSelect;
    const previousWebkitUserSelect = body.style.webkitUserSelect;

    body.style.userSelect = "none";
    body.style.webkitUserSelect = "none";

    return () => {
      body.style.userSelect = previousUserSelect;
      body.style.webkitUserSelect = previousWebkitUserSelect;
    };
  }, [selectionDragActive]);

  React.useEffect(() => {
    if (!selectionDragActive) {
      return;
    }

    const overlay = document.querySelector<HTMLElement>(
      "[data-slot='dialog-overlay'][data-state='open']",
    );
    if (!overlay) {
      return;
    }

    const previousPointerEvents = overlay.style.pointerEvents;
    overlay.style.pointerEvents = "none";

    return () => {
      overlay.style.pointerEvents = previousPointerEvents;
    };
  }, [selectionDragActive]);

  return (
    <ShadcnDialogContent
      className={cn("select-text", className)}
      onPointerDownCapture={(e) => {
        if (e.target instanceof Element && shouldStartSelectionDrag(e.target)) {
          setSelectionDragActive(true);
        } else {
          setSelectionDragActive(false);
        }
        onPointerDownCapture?.(e);
      }}
      // Prevent dialog from closing when clicking on toast notifications (Sonner)
      onInteractOutside={(e) => {
        if (
          e.target instanceof Element &&
          e.target.closest("[data-sonner-toast]")
        ) {
          e.preventDefault();
        }
        onInteractOutside?.(e);
      }}
      {...props}
    />
  );
}

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnDialogHeader>) {
  return (
    <ShadcnDialogHeader className={cn("select-none", className)} {...props} />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnDialogTitle>) {
  return (
    <ShadcnDialogTitle
      className={cn("inline-block select-text", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnDialogDescription>) {
  return (
    <ShadcnDialogDescription
      className={cn("select-text", className)}
      {...props}
    />
  );
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnDialogOverlay>) {
  return (
    <ShadcnDialogOverlay className={cn("select-none", className)} {...props} />
  );
}

export {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
};
export {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogTrigger,
  DialogPortal,
} from "@acme/ui/shadcn/dialog";
