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
} from "./components";

type AlertModalProps = ModalProps & {
  className?: string;
  children?: React.ReactNode;
  description?: React.ReactNode;
  okText?: string;
  okLoading?: boolean;
  title?: React.ReactNode;
  trigger?: React.ReactNode;
  onOk?: React.MouseEventHandler<HTMLButtonElement>;
  onCancel?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export const AlertModal = ({
  className,
  description,
  okText,
  okLoading,
  title,
  trigger,
  onOk,
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
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction loading={okLoading} onClick={onOk}>
            {okText ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
