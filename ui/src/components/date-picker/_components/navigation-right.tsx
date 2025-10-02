import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

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
