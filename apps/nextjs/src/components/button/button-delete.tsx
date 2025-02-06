import type { AlertModalProps } from "@acme/ui/alert-modal";
import type { ButtonProps } from "@acme/ui/button";
import { AlertModal } from "@acme/ui/alert-modal";
import { Button } from "@acme/ui/button";
import { Icon } from "@acme/ui/icons";

type ButtonDeleteProps = AlertModalProps &
  ButtonProps & {
    // confirmProps: AlertModalProps;
  };
export const ButtonDelete = ({
  okLoading,
  size,
  ...props
}: ButtonDeleteProps) => {
  return (
    <AlertModal
      trigger={
        <Button
          icon={<Icon icon="icon-[mingcute--delete-3-line]" />}
          variant="light"
          color="danger"
          size={size}
          loading={okLoading}
        />
      }
      {...props}
    />
  );
};
