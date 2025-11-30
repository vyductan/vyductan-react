import type * as React from "react";

import { DialogContent as ShadcnDialogContent } from "@acme/ui/shadcn/dialog";

function DialogContent({
  onInteractOutside,
  ...props
}: React.ComponentProps<typeof ShadcnDialogContent>) {
  return (
    <ShadcnDialogContent
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

export { DialogContent };
export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
  DialogPortal,
} from "@acme/ui/shadcn/dialog";
