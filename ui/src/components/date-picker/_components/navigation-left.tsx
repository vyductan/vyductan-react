import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

import { Icon } from "@acme/ui/icons";

export const NavigationLeft = (props: ButtonProps) => {
  return (
    <Button
      variant="outlined"
      icon={<Icon icon="icon-[mingcute--left-fill]" className="size-4" />}
      {...props}
    />
  );
};
