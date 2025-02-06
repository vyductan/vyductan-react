import type { ButtonProps } from "@acme/ui/button";
import { Button } from "@acme/ui/button";
import { Icon } from "@acme/ui/icons";

export const ButtonEdit = (props: ButtonProps) => {
  return (
    <Button
      icon={<Icon icon="icon-[uil--edit]" />}
      variant="light"
      color="link"
      {...props}
    />
  );
};
