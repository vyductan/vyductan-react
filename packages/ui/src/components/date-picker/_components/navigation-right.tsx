import type { ButtonProps } from "@acme/ui/components/button";
import { Button } from "@acme/ui/components/button";
import { Icon } from "@acme/ui/icons";

export const NavigationRight = (properties: ButtonProps) => {
  return (
    <Button
      variant="outlined"
      icon={<Icon icon="icon-[mingcute--right-fill]" className="size-4" />}
      {...properties}
    />
  );
};
