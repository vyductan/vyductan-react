import type { ButtonProps } from "@acme/ui/components/button";
import { Button } from "@acme/ui/components/button";
import { Icon } from "@acme/ui/icons";

export const NavigationLeft = (properties: ButtonProps) => {
  return (
    <Button
      variant="outlined"
      aria-label="Previous"
      icon={<Icon icon="icon-[mingcute--left-fill]" className="size-4" />}
      {...properties}
    />
  );
};
