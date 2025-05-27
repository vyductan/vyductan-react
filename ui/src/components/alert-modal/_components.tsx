import { cn } from "@acme/ui/lib/utils";
import {
  AlertDialog,
  AlertDialogAction as ShadcnAlertDialogAction,
  AlertDialogCancel as ShadcnAlertDialogCancel,
  AlertDialogContent as ShadcnAlertDialogContent,
  AlertDialogDescription as ShadcnAlertDialogDescription,
  AlertDialogFooter as ShadcnAlertDialogFooter,
  AlertDialogHeader as ShadcnAlertDialogHeader,
  AlertDialogTitle as ShadcnAlertDialogTitle,
  AlertDialogTrigger as ShadcnAlertDialogTrigger,
} from "@acme/ui/shadcn/alert-dialog";

import { buttonVariants } from "../button";

const AlertDialogRoot = AlertDialog;
const AlertDialogCancel = ShadcnAlertDialogCancel;
const AlertDialogContent = ShadcnAlertDialogContent;
const AlertDialogDescription = ShadcnAlertDialogDescription;
const AlertDialogFooter = ShadcnAlertDialogFooter;
const AlertDialogHeader = ShadcnAlertDialogHeader;
const AlertDialogTitle = ShadcnAlertDialogTitle;
const AlertDialogTrigger = ShadcnAlertDialogTrigger;

const AlertDialogAction = (
  props: React.ComponentProps<typeof ShadcnAlertDialogAction> & {
    isOpenControlled?: boolean;
  },
) => {
  const { isOpenControlled, className, ...restProps } = props;
  return (
    <ShadcnAlertDialogAction
      className={cn(
        buttonVariants({
          color: isOpenControlled ? "danger" : "default",
        }),
        className,
      )}
      {...restProps}
    />
  );
};

export {
  AlertDialogRoot,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
