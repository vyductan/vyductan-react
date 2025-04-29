import type { ButtonProps } from "@acme/ui/components/button";
import { Button } from "@acme/ui/components/button";
import { Icon } from "@acme/ui/icons";

export const NavigationRight = (props: ButtonProps) => {
  return (
    <Button
      variant="outline"
      icon={<Icon icon="icon-[mingcute--right-fill]" className="size-4" />}
      {...props}
    />
  );
};
