import type * as React from "react";

import {
  ALERT_DIALOG_SELECTION_SLOTS,
  useDialogSelectionContainment,
  useToastTextSelection,
} from "@acme/ui/hooks/use-dialog-text-selection";
import { cn } from "@acme/ui/lib/utils";
import {
  AlertDialogAction as ShadcnAlertDialogAction,
  AlertDialogContent as ShadcnAlertDialogContent,
  AlertDialogDescription as ShadcnAlertDialogDescription,
  AlertDialogFooter as ShadcnAlertDialogFooter,
  AlertDialogHeader as ShadcnAlertDialogHeader,
  AlertDialogTitle as ShadcnAlertDialogTitle,
} from "@acme/ui/shadcn/alert-dialog";

import { buttonVariants } from "../button";
import { buttonColorVariants } from "../button/button-variants";

/**
 * Same text-selection layer as Modal — see `use-dialog-text-selection`. The
 * hooks are keyed by `data-slot`, so the alert family has to opt in with its own
 * slot names; without this the content still selects natively, but a drag that
 * strays a few px past the (short) content collapses the selection to "\n" and
 * copy comes back empty.
 */
function AlertDialogContent({
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnAlertDialogContent>) {
  useToastTextSelection();
  useDialogSelectionContainment(ALERT_DIALOG_SELECTION_SLOTS);

  return (
    <ShadcnAlertDialogContent
      className={cn("select-text", className)}
      {...properties}
    />
  );
}

function AlertDialogHeader({
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnAlertDialogHeader>) {
  return (
    <ShadcnAlertDialogHeader
      className={cn("select-none", className)}
      {...properties}
    />
  );
}

function AlertDialogTitle({
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnAlertDialogTitle>) {
  return (
    <ShadcnAlertDialogTitle
      // inline-block: keeps the drag off the title's full-width whitespace.
      className={cn("inline-block select-text", className)}
      {...properties}
    />
  );
}

function AlertDialogDescription({
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnAlertDialogDescription>) {
  return (
    <ShadcnAlertDialogDescription
      className={cn("select-text", className)}
      {...properties}
    />
  );
}

function AlertDialogFooter({
  className,
  ...properties
}: React.ComponentProps<typeof ShadcnAlertDialogFooter>) {
  return (
    <ShadcnAlertDialogFooter
      // Button labels are chrome, not content: keep them out of a selection
      // that runs to the end of the dialog.
      className={cn("select-none", className)}
      {...properties}
    />
  );
}

const AlertDialogAction = (
  properties: React.ComponentProps<typeof ShadcnAlertDialogAction> & {
    isOpenControlled?: boolean;
  },
) => {
  const { isOpenControlled, className, ...restProperties } = properties;
  return (
    <ShadcnAlertDialogAction
      className={cn(
        buttonVariants({
          size: "middle",
        }),
        buttonColorVariants({
          color: isOpenControlled ? "danger" : "default",
        }),
        className,
      )}
      {...restProperties}
    />
  );
};

// function AlertDialogAction({
//     className,
//     asChild,
//     isControlled,
//     ...props
//   }: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
//     ButtonProps & {
//       isControlled?: boolean;
//     }) {
//     return (
//       <AlertDialogPrimitive.Action
//         asChild
//         // className={cn(
//         //   buttonVariants({
//         //     color: !asChild || isControlled ? "danger" : "default",
//         //   }),
//         //   className,
//         // )}
//       >
//         <Button
//           asChild={asChild}
//           color={!asChild || !isControlled ? "danger" : "default"}
//           className={cn(className)}
//           {...props}
//         ></Button>
//       </AlertDialogPrimitive.Action>
//     );
//   }

export {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogTrigger,
  AlertDialogMedia,
} from "@acme/ui/shadcn/alert-dialog";

export {
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
};
