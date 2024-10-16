import type { ButtonProps } from "../../button";
import { Button } from "../../button";
import { Icon } from "../../icons";

export const NavigationLeft = (props: ButtonProps) => {
  return (
    <Button
      variant="outline"
      icon={<Icon icon="icon-[mingcute--left-fill]" className="size-4" />}
      {...props}
    />
  );
};
