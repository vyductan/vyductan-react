import type { ModalProps } from "../modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./_components";

export type AlertModalProps = Omit<ModalProps, "onOk"> & {
  onConfirm?: () => void;
};

export const AlertModal = ({
  className,
  description,
  okText,
  okLoading,
  title,
  trigger,
  onConfirm,
  onCancel,
  onOpenChange,
  ...rest
}: AlertModalProps) => {
  return (
    <AlertDialog
      onOpenChange={(isOpen) => {
        onOpenChange?.(isOpen);
        if (!isOpen) {
          onCancel?.();
        }
      }}
      {...rest}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            isControlled={rest.open !== undefined}
            loading={okLoading}
            onClick={onConfirm}
            onKeyDown={(e) => e.key === "Enter" && onConfirm?.()}
          >
            {okText ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
