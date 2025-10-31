import { cn } from "@acme/ui/lib/utils";
import { AlertDialogAction as ShadcnAlertDialogAction } from "@acme/ui/shadcn/alert-dialog";

import { buttonVariants } from "../button";
import { buttonColorVariants } from "../button/button-variants";

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
          size: "middle",
        }),
        buttonColorVariants({
          color: isOpenControlled ? "danger" : "default",
        }),
        className,
      )}
      {...restProps}
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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@acme/ui/shadcn/alert-dialog";

export { AlertDialogAction };
