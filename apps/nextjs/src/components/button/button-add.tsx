import type { ButtonProps } from "@acme/ui/button";
import { Button } from "@acme/ui/button";
import { Icon } from "@acme/ui/icons";

export const ButtonAdd = (props: ButtonProps) => {
  return (
    <Button
      type="button"
      srOnly
      icon={<Icon icon="icon-[mingcute--add-fill]" />}
      {...props}
    />
  );
};
